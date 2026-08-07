import sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
sys.stdout.reconfigure(encoding="utf-8")
creds = Credentials.from_authorized_user_file("token.json", ["https://www.googleapis.com/auth/youtube"])
yt = build("youtube", "v3", credentials=creds)
r = yt.playlists().list(part="snippet,contentDetails", mine=True, maxResults=50).execute()
for pl in r.get("items", []):
    t = pl["snippet"]["title"]
    if "SID" not in t:
        continue
    print(f"\n📂 {t}  ({pl['contentDetails']['itemCount']} videos)  [{pl['snippet'].get('status','')}]")
    it = yt.playlistItems().list(part="snippet", playlistId=pl["id"], maxResults=50).execute()
    for i in it.get("items", []):
        print("   -", i["snippet"]["title"])
