import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EndScreen as EndScreenType } from './schema';

export const EndScreen: React.FC<EndScreenType & { fps: number; totalDuration: number }> = ({
    text,
    callToAction,
    socialLinks,
    duration,
    fps,
    totalDuration,
}) => {
    const frame = useCurrentFrame();
    const startFrame = (totalDuration - duration) * fps;

    if (frame < startFrame) return null;

    const localFrame = frame - startFrame;
    const scale = interpolate(localFrame, [0, 30], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(localFrame, [0, 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', opacity }}>
            <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
                <h1
                    style={{
                        fontSize: '80px',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '40px',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '1.2',
                    }}
                >
                    {text}
                </h1>

                {callToAction && (
                    <div
                        style={{
                            fontSize: '40px',
                            color: '#3b82f6',
                            marginBottom: '60px',
                            padding: '20px 60px',
                            border: '3px solid #3b82f6',
                            borderRadius: '50px',
                            display: 'inline-block',
                            fontWeight: 'bold',
                        }}
                    >
                        {callToAction}
                    </div>
                )}

                {socialLinks && (
                    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                        {socialLinks.map((link, i) => (
                            <div key={i} style={{ color: 'white', fontSize: '24px' }}>
                                🔗 {link.platform}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
