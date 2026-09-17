from pathlib import Path

from pypdf import PdfReader
from docx import Document

from app.core.exceptions.business_exception import BusinessException


class DocumentParser:

    @staticmethod
    def extract_text(
        file_path: str,
    ) -> str:

        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return DocumentParser._read_pdf(
                file_path,
            )

        elif extension == ".txt":
            return DocumentParser._read_txt(
                file_path,
            )

        elif extension == ".docx":
            return DocumentParser._read_docx(
                file_path,
            )

        raise BusinessException(
            "Unsupported file type."
        )

    @staticmethod
    def _read_pdf(
        file_path: str,
    ) -> str:

        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text.strip()

    @staticmethod
    def _read_txt(
        file_path: str,
    ) -> str:

        with open(
            file_path,
            "r",
            encoding="utf-8",
        ) as file:

            return file.read()

    @staticmethod
    def _read_docx(
        file_path: str,
    ) -> str:

        document = Document(file_path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )