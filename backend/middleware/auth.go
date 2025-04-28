package middleware

import (
	"backend/services"
	"context"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CheckSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": "Authorization header not found"})
			return
		}

		db := services.DB
		var err error

		var ctx = context.Background()
		tx, err := db.BeginTxx(ctx, &sql.TxOptions{
			Isolation: sql.LevelSerializable,
			ReadOnly:  false,
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			return
		}

		defer func() {
			if p := recover(); p != nil {
				tx.Rollback()
				panic(p)
			} else if err != nil {
				tx.Rollback()
			}
		}()

		var uIDs []string
		err = tx.Select(&uIDs, "select user_id from auth.sessions where refresh_token = $1", authHeader)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			return
		}
		if len(uIDs) == 0 || len(uIDs) > 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
			return
		}

		if err = tx.Commit(); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			return
		}
		c.Set("userId", uIDs[0])
		c.Next()
	}
}
