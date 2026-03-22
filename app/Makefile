# UV COMMANDS

.PHONY: pinstall pbuild requirements black pytest black

ubuild:
	uv build

requirements:
	uv export --format requirements-txt --no-hashes > requirements.txt 

pblack:
	uv run black .

pytest:
	uv run pytest --cov=./tests --black -rAP  -s -vvv

format:
	isort .
	black .


# DOCKER / CONTAINER REGISTRY COMMANDS
CONTAINER_NAME=template
PROJECT_ID=kavi-dummy-project-123
TEST_IMAGE=$(CONTAINER_NAME)-test

.PHONY: build run push attach test

build:
	docker build -t gcr.io/$(PROJECT_ID)/$(CONTAINER_NAME) .

run: build
	docker run -it --name ${CONTAINER_NAME} gcr.io/$(PROJECT_ID)/$(CONTAINER_NAME)

push: build
	docker push gcr.io/$(PROJECT_ID)/$(CONTAINER_NAME)

attach:
	docker exec -it $(CONTAINER_NAME) /bin/bash

test:
	@echo "Building Docker image for testing..."
	docker build -t $(TEST_IMAGE) .
	@echo "Running tests in Docker container..."
	docker run --rm $(TEST_IMAGE) pytest --cov=app --cov-report=term-missing -v
