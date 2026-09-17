from typing import Annotated
from typing import Optional
import json

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    Request,
)
from fastapi.responses import (StreamingResponse, FileResponse,)
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.security.password import (
    verify_password,
    hash_password,
)

from app.config.settings import settings
from app.database.db_test import test_database_connection
from app.database.dependencies import get_db
from app.database.database import SessionLocal
from app.models.user import User
from app.security.authentication import (
    get_current_user,
    get_current_session,
)
from app.models.conversation import Conversation
from app.services.image_service import ImageService
from app.schemas.image_chat import ImageChatResponse
from app.models.conversation_message import ConversationMessage
from app.repositories.conversation_repository import (
    ConversationRepository,
)

from app.schemas.chat import ChatRequest
from app.schemas.health import HealthResponse
from app.schemas.response import ApiResponse

from app.schemas.user import (
    UserRegisterRequest,
    UserResponse,
    UserLoginRequest,
    RefreshTokenRequest,
    ChangePasswordRequest,
)

from app.schemas.workspace import (
    WorkspaceCreateRequest,
    WorkspaceResponse,
)

from app.schemas.workspace_ai_settings import (
    WorkspaceAISettingsResponse,
    WorkspaceAISettingsUpdateRequest,
)

from app.schemas.workspace_rag_settings import (
    WorkspaceRAGSettingsResponse,
    WorkspaceRAGSettingsUpdateRequest,
)
from app.schemas.workspace_chat_settings import (
    WorkspaceChatSettingsResponse,
    WorkspaceChatSettingsUpdateRequest,
)
from app.services.workspace_chat_settings_service import (
    WorkspaceChatSettingsService,
)
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    ResetPasswordRequest,
)

from app.security.authorization import require_admin
from app.models.workspace import Workspace
from app.services.document_service import DocumentService
from app.services.gemini_service import GeminiService
from app.services.health_service import get_health_status
from app.services.password_reset_service import (
    PasswordResetService,
)
from app.services.rag_service import RagService
from app.services.query_classifier import (
    QueryClassifier,
    QueryIntent,
)
from app.services.user_service import UserService
from app.services.workspace_ai_settings_service import (
    WorkspaceAISettingsService,
)
from app.services.workspace_rag_settings_service import (
    WorkspaceRAGSettingsService,
)
from app.schemas.notification_preferences import (
    NotificationPreferencesUpdateRequest,
    NotificationPreferencesResponse,
)

from app.services.notification_preferences_service import (
    NotificationPreferencesService,
)
from app.services.data_management_service import (
    DataManagementService,
)
from app.schemas.notification import (
    NotificationListResponse,
    NotificationReadResponse,
)

from app.services.notification_service import (
    NotificationService,
)

from app.services.workspace_service import WorkspaceService
from app.services.global_search_service import (
    GlobalSearchService,
)

router = APIRouter()


def verify_workspace_owner(
    db: Session,
    workspace_id: int,
    current_user: User,
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.owner_id == current_user.id,
        )
        .first()
    )

    if workspace is None:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this workspace.",
        )

    return workspace

# ==========================================================
# REQUEST SCHEMAS
# ==========================================================


class UpdateProfileRequest(BaseModel):

    full_name: str
    email: EmailStr


# ==========================================================
# CHAT
# ==========================================================


@router.post(
    "/chat",
    response_model=ApiResponse,
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):

    gemini = GeminiService()

    answer = gemini.generate(
        request.session_id,
        request.question,
    )

    return ApiResponse(
        success=True,
        message="Request completed successfully",
        data={
            "answer": answer,
        },
    )


# ==========================================================
# INTELLIGENT CHAT / RAG CHAT
# ==========================================================


