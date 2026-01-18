package services

import (
	"context"
	"database/sql"
	"fmt"
)

type ServerSearchResult struct {
	ID     string `db:"id" json:"id"`
	Name   string `db:"name" json:"name"`
	IP     string `db:"ip" json:"ip"`
	Status string `db:"status" json:"status"`
}

type VMSearchResult struct {
	ID             string `db:"id" json:"id"`
	Name           string `db:"name" json:"name"`
	HostServerName string `db:"host_server_name" json:"hostServerName"`
	IP             string `db:"ip" json:"ip"`
	Status         string `db:"status" json:"status"`
}

type ServiceSearchResult struct {
	ID       string `db:"id" json:"id"`
	Name     string `db:"name" json:"name"`
	Type     string `db:"type" json:"type"`
	HostType string `db:"host_type" json:"hostType"`
	Status   string `db:"status" json:"status"`
}

type SearchResults struct {
	Servers  []ServerSearchResult  `json:"servers"`
	VMs      []VMSearchResult      `json:"vms"`
	Services []ServiceSearchResult `json:"services"`
}

func Search(query string, categories []string, userID string) (SearchResults, error) {
	db := DB
	var err error

	// Initialize with empty slices to ensure JSON returns [] instead of null
	results := SearchResults{
		Servers:  []ServerSearchResult{},
		VMs:      []VMSearchResult{},
		Services: []ServiceSearchResult{},
	}

	ctx := context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
		ReadOnly:  true,
	})
	if err != nil {
		return results, fmt.Errorf("Transaction failed %v!", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	searchPattern := "%" + query + "%"
	limit := 5 // Limit results per category

	// Search servers if category is included
	for _, category := range categories {
		switch category {
		case "servers":
			serverQuery := `
				SELECT id, name, ip::text, status::text
				FROM devices.server
				WHERE name ILIKE $1 OR host(ip) ILIKE $1
				ORDER BY created_at DESC
				LIMIT $2
			`
			err = tx.Select(&results.Servers, serverQuery, searchPattern, limit)
			if err != nil {
				return results, err
			}

		case "vms":
			vmQuery := `
				SELECT 
					v.id,
					v.name,
					COALESCE(s.name, '') AS host_server_name,
					COALESCE(host(v.ip), '') AS ip,
					v.status::text
				FROM devices.vm v
				LEFT JOIN devices.server s ON v.host_server_id = s.id
				WHERE v.name ILIKE $1 OR host(v.ip) ILIKE $1
				ORDER BY v.created_at DESC
				LIMIT $2
			`
			err = tx.Select(&results.VMs, vmQuery, searchPattern, limit)
			if err != nil {
				return results, err
			}

		case "services":
			serviceQuery := `
				SELECT 
					id,
					name,
					type::text,
					host_type,
					status::text
				FROM devices.service
				WHERE name ILIKE $1
				ORDER BY created_at DESC
				LIMIT $2
			`
			err = tx.Select(&results.Services, serviceQuery, searchPattern, limit)
			if err != nil {
				return results, err
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return results, fmt.Errorf("Transaction commit failed!")
	}

	return results, nil
}
