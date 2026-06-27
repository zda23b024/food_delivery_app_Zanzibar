import re
from uuid import uuid4


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or str(uuid4())


def generate_order_number() -> str:
    return f"ZM-{str(uuid4()).split('-')[0].upper()}"
