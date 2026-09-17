from app.security.jwt_handler import (
    create_access_token,
    verify_access_token,
)

token = create_access_token(
    {
        "sub": "rajat@example.com",
        "user_id": 2,
        "role": "USER",
    }
)

print("Token:")
print(token)

print()

payload = verify_access_token(token)

print("Decoded Payload:")
print(payload)