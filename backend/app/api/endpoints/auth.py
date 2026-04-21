from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import get_settings
from app.db.prisma import db
from app.core.redis import redis_client
import uuid

router = APIRouter()
settings = get_settings()

class LoginRequest(BaseModel):
    idToken: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    try:
        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            data.idToken, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        # Get user info
        email = idinfo['email']
        name = idinfo.get('name')
        google_user_id = idinfo['sub']

        # Upsert User in DB
        user = await db.user.find_unique(where={"email": email})
        
        if not user:
            user = await db.user.create(
                data={
                    "email": email,
                    "name": name,
                    "authProvider": "google",
                }
            )
        else:
            # Update name if changed (optional)
            pass

        # Create Session
        session_token = str(uuid.uuid4())
        
        # Store in Redis (expire in 24 hours)
        await redis_client.set(f"session:{session_token}", user.id, expire=86400)

        return {
            "token": session_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
