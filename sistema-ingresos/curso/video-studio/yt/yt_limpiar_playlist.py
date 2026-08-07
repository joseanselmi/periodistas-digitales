# Deja en una playlist SOLO los videos oficiales; quita el resto de la playlist
# y borra los videos obsoletos (borradores viejos superados).
# Uso: python yt_limpiar_playlist.py "<playlist>" <idOficial1> <idOficial2> ...
#      agregar --borrar-videos para además eliminar de YouTube los que sobran
import sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

sys.stdout.reconfigure(encoding="utf-8")
SCOPES = ["https://www.googleapis.com/auth/youtube"]
args = sys.argv[1:]
borrar_videos = "--borrar-videos" in args
args = [a for a in args if a != "--borrar-videos"]
playlist_nombre = args[0]
oficiales = set(args[1:])

creds = Credentials.from_authorized_user_file("token.json", SCOPES)
yt = build("youtube", "v3", credentials=creds)

# encontrar la playlist
pid = None
req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
while req:
    r = req.execute()
    for p in r["items"]:
        if p["snippet"]["title"] == playlist_nombre:
            pid = p["id"]
    req = yt.playlists().list_next(req, r)
if not pid:
    print("NO se encontró la playlist:", playlist_nombre); sys.exit(1)

# listar items
items = []
req = yt.playlistItems().list(part="snippet,contentDetails", playlistId=pid, maxResults=50)
while req:
    r = req.execute()
    items.extend(r["items"])
    req = yt.playlistItems().list_next(req, r)

print(f"Playlist «{playlist_nombre}» tiene {len(items)} items. Oficiales a conservar: {len(oficiales)}\n")

sobran_videos = set()
for it in items:
    vid = it["contentDetails"]["videoId"]
    title = it["snippet"]["title"]
    if vid in oficiales:
        print(f"  ✅ CONSERVAR  {vid}  {title[:55]}")
    else:
        print(f"  🗑️  QUITAR    {vid}  {title[:55]}")
        yt.playlistItems().delete(id=it["id"]).execute()
        sobran_videos.add(vid)

print(f"\nQuitados de la playlist: {len(sobran_videos)}")

if borrar_videos and sobran_videos:
    print("\nBorrando los videos obsoletos de YouTube:")
    for vid in sobran_videos:
        try:
            yt.videos().delete(id=vid).execute()
            print("   ❌ borrado", vid)
        except Exception as e:
            print("   ⚠️ no se pudo borrar", vid, "->", e)
elif sobran_videos:
    print("(los videos NO se borraron; solo se quitaron de la playlist)")

print("\nLISTO.")
