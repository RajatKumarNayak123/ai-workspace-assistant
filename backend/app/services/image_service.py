import base64
import uuid
from io import BytesIO
from pathlib import Path
import httpx
from PIL import Image

from app.config.settings import settings


class ImageService:

    IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b"

    UPLOAD_DIR = Path(
        "uploads/generated_images"
    )

    @staticmethod
    def _cloudflare_url():
        return (
            "https://api.cloudflare.com/client/v4/"
            f"accounts/{settings.CLOUDFLARE_ACCOUNT_ID}"
            f"/ai/run/{ImageService.IMAGE_MODEL}"
        )

    @staticmethod
    def _headers():
        return {
            "Authorization": (
                f"Bearer {settings.CLOUDFLARE_API_TOKEN}"
            )
        }

    @classmethod
    async def _call_cloudflare(
        cls,
        prompt: str,
        image_bytes: bytes | None = None,
        mime_type: str = "image/png",
    ):
        """
        Calls Cloudflare FLUX.2 Klein 4B.

        image_bytes=None
            -> text-to-image

        image_bytes provided
            -> image + prompt editing
        """
        
        data = {
            "prompt": prompt,
            "width": "1024",
            "height": "1024",
        }

        files = None

        if image_bytes is not None:

            files = {
                "input_image_0": (
                    "input.png",
                    image_bytes,
                    mime_type,
                )
            }

        async with httpx.AsyncClient(
            timeout=120
        ) as client:

            response = await client.post(
                cls._cloudflare_url(),
                headers=cls._headers(),
                data=data,
                files=files,
            )

        if response.status_code != 200:

            raise RuntimeError(
                "Cloudflare image generation failed: "
                f"{response.status_code} "
                f"{response.text}"
            )

        try:
            result = response.json()

        except Exception as exc:

            raise RuntimeError(
                "Cloudflare returned an invalid response."
            ) from exc

        if not result.get("success"):

            raise RuntimeError(
                "Cloudflare image generation failed: "
                f"{result}"
            )

        cloudflare_result = result.get(
            "result"
        )

        if not cloudflare_result:

            raise RuntimeError(
                "Cloudflare returned no image result."
            )

        image_base64 = cloudflare_result.get(
            "image"
        )

        if not image_base64:

            raise RuntimeError(
                "Cloudflare returned no image data."
            )

        try:

            return base64.b64decode(
                image_base64
            )

        except Exception as exc:

            raise RuntimeError(
                "Failed to decode Cloudflare image."
            ) from exc

    @classmethod
    def _prepare_edit_image(
        cls,
        image_bytes: bytes,
        mime_type: str,
    ):
        """
        FLUX.2 Klein reference/edit images must be
        smaller than 512x512.
        """

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

        image.thumbnail(
            (511, 511)
        )

        buffer = BytesIO()

        image.save(
            buffer,
            format="PNG",
        )

        return (
            buffer.getvalue(),
            "image/png",
        )

    @classmethod
    def _save_image(
        cls,
        image_bytes: bytes,
        workspace_id: int,
        session_id: str,
    ):
        output_dir = (
            cls.UPLOAD_DIR
            / f"workspace_{workspace_id}"
            / f"session_{session_id}"
        )

        output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        filename = (
            f"image_{uuid.uuid4().hex}.png"
        )

        file_path = (
            output_dir / filename
        )

        file_path.write_bytes(
            image_bytes
        )

        image_url = (
            "/uploads/generated_images/"
            f"workspace_{workspace_id}/"
            f"session_{session_id}/"
            f"{filename}"
        )

        return {
            "image_url": image_url,
            "file_path": str(file_path),
            "mime_type": "image/png",
            "filename": filename,
            "model": cls.IMAGE_MODEL,
        }

    @classmethod
    async def generate_image(
        cls,
        prompt: str,
        workspace_id: int,
        session_id: str,
    ):
        """
        Text prompt -> generated image.
        """

        image_bytes = await cls._call_cloudflare(
            prompt=prompt
        )

        return cls._save_image(
            image_bytes=image_bytes,
            workspace_id=workspace_id,
            session_id=session_id,
        )

    @classmethod
    async def edit_image(
        cls,
        image_bytes: bytes,
        mime_type: str,
        prompt: str,
        workspace_id: int,
        session_id: str,
    ):
        """
        Image + prompt -> edited image.
        """

        prepared_bytes, prepared_mime = (
            cls._prepare_edit_image(
                image_bytes=image_bytes,
                mime_type=mime_type,
            )
        )

        generated_bytes = await cls._call_cloudflare(
            prompt=prompt,
            image_bytes=prepared_bytes,
            mime_type=prepared_mime,
        )

        return cls._save_image(
            image_bytes=generated_bytes,
            workspace_id=workspace_id,
            session_id=session_id,
        )