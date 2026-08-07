# Sube los videos del manifest a YouTube como "No listado", con título/descripción,
# y los agrega a su playlist (la crea si no existe). Reutiliza token.json.
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube"]
creds = Credentials.from_authorized_user_file("token.json", SCOPES)
yt = build("youtube", "v3", credentials=creds)
m = json.load(open("manifest.json", encoding="utf-8"))

# playlists existentes
existing = {}
req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
while req is not None:
    r = req.execute()
    for it in r.get("items", []):
        existing[it["snippet"]["title"]] = it["id"]
    req = yt.playlists().list_next(req, r)

def playlist_id(title, desc):
    if title in existing:
        return existing[title]
    r = yt.playlists().insert(part="snippet,status",
        body={"snippet": {"title": title, "description": desc},
              "status": {"privacyStatus": "unlisted"}}).execute()
    existing[title] = r["id"]
    print("  playlist creada:", title)
    return r["id"]

plids = {t: playlist_id(t, d) for t, d in m["playlists"].items()}

for v in m["videos"]:
    if v.get("done"):
        print("Ya subido (salto):", v["title"], "->", v.get("url", ""))
        continue
    print("Subiendo:", v["title"])
    body = {"snippet": {"title": v["title"], "description": v["desc"], "categoryId": "27"},
            "status": {"privacyStatus": "unlisted", "selfDeclaredMadeForKids": False}}
    media = MediaFileUpload(v["file"], resumable=True, chunksize=-1)
    resp = yt.videos().insert(part="snippet,status", body=body, media_body=media).execute()
    vid = resp["id"]
    url = "https://youtu.be/" + vid
    print("  ->", url)
    pl = v.get("playlist")
    if pl and pl in plids:
        yt.playlistItems().insert(part="snippet",
            body={"snippet": {"playlistId": plids[pl],
                  "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
    # marca como subido para no duplicar en próximas corridas
    v["done"] = True
    v["url"] = url
    json.dump(m, open("manifest.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("LISTO — pendientes subidos como No listado y agregados a sus playlists.")
