import React from 'react';
import { AbsoluteFill, useCurrentFrame, random, interpolate } from 'remotion';
import { ParticleEffect as ParticleEffectType } from './schema';

const Particle: React.FC<{
    index: number;
    type: string;
    color: string;
    frame: number;
    fps: number;
}> = ({ index, type, color, frame, fps }) => {
    const seed = index;
    const x = random(seed) * 100;
    const startY = random(seed + 1) * -20;
    const speed = random(seed + 2) * 2 + 1;
    const size = random(seed + 3) * 15 + 5;
    const rotation = random(seed + 4) * 360;

    const y = startY + (frame / fps) * speed * 100;

    if (y > 120) return null;

    const opacity = interpolate(y, [100, 120], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const getShape = () => {
        switch (type) {
            case 'confetti':
                return (
                    <div
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: color,
                            transform: `rotate(${rotation + frame * 2}deg)`,
                        }}
                    />
                );
            case 'snow':
                return (
                    <div
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                        }}
                    />
                );
            case 'sparkles':
                return (
                    <div
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                            filter: 'blur(1px)',
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                opacity,
            }}
        >
            {getShape()}
        </div>
    );
};

export const ParticleSystem: React.FC<ParticleEffectType & { fps: number }> = ({
    type,
    count = 100,
    showAt,
    hideAt,
    color = '#FFD700',
    fps,
}) => {
    const frame = useCurrentFrame();
    const startFrame = showAt * fps;
    const hideFrame = hideAt * fps;

    if (frame < startFrame || frame > hideFrame) return null;

    const localFrame = frame - startFrame;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {Array.from({ length: count }).map((_, i) => (
                <Particle
                    key={i}
                    index={i}
                    type={type}
                    color={color}
                    frame={localFrame}
                    fps={fps}
                />
            ))}
        </AbsoluteFill>
    );
};
