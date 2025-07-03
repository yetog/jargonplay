"""
FastAPI backend for JargonPlay AI puzzle generation
"""
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="JargonPlay AI Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IONOS AI Model Hub Configuration
IONOS_CONFIG = {
    "API_KEY": "eyJ0eXAiOiJKV1QiLCJraWQiOiJkZDZkNWExYS00NDY0LTQ0MGEtYjJhMC05NjY0Y2IzNDZiNDYiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpb25vc2Nsb3VkIiwiaWF0IjoxNzQ4NDgwMjk5LCJjbGllbnQiOiJVU0VSIiwiaWRlbnRpdHkiOnsiaXNQYXJlbnQiOmZhbHNlLCJjb250cmFjdE51bWJlciI6MzM5NzEwMzMsInJvbGUiOiJvd25lciIsInJlZ0RvbWFpbiI6Imlvbm9zLmNvbSIsInJlc2VsbGVySWQiOjEsInV1aWQiOiI3YmNiNzg4MS1hZDMxLTQxMDgtOGI3Zi0wOGIyNjdiYTI0ZWUiLCJwcml2aWxlZ2VzIjpbIkRBVEFfQ0VOVEVSX0NSRUFURSIsIlNOQVBTSE9UX0NSRUFURSIsIklQX0JMT0NLX1JFU0VSVkUiLCJNQU5BR0VfREFUQVBMQVRGT1JNIiwiQUNDRVNTX0FDVElWSVRZX0xPRyIsIlBDQ19DUkVBVEUiLCJBQ0NFU1NfUzNfT0JKRUNUX1NUT1JBR0UiLCJCQUNLVVBfVU5JVF9DUkVBVEUiLCJDUkVBVEVfSU5URVJORVRfQUNDRVNTIiwiSzhTX0NMVVNURVJfQ1JFQVRFIiwiRkxPV19MT0dfQ1JFQVRFIiwiQUNDRVNTX0FORF9NQU5BR0VfTU9OSVRPUklORyIsIkFDQ0VTU19BTkRfTUFOQUdFX0NFUlRJRklDQVRFUyIsIkFDQ0VTU19BTkRfTUFOQUdFX0xPR0dJTkciLCJNQU5BR0VfREJBQVMiLCJBQ0NFU1NfQU5EX01BTkFHRV9ETlMiLCJNQU5BR0VfUkVHSVNUUlkiLCJBQ0NFU1NfQU5EX01BTkFHRV9DRE4iLCJBQ0NFU1NfQU5EX01BTkFHRV9WUE4iLCJBQ0NFU1NfQU5EX01BTkFHRV9BUElfR0FURVdBWSIsIkFDQ0VTU19BTkRfTUFOQUdFX05HUyIsIkFDQ0VTU19BTkRfTUFOQUdFX0tBQVMiLCJBQ0NFU1NfQU5EX01BTkFHRV9ORVRXT1JLX0ZJTEVfU1RPUkFHRSIsIkFDQ0VTU19BTkRfTUFOQUdFX0FJX01PREVMX0hVQiIsIkNSRUFURV9ORVRXT1JLX1NFQ1VSSVRZX0dST1VQUyIsIkFDQ0VTU19BTkRfTUFOQUdFX0lBTV9SRVNPVVJDRVMiXX0sImV4cCI6MTc1NjI1NjI5OX0.MWVvOpvWZFsqQSegbv2IowICHBug2IJODqMk9qSKLRkbzBpLf63JtXwhC8jLDzSFUBgg40mXvMMo0s0-AAcalDeCAKDMccWZYzsKuKVfalTAsh0EGhc8aegs53zXX75MYx02pBddAb2pXrQ96sOknoyffekiM0vufIkD39Rj92gXAUStt7BPjTor1eCqs48BPvHjVojdE_tVJZg5kYAq5f_nAKTT3yDj1_2CQQdtrUZVI_FY8yl5Q_0DyN4oASNDsALhIv2wr49V2dvb9EB-AqIO1TndgkyZxH66Isnz2zJ2BA1tWgSMGTnXAQXNQ5O8qXq0gq97xDoqMjVEk9TahA",
    "CHAT_MODEL_ID": "meta-llama/llama-3.1-8b-instruct",
    "API_BASE": "https://inference.de-txl.ionos.com/models"
}

class PuzzleRequest(BaseModel):
    type: str  # "wordsearch" or "crossword"
    topic: str

class WordSearchResponse(BaseModel):
    words: List[str]

class CrosswordResponse(BaseModel):
    words: List[Dict[str, str]]

