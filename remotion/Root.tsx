import React from "react";
import { Composition } from "remotion";
import { CineVideo } from "./CineVideo";
import { CineVideoSchema, CineVideoProps } from "./schema";

export const RemotionRoot: React.FC = () => {
  console.log("Remotion: RemotionRoot rendering...");
  return (
    <>
      <Composition
        id="CineVideo"
        component={CineVideo}
        fps={30}
        width={1920}
        height={1080}
        schema={CineVideoSchema}
        calculateMetadata={({ props }: { props: CineVideoProps }) => {
          const fps = props.fps || 30;

          // TransitionSeries müddəti belə hesablanır:
          // Bütün Sequence-lərin cəmi MINUS bütün Transition-ların cəmi.

          let totalFrames = 0;
          props.scenes.forEach((scene, index) => {
            const sceneFrames = Math.round(scene.durationInSeconds * fps);
            totalFrames += sceneFrames;

            // Əgər sonda transition varsa, o müddəti çıxırıq (overlap)
            if (index < props.scenes.length - 1 && scene.transitionAfter && scene.transitionAfter !== 'none') {
              const transitionDuration = scene.transitionDuration || 1;
              const transitionFrames = Math.round(transitionDuration * fps);
              totalFrames -= transitionFrames;
            }
          });

          return {
            durationInFrames: Math.max(1, totalFrames),
            fps: fps,
          };
        }}
        defaultProps={{
          scenes: [
            {
              assets: ["https://picsum.photos/seed/remotion/1920/1080"],
              durationInSeconds: 5,
              zoomDirection: "in",
              transitionAfter: "fade",
              transitionDuration: 1
            },
            {
              assets: ["https://picsum.photos/seed/remotion2/1920/1080"],
              durationInSeconds: 5,
              zoomDirection: "out"
            }
          ],
          backgroundMusicVolume: 0.1,
          fps: 30,
          audioDucking: true,
        }}
      />
    </>
  );
};
