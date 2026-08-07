# Autorización única de YouTube (abre el navegador para que Jose apruebe).
# Necesita client_secret.json en esta carpeta. Guarda token.json.
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube"]
flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
creds = flow.run_local_server(port=0, prompt="consent")
with open("token.json", "w", encoding="utf-8") as f:
    f.write(creds.to_json())
print("OK — autorización guardada en token.json")
