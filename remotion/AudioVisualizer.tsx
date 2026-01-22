import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { AudioVisualizer as VisualizerProps } from './schema';

export const AudioVisualizer: React.FC<VisualizerProps> = ({
    type = 'bars',
    color = '#ffffff',
    gap = 10,
    barWidth = 8,
    position = 'bottom',
    opacity = 0.6
}) => {
    const frame = useCurrentFrame();
    // Use frame for animation

    const numElements = type === 'bars' ? 50 : 80;

    const renderBars = () => {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: `${gap}px`,
                height: '150px',
                width: '100%',
                opacity: opacity
            }}>
                {Array.from({ length: numElements }).map((_, i) => {
                    const offset = i * 0.15;
                    const value = Math.sin(frame / 8 + offset) * 0.5 + 0.5;
                    const noise = Math.sin(frame / 3 + i) * 0.3;
                    const h = interpolate(value + noise, [-0.3, 1.3], [10, 120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth}px`,
                                height: `${h}px`,
                                background: `linear-gradient(to top, ${color}33, ${color})`,
                                borderRadius: '10px',
                                boxShadow: h > 80 ? `0 0 15px ${color}44` : 'none',
                                transition: 'height 0.1s ease-out'
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    const renderDots = () => {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${gap * 2}px`,
                height: '120px',
                width: '100%',
                opacity: opacity
            }}>
                {Array.from({ length: 40 }).map((_, i) => {
                    const offset = i * 0.4;
                    const value = Math.sin(frame / 12 + offset);
                    const y = interpolate(value, [-1, 1], [-25, 25]);
                    const s = interpolate(value, [-1, 1], [0.7, 1.3]);
                    const drift = Math.sin(frame / 20 + i) * 10;

                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth * 1.2}px`,
                                height: `${barWidth * 1.2}px`,
                                backgroundColor: color,
                                borderRadius: '50%',
                                transform: `translate(${drift}px, ${y}px) scale(${s})`,
                                boxShadow: `0 0 15px 2px ${color}`,
                                opacity: interpolate(value, [-1, 1], [0.3, 1]),
                                filter: 'blur(0.5px)'
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    const getPositionStyle = (): React.CSSProperties => {
        switch (position) {
            case 'center': return { justifyContent: 'center', alignItems: 'center' };
            case 'top': return { justifyContent: 'flex-start', alignItems: 'center', paddingTop: '10%' };
            case 'bottom-right': return { justifyContent: 'flex-end', alignItems: 'flex-end', padding: '8%' };
            case 'bottom-left': return { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '8%' };
            case 'bottom':
            default: return { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '12%' };
        }
    };

    return (
        <AbsoluteFill style={{ ...getPositionStyle(), pointerEvents: 'none' }}>
            {type === 'dots' ? renderDots() : renderBars()}
        </AbsoluteFill>
    );
};
