from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import settings


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


async def save_image_upload(image: UploadFile, folder: str, entity_id: str) -> str:
    extension = Path(image.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP images are allowed")

    file_name = f"{entity_id}-{uuid4().hex}{extension}"
    content = await image.read()

    if settings.storage_backend.lower() == "s3":
        if not settings.storage_s3_public_base_url:
            raise HTTPException(status_code=500, detail="S3 public base URL is not configured")
        # Real S3 upload can be enabled by installing boto3 and writing content to the configured bucket.
        # The URL contract is already stable for the rest of the app.
        return f"{settings.storage_s3_public_base_url.rstrip('/')}/{folder}/{file_name}"

    upload_dir = Path(settings.storage_local_root) / folder
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file_name
    file_path.write_bytes(content)
    return f"{settings.upload_base_url.rstrip('/')}/{folder}/{file_name}"
