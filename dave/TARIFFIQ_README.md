# TariffIQ

AI-assisted trade compliance: HTS classification, USMCA RVC checks, tariff engineering, PDF documents, and a shipping map.

## Quick start

**Backend** (from `backend/`):

```bash
uv sync
cp ../data/canadian_hs_tariff_2026.csv ../data/   # if missing; sample included in repo
uv run python scripts/seed_hts_cache.py            # USITC-style cache + USMCA annex JSON
export ANTHROPIC_API_KEY=sk-ant-...                # required for /classify, /usmca/check, /engineer
uv run uvicorn main:app --host 0.0.0.0 --port 4002 --reload
```

**Frontend** (from `frontend/`):

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4002` (default in docker-compose).

## Tests

```bash
cd backend && uv run pytest tests/ -v
```

## Docker

`docker compose up` runs Postgres, Alembic migrations, backend (port 4002), and frontend (3000). Mount `./data` for HS CSV and optional HTS cache.

## Docs

API: `http://localhost:4002/docs` (local env). Full specification: [TariffIQ.md](./TariffIQ.md).
