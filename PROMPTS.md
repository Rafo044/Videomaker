# 🚀 Ultimate Lofi Production: Master Guide (Strict 15-Scene Workflow)

This guide is optimized for your **15-image automated workflow**. It generates exactly 15 scenes and 15 asset prompts.

---

## 🤖 Unified Master Generation Prompt (FOR GEMINI/CHATGPT)
**Copy this prompt to generate the complete production JSON for your n8n workflow.**

> Act as a **Master Technical Director**. Your goal is to generate a single, comprehensive "Production Bundle JSON" that covers Music Generation, Image Assets, and the Video Render Pipeline.
>
> ### 🎯 Target Concept:
> Choose an atmospheric Lofi theme (e.g., "Neon Tokyo Night", "Rainy Jazz Cafe", "Cozy Space Station").
>
> ### ⚙️ Technical Constraints (STRICT):
> 1. **Output Format:** You MUST output a single JSON OBJECT. Never wrap it in an array `[]`.
> 2. **Scene Count:** Generate **EXACTLY 15 distinct scenes** and **EXACTLY 15 corresponding image prompts**. No more, no less.
> 3. **Duration:** Each scene must be exactly **20 seconds** long.
> 4. **Particles (MANDATORY):** Every `particles` object MUST include `"showAt": 0` and `"hideAt": 20`.
> 5. **Visualizers:** Every `visualizer` object must have `"type": "dots"`, `"color": "#ffffff"`, and `"position": "bottom"`.
> 6. **Shorts:** Define exactly 2 vertical shorts using `startInSeconds` and `endInSeconds`.
> 7. **Particle Types:** For the `type` field in `particles`, you MUST only use one of these values: `confetti`, `snow`, `rain`, `sparkles`, `bubbles`, `fireflies`.
> 8. **Long Videos (Looping):** If the user wants a long video (e.g. 1 hour), add `"targetDuration": 3600` to the root of the JSON. Our system will automatically loop the base scenes to fill this time.
>
> ### 📦 JSON Structure:
> Output ONLY the raw JSON block in this exact format:
> {
>   "suno_agent_config": {
>     "customMode": true,
>     "instrumental": true,
>     "model": "V5",
>     "title": "[Dynamic Title]",
>     "style": "lofi hip hop, jazzy chords, dusty vinyl",
>     "prompt": "[Technical Suno Prompt: focus on D Minor, seamless loop, no intro/outro]",
>     "negativeTags": "vocals, lyrics, singing, aggressive",
>     "styleWeight": 0.85,
>     "weirdnessConstraint": 0.2
>   },
>   "image_agent_config": {
>     "global_style": "Ghibli-inspired 90s anime, cinematic lighting, 16:9",
>     "prompts": [
>        "Prompt 1: Descriptive...",
>        "...(TOTAL 15 SCRIPTED PROMPTS)...",
>        "Prompt 15: Descriptive..."
>     ]
>   },
>   "remotion_render_config": {
>     "fps": 30,
>     "backgroundMusic": "SOURCE_URL_HERE",
>     "backgroundMusicVolume": 0.15,
>     "watermark": { "text": "Rafelune", "position": "top-left", "scale": 0.8 },
>     "scenes": [
>       {
>         "assets": ["Reference to Image Prompt 1"],
>         "durationInSeconds": 20,
>         "kenBurns": { "startScale": 1.15, "endScale": 1.05, "easing": "easeOut" },
>         "particles": { "type": "rain", "count": 40, "showAt": 0, "hideAt": 20 },
>         "visualizer": { "type": "dots", "color": "#ffffff", "position": "bottom" },
>         "transitionAfter": "fade",
>         "transitionDuration": 2
>       },
>       "...(TOTAL 15 SCENE OBJECTS)..."
>     ],
>     "shorts": [
>       { 
>         "title": "Short Hook 1", "startInSeconds": 30, "endInSeconds": 45 },
>       { 
>         "title": "Mood Vibe 2", "startInSeconds": 120, "endInSeconds": 135 }
>     ]
>   },
>   "targetDuration": "[Total duration in seconds, e.g. 3600 for 1 hour. Optional.]"
> }
>
> **Final Rule:** Output ONLY the raw JSON object. No intro, no outro, no markdown formatting outside the JSON block.

---

## 🛠️ Validation Notes
- **Total Duration:** 15 scenes * 20s = 300 seconds (5 minutes) of unique content. 
- This content is designed to be looped for 30min/1hr videos.
- Ensure all 15 image prompts are detailed and atmospheric.
