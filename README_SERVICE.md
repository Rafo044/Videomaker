# Remotion Professional Video Service

A high-quality programmatic video rendering service built with Remotion, React, and Express.

## Key Features

- **Professional Motion**: Jitter-free Ken Burns (zoom/pan) using React interpolation.
- **Cinematic Overlays**: Built-in vignette and grain effects.
- **Advanced Transitions**: Native cross-fade, wipe, and slide transitions between scenes.
- **Type-safe API**: Payload validation using Zod.
- **Asynchronous Rendering**: Queue-based system with job tracking.

## API Documentation

### 1. Start Rendering

**POST** `/render`

**Payload:**

```json
{
  "scenes": [
    {
      "image": "https://example.com/image1.jpg",
      "audio": "https://example.com/audio1.mp3",
      "durationInSeconds": 5,
      "zoomDirection": "in"
    },
    {
      "image": "https://example.com/image2.jpg",
      "audio": "https://example.com/audio2.mp3",
      "durationInSeconds": 5,
      "zoomDirection": "left-to-right"
    }
  ],
  "backgroundMusic": "https://example.com/music.mp3",
  "backgroundMusicVolume": 0.1,
  "transitionDurationInSeconds": 1,
  "fps": 30
}
```

**Response:**

```json
{
  "status": "success",
  "jobId": "...",
  "pollUrl": "http://localhost:3000/status/..."
}
```

### 2. Check Status

**GET** `/status/:jobId`

**Response (InProgress):**

```json
{
  "status": "in-progress",
  "progress": 0.45,
  "data": { ... }
}
```

**Response (Completed):**

```json
{
  "status": "completed",
  "videoUrl": "http://localhost:3000/renders/jobId.mp4",
  "data": { ... }
}
```

## Setup & Run

### Docker (Recommended)

```bash
docker build -t remotion-service .
docker run -p 3000:3000 remotion-service
```

### Manual

```bash
npm install
npm run dev
```
