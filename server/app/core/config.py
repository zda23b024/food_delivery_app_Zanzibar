from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ZanMeal API"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg2://zanmeal:zanmeal@localhost:5432/zanmeal"
    secret_key: str = "change-this-secret-key-before-production"
    refresh_secret_key: str = "change-this-refresh-secret-before-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    google_maps_api_key: str | None = None
    firebase_credentials_path: str | None = None
    upload_base_url: str = "/static/uploads"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
