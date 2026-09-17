from app.security.password import (
    hash_password,
    verify_password,
)

password = "Rajat@1996"

hashed = hash_password(password)

print("Original :", password)
print("Hashed   :", hashed)

print(
    "Verify :",
    verify_password(password, hashed)
)