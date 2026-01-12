import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { Scene } from "./Scene";
import { CineVideoProps } from "./schema";

export const CineVideo: React.FC<CineVideoProps> = ({
    scenes,
    backgroundMusic,
    backgroundMusicVolume = 0.1,
    transitionDurationInSeconds = 1,
    fps = 30,
    audioDucking = true,
}) => {
    console.log("Remotion: CineVideo rendering...", { sceneCount: scenes.length });
    const transitionFrames = Math.round(transitionDurationInSeconds * fps);

    let currentFrame = 0;
    const sceneConfigurations = scenes.map((scene, index) => {
        const durationFrames = Math.round(scene.durationInSeconds * fps);
        const startFrame = currentFrame;

        // This is the total sequence length
        const totalFrames = durationFrames;

        // Adjust next start frame to create overlap (transition)
        if (index < scenes.length - 1) {
            currentFrame += durationFrames - transitionFrames;
        }

        return {
            ...scene,
            startFrame,
            durationFrames: totalFrames,
            isFirst: index === 0,
        };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            {/* Background Music with Ducking */}
            {backgroundMusic && (
                <Audio
                    src={backgroundMusic}
                    volume={audioDucking ? backgroundMusicVolume * 0.4 : backgroundMusicVolume}
                    loop
                />
            )}

            {sceneConfigurations.map((config, index) => {
                return (
                    <Sequence
                        key={index}
                        from={config.startFrame}
                        durationInFrames={config.durationFrames}
                        layout="none"
                    >
                        <Scene
                            {...config}
                            transitionFrames={transitionFrames}
                        />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
