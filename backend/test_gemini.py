from google import genai
from app.config.settings import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

for i in range(10):

    try:

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents="Say Hello"
        )

        print(i + 1, "SUCCESS")

    except Exception as e:

        print(i + 1, e)