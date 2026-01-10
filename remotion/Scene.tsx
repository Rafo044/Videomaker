import React from "react";
import {
    AbsoluteFill,
    Img,
    Audio,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Series,
} from "remotion";
import { SceneProps } from "./schema";

export const Scene: React.FC<SceneProps & { isFirst?: boolean; transitionFrames?: number }> = ({
    images,
    audio,
    zoomDirection,
    isFirst = false,
    transitionFrames = 30,
    durationInSeconds,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Motion logic (Ken Burns)
    const isStill = zoomDirection === "still";
    const zoom = isStill ? 1.05 : interpolate(
        frame,
        [0, 900], // Smooth over 30s
        zoomDirection === "in" ? [1, 1.3] : zoomDirection === "out" ? [1.3, 1] : [1.1, 1.1],
        { extrapolateRight: "extend" }
    );

    const xPan = isStill ? 0 : interpolate(
        frame,
        [0, 900],
        zoomDirection === "left-to-right" ? [-60, 60] : zoomDirection === "right-to-left" ? [60, -60] : [0, 0],
        { extrapolateRight: "extend" }
    );

    // Fade-in transition for the whole scene group
    const sceneOpacity = isFirst ? 1 : interpolate(
        frame,
        [0, transitionFrames],
        [0, 1],
        { extrapolateRight: "clamp" }
    );

    // Calculate image durations within this scene segment
    const totalFrames = Math.round(durationInSeconds * fps);
    const framesPerImage = totalFrames / images.length;

    return (
        <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden", opacity: sceneOpacity }}>
            {/* Background Motion Container */}
            <div
                style={{
                    transform: `scale(${zoom}) translateX(${xPan}px)`,
                    width: "100%",
                    height: "100%",
                }}
            >
                <Series>
                    {images.map((img, i) => (
                        <Series.Sequence key={i} durationInFrames={Math.ceil(framesPerImage)}>
                            <Img
                                src={img}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Series.Sequence>
                    ))}
                </Series>
            </div>

            {/* Cinematic Overlays */}
            <AbsoluteFill
                style={{
                    boxShadow: "inset 0 0 200px rgba(0,0,0,0.8)",
                    background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)",
                }}
            />

            <AbsoluteFill
                style={{
                    opacity: 0.04,
                    pointerEvents: "none",
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
                    mixBlendMode: "overlay"
                }}
            />

            {/* Shared audio for all images in this scene */}
            {audio && <Audio src={audio} />}
        </AbsoluteFill>
    );
};
