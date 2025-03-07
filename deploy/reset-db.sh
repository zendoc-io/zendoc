#!/bin/bash

echo "Stopping PostgreSQL container if running..."
docker container stop zendoc-postgres 
docker container rm zendoc-postgres 

echo "Removing PostgreSQL data volume..."
docker volume rm zendoc-postgres-data || true

echo "Starting PostgreSQL with initialization scripts..."
docker-compose -f ./deploy/docker-compose.yml up -d 

echo "Waiting for PostgreSQL to initialize..."
sleep 5

echo "Database has been reset and initialized with scripts from ./db/init/"
echo "You can connect to it using: docker exec -it zendoc-postgres psql -U zendoc -d zendoc"
