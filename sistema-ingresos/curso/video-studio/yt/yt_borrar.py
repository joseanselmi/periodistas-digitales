# Borra un video de YouTube por id. Se usa para sacar borradores viejos cuando se sube uno nuevo,
# así nunca quedan dos versiones de la misma clase dando vueltas.
# Uso: python yt_borrar.py <videoId> [<videoId> ...]
import sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# los titulos traen emojis y acentos: sin esto la consola de Windows corta el script a la mitad
sys.stdout.reconfigure(encoding="utf-8")

SCOPES = ["https://www.googleapis.com/auth/youtube"]
creds = Credentials.from_authorized_user_file("token.json", SCOPES)
yt = build("youtube", "v3", credentials=creds)

for vid in sys.argv[1:]:
    r = yt.videos().list(part="snippet", id=vid).execute()
    if not r["items"]:
        print(f"{vid}: no existe (¿ya estaba borrado?)")
        continue
    titulo = r["items"][0]["snippet"]["title"]
    yt.videos().delete(id=vid).execute()
    print(f"borrado: {vid} — {titulo}")