def create_prompt(puzzle_type: str, topic: str) -> str:
    """Create appropriate prompt based on puzzle type and topic"""
    if puzzle_type == "wordsearch":
        return f"""Generate exactly 15-20 single words related to "{topic}". 
Return only a JSON array of strings with no explanations or additional text.
Each word should be uppercase and contain only letters (no spaces, hyphens, or special characters).

Example format:
["ALGORITHM", "BLOCKCHAIN", "CYBERSECURITY", "DATABASE", "ENCRYPTION"]

Topic: {topic}"""
    
    elif puzzle_type == "crossword":
        return f"""Generate exactly 8-12 vocabulary terms related to "{topic}" with their definitions.
Return only a JSON array of objects with no explanations or additional text.
Each word should be uppercase and contain only letters (no spaces, hyphens, or special characters).
Definitions should be concise (under 50 characters).

Example format:
[
  {{"word": "ALGORITHM", "definition": "Step-by-step procedure for solving problems"}},
  {{"word": "BLOCKCHAIN", "definition": "Distributed ledger technology"}},
  {{"word": "DATABASE", "definition": "Organized collection of data"}}
]

Topic: {topic}"""
    
    else:
        raise ValueError(f"Unknown puzzle type: {puzzle_type}")

async def call_ionos_api(prompt: str) -> str:
    """Make API call to IONOS AI Model Hub"""
    headers = {
        "Authorization": f"Bearer {IONOS_CONFIG['API_KEY']}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": IONOS_CONFIG['CHAT_MODEL_ID'],
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that generates educational content. Always respond with valid JSON only, no additional text or explanations."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{IONOS_CONFIG['API_BASE']}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"IONOS API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI service error: {response.status_code}"
                )
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not content:
                raise HTTPException(status_code=500, detail="Empty response from AI service")
                
            return content.strip()
            
    except httpx.TimeoutException:
        logger.error("Timeout calling IONOS API")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Error calling IONOS API: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

def parse_ai_response(content: str, puzzle_type: str) -> Dict[str, Any]:
    """Parse and validate AI response"""
    try:
        # Try to extract JSON from the response
        content = content.strip()
        
        # Find JSON content (sometimes AI adds extra text)
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("No JSON array found in response")
            
        json_content = content[start_idx:end_idx]
        parsed_data = json.loads(json_content)
        
        if not isinstance(parsed_data, list):
            raise ValueError("Response is not a JSON array")
        
        if puzzle_type == "wordsearch":
            # Validate word search format
            words = []
            for item in parsed_data:
                if isinstance(item, str):
                    word = item.upper().strip()
                    # Remove any non-letter characters
                    word = ''.join(c for c in word if c.isalpha())
                    if len(word) >= 3:  # Minimum word length
                        words.append(word)
            
            if len(words) < 5:
                raise ValueError("Not enough valid words generated")
                
            return {"words": words[:20]}  # Limit to 20 words
        
        elif puzzle_type == "crossword":
            # Validate crossword format
            word_defs = []
            for item in parsed_data:
                if isinstance(item, dict) and "word" in item and "definition" in item:
                    word = item["word"].upper().strip()
                    # Remove any non-letter characters
                    word = ''.join(c for c in word if c.isalpha())
                    definition = item["definition"].strip()
                    
                    if len(word) >= 3 and len(definition) >= 5:
                        word_defs.append({"word": word, "definition": definition})
            
            if len(word_defs) < 3:
                raise ValueError("Not enough valid word-definition pairs generated")
                
            return {"words": word_defs[:12]}  # Limit to 12 words
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise ValueError("Invalid JSON response from AI")
    except Exception as e:
        logger.error(f"Parse error: {str(e)}")
        raise ValueError(f"Failed to parse AI response: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "JargonPlay AI Backend is running"}

@app.post("/generate-puzzle")
async def generate_puzzle(request: PuzzleRequest):
    """Generate puzzle content using AI"""
    try:
        # Validate input
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
        if request.type not in ["wordsearch", "crossword"]:
            raise HTTPException(status_code=400, detail="Type must be 'wordsearch' or 'crossword'")
        
        # Create prompt
        prompt = create_prompt(request.type, request.topic)
        logger.info(f"Generating {request.type} puzzle for topic: {request.topic}")
        
        # Call AI API
        ai_response = await call_ionos_api(prompt)
        logger.info(f"AI response received: {ai_response[:200]}...")
        
        # Parse and validate response
        parsed_result = parse_ai_response(ai_response, request.type)
        
        logger.info(f"Successfully generated {len(parsed_result['words'])} items")
        return parsed_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)