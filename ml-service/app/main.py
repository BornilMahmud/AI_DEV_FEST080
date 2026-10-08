from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config.settings import settings
from app.api.routes import router, load_models_at_startup

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model artifacts into memory once at startup
    load_models_at_startup()
    yield
    print("[ML Service] Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Authoritative Python-based Machine Learning Inference Microservice for upay Sentinel MFS Fraud Detection",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
