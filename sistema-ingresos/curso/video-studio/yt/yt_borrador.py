# Sube UN borrador suelto a YouTube como "No listado", para que Jose lo revise desde el celular.
# NO toca manifest.json: los borradores (voz de Windows) no son clases del curso.
# Uso: python yt_borrador.py <ruta.mp4> "<titulo>"
import sys
import time
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube"]
path, title = sys.argv[1], sys.argv[2]

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
yt = build("youtube", "v3", credentials=creds)

desc = (
    "BORRADOR para revisión interna. Voz provisoria de Windows (no es la voz final del curso).\n"
    "No listado. No forma parte del contenido publicado."
)
body = {
    "snippet": {"title": title, "description": desc, "categoryId": "27"},
    "status": {"privacyStatus": "unlisted", "selfDeclaredMadeForKids": False},
}
print("Subiendo:", path)
# Chunks de 8 MB + reintentos: mandar 168 MB de una sola vez corta la conexion.
media = MediaFileUpload(path, resumable=True, chunksize=8 * 1024 * 1024)
req = yt.videos().insert(part="snippet,status", body=body, media_body=media)

resp, fallos = None, 0
while resp is None:
    try:
        status, resp = req.next_chunk()
        if status:
            print(f"  {int(status.progress() * 100)}%")
    except Exception as e:
        fallos += 1
        if fallos > 8:
            raise
        print(f"  reintento {fallos} tras: {type(e).__name__}")
        time.sleep(3 * fallos)

print("LISTO -> https://youtu.be/" + resp["id"])
