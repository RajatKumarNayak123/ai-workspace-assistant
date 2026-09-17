from google import genai
from app.config.settings import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

for model in client.models.list():
    methods = getattr(model, "supported_actions", None)
    if methods is None:
        methods = getattr(model, "supported_generation_methods", None)

    print(model.name)
    print(methods)
    print("-" * 50)