@router.post(
    "/chat/rag",
    response_model=ApiResponse,
)
def chat_with_documents(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_workspace_owner(
    db=db,
    workspace_id=request.workspace_id,
    current_user=current_user,
)

    # ======================================================
    # 1. CLASSIFY USER QUESTION
    # ======================================================

    intent = QueryClassifier.classify(
        request.question
    )

    print("=" * 80)
    print("QUERY CLASSIFICATION")
    print("Question :", request.question)
    print("Intent   :", intent.value)
    print("Has File :", request.has_attachments)
    print("=" * 80)


    # ======================================================
    # 1.1 ATTACHMENT OVERRIDE
    # ======================================================

    if (
        request.has_attachments
        and intent == QueryIntent.GENERAL
    ):

        print("=" * 80)
        print("ATTACHMENT DETECTED")
        print("Original Intent :", intent.value)
        print("Override Intent : DOCUMENT")
        print("=" * 80)

        intent = QueryIntent.DOCUMENT


    # ======================================================
    # 2. GENERAL QUESTION
    # ======================================================

    if intent == QueryIntent.GENERAL:

        gemini = GeminiService()

        answer = gemini.generate(
            session_id=request.session_id,
            question=request.question,
            model=request.model,
        )

        # ======================================================
        # SAVE GENERAL CONVERSATION TO MYSQL
        # ======================================================

        db = SessionLocal()

        try:

        # --------------------------------------------------
        # FIND EXISTING CONVERSATION
        # --------------------------------------------------

            conversation = (
                ConversationRepository.get_by_session(
                    db=db,
                    user_id=current_user.id,
                    session_id=request.session_id,
                )
            )

        # --------------------------------------------------
        # CREATE CONVERSATION IF NOT EXISTS
        # --------------------------------------------------

            if conversation is None:

                conversation = (
                    ConversationRepository.create_conversation(
                        db=db,
                        user_id=current_user.id,
                        session_id=request.session_id,
                        title=(
                            request.question[:255]
                            if request.question
                            else "New conversation"
                        ),
                        workspace_id=request.workspace_id,
                    )
                )

                print(
                    "Created general conversation:",
                    request.session_id,
                )

            # --------------------------------------------------
            # SAVE USER MESSAGE
            # --------------------------------------------------

            ConversationRepository.add_message(
                db=db,
                conversation=conversation,
                role="user",
                content=request.question,
            )

            # --------------------------------------------------
            # SAVE ASSISTANT MESSAGE
            # --------------------------------------------------

            ConversationRepository.add_message(
                db=db,
                conversation=conversation,
                role="assistant",
                content=answer,
                citations=[],
            )

            # --------------------------------------------------
            # UPDATE CONVERSATION TITLE
            # --------------------------------------------------

            if conversation.title == "New conversation":

                title = (
                    request.question[:255]
                    if request.question
                    else "New conversation"
                )

                ConversationRepository.update_title(
                    db=db,
                    conversation=conversation,
                    title=title,
                )

            db.commit()

            print(
                "General conversation history saved to MySQL:",
                request.session_id,
            )

        except Exception as e:

            db.rollback()

            print(
                "Failed to save general conversation:",
                str(e),
            )

        finally:

            db.close()
        # ======================================================
        # RETURN RESPONSE
        # ======================================================

        return ApiResponse(
            success=True,
            message="General AI response generated successfully",
            data={
                "answer": answer,
                "intent": intent.value,
                "citations": [],
            },
        )

    # ======================================================
    # 3. DOCUMENT / MIXED QUESTION
    # ======================================================

    result = RagService.ask_question(
        user_id=current_user.id,
        session_id=request.session_id,
        workspace_id=request.workspace_id,
        question=request.question,
        model=request.model,
        force_document=request.has_attachments,
        has_attachments=request.has_attachments,
        attachment_document_ids=request.attachment_document_ids,
    )

    # ------------------------------------------------------
    # Add classification information to the response
    # ------------------------------------------------------

    result["intent"] = intent.value

    return ApiResponse(
        success=True,
        message="RAG response generated successfully",
        data=result,
    )


@router.post(
    "/chat/image",
    response_model=ImageChatResponse,
)
async def generate_or_edit_image(
    session_id: str = Form(...),
    workspace_id: int = Form(...),
    prompt: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------------------------
    # Get existing conversation
    # ------------------------------------------------------

    conversation = ConversationRepository.get_by_session(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

    if conversation is None:
        conversation = ConversationRepository.create_conversation(
            db=db,
            user_id=current_user.id,
            workspace_id=workspace_id,
            session_id=session_id,
        )

    # ------------------------------------------------------
    # Save user prompt
    # ------------------------------------------------------

    ConversationRepository.add_message(
        db=db,
        conversation=conversation,
        role="user",
        content=prompt,
        message_type="text",
    )

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )
     
    
    # ------------------------------------------------------
    # Image generation
    # ------------------------------------------------------

    if image is None:

        result =await ImageService.generate_image(
            prompt=prompt,
            workspace_id=workspace_id,
            session_id=session_id,
        )

    # ------------------------------------------------------
    # Image editing
    # ------------------------------------------------------

    else:

        image_bytes = image.file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        if not image.content_type:
            raise HTTPException(
                status_code=400,
                detail="Unable to determine image type.",
            )

        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are supported.",
            )

        result =await ImageService.edit_image(
            image_bytes=image_bytes,
            mime_type=image.content_type,
            prompt=prompt,
            workspace_id=workspace_id,
            session_id=session_id,
        )

    # ------------------------------------------------------
    # Save generated image message
    # ------------------------------------------------------

    assistant_message = ConversationRepository.add_message(
        db=db,
        conversation=conversation,
        role="assistant",
        content="Here is the generated image.",
        message_type="image",
        image_url=result["image_url"],
        image_prompt=prompt,
        image_model=result["model"],
    )

    # ------------------------------------------------------
    # Commit entire operation
    # ------------------------------------------------------

    db.commit()

    return ImageChatResponse(
        session_id=session_id,
        message_id=assistant_message.id,
        answer="Here is the generated image.",
        message_type="image",
        image_url=result["image_url"],
        image_prompt=prompt,
        image_model=result["model"],
    )




# ==========================================================
# GET CHAT HISTORY
# ==========================================================


@router.get(
    "/chat/history/{session_id}",
)
def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = (
        ConversationRepository.get_by_session(
            db=db,
            user_id=current_user.id,
            session_id=session_id,
        )
    )

    if conversation is None:

        return {
            "session_id": session_id,
            "messages": [],
        }

    messages = (
        ConversationRepository.get_messages(
            db=db,
            conversation=conversation,
        )
    )

    formatted_messages = []

    for message in messages:

        citations = []

        if message.citations:

            try:

                citations = json.loads(
                    message.citations
                )

            except (
                json.JSONDecodeError,
                TypeError,
            ):

                citations = []

        formatted_messages.append(
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "citations": citations,
                "created_at": message.created_at,
                # Image message metadata
                "message_type": message.message_type,
                "image_url": message.image_url,
                "image_prompt": message.image_prompt,
                "image_model": message.image_model,
            }
        )

    return {
        "session_id": session_id,
        "messages": formatted_messages,
    }


