import os
import json
import sys
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

def upload_file(file_path):
    # Bu məlumatları GitHub Secrets-dən alacağıq
    client_id = os.environ.get("GDRIVE_CLIENT_ID")
    client_secret = os.environ.get("GDRIVE_CLIENT_SECRET")
    refresh_token = os.environ.get("GDRIVE_REFRESH_TOKEN")
    folder_id = os.environ.get("GDRIVE_FOLDER_ID", "1aYD8R1ZE1L9HQZudXQMOhwoqEOYkxaGS")
    
    if not refresh_token:
        print("Error: GDRIVE_REFRESH_TOKEN is missing! Please provide OAuth2 credentials.")
        sys.exit(1)

    try:
        # 1. Credentials obyektini yaradırıq (Sizin adınızdan işləyəcək)
        creds = Credentials(
            token=None, # Yeni token refresh_token vasitəsilə alınacaq
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri="https://oauth2.googleapis.com/token"
        )
        
        # 2. Token-in vaxtı keçibsə, yeniləyirik
        if not creds.valid:
            creds.refresh(Request())

        service = build('drive', 'v3', credentials=creds)

        filename = os.path.basename(file_path)
        print(f"Uploading {filename} to GDrive as user (Personal Account)...")

        # 3. Fayl məlumatları
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(file_path, mimetype='video/mp4', resumable=True)
        
        # 4. Yükləmə (Sizin 15GB kvotanız istifadə olunur)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()

        print(f"✅ Uğurla yükləndi! Fayl Sahibi: Siz. File ID: {file.get('id')}")

    except Exception as e:
        print(f"❌ GDrive OAuth2 Upload Failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_gdrive.py <path_to_video>")
        sys.exit(1)
    upload_file(sys.argv[1])
