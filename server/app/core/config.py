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
    storage_backend: str = "local"
    storage_local_root: str = "assets/uploads"
    storage_s3_bucket: str | None = None
    storage_s3_region: str | None = None
    storage_s3_public_base_url: str | None = None
    otp_expire_minutes: int = 10
    password_reset_expire_minutes: int = 15
    expose_dev_otp_codes: bool = True
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 120
    rate_limit_window_seconds: int = 60
    audit_log_enabled: bool = True
    payment_gateway_mode: str = "mock"
    payment_callback_secret: str = "change-this-payment-callback-secret"
    mpesa_api_key: str | None = None
    mpesa_api_secret: str | None = None
    airtel_money_client_id: str | None = None
    airtel_money_client_secret: str | None = None
    tigo_pesa_client_id: str | None = None
    tigo_pesa_client_secret: str | None = None
    halopesa_client_id: str | None = None
    halopesa_client_secret: str | None = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
