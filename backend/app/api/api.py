from fastapi import APIRouter
from app.api.endpoints import upload, documents, qna, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(qna.router, prefix="/qna", tags=["qna"])