# ==========================================================
# GET ALL USER CONVERSATIONS
# ==========================================================


@router.get(
    "/chat/conversations",
)
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversations = (
        ConversationRepository.get_user_conversations(
            db=db,
            user_id=current_user.id,
        )
    )

    return {
        "conversations": [
            {
                "id": conversation.id,
                "sessionId": conversation.session_id,
                "title": conversation.title,
                "workspaceId": conversation.workspace_id,
                "createdAt": conversation.created_at,
                "updatedAt": conversation.updated_at,
                "lastMessageAt": conversation.last_message_at,
            }
            for conversation in conversations
        ]
    }


# ==========================================================
# RENAME CONVERSATION
# ==========================================================

@router.put("/chat/conversations/{session_id}")
def rename_conversation(
    session_id: str,
    request: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # ------------------------------------------------------
    # GET NEW TITLE
    # ------------------------------------------------------

    title = (
        request.get("title")
        if isinstance(request, dict)
        else None
    )


    if not title or not title.strip():

        raise HTTPException(
            status_code=400,
            detail="Conversation title cannot be empty.",
        )


    title = title.strip()[:255]


    # ------------------------------------------------------
    # FIND USER'S CONVERSATION
    # ------------------------------------------------------

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == current_user.id,
            Conversation.session_id == session_id,
        )
        .first()
    )


    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )


    # ------------------------------------------------------
    # UPDATE TITLE
    # ------------------------------------------------------

    conversation.title = title

    db.commit()

    db.refresh(conversation)


    return {

        "success": True,

        "message": "Conversation renamed successfully.",

        "conversation": {

            "id": conversation.id,

            "sessionId":
                conversation.session_id,

            "title":
                conversation.title,

            "workspaceId":
                conversation.workspace_id,

        },

    }


