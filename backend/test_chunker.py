from app.utils.document_parser import DocumentParser
from app.utils.text_chunker import TextChunker

text = DocumentParser.extract_text(
    "uploads/documents/Resume SDE.pdf"
)

chunks = TextChunker.chunk(text)

print(f"Total Chunks: {len(chunks)}")

for i, chunk in enumerate(chunks):
    print("=" * 50)
    print(f"Chunk {i+1}")
    print(chunk)