import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
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

const getTransitionEffect = (type: TransitionType = 'fade', durationInSeconds: number, fps: number) => {
    const durationFrames = Math.round(durationInSeconds * fps);
    const timing = springTiming({ config: { damping: 200, mass: 1.5, stiffness: 50 } });

    switch (type) {
        case 'slide': return { presentation: slide({ direction: 'from-right' }), timing };
        case 'wipe': return { presentation: wipe({ direction: 'from-right' }), timing };
        case 'flip': return { presentation: flip({ direction: 'from-right' }), timing };
        case 'clockWipe': return { presentation: clockWipe(), timing: linearTiming({ durationInFrames }) };
        case 'none': return null;
        case 'fade':
        default: return { presentation: fade(), timing };
    }
};

export const CineVideo: React.FC<CineVideoProps> = ({
    scenes, backgroundMusic, backgroundMusicVolume = 0.1, fps = 30, audioDucking = true, watermark, endScreen
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

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
                                const transition = getTransitionEffect(scene.transitionAfter, transitionDuration, fps);
                                return transition ? <TransitionSeries.Transition presentation={transition.presentation} timing={transition.timing} /> : null;
                            })()}
                        </React.Fragment>
                    );
                })}
            </TransitionSeries>

            {watermark && (
                <AbsoluteFill style={{ justifyContent: watermark.position.includes('top') ? 'flex-start' : 'flex-end', alignItems: watermark.position.includes('left') ? 'flex-start' : 'flex-end', padding: '3%', pointerEvents: 'none' }}>
                    <Img src={watermark.imageUrl} style={{ width: `${(watermark.scale || 1) * 150}px`, opacity: watermark.opacity || 0.7 }} />
                </AbsoluteFill>
            )}

            {endScreen && <EndScreen {...endScreen} fps={fps} totalDuration={totalDuration} />}
        </AbsoluteFill>
    );
};
