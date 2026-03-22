import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from config import get_origins, initialize_check, ENV
from controllers import (
    classify_controller,
    documents_controller,
    engineer_controller,
    health_controller,
    hs_codes_controller,
    marine_traffic_controller,
    products_controller,
    savings_controller,
    usmca_controller,
)
from database import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
initialize_check()


@asynccontextmanager
async def lifespan(app):
    init_db()
    yield


app = FastAPI(
    title="TariffIQ API",
    description="Trade compliance API for TariffIQ",
    version="0.1.0",
    openapi_url="/openapi.json" if ENV == "local" else None,
    docs_url="/docs" if ENV == "local" else None,
    redoc_url="/redoc" if ENV == "local" else None,
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", description="Welcome message.", tags=["Default"])
async def root():
    return {"message": "TariffIQ API"}


app.include_router(health_controller.router, prefix="/health", tags=["Health"])
app.include_router(hs_codes_controller.router, prefix="/hs-codes", tags=["HS Codes"])
app.include_router(marine_traffic_controller.router, prefix="/marine-traffic", tags=["Marine Traffic"])
app.include_router(savings_controller.router, prefix="/savings", tags=["Savings"])
app.include_router(classify_controller.router, tags=["Classify"])
app.include_router(usmca_controller.router, tags=["USMCA"])
app.include_router(engineer_controller.router, tags=["Engineer"])
app.include_router(documents_controller.router, tags=["Documents"])
app.include_router(products_controller.router, tags=["Products"])
