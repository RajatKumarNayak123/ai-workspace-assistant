from app.utils.document_parser import DocumentParser

text = DocumentParser.extract_text(
    "uploads/documents/Resume SDE.pdf"
)

print(text)