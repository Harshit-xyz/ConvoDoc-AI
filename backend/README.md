# ConvoDoc ai Backend

The backend for ConvoDoc ai, an AI-powered document assistant. Built with FastAPI, it handles document processing, vector embeddings, and LLM interactions.

## Features

- **FastAPI**: High-performance async API.
- **LangGraph**: Orchestrates complex analysis workflows (Topic Extraction, Mind Maps).
- **Google Gemini**: Powers the AI intelligence.
- **Pinecone**: Vector database for semantic search.
- **Redis**: Caching and progress tracking.
- **Prisma**: ORM for database management.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file with:
    ```env
    DATABASE_URL="postgresql://..."
    PINECONE_API_KEY="..."
    GOOGLE_API_KEY="..."
    REDIS_URL="redis://localhost:6379"
    ```

3.  **Run Server**:
    ```bash
    uvicorn main:app --reload
    ```

## Docker

Build and run the backend container:

```bash
docker build -t convodocai-backend .
docker run -p 8000:8000 --env-file .env convodocai-backend
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for the interactive Swagger UI.
