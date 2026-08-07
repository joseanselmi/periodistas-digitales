# Convierte un video ya subido en CLASE OFICIAL: corrige título y descripción,
# lo agrega a su playlist, lo anota en manifest.json y borra el borrador viejo.
# Uso: python yt_oficializar.py <videoId> "<titulo>" "<playlist>" "<desc>" [--borrar <videoIdBorrador>]
import sys
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/youtube"]
args = sys.argv[1:]
vid, title, playlist, desc = args[0], args[1], args[2], args[3]
borrar = args[args.index("--borrar") + 1] if "--borrar" in args else None

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
yt = build("youtube", "v3", credentials=creds)

# 1) corregir metadatos (la subida de borrador deja una descripción que no corresponde)
cur = yt.videos().list(part="snippet", id=vid).execute()["items"][0]["snippet"]
cur.update({"title": title, "description": desc, "categoryId": "27"})
yt.videos().update(part="snippet", body={"id": vid, "snippet": cur}).execute()
print("metadatos corregidos:", title)

# 2) playlist (la crea si no existe)
m = json.load(open("manifest.json", encoding="utf8"))
pls = {}
req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
while req:
    r = req.execute()
    for p in r["items"]:
        pls[p["snippet"]["title"]] = p["id"]
    req = yt.playlists().list_next(req, r)

if playlist not in pls:
    r = yt.playlists().insert(part="snippet,status",
        body={"snippet": {"title": playlist, "description": m["playlists"].get(playlist, "")},
              "status": {"privacyStatus": "unlisted"}}).execute()
    pls[playlist] = r["id"]
    print("  playlist creada:", playlist)

yt.playlistItems().insert(part="snippet",
    body={"snippet": {"playlistId": pls[playlist],
                      "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
print("agregado a la playlist:", playlist)

# 3) anotar en el manifest para que quede registrado como clase del curso
url = f"https://youtu.be/{vid}"
ya = next((v for v in m["videos"] if v.get("url") == url), None)
if not ya:
    m["videos"].append({"file": "(render Remotion)", "title": title, "desc": desc,
                        "playlist": playlist, "done": True, "url": url})
    json.dump(m, open("manifest.json", "w", encoding="utf8"), ensure_ascii=False, indent=2)
    print("anotado en manifest.json")

# 4) borrar el borrador, que ya no sirve y confunde
if borrar:
    yt.videos().delete(id=borrar).execute()
    print("borrador eliminado:", borrar)

print("LISTO ->", url)
