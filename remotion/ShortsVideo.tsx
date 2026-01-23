import { AbsoluteFill, useVideoConfig, Sequence } from 'remotion';
import { CineVideo } from './CineVideo';
import { CineVideoProps } from './schema';

export const ShortsVideo: React.FC<CineVideoProps> = (props) => {
    const { width, height, fps, durationInFrames } = useVideoConfig();
    const { selectedShortIndex, shorts } = props;

    // Calculate offset if a specific short is selected
    const offsetInSeconds = (selectedShortIndex !== undefined && shorts && shorts[selectedShortIndex])
        ? shorts[selectedShortIndex].startInSeconds
        : 0;
    const offsetInFrames = Math.round(offsetInSeconds * fps);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
            <AbsoluteFill style={{
                width: 1920,
                height: 1080,
                left: (width - 1920) / 2,
                top: (height - 1080) / 2,
                transform: `scale(${height / 1080 * 1.2})`,
                transformOrigin: 'center'
            }}>
                <Sequence from={-offsetInFrames} durationInFrames={Infinity}>
                    <CineVideo {...props} />
                </Sequence>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
