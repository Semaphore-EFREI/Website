import requests
import base64
import json

URL = "https://semaphore.deway.fr/auth/login"

payload = {
    "email": "admin@demo.local",
    "password": "dev-password"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0"
}

response = requests.post(URL, json=payload, headers=headers)

# Vérification
response.raise_for_status()

data = response.json()
print(data)
token = data["access_token"]
refresh_token = data["refresh_token"]

print("Token :", token)
print("Refresh token :", refresh_token)

import base64
import json

header_b64, payload_b64, signature = token.split(".")

def decode_base64url(data):
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

header = json.loads(decode_base64url(header_b64))
payload = json.loads(decode_base64url(payload_b64))

print("HEADER:", header)
print("PAYLOAD:", payload)