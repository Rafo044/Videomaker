import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, Video, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { SceneProps } from './schema';
import { ProgressBar } from './ProgressBar';
import { ParticleSystem } from './ParticleSystem';
import { Chart } from './Chart';
import { AudioVisualizer } from './AudioVisualizer';

const isVideo = (url: string): boolean => {
    return /\.(mp4|webm|mov|avi)$/i.test(url);
};

const getEasingFunction = (easing?: string) => {
    switch (easing) {
        case 'easeIn':
        case 'ease-in': return Easing.in(Easing.ease);
        case 'easeOut':
        case 'ease-out': return Easing.out(Easing.ease);
        case 'easeInOut':
        case 'ease-in-out': return Easing.inOut(Easing.ease);
        case 'linear':
        default: return Easing.linear;
    }
};

export const Scene: React.FC<SceneProps & { transitionFrames: number }> = ({
    assets, audio, durationInSeconds, zoomDirection, kenBurns, videoPlayback,
    titleCard, subtitles, lowerThird, progressBar, particles, chart, visualizer, transitionFrames
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const durationFrames = Math.round(durationInSeconds * fps);
    const assetUrl = useMemo(() => assets[0], [assets]);
    const isVideoAsset = isVideo(assetUrl);

    const progress = spring({ frame, fps, config: { damping: 200, mass: 1, stiffness: 50 } });

    const getTransform = () => {
        let scale = 1, translateX = 0, translateY = 0, rotate = 0;

        if (kenBurns) {
            const easing = getEasingFunction(kenBurns.easing);
            scale = interpolate(progress, [0, 1], [kenBurns.startScale || 1.2, kenBurns.endScale || 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
            translateX = interpolate(progress, [0, 1], [kenBurns.startX || 0, kenBurns.endX || 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
            translateY = interpolate(progress, [0, 1], [kenBurns.startY || 0, kenBurns.endY || 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
            if (kenBurns.rotation) rotate = interpolate(progress, [0, 1], [0, kenBurns.rotation], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
        } else if (zoomDirection && !isVideoAsset) {
            switch (zoomDirection) {
                case 'in': scale = interpolate(progress, [0, 1], [1.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); break;
                case 'out': scale = interpolate(progress, [0, 1], [1, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); break;
                case 'left-to-right': translateX = interpolate(progress, [0, 1], [-3, 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); scale = 1.05; break;
                case 'right-to-left': translateX = interpolate(progress, [0, 1], [3, -3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); scale = 1.05; break;
            }
        }
        return { transform: `scale(${scale}) translateX(${translateX}%) translateY(${translateY}%) rotate(${rotate}deg)` };
    };

    const opacity = interpolate(frame, [0, transitionFrames, durationFrames - transitionFrames, durationFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const audioVolume = interpolate(frame, [0, transitionFrames, durationFrames - transitionFrames, durationFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const renderTitleCard = () => {
        if (!titleCard) return null;
        const showFrame = (titleCard.showAt || 0) * fps;
        const hideFrame = (titleCard.hideAt || durationInSeconds) * fps;
        if (frame < showFrame || frame > hideFrame) return null;
        const titleOpacity = interpolate(frame, [showFrame, showFrame + 15, hideFrame - 15, hideFrame], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const yOffset = titleCard.animation === 'slideUp' ? interpolate(frame, [showFrame, showFrame + 20], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
        return (
            <AbsoluteFill style={{ justifyContent: titleCard.position || 'center', alignItems: 'center', padding: '5%' }}>
                <div style={{ opacity: titleOpacity, transform: `translateY(${yOffset}px)`, textAlign: 'center', color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                    <h1 style={{ fontSize: '80px', fontWeight: 'bold', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: '1.1' }}>{titleCard.text}</h1>
                    {titleCard.subtitle && <p style={{ fontSize: '40px', marginTop: '20px', opacity: 0.9 }}>{titleCard.subtitle}</p>}
                </div>
            </AbsoluteFill>
        );
    };

    const renderSubtitles = () => {
        if (!subtitles || subtitles.length === 0) return null;
        const currentTime = frame / fps;
        const activeSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);
        if (!activeSubtitle) return null;
        return (
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '10%' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '15px 40px', borderRadius: '8px', color: 'white', fontSize: '36px', fontFamily: 'Inter, sans-serif', maxWidth: '80%', textAlign: 'center' }}>
                    {activeSubtitle.text}
                </div>
            </AbsoluteFill>
        );
    };

    const renderLowerThird = () => {
        if (!lowerThird) return null;
        const showFrame = lowerThird.showAt * fps;
        const hideFrame = lowerThird.hideAt * fps;
        if (frame < showFrame || frame > hideFrame) return null;
        const slideX = interpolate(frame, [showFrame, showFrame + 20, hideFrame - 20, hideFrame], [-300, 0, 0, -300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
            <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '5%' }}>
                <div style={{ transform: `translateX(${slideX}px)`, backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px 40px', borderLeft: '8px solid #3b82f6', maxWidth: '500px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{lowerThird.name}</div>
                    <div style={{ fontSize: '24px', color: '#6b7280', marginTop: '5px' }}>{lowerThird.title}</div>
                </div>
            </AbsoluteFill>
        );
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
            <AbsoluteFill style={{ opacity, ...getTransform() }}>
                {isVideoAsset ? (
                    <Video src={assetUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(0.9) saturate(0.8) sepia(0.1)' }} startFrom={videoPlayback?.startFrom ? Math.round(videoPlayback.startFrom * fps) : 0} endAt={videoPlayback?.endAt ? Math.round(videoPlayback.endAt * fps) : durationFrames} volume={0} muted={true} loop={videoPlayback?.loop || false} />
                ) : (
                    <Img src={assetUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(0.9) saturate(0.8) sepia(0.1)' }} />
                )}
            </AbsoluteFill>

            {renderTitleCard()}
            {renderSubtitles()}
            {renderLowerThird()}

            {progressBar && <ProgressBar {...progressBar} fps={fps} />}
            {particles && <ParticleSystem {...particles} fps={fps} />}
            {chart && <Chart {...chart} fps={fps} />}
            {visualizer && <AudioVisualizer {...visualizer} />}

            {/* Aesthetic Overlays */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                background: 'radial-gradient(circle, transparent 20%, rgba(10,10,10,0.4) 100%)',
                mixBlendMode: 'multiply'
            }} />

            {/* VHS Grain Effect (SVG Noise) */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px',
            }} />

            {/* Digital Timestamp Counter */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '60px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '24px',
                opacity: 0.6,
                textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}>
                REC  ●  {(() => {
                    const time = Math.floor(frame / fps);
                    const h = Math.floor(time / 3600).toString().padStart(2, '0');
                    const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
                    const s = (time % 60).toString().padStart(2, '0');
                    return `${h}:${m}:${s}`;
                })()}
            </div>

            {audio && <Audio src={audio} volume={audioVolume} />}
        </AbsoluteFill>
    );
};
