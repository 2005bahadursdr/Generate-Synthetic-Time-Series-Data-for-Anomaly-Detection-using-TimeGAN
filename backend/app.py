from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from contextlib import asynccontextmanager

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://bahadursdr2005_db_user:bahadursdr@cluster0.mo38slc.mongodb.net/?appName=Cluster0")
client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = AsyncIOMotorClient(MONGO_URI)
    app.state.db = client.timegan_db
    print("Connected to MongoDB!")
    yield
    client.close()
    print("Closed MongoDB connection.")

app = FastAPI(
    title="TimeGAN Anomaly Detection API",
    description="API for managing IoT datasets, generating synthetic time-series data with TimeGAN, and training Anomaly Detection models.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TimeGAN Anomaly Detection API"}

# We will include routers here once created
from routes import dataset_routes, model_routes
app.include_router(dataset_routes.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(model_routes.router, prefix="/api/models", tags=["Models"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
