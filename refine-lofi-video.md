# Task: Refining Lofi Video Production

## 📋 Role & Skills
- **Agent:** `orchestrator`
- **Skills:** `frontend-design`, `react-patterns`, `clean-code`, `python-patterns`, `deployment-procedures`

## 🎯 Goal
Refine the Lofi Chill video generation pipeline to ensure high-quality, loopable music and visuals, robust Shorts generation, and stable cloud rendering.

## 🛠️ Task Breakdown

### Phase 1: Music & Visual Intelligence (Analysis & Prompting)
- [x] **Instrumental & Loopable Music:** Create premium Suno AI prompts for Lofi Chill tracks that are strictly instrumental and have a BPM/Structure suitable for seamless looping.
- [x] **Dreamy & Loopable Visuals:** Create Cloudflare AI image prompts that evoke "calm, nocturnal, dreamy" moods and are designed to be loopable when panned/zoomed in Remotion.

### Phase 2: Remotion Polish (UI/UX & Branding)
- [x] **Watermark Refinement:** Adjust the "Rafelune" watermark for glassmorphism excellence and optimal contrast.
- [x] **Visualizer Enhancement:** Improve the "dots" visualizer with better glows, outlines, and smooth motion to prevent flickering.
- [x] **Linting & Quality:** Fix identified linting errors in `CineVideo.tsx`, `Root.tsx`, `ParticleSystem.tsx`, etc.
- [x] **Shorts Optimization:** Ensure exactly 2 premium shorts are generated from the specified time segments.

### Phase 3: Modal & Rendering Stability
- [ ] **Build Process Hardening:** Ensure the Modal build is stable and dependencies are correctly handled without fragile caching.
- [ ] **Output Management:** Verify that both the main video and Shorts are correctly returned and stored.

### Phase 4: Final Validation
- [ ] **Checklist Execution:** Run `checklist.py`.
- [ ] **End-to-End Test:** Perform a full render with `lofi_chill.json`.

## 📐 Design Commitments
- **Geometry:** Sharp edges for technical elements (watermark), organic motion for visualizers.
- **Palette:** Deep blues, dark violets (avoiding the overused purple glow), and warm amber accents.
- **Motion:** Parallax zooms, floating particles, and frequency-mapped visualizers.

## 🔗 Dependencies
- `modal_app.py`: Deployment & Rendering logic.
- `remotion/`: Video composition logic.
- `requests/lofi_chill.json`: Input configuration.
