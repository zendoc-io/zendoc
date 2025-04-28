.PHONY: up down ps logs db-connect db-reset

up:
	docker-compose -f deploy/docker-compose.yml up -d

down:
	docker-compose -f deploy/docker-compose.yml down

ps:
	docker-compose ps

logs:
	docker-compose -f deploy/docker-compose.yml logs -f

db-connect:
	docker exec -it zendoc-postgres psql -U zendoc -d zendoc

db-reset:
	chmod +x ./deploy/reset-db.sh
	./deploy/reset-db.sh

db-tables:
	docker exec -it zendoc-postgres psql -U zendoc -d zendoc -c '\dt auth.*'

db-dump-schema:
	docker exec -it zendoc-postgres pg_dump -U zendoc --schema-only --schema=auth zendoc > schema_dump.sql