# ==========================================================
# DELETE CONVERSATION
# ==========================================================

@router.delete("/chat/conversations/{session_id}")
def delete_conversation(
    session_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # ------------------------------------------------------
    # FIND USER'S CONVERSATION
    # ------------------------------------------------------

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == current_user.id,
            Conversation.session_id == session_id,
        )
        .first()
    )


    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )


    # ------------------------------------------------------
    # DELETE MESSAGES FIRST
    #
    # This avoids foreign-key problems if the database
    # does not have cascade delete configured.
    # ------------------------------------------------------

    db.query(ConversationMessage).filter(
        ConversationMessage.conversation_id
        == conversation.id
    ).delete(
        synchronize_session=False
    )


    # ------------------------------------------------------
    # DELETE CONVERSATION
    # ------------------------------------------------------

    db.delete(conversation)

    db.commit()


    return {

        "success": True,

        "message":
            "Conversation deleted successfully.",

        "session_id":
            session_id,

    }


# ==========================================================
# GLOBAL SEARCH
# ==========================================================


@router.get(
    "/search",
    tags=["Global Search"],
)
def global_search(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return GlobalSearchService.search(
        db=db,
        user_id=current_user.id,
        query=q,
    )



# ==========================================================
# GET LAST SESSION
# ==========================================================


@router.get(
    "/chat/last-session",
)
def get_last_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.user_id
            == current_user.id
        )
        .order_by(
            Conversation.last_message_at.desc()
        )
        .first()
    )

    if conversation is None:

        return {
            "session_id": None,
        }

    return {
        "session_id": conversation.session_id,
    }


# ==========================================================
# DATA MANAGEMENT - DELETE ALL CONVERSATIONS
# ==========================================================


@router.delete(
    "/me/data/conversations",
)
def delete_all_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    result = (
        DataManagementService
        .delete_all_conversations(
            db=db,
            user_id=current_user.id,
        )
    )

    return {
        "success": True,
        "message": (
            "All conversations deleted successfully."
        ),
        "data": result,
    }


# ==========================================================
# RAG STREAM
# ==========================================================


@router.post(
    "/chat/rag/stream",
)
def chat_with_documents_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_workspace_owner(
        db=db,
        workspace_id=request.workspace_id,
        current_user=current_user,
    )

    return StreamingResponse(
        RagService.ask_question_stream(
            user_id=current_user.id,
            session_id=request.session_id,
            workspace_id=request.workspace_id,
            question=request.question,
        ),
        media_type="text/event-stream",
    )


# ==========================================================
# VERSION
# ==========================================================


@router.get(
    "/version",
)
def version():

    return {
        "application": "AI Workspace Assistant",
        "version": "1.0.0",
        "framework": "FastAPI",
        "ai_model": settings.GEMINI_MODEL,
    }


# ==========================================================
# HEALTH
# ==========================================================


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
)
def health():

    return get_health_status()


# ==========================================================
# DATABASE TEST
# ==========================================================


@router.get(
    "/db-test",
)
def db_test():

    return test_database_connection()


# ==========================================================
# REGISTER
# ==========================================================


@router.post(
    "/register",
    response_model=UserResponse,
    tags=["Users"],
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
):

    user = UserService.register(
        db,
        request,
    )

    return user


# ==========================================================
# LOGIN
# ==========================================================


@router.post(
    "/login",
    tags=["Users"],
)
def login(
    request: UserLoginRequest,
    http_request: Request,
    db: Session = Depends(get_db),
):

    return UserService.login(
        db,
        request,
        http_request,
    )


