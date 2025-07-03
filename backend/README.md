# JargonPlay AI Backend

This is the FastAPI backend service for JargonPlay that provides AI-powered puzzle generation using the IONOS AI Model Hub.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the development server:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Or use the npm script from the root directory:
   ```bash
   npm run backend
   ```

3. **The API will be available at:**
   - Local: http://localhost:8000
   - Health check: http://localhost:8000/
   - API docs: http://localhost:8000/docs

## API Endpoints

### `GET /`
Health check endpoint that returns a simple status message.

### `POST /generate-puzzle`
Generates puzzle content using AI.

**Request Body:**
```json
{
  "type": "wordsearch" | "crossword",
  "topic": "string"
}
```

**Response for Word Search:**
```json
{
  "words": ["ALGORITHM", "BLOCKCHAIN", "CYBERSECURITY", ...]
}
```

**Response for Crossword:**
```json
{
  "words": [
    {"word": "ALGORITHM", "definition": "Step-by-step procedure"},
    {"word": "BLOCKCHAIN", "definition": "Distributed ledger technology"},
    ...
  ]
}
```

## Configuration

The IONOS AI Model Hub configuration is hardcoded in `main.py`. In production, these should be moved to environment variables:

- `IONOS_API_KEY`: Your IONOS AI Model Hub API key
- `CHAT_MODEL_ID`: The model ID for text generation (currently using `meta-llama/llama-3.1-8b-instruct`)

## Error Handling

The API includes comprehensive error handling for:
- Invalid input validation
- AI service timeouts
- Network connectivity issues
- Malformed AI responses
- Rate limiting and quota issues

## CORS

CORS is configured to allow requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Alternative dev server)

## Logging

The service includes structured logging for debugging and monitoring AI generation requests and responses.