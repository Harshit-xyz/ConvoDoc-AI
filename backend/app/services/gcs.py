from google.cloud import storage
from app.core.config import get_settings
import datetime

settings = get_settings()

class GCSService:
    def __init__(self):
        self.client = storage.Client()
        self.bucket_name = settings.BUCKET_NAME
        self.bucket = self.client.bucket(self.bucket_name)

    def upload_file(self, file_obj, destination_blob_name: str, content_type: str = "application/pdf"):
        blob = self.bucket.blob(destination_blob_name)
        blob.upload_from_file(file_obj, content_type=content_type)
        return blob.public_url

    def generate_signed_url(self, blob_name: str, expiration=3600):
        blob = self.bucket.blob(blob_name)
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(seconds=expiration),
            method="GET",
        )
        return url

    def download_as_bytes(self, blob_name: str) -> bytes:
        blob = self.bucket.blob(blob_name)
        return blob.download_as_bytes()

    def delete_file(self, blob_name: str):
        blob = self.bucket.blob(blob_name)
        blob.delete()

gcs_service = GCSService()
