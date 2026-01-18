package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"log"
	"os"
)

func deriveNonceKey(key []byte) []byte {
	h := sha256.New()
	h.Write([]byte("email_nonce"))
	h.Write(key)
	return h.Sum(nil)
}

func encrypt(plaintext string, aesKey string) (string, error) {
	key, err := base64.StdEncoding.DecodeString(aesKey)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceKey := deriveNonceKey(key)
	h := hmac.New(sha256.New, nonceKey)
	h.Write([]byte(plaintext))
	nonceHash := h.Sum(nil)

	nonce := nonceHash[:gcm.NonceSize()]

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func hash256(plaintext string) (string, error) {
	hasher := sha256.New()
	_, err := hasher.Write([]byte(plaintext))
	if err != nil {
		return "", err
	}
	hashBytes := hasher.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)
	return hashString, err
}

func main() {
	if len(os.Args) < 4 {
		fmt.Println("Usage: go run generate_credentials.go <email> <password> <aes_key>")
		os.Exit(1)
	}

	email := os.Args[1]
	password := os.Args[2]
	aesKey := os.Args[3]

	encryptedEmail, err := encrypt(email, aesKey)
	if err != nil {
		log.Fatalf("Error encrypting email: %v", err)
	}

	hashedPassword, err := hash256(password)
	if err != nil {
		log.Fatalf("Error hashing password: %v", err)
	}

	fmt.Println("Credentials generated:")
	fmt.Printf("Email (plaintext): %s\n", email)
	fmt.Printf("Email (encrypted): %s\n", encryptedEmail)
	fmt.Printf("Password (plaintext): %s\n", password)
	fmt.Printf("Password (hashed): %s\n", hashedPassword)
}
