IMAGE = todolist-api

build:
	docker build -t $(IMAGE) -f packages/server/Dockerfile .

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker rmi $(IMAGE)

fresh:
	docker compose down -v && docker compose up --build

psql:
	psql postgres://postgres:postgres@localhost:5432/todolist

psql-test:
	psql postgres://postgres:postgres@localhost:5432/todolist_test

.PHONY: build up down logs clean fresh psql psql-test
