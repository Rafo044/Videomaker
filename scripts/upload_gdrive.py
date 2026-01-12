import os
import json
import sys
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

def upload_file(file_path):
    # 1. Load configuration
    creds_json = os.environ.get("SERVICE_ACCOUNT_JSON")
    folder_id = os.environ.get("GDRIVE_FOLDER_ID", "1aYD8R1ZE1L9HQZudXQMOhwoqEOYkxaGS")
    
    if not creds_json:
        print("Error: SERVICE_ACCOUNT_JSON secret is missing!")
        sys.exit(1)

    try:
        # 2. Setup GDrive Service
        info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(info)
        service = build('drive', 'v3', credentials=creds)

        filename = os.path.basename(file_path)
        print(f"Uploading {filename} to GDrive folder {folder_id}...")

        # 3. File Metadata
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(file_path, mimetype='video/mp4', resumable=True)
        
        # 4. Create File
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id',
            supportsAllDrives=True
        ).execute()

        file_id = file.get('id')
        print(f"Successfully uploaded! File ID: {file_id}")

        # 5. Share with Owner (Optional but helpful for My Drive quota issues)
        # Attempt to make it readable/owned by the real user email if possible
        # However, for Service Accounts, the quota usually counts where the file is created.
        
    except Exception as e:
        print(f"GDrive Upload Failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_gdrive.py <path_to_video>")
        sys.exit(1)
    upload_file(sys.argv[1])
