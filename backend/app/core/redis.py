import redis.asyncio as redis
from app.core.config import get_settings

settings = get_settings()

class RedisClient:
    def __init__(self):
        self.redis = None

    async def connect(self):
        self.redis = await redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

    async def close(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str):
        return await self.redis.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        if expire:
            await self.redis.set(key, value, ex=expire)
        else:
            await self.redis.set(key, value)
            
    async def delete(self, key: str):
        await self.redis.delete(key)

redis_client = RedisClient()

async def get_redis():
    return redis_client
