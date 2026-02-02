from datetime import date, datetime
import math
from sqlite3 import Date
import requests
import base64
import json

URL = "https://semaphore.deway.fr/signature"

payload = {
    "course": "625d4fe1-5b98-4171-b964-3c9532dcf230",
    "status": 'present',
    "method": 'admin',
    "date": math.floor(datetime.now().timestamp()),
    "student" : '22222222-2222-2222-2222-222222222224'
}

print(payload)

headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InpRUGFKelJGSGVjOTNhcWVtSndxVGlsbF9CZFNhd0tJZW8waWx0SGdJMW8iLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIxIiwidXNlcl90eXBlIjoiYWRtaW4iLCJzY2hvb2xfaWQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJhZG1pbl9yb2xlIjoibWFuYWdlciIsImlzcyI6InNlbWFwaG9yZS1hdXRoLWlkZW50aXR5Iiwic3ViIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIxIiwiZXhwIjoxNzcwMDI4NjA1LCJpYXQiOjE3NzAwMjc3MDV9.CnkT4gpKkrefJ2-R5crdbTTNkJeN-QE7VDSq2JCcmKiqaLF2i2DTojAp_9JUbZ3yVbcO7TxRaiwPSAv0uj2JVTi5s5Ile2Sh4NdWqTp5WzYfhCKbepeeJSz8Wb-qkrFYKqUnT6s0JIHfnhJ28SNP7bgGYmigkOx3S8xwfieX3VSOlP8dU7Rz_DJwVEtlohcGvN7PDDzBsSrY2EtcZjj9FgX-0Fi_to0GdmDq4nfNZIwDLPojdhYc6D04qlVuogJgWK1WjQmo3cgrH7hri8lXU7clvf8DvrmiL99PcmyKnkvHz3R82Fre_ffdzW5PInv8jfw-XX_c1UAq_zYaJhdkLA",
    "User-Agent": "Mozilla/5.0",
    "Origin": "http://localhost:5173/"
    }



response = requests.post(URL, headers=headers, json=payload)

# Vérification
response.raise_for_status()

data = response.json()
print(data)

#NcAFzHsBa7FoMeS2gBPGB7f17SILgONDkTXVBquN_H4
