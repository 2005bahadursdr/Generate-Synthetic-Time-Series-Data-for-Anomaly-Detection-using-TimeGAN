from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio
import random
import datetime

router = APIRouter()

# Global state for training simulation
training_state = {
    "status": "Ready",
    "epoch": 0,
    "total_epochs": 0,
    "logs": [],
    "last_loss": 0.0
}

class TrainTimeGANRequest(BaseModel):
    dataset_id: str
    epochs: int = 100
    batch_size: int = 128
    hidden_dim: int = 24

# Mock training function
async def dummy_train_timegan(dataset_id: str, epochs: int):
    global training_state
    training_state["status"] = "Training"
    training_state["epoch"] = 0
    training_state["total_epochs"] = epochs
    training_state["logs"] = [
        f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Initializing TimeGAN Architecture...",
        f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Connecting to dataset '{dataset_id}'...",
        f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Building Embedding Network (GRU)...",
        f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Building Generator & Discriminator...",
    ]
    
    # Simulate training delay
    for i in range(1, epochs + 1):
        await asyncio.sleep(0.05) # 50ms per epoch mock
        loss_e = round(random.uniform(0.1, 0.5), 4)
        loss_d = round(random.uniform(0.4, 0.7), 4)
        loss_g = round(random.uniform(0.5, 0.8), 4)
        
        training_state["epoch"] = i
        training_state["last_loss"] = loss_g
        
        # Log periodically
        if i % max(1, epochs // 10) == 0 or i == 1:
            log_line = f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Epoch {i}/{epochs} - Loss_E: {loss_e} | Loss_D: {loss_d} | Loss_G: {loss_g}"
            training_state["logs"].append(log_line)
            
    training_state["logs"].append(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] TimeGAN training complete!")
    training_state["status"] = "Complete"

@router.post("/train-timegan")
async def train_timegan(req: TrainTimeGANRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to trigger TimeGAN training. Runs in the background.
    """
    global training_state
    if training_state["status"] == "Training":
        return {"message": "Training already in progress", "status": "Training"}
        
    background_tasks.add_task(dummy_train_timegan, req.dataset_id, req.epochs)
    return {"message": "TimeGAN training started in the background.", "status": "Training"}

@router.get("/timegan-status")
async def get_timegan_status():
    """
    Endpoint to get current training status. Mocked for now.
    """
    global training_state
    return training_state