@router.get(
    "/me/sessions",
    tags=["Users"],
)
def get_my_sessions(
    current_session = Depends(get_current_session),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return UserService.get_active_sessions(
        db=db,
        user_id=current_user.id,
        current_session_id=current_session.session_id,
    )


@router.delete(
    "/me/sessions/{session_id}",
    tags=["Users"],
)
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return UserService.revoke_session(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

# ==========================================================
# FORGOT PASSWORD - REQUEST
# ==========================================================


@router.post(
    "/forgot-password/request",
    tags=["Password Reset"],
)
def forgot_password_request(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):

    return PasswordResetService.request_password_reset(
        db=db,
        email=request.email,
    )


# ==========================================================
# FORGOT PASSWORD - VERIFY OTP
# ==========================================================


@router.post(
    "/forgot-password/verify-otp",
    tags=["Password Reset"],
)
def forgot_password_verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):

    return PasswordResetService.verify_otp(
        db=db,
        email=request.email,
        otp=request.otp,
    )


# ==========================================================
# FORGOT PASSWORD - RESEND OTP
# ==========================================================


@router.post(
    "/forgot-password/resend-otp",
    tags=["Password Reset"],
)
def forgot_password_resend_otp(
    request: ResendOTPRequest,
    db: Session = Depends(get_db),
):

    return PasswordResetService.resend_otp(
        db=db,
        email=request.email,
    )


# ==========================================================
# FORGOT PASSWORD - RESET
# ==========================================================


@router.post(
    "/forgot-password/reset",
    tags=["Password Reset"],
)
def forgot_password_reset(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):

    return PasswordResetService.reset_password(
        db=db,
        reset_token=request.reset_token,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
    )


# ==========================================================
# REFRESH TOKEN
# ==========================================================


@router.post(
    "/refresh",
    tags=["Users"],
)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):

    return UserService.refresh_token(
        db,
        request.refresh_token,
    )


# ==========================================================
# CURRENT USER - GET PROFILE
# ==========================================================


@router.get(
    "/me",
    tags=["Users"],
)
def get_profile(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
):

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


# ==========================================================
# CHANGE PASSWORD
# ==========================================================


@router.put(
    "/change-password",
    tags=["Security"],
)
def change_password(
    request: ChangePasswordRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    # ------------------------------------------------------
    # VERIFY CURRENT PASSWORD
    # ------------------------------------------------------

    if not verify_password(
        request.current_password,
        current_user.password,
    ):

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # ------------------------------------------------------
    # PREVENT SAME PASSWORD
    # ------------------------------------------------------

    if verify_password(
        request.new_password,
        current_user.password,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be different "
                "from the current password."
            ),
        )

    # ------------------------------------------------------
    # HASH NEW PASSWORD
    # ------------------------------------------------------

    current_user.password = hash_password(
        request.new_password
    )

    # ------------------------------------------------------
    # SAVE
    # ------------------------------------------------------

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Password changed successfully.",
    }


# ==========================================================
# UPDATE CURRENT USER PROFILE
# ==========================================================


@router.put(
    "/me",
    tags=["Users"],
)
def update_profile(
    request: UpdateProfileRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    # ------------------------------------------------------
    # VALIDATE FULL NAME
    # ------------------------------------------------------

    full_name = request.full_name.strip()

    if not full_name:

        raise HTTPException(
            status_code=400,
            detail="Full name cannot be empty.",
        )

    # ------------------------------------------------------
    # NORMALIZE EMAIL
    # ------------------------------------------------------

    email = request.email.strip().lower()

    # ------------------------------------------------------
    # CHECK DUPLICATE EMAIL
    # ------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == email,
            User.id != current_user.id,
        )
        .first()
    )

    if existing_user is not None:

        raise HTTPException(
            status_code=409,
            detail="Email address is already in use.",
        )

    # ------------------------------------------------------
    # UPDATE USER
    # ------------------------------------------------------

    current_user.full_name = full_name
    current_user.email = email

    db.commit()
    db.refresh(current_user)

    # ------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
        },
    }


# ==========================================================
# NOTIFICATION PREFERENCES
# ==========================================================


