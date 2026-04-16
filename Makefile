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

.PHONY: build up down logs clean
