# Modal App for Remotion Rendering - v1.2.0 (High Performance)
import modal
import os
import json
import subprocess
import time

# 1. Base Image
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
    .add_local_dir(".", remote_path="/app", copy=True, ignore=[".git", "node_modules", "renders", "requests", "out", "build"])
    .workdir("/app")
    .run_commands(
        "rm -rf node_modules",
        "npm install",
        "./node_modules/.bin/remotion browser ensure"
    )
    .env({
        "REMOTION_IGNORE_MEMORY_LIMIT_CHECK": "true",
        "REMOTION_IGNORE_WINDRIVE_CHECK": "true"
    })
)

app = modal.App("remotion-video-service")

@app.function(
    image=remotion_image,
    cpu=32, # Reduced for cost efficiency, speed maintained via log silencing
    memory=65536, # Adjusted for 32 CPUs
    timeout=7200
)
def render_video(input_data: dict, upload_gdrive: bool = False):
    job_id = f"job_{int(time.time())}"
    input_path = f"/tmp/{job_id}_input.json"
    bundle_path = f"./{job_id}_bundle.js"
    results = {}

    with open(input_path, "w") as f:
        json.dump(input_data, f)

    # CRITICAL EMPIRICAL FIXES:
    # 1. REMOTION_LOG=error stops the massive I/O lag from memory warnings
    # 2. Concurrency=16 is the "sweet spot" for Modal to prevent localhost server crash
    env = os.environ.copy()
    env["REMOTION_LOG"] = "error" 
    env["REMOTION_IGNORE_MEMORY_LIMIT_CHECK"] = "true"
    
    fps = input_data.get("fps", 30)

    try:
        # 1. BUNDLE ONCE (High Efficiency)
        print("📦 Layihə bir dəfəlik paketlənir (Bundling)...")
        bundle_cmd = [
            "./node_modules/.bin/remotion", "bundle",
            "remotion/index.ts", bundle_path,
            "--log=error"
        ]
        subprocess.run(bundle_cmd, check=True, text=True, env=env)

        # A. Render Main Video
        main_output = f"/tmp/{job_id}_main_base.mp4"
        final_main_output = f"/tmp/{job_id}_main_final.mp4"
        print(f"🚀 Baza Video Render (@CineVideo) başladı...")
        
        main_cmd = [
            "./node_modules/.bin/remotion", "render",
            "CineVideo", main_output,
            "--bundle", bundle_path,
            "--props", input_path,
            "--concurrency", "24",
            "--ignore-memory-limit-check",
            "--log=error",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
        ]
        
        subprocess.run(main_cmd, check=True, text=True, env=env)
        
        # --- FFmpeg Loop Logic (Hybrid Metod) ---
        target_duration = input_data.get("targetDuration")
        if target_duration and os.path.exists(main_output):
            print(f"🔄 Loop Prosesi başladı: {target_duration} saniyəlik video hazırlanır...")
            # Use stream_loop to extend the video without re-encoding
            ffmpeg_loop_cmd = [
                "ffmpeg", "-y",
                "-stream_loop", "-1", 
                "-i", main_output,
                "-t", str(target_duration),
                "-c", "copy",
                "-map_metadata", "0",
                final_main_output
            ]
            subprocess.run(ffmpeg_loop_cmd, check=True, text=True)
            os.remove(main_output)
            main_output = final_main_output
            
        if os.path.exists(main_output):
            with open(main_output, "rb") as f:
                results["main.mp4"] = f.read()
            os.remove(main_output)
            print(f"✅ Əsas Video hazırdır.")

        # B. Render Shorts (Reusing SAME Bundle)
        shorts_config = input_data.get("shorts", [])
        for i, short in enumerate(shorts_config):
            short_id = f"short_{i}"
            short_output = f"/tmp/{job_id}_{short_id}.mp4"
            print(f"🎬 Short {i+1}/{len(shorts_config)} render olunur: {short.get('title', short_id)}")
            
            from_frame = int(short["startInSeconds"] * fps)
            to_frame = int(short["endInSeconds"] * fps)
            
            short_cmd = [
                "./node_modules/.bin/remotion", "render",
                "ShortsVideo", short_output,
                "--bundle", bundle_path,
                "--props", input_path,
                "--from", str(from_frame),
                "--to", str(to_frame),
                "--concurrency", "24",
                "--ignore-memory-limit-check",
                "--log=error",
                "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
            ]
            
            subprocess.run(short_cmd, check=True, text=True, env=env)
            
            if os.path.exists(short_output):
                filename = f"short_{i+1}_{short.get('title', 'video').replace(' ', '_')}.mp4"
                with open(short_output, "rb") as f:
                    results[filename] = f.read()
                os.remove(short_output)
                print(f"✅ {filename} hazırdır.")

        return results

    except Exception as e:
        print(f"❌ Krtitiki Render Xətası: {str(e)}")
        raise e
    finally:
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(bundle_path): os.remove(bundle_path)
