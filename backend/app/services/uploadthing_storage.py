import httpx
import json
import base64
import hashlib
import hmac
import time
import urllib.parse
from sqids import Sqids
from app.core.config import get_settings

settings = get_settings()

# Default SQIDs alphabet (matches JS sqids library)
SQIDS_DEFAULT_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"


def _decode_token(token: str) -> dict:
    """Decode the base64 UPLOADTHING_TOKEN to extract apiKey, appId, regions."""
    decoded = base64.b64decode(token)
    return json.loads(decoded)


# ── Replicate Effect.js Hash.string (DJB2) ────────────────────

def _effect_hash_string(s: str) -> int:
    """Replicate Effect.js Hash.string — DJB2 hash with optimize."""
    h = 5381
    i = len(s)
    while i:
        i -= 1
        h = ((h * 33) ^ ord(s[i])) & 0xFFFFFFFF  # keep as 32-bit
    return _optimize(h)


def _optimize(n: int) -> int:
    """Replicate Effect.js Hash.optimize."""
    # Convert to signed 32-bit
    if n >= 0x80000000:
        n -= 0x100000000
    return (n & 0xBFFFFFFF) | ((n >> 1) & 0x40000000)


# ── Replicate SQIDs shuffle with appId ────────────────────────

def _shuffle(alphabet: str, seed: str) -> str:
    """Replicate the JS shuffle(str, seed) function from uploadthing."""
    chars = list(alphabet)
    seed_num = _effect_hash_string(seed)
    for i in range(len(chars)):
        j = ((seed_num % (i + 1)) + i) % len(chars)
        chars[i], chars[j] = chars[j], chars[i]
    return "".join(chars)


def _generate_key(filename: str, file_size: int, file_type: str, app_id: str) -> str:
    """
    Replicate the JS generateKey function. 
    Generates a file key using SQIDs, seeded by the appId.
    """
    # Hash parts (same as JS default): [name, size, type, lastModified, Date.now()]
    hash_parts = json.dumps([filename, file_size, file_type, int(time.time() * 1000), int(time.time() * 1000)])
    
    alphabet = _shuffle(SQIDS_DEFAULT_ALPHABET, app_id)
    
    # Encode file seed
    file_hash = abs(_effect_hash_string(hash_parts))
    sqids_file = Sqids(alphabet=alphabet, min_length=36)
    encoded_file_seed = sqids_file.encode([file_hash])
    
    # Encode app id  
    app_hash = abs(_effect_hash_string(app_id))
    sqids_app = Sqids(alphabet=alphabet, min_length=12)
    encoded_app_id = sqids_app.encode([app_hash])
    
    return encoded_app_id + encoded_file_seed


# ── HMAC signing ──────────────────────────────────────────────

def _hmac_sign(payload: str, secret: str) -> str:
    """Sign payload with HMAC-SHA256, returns 'hmac-sha256=<hex>'."""
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"hmac-sha256={sig}"


def _generate_presigned_url(
    base_url: str,
    api_key: str,
    app_id: str,
    filename: str,
    file_size: int,
    file_type: str,
    ttl_seconds: int = 3600,
) -> str:
    """Generate a presigned ingest URL (mirrors JS SDK generateSignedURL)."""
    expiration = int(time.time() * 1000) + (ttl_seconds * 1000)

    # Build query params in the exact order the JS SDK uses
    params = [
        ("expires", str(expiration)),
        ("x-ut-identifier", app_id),
        ("x-ut-file-name", urllib.parse.quote(filename, safe="")),
        ("x-ut-file-size", str(file_size)),
        ("x-ut-file-type", urllib.parse.quote(file_type, safe="")),
        ("x-ut-content-disposition", "inline"),
        ("x-ut-acl", "public-read"),
    ]

    query_string = "&".join(f"{k}={v}" for k, v in params)
    url_without_sig = f"{base_url}?{query_string}"

    # Sign the full URL
    signature = _hmac_sign(url_without_sig, api_key)
    return f"{url_without_sig}&signature={urllib.parse.quote(signature, safe='')}"


class UploadThingService:
    def __init__(self):
        token_data = _decode_token(settings.UPLOADTHING_TOKEN)
        self.api_key = token_data["apiKey"]
        self.app_id = token_data["appId"]
        self.regions = token_data.get("regions", ["sea1"])
        self.api_url = "https://api.uploadthing.com"
        self.ingest_url = f"https://{self.regions[0]}.ingest.uploadthing.com"

    async def upload_file(self, file_bytes: bytes, filename: str, content_type: str = "application/pdf") -> dict:
        """
        Upload a file to UploadThing using the v7 ingest flow.
        Replicates the JS SDK's UTApi.uploadFiles logic exactly.
        """
        file_size = len(file_bytes)

        # Step 1: Generate a key (same algorithm as JS SDK)
        file_key = _generate_key(filename, file_size, content_type, self.app_id)

        # Step 2: Generate presigned URL
        upload_url = _generate_presigned_url(
            base_url=f"{self.ingest_url}/{file_key}",
            api_key=self.api_key,
            app_id=self.app_id,
            filename=filename,
            file_size=file_size,
            file_type=content_type,
        )

        # Step 3: PUT the file (multipart form-data with "file" field, matching JS SDK)
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.put(
                upload_url,
                files={"file": (filename, file_bytes, content_type)},
                headers={
                    "Range": "bytes=0-",
                    "x-uploadthing-version": "7.4.1",
                },
            )

            if resp.status_code not in (200, 201):
                error_text = resp.text
                print(f"UploadThing upload failed ({resp.status_code}): {error_text}")
                raise Exception(f"UploadThing upload failed ({resp.status_code}): {error_text}")

            result = resp.json()

        file_url = result.get("ufsUrl") or result.get("url") or f"https://{self.app_id}.ufs.sh/f/{file_key}"

        return {
            "key": result.get("key", file_key),
            "url": file_url,
            "name": filename,
            "size": file_size,
        }

    async def download_as_bytes(self, file_url: str) -> bytes:
        """Download a file from its UploadThing URL."""
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            resp = await client.get(file_url)
            resp.raise_for_status()
            return resp.content

    async def delete_file(self, file_key: str):
        """Delete a file from UploadThing by its file key."""
        async with httpx.AsyncClient(timeout=30) as client:
            headers = {
                "x-uploadthing-api-key": self.api_key,
                "Content-Type": "application/json",
            }
            resp = await client.post(
                f"{self.api_url}/v6/deleteFiles",
                json={"fileKeys": [file_key]},
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()


ut_service = UploadThingService()
