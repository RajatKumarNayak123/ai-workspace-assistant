from app.vectorstore.chroma_client import collection

print("Total vectors:", collection.count())