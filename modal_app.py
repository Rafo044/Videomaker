# Modal App for Remotion Rendering - v1.0.2 (Public Assets Fix)
import modal
import os
import json
import subprocess

# 1. Base Image with Node.js and Chromium dependencies
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
    .env({"REMOTION_IGNORE_MEMORY_CHECK": "true"})
)

app = modal.App("remotion-video-service")

# 2. Simplified Render Function (Offloading GDrive to GitHub Actions)
@app.function(
    image=remotion_image,
    cpu=32,
    memory=65536,
    timeout=7200 # 2 hours timeout for long Lofi videos
)
def render_video(input_data: dict, upload_gdrive: bool = False):
    """
    Renders video and returns bytes. GDrive upload is handled by the caller (GitHub Actions).
    """
    import time
    job_id = f"render_{int(time.time())}"
    input_path = f"/tmp/{job_id}_input.json"
    output_path = f"/tmp/{job_id}.mp4"

    with open(input_path, "w") as f:
        json.dump(input_data, f)

    print(f"🚀 Render başladı: {job_id}")
    
    env = os.environ.copy()
    env["REMOTION_IGNORE_MEMORY_CHECK"] = "true"

    try:
        # Remotion CLI render
        # We return the video bytes even if upload_gdrive is requested (to be handled by GitHub)
        result = subprocess.run([
            "./node_modules/.bin/remotion", "render",
            "remotion/index.ts",
            "CineVideo",
            output_path,
            "--props", input_path,
            "--concurrency", "16",
            "--timeout", "7200000",
            "--ignore-memory-limit-check",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"
        ], capture_output=True, text=True, env=env)

        if result.returncode != 0:
            print(f"❌ Remotion Render Error:\n{result.stderr}")
            raise Exception(f"Render failed: {result.stderr}")

        if os.path.exists(output_path):
            with open(output_path, "rb") as f:
                video_bytes = f.read()
            return video_bytes
        else:
            raise Exception("Output file not found after render")

    finally:
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(output_path): os.remove(output_path)
