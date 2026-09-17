import uuid
import re
from fastapi import Request
from uuid import uuid4
from app.models.user_session import UserSession
from app.repositories.user_session_repository import UserSessionRepository
from app.models.user_session import UserSession
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegisterRequest
from app.security.password import hash_password
from app.core.exceptions.business_exception import BusinessException
from app.schemas.user import UserLoginRequest
from app.security.password import verify_password
from app.security.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.models.user_session import UserSession
from app.repositories.user_session_repository import UserSessionRepository
from app.utils.device_detector import detect_device_info
class UserService:

    @staticmethod
    def register(
        db: Session,
        request: UserRegisterRequest,
    ) -> User:

        # Check duplicate email
        existing_user = UserRepository.get_by_email(
            db,
            request.email,
        )

        if existing_user:

            raise BusinessException(
                "Email already registered."
            )

        # Create new user
        user = User(
            full_name=request.full_name,
            email=request.email,
            password=hash_password(request.password),
        )

        user = UserRepository.create(
            db,
            user,
        )

    # ------------------------------------------
    # CREATE DEFAULT WORKSPACE
    # ------------------------------------------

        default_workspace = Workspace(
            name="My Workspace",
            description="Your personal workspace.",
            owner_id=user.id,
        )

        WorkspaceRepository.create(
            db,
            default_workspace,
        )

        return user



    @staticmethod
    def login(
        db: Session,
        request: UserLoginRequest,
        http_request: Request,
    ):

        user = UserRepository.get_by_email(
            db,
            request.email,
        )

        if not user:
            raise BusinessException(
                "Invalid email or password."
            )

        if not verify_password(
            request.password,
            user.password,
        ):
            raise BusinessException(
                "Invalid email or password."
            )

        session_id = uuid4().hex    

        access_token = create_access_token(
            {
                        "sub": user.email,
                        "user_id": user.id,
                        "role": user.role.value,
                        "sid": session_id,
            }
        )
        
        refresh_token = create_refresh_token(
            {
                        "sub": user.email,
                        "user_id": user.id,
                        "sid": session_id,
            }
        )

        user_agent = http_request.headers.get(
            "user-agent"
        )

        ip_address = (
            http_request.client.host
            if http_request.client
            else None
        )
        device_info = UserService.parse_user_agent(
            user_agent
        )

        session = UserSession(
            user_id=user.id,
            session_id=session_id,
            device_type=device_info["device_type"],
            device_name=device_info["device_name"],
            browser=device_info["browser"],
            operating_system=device_info["operating_system"],
            ip_address=ip_address,
            user_agent=user_agent,
        )

        db.add(session)
        db.commit()
        db.refresh(session)
     

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
            },
        }    



    @staticmethod
    def refresh_token(
    db: Session,
    refresh_token: str,
    ):

     payload = verify_refresh_token(
        refresh_token,
    )

     if payload is None:
        raise BusinessException(
            "Invalid refresh token."
        )

     email = payload.get("sub")

     user = UserRepository.get_by_email(
        db,
        email,
    )

     if user is None:
        raise BusinessException(
            "User not found."
        )

     access_token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "role": user.role.value,
        }
    )

     return {
        "access_token": access_token,
        "token_type": "Bearer",
    }    

    @staticmethod
    def get_active_sessions(
        db: Session,
        user_id: int,
        current_session_id: str | None = None,
    ):

        sessions = UserSessionRepository.get_active_sessions_by_user_id(
            db,
            user_id,
        )

        return [
            {
                "id": session.id,
                "session_id": session.session_id,
                "device_type": session.device_type,
                "device_name": session.device_name,
                "browser": session.browser,
                "operating_system": session.operating_system,
                "ip_address": session.ip_address,
                "created_at": session.created_at,
                "last_active_at": session.last_active_at,
                "is_current": (session.session_id == current_session_id),
            }
            for session in sessions
        ]

    @staticmethod
    def revoke_session(
        db: Session,
        user_id: int,
        session_id: str,
    ):
        session = UserSessionRepository.get_by_session_id(
            db,
            session_id,
        )

        if session is None:
            raise BusinessException(
                "Session not found."
            )

        # Security check:
        # User can revoke only their own session.
        if session.user_id != user_id:
            raise BusinessException(
                "You are not authorized to revoke this session."
            )

        # Already revoked
        if session.is_revoked:
            raise BusinessException(
                "Session has already been revoked."
            )

        UserSessionRepository.revoke_session(
            db,
            session,
        )

        return {
            "success": True,
            "message": "Session revoked successfully.",
            "session_id": session.session_id,
        }






    @staticmethod
    def parse_user_agent(user_agent: str | None):

        if not user_agent:
            return {
                "device_type": "Unknown",
                "device_name": "Unknown Device",
                "browser": "Unknown",
                "operating_system": "Unknown",
            }

    # =========================================
    # DEVICE TYPE
    # =========================================

        if re.search(
            r"Mobile|Android.*Mobile|iPhone",
            user_agent,
            re.IGNORECASE,
        ):
            device_type = "Mobile"

        elif re.search(
            r"Tablet|iPad|Android(?!.*Mobile)",
            user_agent,
            re.IGNORECASE,
        ):
            device_type = "Tablet"

        else:
            device_type = "Desktop"

    # =========================================
    # OPERATING SYSTEM
    # =========================================

        if re.search(
            r"Windows NT",
            user_agent,
            re.IGNORECASE,
        ):
            operating_system = "Windows 10/11"

        elif re.search(
            r"Mac OS X",
            user_agent,
            re.IGNORECASE,
        ):
            operating_system = "macOS"

        elif re.search(
            r"Android",
            user_agent,
            re.IGNORECASE,
        ):
            operating_system = "Android"

        elif re.search(
            r"iPhone|iPad|iPod",
            user_agent,
            re.IGNORECASE,
        ):
            operating_system = "iOS"

        elif re.search(
            r"Linux",
            user_agent,
            re.IGNORECASE,
        ):
            operating_system = "Linux"

        else:
            operating_system = "Unknown"

    # =========================================
    # BROWSER
    # =========================================

        firefox = re.search(
            r"Firefox/([\d.]+)",
            user_agent,
            re.IGNORECASE,
        )

        chrome = re.search(
            r"Chrome/([\d.]+)",
            user_agent,
            re.IGNORECASE,
        )

        edge = re.search(
            r"Edg/([\d.]+)",
            user_agent,
            re.IGNORECASE,
        )

        safari = re.search(
            r"Version/([\d.]+).*Safari/",
            user_agent,
            re.IGNORECASE,
        )

        opera = re.search(
            r"(?:OPR|Opera)/([\d.]+)",
            user_agent,
            re.IGNORECASE,
        )

        if edge:
            browser = f"Edge {edge.group(1)}"

        elif firefox:
            browser = f"Firefox {firefox.group(1)}"

        elif opera:
            browser = f"Opera {opera.group(1)}"

        elif chrome:
            browser = f"Chrome {chrome.group(1)}"

        elif safari:
            browser = f"Safari {safari.group(1)}"

        else:
            browser = "Unknown"

    # =========================================
    # DEVICE NAME
    # =========================================

        if device_type == "Mobile":

            if re.search(
                r"iPhone",
                user_agent,
                re.IGNORECASE,
            ):
                device_name = "iPhone"

            elif re.search(
                r"Android",
                user_agent,
                re.IGNORECASE,
            ):
                device_name = "Android Phone"

            else:
                device_name = "Mobile Device"

        elif device_type == "Tablet":

            if re.search(
                r"iPad",
                user_agent,
                re.IGNORECASE,
            ):
                device_name = "iPad"

            elif re.search(
                r"Android",
                user_agent,
                re.IGNORECASE,
            ):
                device_name = "Android Tablet"

            else:
                device_name = "Tablet"

        else:

            if operating_system.startswith("Windows"):
                device_name = "Windows PC"

            elif operating_system == "macOS":
                device_name = "Mac"

            elif operating_system == "Linux":
                device_name = "Linux PC"

            else:
                device_name = "Desktop Computer"

        return {
            "device_type": device_type,
            "device_name": device_name,
            "browser": browser,
            "operating_system": operating_system,
        }