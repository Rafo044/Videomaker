import modal
import os
import json
import subprocess
from pathlib import Path

# Modal App təyini
app = modal.App("remotion-video-service")

# Remotion üçün lazım olan tam sistem kitabxanaları siyahısı
remotion_image = (
    modal.Image.debian_slim()
    .apt_install(
        "curl", "libnss3", "libdbus-1-3", "libatk1.0-0", "libgbm-dev", "libasound2",
        "libxrandr2", "libxkbcommon-dev", "libxfixes3", "libxcomposite1", "libxdamage1",
        "libatk-bridge2.0-0", "libcups2", "ffmpeg", "fonts-noto-color-emoji", "fonts-liberation",
        "libgtk-3-0", "libxshmfence1", "libglu1-mesa"
    )
    .run_commands(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs"
    )
    .add_local_dir(".", remote_path="/app", copy=True)
    .workdir("/app")
    .run_commands(
        "npm install",
        "npx remotion browser ensure",
        "npx remotion bundle remotion/index.ts build/bundle.js"
    )
    .pip_install("google-api-python-client", "google-auth", "google-auth-oauthlib", "google-auth-httplib2", "fastapi")
    .env({"REMOTION_IGNORE_MEMORY_CHECK": "true"})
)

def upload_to_gdrive(file_path: str, filename: str):
    """
    Google Drive-a fayl yükləyir.
    """
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2 import service_account

    creds_json = os.environ.get("SERVICE_ACCOUNT_JSON")
    if not creds_json:
        print("SERVICE_ACCOUNT_JSON tapılmadı, upload ləğv edildi.")
        return None

    try:
        info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(info)
        service = build('drive', 'v3', credentials=creds)

        folder_id = "1aYD8R1ZE1L9HQZudXQMOhwoqEOYkxaGS"
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        media = MediaFileUpload(file_path, mimetype='video/mp4', resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        print(f"GDrive Upload Uğurlu! File ID: {file.get('id')}")
        return file.get('id')
    except Exception as e:
        print(f"GDrive Upload Xətası: {str(e)}")
        return None

# Render funksiyası
@app.function(
    image=remotion_image,
    cpu=16,
    memory=32768,
    timeout=1200,
    secrets=[
        modal.Secret.from_name("googlecloud-secret")
    ]
)
def render_video(input_data: dict, upload_gdrive: bool = False):
    """
    JSON datası əsasında videonu render edir.
    """
    import time
    job_id = f"render_{int(time.time())}"
    input_path = f"/tmp/{job_id}_input.json"
    output_path = f"/tmp/{job_id}.mp4"

    with open(input_path, "w") as f:
        json.dump(input_data, f)

    print(f"Render başladı: {job_id}")
    
    try:
        # Remotion CLI render
        # Avtomatik yüklənmiş chrome-headless-shell istifadə olunur
        result = subprocess.run([
            "npx", "remotion", "render",
            "build/bundle.js",
            "CineVideo",
            output_path,
            "--props", input_path,
            "--concurrency", "4",
            "--timeout", "120000",
            "--ignore-memory-limit-check",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-web-security"
        ], capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Remotion Log ERROR:\n{result.stderr}")
            raise Exception(f"Remotion Error: {result.stderr}")

        if upload_gdrive:
            upload_to_gdrive(output_path, f"{job_id}.mp4")

        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        return video_bytes

    except Exception as e:
        print(f"Sistem Xətası: {str(e)}")
        raise e
    finally:
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(output_path): os.remove(output_path)

# Web Endpoint
@app.function(image=remotion_image)
@modal.fastapi_endpoint(method="POST")
async def api_render(item: dict, upload: bool = False):
    try:
        video_content = render_video.remote(item, upload_gdrive=upload)
        return modal.Response(content=video_content, media_type="video/mp4")
    except Exception as e:
        return modal.Response(content=json.dumps({"error": str(e)}), status_code=500, media_type="application/json")

if __name__ == "__main__":
    with open("universal_template.json", "r") as f:
        test_data = json.load(f)
    with app.run():
        video_data = render_video.remote(test_data)
        with open("modal_result.mp4", "wb") as f:
            f.write(video_data)
