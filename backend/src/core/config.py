import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Automated Demand Forecasting & Inventory Intelligence Engine"
    API_V1_STR = "/api/v1"

    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "forecast_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "forecast_secret")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getend("POSTGRES_DB", "forecast_db")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()