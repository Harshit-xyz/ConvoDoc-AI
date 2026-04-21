from app.db.prisma import db
from app.services.uploadthing_storage import ut_service
from app.services.llm import extract_topics, generate_explanations, generate_mind_tree, generate_predicted_questions
from app.core.redis import redis_client
import fitz  # PyMuPDF
import asyncio
import json


async def process_document(document_id: str, file_url: str, file_key: str):
    try:
        # Update status to processing
        await db.document.update(
            where={"id": document_id},
            data={"status": "processing"}
        )

        # ──────────────────────────────────────────────
        # PHASE 1: Fast path — download, extract text, extract topics
        # ──────────────────────────────────────────────

        # Download file
        await redis_client.set(f"progress:{document_id}", "10")
        file_content = await ut_service.download_as_bytes(file_url)
        
        # Extract text from PDF
        await redis_client.set(f"progress:{document_id}", "20")
        text = ""
        
        # UploadThing URLs don't have extensions, try PyMuPDF directly since we enforce PDF/DOCX at upload
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text += page.get_text()
        except Exception as e:
            print(f"PyMuPDF failed to extract text: {e}")

        if not text:
            raise Exception("Could not extract text from document (ensure it is a valid PDF containing text)")

        # Extract topics first (priority task)
        await redis_client.set(f"progress:{document_id}", "30")
        topics = await extract_topics(text)

        # Extract explanations immediately alongside topics
        await redis_client.set(f"progress:{document_id}", "35")
        explanations = await generate_explanations(text, topics)

        # Save both topics and explanations so the frontend can fully render the TopicsTab
        await _save_document_data(document_id, topics=topics, explanations=explanations)

        # Mark topics as ready — frontend can now display them
        await redis_client.set(f"progress:{document_id}", "40")
        await db.document.update(
            where={"id": document_id},
            data={"status": "topics_ready"}
        )

        # ──────────────────────────────────────────────
        # PHASE 2: Background — remaining analysis + embeddings (concurrent)
        # ──────────────────────────────────────────────

        # Run mind tree, questions, and embeddings concurrently in the background
        mind_tree_task = generate_mind_tree(text)
        questions_task = generate_predicted_questions(text)

        # Prepare embedding chunks while LLM tasks run
        chunk_size = 1000
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

        from app.services.vector_store import upsert_vectors
        embeddings_task = upsert_vectors(document_id, chunks)

        # Await all concurrently
        mind_tree, questions, _ = await asyncio.gather(
            mind_tree_task,
            questions_task,
            embeddings_task,
        )

        await redis_client.set(f"progress:{document_id}", "90")

        # Update the document data row with remaining fields
        await _update_document_data(
            document_id,
            mind_tree=mind_tree,
            questions=questions,
        )

        # Mark fully ready
        await redis_client.set(f"progress:{document_id}", "100")
        await db.document.update(
            where={"id": document_id},
            data={"status": "ready"}
        )

        # Invalidate cached partial data so the next fetch gets the full result
        await redis_client.delete(f"document_details:{document_id}")

    except Exception as e:
        print(f"Processing failed for {document_id}: {e}")
        await db.document.update(
            where={"id": document_id},
            data={"status": "failed"}
        )


# ── DB helpers with retry logic ──────────────────────────────

async def _save_document_data(document_id: str, topics: list, explanations: dict = None):
    """Create the DocumentData row with topics and explanations (Phase 1)."""
    if explanations is None:
        explanations = {}
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if not db.is_connected():
                await db.connect()

            await db.documentdata.create(
                data={
                    "documentId": document_id,
                    "topics": json.dumps(topics),
                    "explanations": json.dumps(explanations),
                    "mindTree": json.dumps({}),
                    "predictedQuestions": json.dumps([]),
                }
            )
            return
        except Exception as e:
            print(f"DB Save (topics) failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise e
            await asyncio.sleep(1)


async def _update_document_data(document_id: str, mind_tree: dict, questions: list):
    """Update the existing DocumentData row with remaining analysis results (Phase 2)."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if not db.is_connected():
                await db.connect()

            await db.documentdata.update(
                where={"documentId": document_id},
                data={
                    "mindTree": json.dumps(mind_tree),
                    "predictedQuestions": json.dumps(questions),
                }
            )
            return
        except Exception as e:
            print(f"DB Update (full analysis) failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise e
            await asyncio.sleep(1)
