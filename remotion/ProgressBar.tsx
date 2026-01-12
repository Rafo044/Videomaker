import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ProgressBar as ProgressBarType } from './schema';

export const ProgressBar: React.FC<ProgressBarType & { fps: number }> = ({
    label,
    from = 0,
    to,
    duration,
    showAt,
    color = '#3b82f6',
    position = 'bottom',
    fps,
}) => {
    const frame = useCurrentFrame();
    const currentTime = frame / fps;
    const startFrame = showAt * fps;
    const endFrame = (showAt + duration) * fps;

    if (frame < startFrame || frame > endFrame) return null;

    const progress = interpolate(
        frame,
        [startFrame, endFrame],
        [from, to],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const opacity = interpolate(
        frame,
        [startFrame, startFrame + 10, endFrame - 10, endFrame],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill
            style={{
                justifyContent: position === 'top' ? 'flex-start' : 'flex-end',
                alignItems: 'center',
                padding: '5%',
                opacity,
            }}
        >
            <div style={{ width: '80%', maxWidth: '600px' }}>
                {label && (
                    <div style={{
                        color: 'white',
                        fontSize: '28px',
                        marginBottom: '15px',
                        fontFamily: 'Inter, sans-serif',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}>
                        {label}: {Math.round(progress)}%
                    </div>
                )}
                <div style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
