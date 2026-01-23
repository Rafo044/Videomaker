# Modal App for Remotion Rendering - v1.3.0 (Optimized & Stable)
import modal
import os
import json
import subprocess
import time
import shutil

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
)

app = modal.App("remotion-video-service")
results_volume = modal.Volume.from_name("remotion-results", create_if_missing=True)

@app.function(
    image=remotion_image,
    cpu=32,
    memory=65536,
    timeout=7200,
    volumes={"/results": results_volume},
    retries=0 # Stop the "restart everything" loop
)
def render_video(input_data: dict, upload_gdrive: bool = False):
    job_id = f"job_{int(time.time())}"
    job_dir = f"/results/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    input_path = f"/tmp/{job_id}_input.json"
    bundle_path = f"/tmp/{job_id}_bundle.js"
    output_meta = {"main": "", "shorts": []}

    with open(input_path, "w") as f:
        json.dump(input_data, f)

    env = os.environ.copy()
    env["REMOTION_LOG"] = "error" 
    env["REMOTION_IGNORE_MEMORY_LIMIT_CHECK"] = "true"
    
    try:
        # 1. BUNDLE ONCE
        print("📦 Layihə paketlənir...")
        subprocess.run([
            "./node_modules/.bin/remotion", "bundle",
            "remotion/index.ts", bundle_path, "--log=error"
        ], check=True, env=env)

        # 2. RENDER MAIN
        main_base_output = f"/tmp/{job_id}_main_base.mp4"
        print("🚀 Base Video Render (@CineVideo) başlayır...")
        subprocess.run([
            "./node_modules/.bin/remotion", "render", "CineVideo", main_base_output,
            "--bundle", bundle_path, "--props", input_path,
            "--concurrency", "24", "--log=error",
            "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
        ], check=True, env=env)

        # 3. FFMPEG LOOP
        target_duration = input_data.get("targetDuration")
        main_final_path = f"{job_dir}/main.mp4"
        if target_duration:
            print(f"🔄 Loop: {target_duration} saniyə hazırlanır...")
            subprocess.run([
                "ffmpeg", "-y", "-stream_loop", "-1", "-i", main_base_output,
                "-t", str(target_duration), "-c", "copy", "-map_metadata", "0", main_final_path
            ], check=True)
            os.remove(main_base_output)
        else:
            shutil.move(main_base_output, main_final_path)
        
        output_meta["main"] = main_final_path
        print(f"✅ Main video hazır: {main_final_path}")

        # 4. OPTIMIZED SHORTS
        shorts_config = input_data.get("shorts", [])
        for i, short in enumerate(shorts_config):
            short_filename = f"short_{i+1}.mp4"
            short_final_path = f"{job_dir}/{short_filename}"
            short_props_path = f"/tmp/{job_id}_short_{i}.json"
            
            short_props = input_data.copy()
            short_props["selectedShortIndex"] = i # TRIGGER OPTIMIZATION
            with open(short_props_path, "w") as f:
                json.dump(short_props, f)

            print(f"🎬 Short {i+1} render olunur (Optimized)...")
            subprocess.run([
                "./node_modules/.bin/remotion", "render", "ShortsVideo", short_final_path,
                "--bundle", bundle_path, "--props", short_props_path,
                "--concurrency", "24", "--log=error",
                "--chromium-flags", "--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu"
            ], check=True, env=env)
            
            output_meta["shorts"].append(short_final_path)
            if os.path.exists(short_props_path): os.remove(short_props_path)

        results_volume.commit() 

        # Return file paths instead of huge bytes
        return {
            "status": "success",
            "job_id": job_id,
            "files": output_meta
        }

    except Exception as e:
        print(f"❌ Kritik Xəta: {str(e)}")
        raise e
    finally:
        if os.path.exists(input_path): os.remove(input_path)
        if os.path.exists(bundle_path): os.remove(bundle_path)
