import React from "react";
import { Composition } from "remotion";
import { CineVideo } from "./CineVideo";
import { CineVideoSchema, CineVideoSchemaBase, CineVideoProps } from "./schema";
import { ShortsVideo } from "./ShortsVideo";

const calculateVideoMetadata = ({ props }: { props: CineVideoProps }) => {
  const fps = props.fps || 30;

  // Optimization for Shorts: If a specific short is selected, return only its duration
  if (props.selectedShortIndex !== undefined && props.shorts && props.shorts[props.selectedShortIndex]) {
    const short = props.shorts[props.selectedShortIndex];
    const duration = short.endInSeconds - short.startInSeconds;
    return {
      durationInFrames: Math.max(1, Math.round(duration * fps)),
      fps,
    };
  }

  let totalFrames = 0;
  props.scenes.forEach((scene, index) => {
    const sceneFrames = Math.round(scene.durationInSeconds * fps);
    totalFrames += sceneFrames;
    if (index < props.scenes.length - 1 && scene.transitionAfter && scene.transitionAfter !== 'none') {
      const transitionDuration = scene.transitionDuration || 1;
      const transitionFrames = Math.round(transitionDuration * fps);
      totalFrames -= transitionFrames;
    }
  });
  return {
    durationInFrames: Math.max(1, totalFrames),
    fps,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CineVideo"
        component={CineVideo}
        fps={30}
        width={1920}
        height={1080}
        schema={CineVideoSchemaBase}
        calculateMetadata={calculateVideoMetadata}
        defaultProps={{
          scenes: [
            {
              assets: ["https://picsum.photos/seed/remotion/1920/1080"],
              durationInSeconds: 5,
              zoomDirection: "in"
            }
          ],
          fps: 30,
        }}
      />
      <Composition
        id="ShortsVideo"
        component={ShortsVideo}
        fps={30}
        width={1080}
        height={1920}
        schema={CineVideoSchemaBase}
        calculateMetadata={calculateVideoMetadata}
        defaultProps={{
          scenes: [
            {
              assets: ["https://picsum.photos/seed/shorts/1080/1920"],
              durationInSeconds: 5,
              zoomDirection: "in"
            }
          ],
          fps: 30,
        }}
      />
    </>
  );
};
