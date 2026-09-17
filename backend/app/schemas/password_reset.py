from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordRequest(BaseModel):

    email: EmailStr


class VerifyOTPRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
    )

class ResendOTPRequest(BaseModel):

        email: EmailStr

class ResetPasswordRequest(BaseModel):

    reset_token: str

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=100,
    )

    confirm_password: str = Field(
        ...,
        min_length=8,
        max_length=100,
    )