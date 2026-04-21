from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from app.core.security import get_current_user
from app.services.uploadthing_storage import ut_service
from app.db.prisma import db
from app.services.processing import process_document
import uuid

router = APIRouter()

@router.post("/")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")

    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{user['sub']}_{uuid.uuid4()}.{file_ext}"
    
    # Upload to UploadThing
    try:
        file_bytes = await file.read()

        # Truncate to first 7 pages if it's a PDF
        if file.content_type == "application/pdf":
            try:
                import fitz
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                if len(doc) > 7:
                    doc.select(range(7))
                    file_bytes = doc.tobytes()
                doc.close()
            except Exception as e:
                print(f"Failed to truncate PDF: {e}")
        result = await ut_service.upload_file(file_bytes, filename, file.content_type)
        file_url = result["url"]
        file_key = result["key"]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    # Create DB record
    try:
        doc = await db.document.create(
            data={
                "userId": user['sub'],
                "name": file.filename,
                "fileUrl": file_url,
                "status": "processing"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error (Document): {str(e)}")

    # Trigger background task — pass the URL (not a blob name) since UploadThing files are accessed by URL
    background_tasks.add_task(process_document, doc.id, file_url, file_key)

    return {"id": doc.id, "status": "processing", "message": "File uploaded and processing started"}
