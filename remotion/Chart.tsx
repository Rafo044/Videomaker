import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { Chart as ChartType } from './schema';

export const Chart: React.FC<ChartType & { fps: number }> = ({
    type,
    title,
    data,
    showAt,
    hideAt,
    position = 'center',
    fps,
}) => {
    const frame = useCurrentFrame();
    const startFrame = showAt * fps;
    const hideFrame = hideAt * fps;

    if (frame < startFrame || frame > hideFrame) return null;

    // Daha ağır və sabit spring (titrəmənin qarşısını alır)
    const progress = spring({
        frame: frame - startFrame,
        fps,
        config: {
            damping: 200, // Yüksək damping = titrəmə yoxdur
            stiffness: 50,
            mass: 1.5,
        },
    });

    const opacity = interpolate(
        frame,
        [startFrame, startFrame + 15, hideFrame - 15, hideFrame],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const maxValue = Math.max(...data.map(d => d.value));

    const renderBarChart = () => (
        <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '30px',
            height: '350px',
            padding: '20px',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            justifyContent: 'center'
        }}>
            {data.map((point, i) => {
                const heightPercentage = (point.value / maxValue) * 100;
                // Animasiya zamanı hündürlük
                const currentHeight = interpolate(progress, [0, 1], [0, heightPercentage]);

                return (
                    <div key={i} style={{
                        textAlign: 'center',
                        width: '120px', // Sabit en (layout shift-in qarşısını alır)
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                    }}>
                        {/* Bar Value Tooltip */}
                        <div style={{
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '800',
                            marginBottom: '10px',
                            opacity: progress,
                            fontFamily: 'Inter, sans-serif',
                            fontVariantNumeric: 'tabular-nums', // Rəqəmlər titrəməsin deyə
                        }}>
                            {Math.round(point.value * progress)}
                        </div>

                        {/* The Bar */}
                        <div
                            style={{
                                height: `${currentHeight}%`,
                                background: `linear-gradient(to top, ${point.color || '#3b82f6'}, ${point.color}CC)`,
                                borderRadius: '12px 12px 4px 4px',
                                boxShadow: `0 10px 40px ${point.color}33`,
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        />

                        {/* Label */}
                        <div style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '20px',
                            marginTop: '20px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {point.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
            padding: '5%',
            opacity,
        }}>
            <div
                style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                    padding: '60px',
                    borderRadius: '40px',
                    minWidth: '700px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.7)',
                    transform: `scale(${interpolate(progress, [0, 1], [0.98, 1])})`,
                }}
            >
                {title && (
                    <h2 style={{
                        color: 'white',
                        fontSize: '44px',
                        marginBottom: '50px',
                        fontWeight: '900',
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '1.2',
                    }}>
                        {title}
                    </h2>
                )}
                {type === 'bar' && renderBarChart()}
            </div>
        </AbsoluteFill>
    );
};
