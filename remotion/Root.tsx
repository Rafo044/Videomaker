import { Composition } from "remotion";
import { CineVideo } from "./CineVideo";
import { CineVideoSchema, CineVideoProps } from "./schema";

export const RemotionRoot: React.FC = () => {
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
          const totalDuration = props.scenes.reduce(
            (acc, scene) => acc + scene.durationInSeconds,
            0
          );

          // Account for overlap in transitions
          const transitionOverlap = (props.scenes.length - 1) * (props.transitionDurationInSeconds || 1);
          const finalDurationSeconds = totalDuration - transitionOverlap;

          return {
            durationInFrames: Math.max(1, Math.round(finalDurationSeconds * props.fps)),
          };
        }}
        defaultProps={{
          scenes: [
            {
              image: "https://remotion-assets.s3.eu-central-1.amazonaws.com/found-the-f-1.png",
              audio: "https://remotion-assets.s3.eu-central-1.amazonaws.com/remotion-intro.mp3",
              durationInSeconds: 5,
              zoomDirection: "in",
            }
          ],
          backgroundMusic: undefined,
          backgroundMusicVolume: 0.1,
          transitionType: "fade",
          transitionDurationInSeconds: 1,
          fps: 30,
          audioDucking: true,
        }}
      />
    </>
  );
};
