import React from "react";
import {
    AbsoluteFill,
    Img,
    Video,
    Audio,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Series,
    staticFile,
} from "remotion";
import { SceneProps } from "./schema";

const isVideo = (src: string) => {
    const videoExtensions = [".mp4", ".webm", ".mov", ".mkv", ".ogg"];
    const lowerSrc = src.toLowerCase();
    return videoExtensions.some(ext => lowerSrc.endsWith(ext)) || lowerSrc.includes("video");
};

export const Scene: React.FC<SceneProps & { isFirst?: boolean; transitionFrames?: number }> = ({
    assets,
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

    // Calculate asset durations within this scene segment
    const totalFrames = Math.round(durationInSeconds * fps);
    const framesPerAsset = totalFrames / assets.length;

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
                    {assets.map((asset, i) => {
                        const isVid = isVideo(asset);
                        const assetSrc = asset.startsWith("http") ? asset : staticFile(asset);

                        return (
                            <Series.Sequence key={i} durationInFrames={Math.ceil(framesPerAsset)}>
                                {isVid ? (
                                    <Video
                                        src={assetSrc}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                        muted // Muted because we have a separate audio track
                                    />
                                ) : (
                                    <Img
                                        src={assetSrc}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </Series.Sequence>
                        );
                    })}
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

            {/* Shared audio for all assets in this scene */}
            {audio && <Audio src={audio.startsWith("http") ? audio : staticFile(audio)} />}
        </AbsoluteFill>
    );
};
