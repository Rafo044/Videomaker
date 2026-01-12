import modal
import os
import json
import subprocess
from pathlib import Path

# Modal App təyini
app = modal.App("remotion-video-service")

# Remotion və Chromium üçün lazım olan sistem kitabxanaları
remotion_image = (
    modal.Image.debian_slim()
    .apt_install(
        "curl",
        "libnss3",
        "libdbus-1-3",
        "libatk1.0-0",
        "libgbm-dev",
        "libasound2",
        "libxrandr2",
        "libxkbcommon-dev",
        "libxfixes3",
        "libxcomposite1",
        "libxdamage1",
        "libatk-bridge2.0-0",
        "libcups2",
        "ffmpeg"
    )
    .run_commands(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs"
    )
    .copy_local_dir(".", "/app")
    .workdir("/app")
    .run_commands(
        "npm install",
        "npx remotion browser ensure",
        "npx remotion bundle remotion/index.ts build/bundle.js"
    )
)

# Render funksiyası
@app.function(
    image=remotion_image,
    cpu=16, # Güclü CPU seçimi (Hərəkətli və sürətli render üçün)
    memory=32768, # 32GB RAM
    timeout=1200, # 20 dəqiqə limit
    container_idle_timeout=60,
)
def render_video(input_data: dict):
    """
    JSON datası əsasında videonu render edir və nəticəni qaytarır.
    """
    job_id = "modal_render_" + str(os.getpid())
    input_path = f"/tmp/{job_id}_input.json"
    output_path = f"/tmp/{job_id}.mp4"

    # Input datanı müvəqqəti fayla yazırıq
    with open(input_path, "w") as f:
        json.dump(input_data, f)

    print(f"Render başladı: {job_id}")
    
    try:
        # Remotion CLI vasitəsilə render əmri
        # --concurrency bayrağı CPU sayına görə paralel renderi təmin edir
        result = subprocess.run([
            "npx", "remotion", "render",
            "build/bundle.js", # BUNDLE_URL
            "CineVideo",       # Composition ID
            output_path,
            "--props", input_path,
            "--concurrency", "16", # CPU sayına uyğun
            "--browser-executable", "/usr/bin/google-chrome-stable" # Modal-da yerləşən brauzer
        ], capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Render Xətası: {result.stderr}")
            raise Exception(f"Remotion Error: {result.stderr}")

        # Hazır videonu oxuyub binary olaraq qaytarırıq
        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        return video_bytes

    except Exception as e:
        print(f"Sistem Xətası: {str(e)}")
        raise e
    finally:
        # Təmizlik
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(output_path): os.remove(output_path)

# Web Endpoint (Kənardan çağırmaq üçün)
@app.function(image=remotion_image)
@modal.web_endpoint(method="POST")
async def api_render(item: dict):
    """
    Xarici API vasitəsilə renderi tətikləyir.
    """
    try:
        video_content = render_video.remote(item)
        return modal.Response(
            content=video_content,
            media_type="video/mp4"
        )
    except Exception as e:
        return modal.Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )

# Yerli test üçün: python modal_app.py
if __name__ == "__main__":
    with open("universal_template.json", "r") as f:
        test_data = json.load(f)
    
    with app.run():
        print("Test render göndərilir...")
        video_data = render_video.remote(test_data)
        with open("modal_result.mp4", "wb") as f:
            f.write(video_data)
        print("Render tamamlandı! Fayl: modal_result.mp4")
