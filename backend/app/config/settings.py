from pydantic_settings import BaseSettings
from urllib.parse import quote_plus

class Settings(BaseSettings):
    # ==========================
    # Gemini
    # ==========================

    GOOGLE_API_KEY: str
    #GEMINI_MODEL: str = "gemini-flash-latest"
    GEMINI_MODEL: str ="gemini-3.5-flash"
    GEMINI_IMAGE_MODEL: str = "gemini-3.1-flash-image"
    GEMINI_TEMPERATURE: float = 0.3
    GEMINI_RETRY_ATTEMPTS: int = 3
    GEMINI_RETRY_MIN_WAIT: int = 2
    GEMINI_RETRY_MAX_WAIT: int = 10
    MAX_HISTORY_MESSAGES: int = 10
    CLOUDFLARE_ACCOUNT_ID: str
    CLOUDFLARE_API_TOKEN: str

    IMAGE_PROVIDER: str = "cloudflare"
    # ==========================
    # Database
    # ==========================

    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USERNAME: str
    DB_PASSWORD: str

# ==========================
# JWT
# ==========================

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_SECRET_KEY: str
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int

# ==========================
# SMTP / Email
# ==========================

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_EMAIL: str
    SMTP_PASSWORD: str


# ==========================
# Password Reset
# ==========================

    PASSWORD_RESET_OTP_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_MAX_OTP_ATTEMPTS: int = 5
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_OTP_COOLDOWN_SECONDS: int = 60

    @property
    def DATABASE_URL(self):

     password = quote_plus(self.DB_PASSWORD)

     return (
        f"mysql+pymysql://"
        f"{self.DB_USERNAME}:{password}"
        f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    )


    def validate(self):

     if not self.GOOGLE_API_KEY.strip():
        raise ValueError(
            "GOOGLE_API_KEY is missing in .env file."
        )

     return self

    class Config:
        env_file = ".env"


settings = Settings().validate()