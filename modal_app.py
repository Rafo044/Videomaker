# Modal App for Remotion Rendering - v1.1.0 (Shorts Support)
import modal
import os
import json
import subprocess
import time

# 1. Base Image - Robust and Simple
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
        "./node_modules/.bin/remotion browser ensure"
    )
    .env({"REMOTION_IGNORE_MEMORY_CHECK": "true"})
)

app = modal.App("remotion-video-service")

# 2. Render Function supporting multiple outputs (Main + Shorts)
@app.function(
    image=remotion_image,
    cpu=64,
    memory=131072,
    timeout=7200
)
def render_video(input_data: dict, upload_gdrive: bool = False):
    """
    Renders main video and optional shorts. Returns a dict of {filename: bytes}.
    """
    job_id = f"job_{int(time.time())}"
    input_path = f"/tmp/{job_id}_input.json"
    results = {}

    with open(input_path, "w") as f:
        json.dump(input_data, f)

    env = os.environ.copy()
    env["REMOTION_IGNORE_MEMORY_CHECK"] = "true"
    fps = input_data.get("fps", 30)

    try:
        # A. Render Main Video (CineVideo)
        main_output = f"/tmp/{job_id}_main.mp4"
        print(f"🚀 Main Video Render başladı: {job_id}")
        
        main_cmd = [
            "./node_modules/.bin/remotion", "render",
            "remotion/index.ts", "CineVideo", main_output,
            "--props", input_path,
            "--concurrency", "64",
            "--timeout", "7200000",
            "--ignore-memory-limit-check",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"
        ]
        
        subprocess.run(main_cmd, check=True, text=True, env=env)
        
        if os.path.exists(main_output):
            with open(main_output, "rb") as f:
                results["main.mp4"] = f.read()
            os.remove(main_output)

        # B. Render Shorts (ShortsVideo)
        shorts_config = input_data.get("shorts", [])
        for i, short in enumerate(shorts_config):
            short_id = f"short_{i}"
            short_output = f"/tmp/{job_id}_{short_id}.mp4"
            print(f"🎬 Short Render başladı ({i+1}/{len(shorts_config)}): {short.get('title', short_id)}")
            
            # Calculate frames
            from_frame = int(short["startInSeconds"] * fps)
            to_frame = int(short["endInSeconds"] * fps)
            
            short_cmd = [
                "./node_modules/.bin/remotion", "render",
                "remotion/index.ts", "ShortsVideo", short_output,
                "--props", input_path,
                "--from", str(from_frame),
                "--to", str(to_frame),
                "--concurrency", "64",
                "--timeout", "7200000",
                "--ignore-memory-limit-check",
                "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage"
            ]
            
            subprocess.run(short_cmd, check=True, text=True, env=env)
            
            if os.path.exists(short_output):
                filename = f"short_{i+1}_{short.get('title', 'video').replace(' ', '_')}.mp4"
                with open(short_output, "rb") as f:
                    results[filename] = f.read()
                os.remove(short_output)

        return results

    except Exception as e:
        print(f"❌ Render Error: {str(e)}")
        raise e
    finally:
        if os.path.exists(input_path): os.remove(input_path)
