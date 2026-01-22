import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, useCurrentFrame } from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { springTiming, linearTiming } from '@remotion/transitions';
import { Scene } from './Scene';
import { EndScreen } from './EndScreen';
import { CineVideoProps, TransitionType } from './schema';
import { staticFile } from 'remotion';

const getTransitionEffect = (type: TransitionType = 'fade', durationInSeconds: number, fps: number, width: number, height: number) => {
    const durationInFrames = Math.round(durationInSeconds * fps);
    const timing = springTiming({ config: { damping: 200, mass: 1.5, stiffness: 50 } });

    switch (type) {
        case 'slide': return { presentation: slide({ direction: 'from-right' }), timing };
        case 'wipe': return { presentation: wipe({ direction: 'from-right' }), timing };
        case 'flip': return { presentation: flip({ direction: 'from-right' }), timing };
        case 'clockWipe': return { presentation: clockWipe({ width, height }), timing: linearTiming({ durationInFrames }) };
        case 'none': return null;
        case 'fade':
        default: return { presentation: fade(), timing };
    }
};

export const CineVideo: React.FC<CineVideoProps> = ({
    scenes, backgroundMusic, backgroundMusicVolume = 0.1, fps = 30, audioDucking = true, watermark, endScreen
}) => {
    const frame = useCurrentFrame();

    const bgMusicVolume = interpolate(frame % 60, [0, 30, 60], [backgroundMusicVolume, backgroundMusicVolume * 0.7, backgroundMusicVolume], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {backgroundMusic && <Audio src={backgroundMusic} volume={audioDucking ? bgMusicVolume : backgroundMusicVolume} loop />}

            <TransitionSeries>
                {scenes.map((scene, index) => {
                    const durationFrames = Math.round(scene.durationInSeconds * fps);
                    const transitionDuration = scene.transitionDuration || 1;
                    const transitionFrames = Math.round(transitionDuration * fps);

                    return (
                        <React.Fragment key={index}>
                            <TransitionSeries.Sequence durationInFrames={durationFrames}>
                                <Scene {...scene} transitionFrames={transitionFrames} />
                            </TransitionSeries.Sequence>

                            {index < scenes.length - 1 && scene.transitionAfter && scene.transitionAfter !== 'none' && (() => {
                                const { width, height } = { width: 1920, height: 1080 }; // Default as we are outside hook, but better pass from component
                                const transition = getTransitionEffect(scene.transitionAfter, transitionDuration, fps, width, height);
                                if (!transition) return null;
                                return <TransitionSeries.Transition presentation={transition.presentation as any} timing={transition.timing} />;
                            })()}
                        </React.Fragment>
                    );
                })}
            </TransitionSeries>

            {watermark && (
                <AbsoluteFill style={{
                    justifyContent: watermark.position.includes('top') ? 'flex-start' : 'flex-end',
                    alignItems: watermark.position.includes('left') ? 'flex-start' : 'flex-end',
                    padding: '50px',
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        transform: `scale(${1 + Math.sin(frame / 30) * 0.02})`,
                        filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))',
                    }}>
                        {watermark.text ? (
                            <div style={{
                                fontSize: `${(watermark.scale || 1) * 40}px`,
                                fontWeight: 'bold',
                                color: 'white',
                                fontFamily: 'Inter, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '4px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)',
                                padding: '15px 30px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                opacity: watermark.opacity || 0.9,
                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}>
                                {watermark.text}
                            </div>
                        ) : (
                            watermark.imageUrl && (
                                <Img
                                    src={watermark.imageUrl.startsWith('http') ? watermark.imageUrl : staticFile(watermark.imageUrl)}
                                    style={{
                                        width: `${(watermark.scale || 1) * 160}px`,
                                        height: `${(watermark.scale || 1) * 160}px`,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255, 255, 255, 0.4)',
                                        objectFit: 'cover',
                                        opacity: watermark.opacity || 0.95,
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            )
                        )}
                    </div>
                </AbsoluteFill>
            )}

            {endScreen && <EndScreen {...endScreen} fps={fps} totalDuration={totalDuration} />}
        </AbsoluteFill>
    );
};
