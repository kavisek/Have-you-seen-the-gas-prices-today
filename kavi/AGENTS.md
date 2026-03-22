# Agent Instructions

## Project Overview

Python CLI application template. Detailed rules are in `.cursor/rules/`.

## Coding Style

- No multi-line comments in code
- No emojis in print statements or log output
- Use `logger.info()` / `logger.error()` instead of `print()`
- Functions: `snake_case` | Classes: `PascalCase` | Constants: `UPPER_SNAKE_CASE`

## Technology Stack

- **Language**: Python 3.11+
- **Package Manager**: uv
- **Testing**: pytest with coverage (`uv run pytest --cov=./tests --black -rAP -s -vvv`)
- **Formatting**: black (`uv run black .`) + isort
- **API**: FastAPI + uvicorn (default unless told otherwise)

## Logging

Always use `colorlog` for colored output — never plain `print()`. Configure early in app startup.

## Docker

- Never include `version:` in `docker-compose.yaml` (deprecated in Compose v2+)
- After `make start`, output port mappings showing all running service URLs

## Testing

- Aim for 80%+ coverage; 95%+ on critical paths
- Mock external services in unit tests
- Run tests in Docker for consistency: `make test`
