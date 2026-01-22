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

    const numBars = type === 'bars' ? 40 : 100;

    const renderBars = () => {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: `${gap}px`,
                height: '200px',
                width: '100%',
                opacity: opacity
            }}>
                {Array.from({ length: numBars }).map((_, i) => {
                    // Create a pseudo-random animation based on frame and index
                    const offset = i * 0.2;
                    const value = Math.sin(frame / 5 + offset) * 0.5 + 0.5;
                    const noise = Math.sin(frame / 2 + i) * 0.2;
                    const h = interpolate(value + noise, [0, 1], [10, 150]);

                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth}px`,
                                height: `${h}px`,
                                backgroundColor: color,
                                borderRadius: '4px',
                                boxShadow: `0 0 15px ${color}66`
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
            case 'bottom-right': return { justifyContent: 'flex-end', alignItems: 'flex-end', padding: '5%' };
            case 'bottom-left': return { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '5%' };
            case 'bottom':
            default: return { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '10%' };
        }
    };

    return (
        <AbsoluteFill style={{ ...getPositionStyle(), pointerEvents: 'none' }}>
            {type === 'bars' && renderBars()}
        </AbsoluteFill>
    );
};
