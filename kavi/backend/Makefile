PORT ?= 4002

.PHONY: start format test

start:
	@echo "=========================================="
	@echo "Services Started Successfully!"
	@echo "=========================================="
	@echo ""
	@echo "Service Ports:"
	@echo "  • backend: http://localhost:$(PORT)"
	@echo ""
	@echo "Useful Commands:"
	@echo "  • Stop:  Ctrl+C"
	@echo ""
	uv run uvicorn main:app --host 0.0.0.0 --port $(PORT) --reload --log-config logging.yaml

format:
	uv run black .
	uv run isort .

test:
	uv run python -m pytest --cov=./tests -rAP -s -vvv
