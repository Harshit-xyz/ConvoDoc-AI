from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.services.llm import generate_content
from app.db.prisma import db

router = APIRouter()

class QuestionRequest(BaseModel):
    documentId: str
    question: str

@router.post("/")
async def ask_question(request: QuestionRequest, user: dict = Depends(get_current_user)):
    # Verify access
    document = await db.document.find_unique(
        where={"id": request.documentId}
    )
    if not document or document.userId != user['sub']:
        raise HTTPException(status_code=403, detail="Not authorized")

    # RAG Implementation
    from app.services.vector_store import query_vectors
    
    # Search for relevant chunks
    search_results = await query_vectors(request.question, filter={"document_id": request.documentId})
    
    context_chunks = []
    if search_results and search_results.matches:
        for match in search_results.matches:
            if match.metadata and 'text' in match.metadata:
                context_chunks.append(match.metadata['text'])
    
    context = "\n\n".join(context_chunks)
    
    # Fallback to document data if no vector results (or as additional context)
    doc_data = await db.documentdata.find_unique(where={"documentId": request.documentId})
    if doc_data and doc_data.explanations:
        context += f"\n\nAdditional Context from Topics: {str(doc_data.explanations)[:2000]}"
    
    prompt = f"""
    Answer the user's question based on the context provided.
    Do not use markdown lists or asterisks (*) for bullet points, prefer clean paragraphs.
    
    Context:
    {context}
    
    Question: {request.question}
    """
    
    answer = await generate_content(prompt)
    
    # Save conversation
    await db.message.create(
        data={
            "documentId": request.documentId,
            "role": "user",
            "content": request.question
        }
    )
    
    await db.message.create(
        data={
            "documentId": request.documentId,
            "role": "ai",
            "content": answer
        }
    )
    
    return {"answer": answer}

@router.get("/history/{document_id}")
async def get_chat_history(document_id: str, user: dict = Depends(get_current_user)):
    # Verify access
    document = await db.document.find_unique(
        where={"id": document_id}
    )
    if not document or document.userId != user['sub']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    messages = await db.message.find_many(
        where={"documentId": document_id},
        order={"createdAt": "asc"}
    )
    
    return messages

@router.delete("/history/{document_id}")
async def clear_chat_history(document_id: str, user: dict = Depends(get_current_user)):
    # Verify access
    document = await db.document.find_unique(
        where={"id": document_id}
    )
    if not document or document.userId != user['sub']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await db.message.delete_many(
        where={"documentId": document_id}
    )
    
    return {"status": "success"}
