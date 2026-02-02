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
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InpRUGFKelJGSGVjOTNhcWVtSndxVGlsbF9CZFNhd0tJZW8waWx0SGdJMW8iLCJ0eXAiOiJKV1QifQ.eyJ1c2VyX2lkIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIxIiwidXNlcl90eXBlIjoiYWRtaW4iLCJzY2hvb2xfaWQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJhZG1pbl9yb2xlIjoibWFuYWdlciIsImlzcyI6InNlbWFwaG9yZS1hdXRoLWlkZW50aXR5Iiwic3ViIjoiMjIyMjIyMjItMjIyMi0yMjIyLTIyMjItMjIyMjIyMjIyMjIxIiwiZXhwIjoxNzcwMDU1NDQxLCJpYXQiOjE3NzAwNTQ1NDF9.GYxvZofJEZQnpXDKMrDD1b36qMO3q9mEboUi2f_orc_hVaLohFQZMfi6aeUjFbQh7_rxfiUDnUzOY2cNbi7KTDDTMir6r2Gv2-Cj02T9n-UDPE0ioeGttROYew9V9RK868ZHsk2DXQMJx-Nd7BnN-CyvaEAmcStokVVVysB2jyNiVY5OPqQQDWSndmSb6_fiNncrXw1ioJfy1J2xLLFN8712XKkeT-3udHuAcNtnnaVhiikTAU7UPSZQjFyratAjtiMZIEkGtb-IIY7nTEJ-A9RRJPzgnzSEl08n44pPFBFAu8W8bu4HuDcLFkaXDKWUa0fUbnGs-rE27N3l3z87cg",
    "User-Agent": "Mozilla/5.0",
    "Origin": "http://localhost:5173/"
    }



response = requests.post(URL, headers=headers, json=payload)

# Vérification
response.raise_for_status()

data = response.json()
print(data)

#NcAFzHsBa7FoMeS2gBPGB7f17SILgONDkTXVBquN_H4
