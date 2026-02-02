from datetime import date, datetime
import math
from sqlite3 import Date
import requests
import base64
import json

URL = "https://semaphore.deway.fr/auth/refresh"

payload = {
    "refreshToken": "z4gUs_F40rhHTv48egYjckCLSOKmK_xY2imWYRzkuac"
}


headers = {
    "Accept": "application/json",
   }



response = requests.post(URL, headers=headers, json=payload)

# Vérification
response.raise_for_status()

data = response.json()
print(data)

#NcAFzHsBa7FoMeS2gBPGB7f17SILgONDkTXVBquN_H4
