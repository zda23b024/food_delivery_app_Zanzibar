from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr | None = None
    phone_number: str = Field(..., min_length=7, max_length=32)
    preferred_language: str = "en"


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "customer"


class UserLogin(BaseModel):
    phone_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PhoneOtpRequest(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=32)


class PhoneOtpVerify(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=32)
    code: str = Field(..., min_length=4, max_length=10)


class PasswordResetRequest(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=32)


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=16)
    new_password: str = Field(..., min_length=8, max_length=128)


class UserResponse(UserBase):
    id: str
    role: str
    profile_image_url: str | None = None
    is_active: bool
    is_phone_verified: bool
    is_email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    preferred_language: str | None = None
    profile_image_url: str | None = None


class UserAdminUpdate(UserUpdate):
    role: str | None = None
    is_active: bool | None = None
    is_phone_verified: bool | None = None
    is_email_verified: bool | None = None
