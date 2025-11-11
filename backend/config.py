from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str = "AkmalxonSecretKeyForJWTToken"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # Server
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # JSON Data Directory
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")
    
    class Config:
        env_file = ".env"

settings = Settings()
