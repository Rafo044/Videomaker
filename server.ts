import express from 'express';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.post('/render', async (req, res) => {
    const startTime = Date.now();
    console.log('📹 Render request received');

    try {
        const inputProps = req.body;
        const outputPath = path.join('/tmp', `video_${Date.now()}.mp4`);

        console.log('🔧 Bundling Remotion project...');
        const bundleLocation = await bundle({
            entryPoint: path.join(process.cwd(), 'remotion/index.ts'),
            webpackOverride: (config) => config,
        });

        console.log('🎬 Selecting composition...');
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: 'CineVideo',
            inputProps,
        });

        console.log(`📊 Composition: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames`);

        console.log('🎥 Starting render...');
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps,
            chromiumOptions: {
                ignoreCertificateErrors: true,
                disableWebSecurity: true,
                gl: 'swiftshader',
            },
            envVariables: {
                REMOTION_IGNORE_MEMORY_CHECK: 'true',
            },
            onProgress: ({ renderedFrames }) => {
                if (renderedFrames % 10 === 0) {
                    console.log(`📊 Progress: ${renderedFrames}/${composition.durationInFrames} frames rendered`);
                }
            },
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Render completed in ${duration}s`);

        // Send file back
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);

        const fileStream = fs.createReadStream(outputPath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
            // Clean up
            fs.unlinkSync(outputPath);
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Render error:', err);
        res.status(500).json({
            error: err.message,
            stack: err.stack,
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Remotion render server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📹 Render endpoint: POST http://localhost:${PORT}/render`);
});
