from pinecone import Pinecone
from app.core.config import get_settings
import google.generativeai as genai

settings = get_settings()

# Initialize Pinecone
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index("curiobot") 

# Initialize Embedding Model
genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_embedding(text: str) -> list:
    # Use Gemini for embeddings (truncated to 768 dims to match Pinecone index)
    result = await genai.embed_content_async(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_document",
        output_dimensionality=768,
    )
    return result['embedding']

async def upsert_vectors(document_id: str, chunks: list):
    vectors = []
    for i, chunk in enumerate(chunks):
        embedding = await generate_embedding(chunk)
        vectors.append({
            "id": f"{document_id}_{i}",
            "values": embedding,
            "metadata": {
                "document_id": document_id,
                "text": chunk,
                "chunk_index": i
            }
        })
    
    # Batch upsert
    index.upsert(vectors=vectors)

async def query_vectors(query: str, filter: dict = None, top_k: int = 5):
    # Embed query
    result = await genai.embed_content_async(
        model="models/gemini-embedding-001",
        content=query,
        task_type="retrieval_query",
        output_dimensionality=768,
    )
    embedding = result['embedding']
    
    # Query Pinecone
    results = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True,
        filter=filter
    )
    return results
