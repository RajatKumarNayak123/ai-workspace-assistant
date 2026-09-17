from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):

    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
    )


class UserResponse(BaseModel):

    id: int
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True

class UserLoginRequest(BaseModel):

    email: EmailStr

    password: str        

class RefreshTokenRequest(BaseModel):
    refresh_token: str    


class ChangePasswordRequest(BaseModel):

    current_password: str = Field(
        min_length=1
    )

    new_password: str = Field(
        min_length=8
    )