import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { CineVideo } from './CineVideo';
import { CineVideoProps } from './schema';

/**
 * ShortsVideo is a vertical container (9:16) that crops the main CineVideo content.
 * It's designed to be used with the 'ShortsVideo' composition in Root.tsx.
 */
export const ShortsVideo: React.FC<CineVideoProps> = (props) => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
            {/* 
                We render the main CineVideo at its original landscape size,
                then scale and center it to fill the vertical frame (9:16).
                This creates a "zoomed-in" vertical look while keeping our premium assets.
            */}
            <AbsoluteFill style={{
                width: 1920,
                height: 1080,
                left: (width - 1920) / 2,
                top: (height - 1080) / 2,
                transform: `scale(${height / 1080 * 1.2})`, // Scale slightly more to ensure no black edges
                transformOrigin: 'center'
            }}>
                <CineVideo {...props} />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
