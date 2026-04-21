from fastapi import APIRouter, Depends, HTTPException
from app.db.prisma import db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/")
async def get_documents(user: dict = Depends(get_current_user)):
    documents = await db.document.find_many(
        where={"userId": user['sub']},
        order={"createdAt": "desc"}
    )
    return documents

@router.get("/{document_id}")
async def get_document_details(document_id: str, user: dict = Depends(get_current_user)):
    # Check Redis cache
    from app.core.redis import redis_client
    import json
    
    cache_key = f"document_details:{document_id}"
    cached_doc = await redis_client.get(cache_key)
    
    # If cache hit, verify ownership
    if cached_doc:
        print(f"DEBUG: Cache HIT for {document_id}")
        doc_data = json.loads(cached_doc)
        if doc_data.get('userId') == user['sub']:
             return doc_data
    
    print(f"DEBUG: Cache MISS for {document_id}")
    
    # Cache miss or auth failed (if we didn't store userId, but we will)
    document = await db.document.find_unique(
        where={"id": document_id},
        include={"documentData": True}
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if document.userId != user['sub']:
        raise HTTPException(status_code=403, detail="Not authorized to view this document")
        
    progress = 0
    if document.status in ("processing", "topics_ready"):
        p = await redis_client.get(f"progress:{document_id}")
        if p:
            progress = int(p)
    elif document.status == "ready":
        progress = 100

    # UploadThing URLs are public by default — no signed URL needed
    file_url = document.fileUrl

    response_data = {
        "id": document.id,
        "name": document.name,
        "status": document.status,
        "progress": progress,
        "fileUrl": file_url,
        "topics": document.documentData.topics if document.documentData else [],
        "explanations": document.documentData.explanations if document.documentData else {},
        "mindTree": document.documentData.mindTree if document.documentData else {},
        "predictedQuestions": document.documentData.predictedQuestions if document.documentData else [],
        "userId": document.userId # Include userId for auth check in cache
    }
    
    # Only cache when fully ready — don't cache partial (topics_ready) results
    if document.status == "ready":
        await redis_client.set(cache_key, json.dumps(response_data), expire=3600)

    return response_data

@router.delete("/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(get_current_user)):
    document = await db.document.find_unique(where={"id": document_id})
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if document.userId != user['sub']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    # Delete from UploadThing
    if document.fileUrl:
        try:
            from app.services.uploadthing_storage import ut_service
            # Extract file key from URL: https://<appId>.ufs.sh/f/<fileKey>
            file_key = document.fileUrl.split("/f/")[-1] if "/f/" in document.fileUrl else None
            if file_key:
                await ut_service.delete_file(file_key)
        except Exception as e:
            print(f"Error deleting file from UploadThing: {e}")

    # Delete from DB (Cascade delete should handle related data if configured, otherwise delete manually)
    # Prisma schema doesn't show cascade delete on relations explicitly in the snippet, 
    # but usually it's handled if configured. 
    # Let's delete related data first to be safe or rely on Prisma's onDelete: Cascade if set.
    # Looking at schema, no onDelete: Cascade is visible in the snippet provided earlier.
    # So we should delete DocumentData and VectorMetadata first.
    
    await db.documentdata.delete_many(where={"documentId": document_id})
    await db.vectormetadata.delete_many(where={"documentId": document_id})
    await db.document.delete(where={"id": document_id})
    
    # Invalidate cache
    from app.core.redis import redis_client
    await redis_client.delete(f"document_details:{document_id}")
    
    return {"message": "Document deleted successfully"}
