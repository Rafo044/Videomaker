# 🚀 Ultimate Lofi Production: Master Guide (Looping & Long-Form)

This guide is optimized for creating **1-2 hour long Lo-Fi videos** by rendering a high-quality 5-minute base segment and looping it using FFmpeg.

---

## 🤖 Unified Master Generation Prompt

Act as a Master Technical Director. Your goal is to generate a single, comprehensive "Production Bundle JSON" that covers Music Generation, Image Assets, and the Video Render Pipeline.

### 🎯 Target Concept:
Choose an atmospheric Lofi theme (e.g., "Neon Tokyo Night", "Rainy Jazz Cafe", "Cozy Space Station").

### ⚙️ Technical Constraints (STRICT):
1. **Output Format:** Output ONLY the raw JSON object. Do not include markdown blocks (```json), intro text, or outro text.
2. **Scene Count:** Generate EXACTLY 15 distinct scenes and EXACTLY 15 corresponding image prompts.
3. **Duration:** Each scene must be exactly 20 seconds long (Total base duration = 300s / 5 mins).
4. **Particles:** Every scene MUST have particles ("showAt": 0, "hideAt": 20). Types: "confetti", "snow", "rain", "sparkles", "bubbles", "fireflies".
5. **Visualizers:** Every scene MUST have a visualizer ("type": "dots", "color": "#ffffff", "position": "bottom").
6. **Watermark:** Always include a "watermark" object at the root for branding.
7. **Long-Form Looping:** To create a long video (e.g. 1 hour), set `"targetDuration": 3600` at the root. 
8. **IMPORTANT (No EndScreen in Loops):** If `targetDuration` is used, do NOT include an `endScreen` object, as it would appear repeatedly within the loop.

### 📦 JSON Structure Template:
{
  "suno_agent_config": {
    "customMode": true,
    "instrumental": true,
    "model": "V5",
    "title": "[Dynamic Title]",
    "style": "lofi hip hop, jazzy chords, dusty vinyl",
    "prompt": "[Prompt for Suno: focus on mood, 80bpm, seamless loop]",
    "negativeTags": "vocals, lyrics, singing, aggressive",
    "styleWeight": 0.85,
    "weirdnessConstraint": 0.2
  },
  "image_agent_config": {
    "global_style": "Ghibli-inspired 90s anime, cinematic lighting, 16:9",
    "prompts": [
      "[Prompt for Scene 1]",
      "[Prompt for Scene 2]",
      "... up to 15 prompts"
    ]
  },
  "scenes": [
    {
      "assets": ["{{image_0}}"],
      "durationInSeconds": 20,
      "particles": { "type": "fireflies", "count": 30, "showAt": 0, "hideAt": 20, "color": "#ffffff" },
      "visualizer": { "type": "dots", "color": "#ffffff", "position": "bottom", "opacity": 0.8 },
      "kenBurns": { "startScale": 1.1, "endScale": 1.0, "easing": "easeInOut" }
    }
  ],
  "watermark": {
    "text": "Rafelune",
    "position": "bottom-right",
    "opacity": 0.5,
    "scale": 1.0
  },
  "shorts": [
    { "title": "Part 1", "startInSeconds": 10, "endInSeconds": 25 },
    { "title": "Part 2", "startInSeconds": 60, "endInSeconds": 75 }
  ],
  "targetDuration": 3600,
  "backgroundMusic": "{{audio_url}}",
  "backgroundMusicVolume": 0.15,
  "audioDucking": true,
  "fps": 30
}

**Final Rule:** Ensure the JSON is valid and contains exactly 15 scenes. Output ONLY the raw JSON.
