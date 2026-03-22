# Claude Code Guidelines

## Project Overview

Python CLI application template focused on best practices, testing, and maintainability.

## Technology Stack

- **Language**: Python 3.11+
- **Package Manager**: uv
- **Testing**: pytest with coverage
- **Code Formatting**: black, isort
- **API Framework**: FastAPI + uvicorn (when building APIs)

## Project Structure

```
template-python-app/
├── .cursor/rules/              # Cursor rules (source of truth for shared guidelines)
├── app/                        # Application directory
│   ├── app/                    # Source code package
│   ├── tests/                  # Test files
│   ├── Dockerfile
│   ├── main.py
│   ├── Makefile
│   ├── pyproject.toml
│   └── requirements.txt
└── CLAUDE.md
```

## Coding Style

- No multi-line comments in code
- No emojis in print statements or log output
- Use `logger.info()` / `logger.error()` etc. instead of `print()`
- Functions: `snake_case`, Classes: `PascalCase`, Constants: `UPPER_SNAKE_CASE`
- Use Google-style docstrings

## UV Commands

```bash
uv build                  # Build package
uv export --format requirements-txt --no-hashes > requirements.txt
uv run black .            # Format code
uv run pytest --cov=./tests --black -rAP -s -vvv  # Run tests
```

## Testing

- Framework: **pytest** with coverage
- Test files: `test_*.py` or `*_test.py`
- Aim for 80%+ coverage; 95%+ on critical paths
- Test both success and failure paths
- Mock external services in unit tests; don't make real network calls
- Use `conftest.py` for shared fixtures
- Run tests via Docker for consistency: `make test`

## Docker

- Use official Python base images; multi-stage builds for smaller images
- Do NOT run as root user
- Do NOT include `version:` field in `docker-compose.yaml` (deprecated in Compose v2+)
- After `make start` with docker compose, output port mappings in this format:

```
==========================================
Services Started Successfully!
==========================================

Service Ports:
  • <service>: http://localhost:<port>

Useful Commands:
  • View logs:    make logs
  • Stop:         make stop
```

## Preferred Tools

- **API**: FastAPI + uvicorn (default unless told otherwise)
- **Testing**: pytest + curl for manual API testing
- **Formatting**: black (88 char line length) + isort
- **`make start`**: should start docker compose services (if applicable) and output port mappings

## Logging

Use `colorlog` for colored output in all Python applications.

### Setup

```python
import logging
import colorlog

handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(cyan)s%(asctime)s %(levelname)s%(reset)s:  %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    log_colors={
        'DEBUG': 'white',
        'INFO': 'cyan',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
))
logger = logging.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

### Uvicorn (`logging.yaml`)

```yaml
version: 1
disable_existing_loggers: false
formatters:
  color:
    (): colorlog.ColoredFormatter
    format: "%(log_color)s%(cyan)s%(asctime)s %(levelname)s%(reset)s:  %(message)s"
    datefmt: "%Y-%m-%d %H:%M:%S"
    log_colors:
      DEBUG: white
      INFO: cyan
      WARNING: yellow
      ERROR: red
      CRITICAL: bold_red
handlers:
  default:
    class: logging.StreamHandler
    formatter: color
    stream: ext://sys.stdout
loggers:
  uvicorn:
    handlers: [default]
    level: INFO
  uvicorn.error:
    handlers: [default]
    level: INFO
    propagate: true
  uvicorn.access:
    handlers: [default]
    level: INFO
    propagate: true
root:
  handlers: [default]
  level: INFO
```

Run uvicorn with: `uvicorn --port 4002 --host 0.0.0.0 main:app --reload --log-config logging.yaml`

## Security

- Never commit API keys or secrets — use environment variables
- Keep dependencies updated
- Use `.gitignore` to exclude sensitive files