@router.get(
    "/me/notifications",
    response_model=NotificationPreferencesResponse,
    tags=["Notification Preferences"],
)
def get_notification_preferences(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    return (
        NotificationPreferencesService
        .get_preferences(
            db=db,
            user_id=current_user.id,
        )
    )


@router.put(
    "/me/notifications",
    response_model=NotificationPreferencesResponse,
    tags=["Notification Preferences"],
)
def update_notification_preferences(
    request: NotificationPreferencesUpdateRequest,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    return (
        NotificationPreferencesService
        .update_preferences(
            db=db,
            user_id=current_user.id,
            request=request,
        )
    )

@router.get(
    "/me/notifications/list",
    response_model=NotificationListResponse,
    tags=["Notifications"],
)
def get_notifications(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    notifications, unread_count = (
        NotificationService.get_notifications(
            db=db,
            user_id=current_user.id,
        )
    )

    return {
        "notifications": notifications,
        "unread_count": unread_count,
    }

@router.put(
    "/me/notifications/{notification_id}/read",
    response_model=NotificationReadResponse,
    tags=["Notifications"],
)
def mark_notification_as_read(
    notification_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    success = NotificationService.mark_as_read(
        db=db,
        user_id=current_user.id,
        notification_id=notification_id,
    )

    if not success:

        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "success": True,
        "message": "Notification marked as read.",
    }


@router.put(
    "/me/notifications/read-all",
    response_model=NotificationReadResponse,
    tags=["Notifications"],
)
def mark_all_notifications_as_read(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):

    NotificationService.mark_all_as_read(
        db=db,
        user_id=current_user.id,
    )

    return {
        "success": True,
        "message": "All notifications marked as read.",
    }

# ==========================================================
# ADMIN DASHBOARD
# ==========================================================


@router.get(
    "/admin/dashboard",
    tags=["Admin"],
)
def admin_dashboard(
    current_user: User = Depends(require_admin),
):

    return {
        "message": "Welcome Admin!",
        "admin": current_user.full_name,
    }


# ==========================================================
# WORKSPACES
# ==========================================================


@router.post(
    "/workspaces",
    response_model=WorkspaceResponse,
    tags=["Workspaces"],
)
def create_workspace(
    request: WorkspaceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return WorkspaceService.create_workspace(
        db=db,
        current_user=current_user,
        name=request.name,
        description=request.description,
    )



@router.get(
    "/workspaces",
    response_model=list[WorkspaceResponse],
    tags=["Workspaces"],
)
def get_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return WorkspaceService.get_user_workspaces(
        db=db,
        current_user=current_user,
    )

# ==========================================================
# DOCUMENT UPLOAD
# ==========================================================


@router.post(
    "/workspaces/{workspace_id}/documents/upload",
)
def upload_document(
    workspace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return DocumentService.upload_document(
        db,
        workspace_id,
        file,
    )


# ==========================================================
# GET DOCUMENTS
# ==========================================================


@router.get(
    "/workspaces/{workspace_id}/documents",
)
def get_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return DocumentService.get_documents(
        db,
        workspace_id,
    )


# ==========================================================
# PREVIEW DOCUMENT
# ==========================================================

@router.get(
    "/workspaces/{workspace_id}/documents/{document_id}/preview",
)
def preview_document(
    workspace_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    try:

        document = DocumentService.get_document_file(
            db=db,
            workspace_id=workspace_id,
            document_id=document_id,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    return FileResponse(
        path=document.file_path,
        media_type=document.file_type,
        filename=document.filename,
        content_disposition_type="inline",
    )


# ==========================================================
# SEARCH DOCUMENTS
# ==========================================================

@router.get(
    "/workspaces/{workspace_id}/documents/search",
)
def search_documents(
    workspace_id: int,
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    documents = DocumentService.search_documents(
        db=db,
        workspace_id=workspace_id,
        search_term=q,
    )

    return {
        "results": [
            {
                "id": document.id,
                "filename": document.filename,
                "file_type": document.file_type,
                "workspace_id": document.workspace_id,
            }
            for document in documents
        ]
    }


# ==========================================================
# DELETE DOCUMENT
# ==========================================================


@router.delete(
    "/workspaces/{workspace_id}/documents/{document_id}",
)
def delete_document(
    workspace_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return DocumentService.delete_document(
        db=db,
        workspace_id=workspace_id,
        document_id=document_id,
    )


# ==========================================================
# DATA MANAGEMENT - DELETE ALL USER DOCUMENTS
# ==========================================================


@router.delete(
    "/me/data/documents",
)
def delete_all_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    result = (
        DocumentService
        .delete_all_user_documents(
            db=db,
            user_id=current_user.id,
        )
    )

    db.commit()

    return {
        "success": True,
        "message": (
            "All documents deleted successfully."
        ),
        "data": result,
    }


# ==========================================================
# WORKSPACE AI SETTINGS - GET
# ==========================================================


@router.get(
    "/workspaces/{workspace_id}/settings/ai",
    response_model=WorkspaceAISettingsResponse,
    tags=["Workspace AI Settings"],
)
def get_workspace_ai_settings(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceAISettingsService.get_settings(
        db=db,
        workspace_id=workspace_id,
    )


# ==========================================================
# WORKSPACE AI SETTINGS - UPDATE
# ==========================================================


@router.put(
    "/workspaces/{workspace_id}/settings/ai",
    response_model=WorkspaceAISettingsResponse,
    tags=["Workspace AI Settings"],
)
def update_workspace_ai_settings(
    workspace_id: int,
    request: WorkspaceAISettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceAISettingsService.update_settings(
        db=db,
        workspace_id=workspace_id,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        system_prompt=request.system_prompt,
    )


# ==========================================================
# WORKSPACE RAG SETTINGS - GET
# ==========================================================


@router.get(
    "/workspaces/{workspace_id}/settings/rag",
    response_model=WorkspaceRAGSettingsResponse,
    tags=["Workspace RAG Settings"],
)
def get_workspace_rag_settings(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceRAGSettingsService.get_settings(
        db=db,
        workspace_id=workspace_id,
    )


# ==========================================================
# WORKSPACE RAG SETTINGS - UPDATE
# ==========================================================


@router.put(
    "/workspaces/{workspace_id}/settings/rag",
    response_model=WorkspaceRAGSettingsResponse,
    tags=["Workspace RAG Settings"],
)
def update_workspace_rag_settings(
    workspace_id: int,
    request: WorkspaceRAGSettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceRAGSettingsService.update_settings(
        db=db,
        workspace_id=workspace_id,

        query_rewriting_enabled=(
            request.query_rewriting_enabled
        ),

        vector_enabled=(
            request.vector_enabled
        ),

        vector_top_k=(
            request.vector_top_k
        ),

        bm25_enabled=(
            request.bm25_enabled
        ),

        bm25_top_k=(
            request.bm25_top_k
        ),

        rrf_enabled=(
            request.rrf_enabled
        ),

        rrf_top_k=(
            request.rrf_top_k
        ),

        reranker_enabled=(
            request.reranker_enabled
        ),

        reranker_top_k=(
            request.reranker_top_k
        ),
    )


# ==========================================================
# WORKSPACE CHAT SETTINGS - GET
# ==========================================================


@router.get(
    "/workspaces/{workspace_id}/settings/chat",
    response_model=WorkspaceChatSettingsResponse,
    tags=["Workspace Chat Settings"],
)
def get_workspace_chat_settings(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceChatSettingsService.get_settings(
        db=db,
        workspace_id=workspace_id,
    )



# ==========================================================
# WORKSPACE CHAT SETTINGS - UPDATE
# ==========================================================


@router.put(
    "/workspaces/{workspace_id}/settings/chat",
    response_model=WorkspaceChatSettingsResponse,
    tags=["Workspace Chat Settings"],
)
def update_workspace_chat_settings(
    workspace_id: int,
    request: WorkspaceChatSettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    verify_workspace_owner(
        db=db,
        workspace_id=workspace_id,
        current_user=current_user,
    )

    return WorkspaceChatSettingsService.update_settings(
        db=db,
        workspace_id=workspace_id,

        conversation_history_enabled=(
            request.conversation_history_enabled
        ),

        response_preference=(
            request.response_preference
        ),
    )