from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="Alltagslabor API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# GitLab repository URLs
GITLAB_BASE_URL = "https://gitlab.com/Datenflix007/alltagslabordata/-/raw/main"

# Define Models
class ExperimentStep(BaseModel):
    type: str
    content: str
    description: Optional[str] = ""

class Experiment(BaseModel):
    title: str
    shortDescription: str
    subject: str
    gradeLevel: str
    steps: List[ExperimentStep]
    schoolType: str

class SearchFilters(BaseModel):
    subject: Optional[str] = None
    gradeLevel: Optional[str] = None
    schoolType: Optional[str] = None
    freetext: Optional[str] = None

# Cache for data
_cache = {}

async def fetch_json_data(filename: str) -> Dict[str, Any]:
    """Fetch JSON data from GitLab repository with caching"""
    if filename not in _cache:
        try:
            url = f"{GITLAB_BASE_URL}/{filename}"
            response = requests.get(url)
            response.raise_for_status()
            _cache[filename] = response.json()
        except Exception as e:
            logger.error(f"Error fetching {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
    return _cache[filename]

async def fetch_text_data(filename: str) -> str:
    """Fetch text data from GitLab repository with caching"""
    if filename not in _cache:
        try:
            url = f"{GITLAB_BASE_URL}/{filename}"
            response = requests.get(url)
            response.raise_for_status()
            _cache[filename] = response.text
        except Exception as e:
            logger.error(f"Error fetching {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
    return _cache[filename]

@api_router.get("/")
async def root():
    return {"message": "Alltagslabor API", "version": "1.0.0"}

@api_router.get("/experiments", response_model=List[Experiment])
async def get_experiments():
    """Get all experiments"""
    data = await fetch_json_data("_experiments.json")
    return [Experiment(**exp) for exp in data]

@api_router.get("/experiments/search", response_model=List[Experiment])
async def search_experiments(
    subject: Optional[str] = Query(None, description="Subject to filter by"),
    gradeLevel: Optional[str] = Query(None, description="Grade level to filter by"),
    schoolType: Optional[str] = Query(None, description="School type to filter by"),
    freetext: Optional[str] = Query(None, description="Free text search")
):
    """Search experiments with filters"""
    experiments_data = await fetch_json_data("_experiments.json")
    experiments = [Experiment(**exp) for exp in experiments_data]
    
    filtered_experiments = experiments
    
    # Apply subject filter
    if subject:
        filtered_experiments = [exp for exp in filtered_experiments if exp.subject.lower() == subject.lower()]
    
    # Apply grade level filter
    if gradeLevel:
        filtered_experiments = [exp for exp in filtered_experiments if exp.gradeLevel == gradeLevel]
    
    # Apply school type filter
    if schoolType:
        filtered_experiments = [exp for exp in filtered_experiments if exp.schoolType.lower() == schoolType.lower()]
    
    # Apply free text search
    if freetext:
        search_term = freetext.lower()
        filtered_experiments = [
            exp for exp in filtered_experiments 
            if (search_term in exp.title.lower() or 
                search_term in exp.shortDescription.lower() or
                any(search_term in step.content.lower() for step in exp.steps))
        ]
    
    return filtered_experiments

@api_router.get("/experiments/{experiment_title}")
async def get_experiment_by_title(experiment_title: str):
    """Get a specific experiment by title"""
    experiments_data = await fetch_json_data("_experiments.json")
    
    for exp in experiments_data:
        if exp["title"] == experiment_title:
            return Experiment(**exp)
    
    raise HTTPException(status_code=404, detail="Experiment not found")

@api_router.get("/subjects")
async def get_subjects():
    """Get all subjects by state"""
    return await fetch_json_data("subjects.json")

@api_router.get("/school-types")
async def get_school_types():
    """Get all school types by state"""  
    return await fetch_json_data("typeOfSchoole.json")

@api_router.get("/grades")
async def get_grades():
    """Get available grade levels"""
    experiments_data = await fetch_json_data("_experiments.json")
    grades = list(set([exp["gradeLevel"] for exp in experiments_data]))
    return sorted(grades, key=lambda x: int(x) if x.isdigit() else float('inf'))

@api_router.get("/impressum")
async def get_impressum():
    """Get impressum text"""
    text = await fetch_text_data("impressum.txt")
    return {"content": text}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)