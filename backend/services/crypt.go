package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"io"
)

func Encrypt(plaintext string) (string, error) {
	key, err := base64.StdEncoding.DecodeString(GetEnv("AES_KEY", "VCaeFVlItzPjmA3WjGPmJ2d3Jd3uwayU8HUJ1mzmNyM="))
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

// Helper function to derive a nonce key from the main key
func deriveNonceKey(key []byte) []byte {
	h := sha256.New()
	h.Write([]byte("email_nonce"))
	h.Write(key)
	return h.Sum(nil)
}

// The Decrypt function remains unchanged as it extracts the nonce from the ciphertext
func Decrypt(cipherText string) (string, error) {
	key, err := base64.StdEncoding.DecodeString(GetEnv("AES_KEY", "VCaeFVlItzPjmA3WjGPmJ2d3Jd3uwayU8HUJ1mzmNyM="))
	if err != nil {
		return "", err
	}

	ciphertext, err := base64.StdEncoding.DecodeString(cipherText)
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

	if len(ciphertext) < gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:gcm.NonceSize()], ciphertext[gcm.NonceSize():]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func GenerateKey() (string, error) {
	key := make([]byte, 32)
	_, err := io.ReadFull(rand.Reader, key)

	return base64.StdEncoding.EncodeToString(key), err
}

func Hash256(plaintext string) (string, error) {
	hasher := sha256.New()
	_, err := hasher.Write([]byte(plaintext))
	if err != nil {
		return "", err
	}
	hashBytes := hasher.Sum(nil)
	hashString := hex.EncodeToString(hashBytes)
	return hashString, err
}

