import os

from dotenv import load_dotenv

load_dotenv()

from controllers import (
    health_controller,
    marine_traffic_controller,
)
from config import get_origins, initialize_check, ENV
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logger import logger

initialize_check()

app = FastAPI(
    title="Vancity Hackathon API",
    description="API for the Vancity Hackathon",
    version="0.1.0",
    openapi_url="/openapi.json" if ENV == "local" else None,
    docs_url="/docs" if ENV == "local" else None,
    redoc_url="/redoc" if ENV == "local" else None,
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
    return {"message": "Welcome to Vancity Hackathon API"}


app.include_router(health_controller.router, prefix="/health", tags=["Health"])
app.include_router(marine_traffic_controller.router, prefix="/marine-traffic", tags=["Marine Traffic"])
