from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.redis import redis_client
from app.db.prisma import db
from app.core.config import get_settings

security = HTTPBearer()
settings = get_settings()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Check Redis for session
        user_id = await redis_client.get(f"session:{token}")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Fetch user from DB (optional, but ensures user still exists)
        user = await db.user.find_unique(where={"id": user_id})
        
        if not user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Return user info in a format compatible with endpoints
        return {
            "sub": user.id,
            "email": user.email,
            "name": user.name
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed",
        )
