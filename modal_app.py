import modal
import os
import json
import subprocess
from pathlib import Path

# Modal App təyini - v2.1 (Trigger)
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
        "rm -rf node_modules",
        "npm install",
        "./node_modules/.bin/remotion browser ensure",
        "./node_modules/.bin/remotion bundle remotion/index.ts build/bundle.js"
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
        print("❌ SERVICE_ACCOUNT_JSON tapılmadı! Modal Dashboard-da Secret-in düzgün açara (Key: SERVICE_ACCOUNT_JSON) malik olduğuna əmin olun.")
        return None

    try:
        # Bəzi mühitlərdə JSON dırnaq içində gələ bilər, onu təmizləyək
        info = json.loads(creds_json.strip())
        
        # Servis hesabı üçün vacib sahələrin yoxlanılması
        required_keys = ['client_email', 'token_uri', 'project_id', 'private_key']
        missing = [k for k in required_keys if k not in info]
        if missing:
            print(f"❌ SERVICE_ACCOUNT_JSON formatı yanlışdır. Çatışmayan sahələr: {', '.join(missing)}")
            print(f"Mövcud açarlar: {list(info.keys())}")
            return None

        creds = service_account.Credentials.from_service_account_info(info)
        service = build('drive', 'v3', credentials=creds)

        folder_id = "1aYD8R1ZE1L9HQZudXQMOhwoqEOYkxaGS"
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        media = MediaFileUpload(file_path, mimetype='video/mp4', resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        print(f"✅ GDrive Upload Uğurlu! File ID: {file.get('id')}")
        return file.get('id')
    except json.JSONDecodeError:
        print("❌ SERVICE_ACCOUNT_JSON etibarlı JSON formatında deyil! Kopyalayarkən simvolların itdiyinə baxın.")
        return None
    except Exception as e:
        print(f"❌ GDrive Upload Xətası: {str(e)}")
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
    
    # Mühit dəyişənlərini gücləndiririk
    env = os.environ.copy()
    env["REMOTION_IGNORE_MEMORY_CHECK"] = "true"

    try:
        # Remotion CLI render
        result = subprocess.run([
            "./node_modules/.bin/remotion", "render",
            "remotion/index.ts",
            "CineVideo",
            output_path,
            "--props", input_path,
            "--concurrency", "2", # Daha stabil olması üçün 2-yə endirdik
            "--timeout", "240000",
            "--log", "verbose",
            "--ignore-memory-limit-check",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-web-security --disable-gpu --single-process"
        ], capture_output=True, text=True, env=env)

        if result.stdout: print(f"Remotion STDOUT:\n{result.stdout}")
        if result.stderr: print(f"Remotion STDERR:\n{result.stderr}")

        if result.returncode != 0:
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
