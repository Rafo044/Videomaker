import { z } from 'zod';

// Transition types
export const TransitionTypeSchema = z.enum([
    'fade', 'slide', 'wipe', 'flip', 'clockWipe', 'iris', 'none'
]);

export const ZoomDirectionSchema = z.enum(['in', 'out', 'left-to-right', 'right-to-left']);

// Ken Burns
export const KenBurnsSchema = z.object({
    startX: z.number().min(-100).max(100).optional(),
    startY: z.number().min(-100).max(100).optional(),
    endX: z.number().min(-100).max(100).optional(),
    endY: z.number().min(-100).max(100).optional(),
    startScale: z.number().min(1).max(2).optional(),
    endScale: z.number().min(1).max(2).optional(),
    rotation: z.number().min(-15).max(15).optional(),
    easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut', 'ease-in', 'ease-out', 'ease-in-out']).optional(),
});

// Video playback
export const VideoPlaybackSchema = z.object({
    startFrom: z.number().min(0).optional(),
    endAt: z.number().min(0).optional(),
    loop: z.boolean().optional(),
    muted: z.boolean().optional(),
    volume: z.number().min(0).max(1).optional(),
});

// Text overlays
export const TitleCardSchema = z.object({
    text: z.string(),
    subtitle: z.string().optional(),
    animation: z.enum(['slideUp', 'slideDown', 'fade', 'zoom', 'typewriter']).optional(),
    position: z.enum(['top', 'center', 'bottom']).optional(),
    showAt: z.number().optional(),
    hideAt: z.number().optional(),
});

export const SubtitleSchema = z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
});

export const LowerThirdSchema = z.object({
    name: z.string(),
    title: z.string(),
    showAt: z.number(),
    hideAt: z.number(),
});

// Progress Bar
export const ProgressBarSchema = z.object({
    label: z.string().optional(),
    from: z.number().optional(),
    to: z.number(),
    duration: z.number(),
    showAt: z.number(),
    color: z.string().optional(),
    position: z.enum(['top', 'bottom']).optional(),
});

// Particle Effect
export const ParticleEffectSchema = z.object({
    type: z.enum(['confetti', 'snow', 'rain', 'sparkles', 'bubbles', 'fireflies']),
    count: z.number().optional(),
    showAt: z.number(),
    hideAt: z.number(),
    color: z.string().optional(),
});

// Data Chart
export const DataPointSchema = z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
});

export const ChartSchema = z.object({
    type: z.enum(['bar', 'line', 'pie', 'donut']),
    title: z.string().optional(),
    data: z.array(DataPointSchema),
    showAt: z.number(),
    hideAt: z.number(),
    position: z.enum(['left', 'center', 'right']).optional(),
});

// Audio Visualizer
export const AudioVisualizerSchema = z.object({
    type: z.enum(['bars', 'wave', 'circle', 'dots']),
    color: z.string().optional(),
    gap: z.number().optional(),
    barWidth: z.number().optional(),
    position: z.enum(['bottom', 'center', 'top', 'bottom-right', 'bottom-left']).optional(),
    opacity: z.number().optional(),
});

export const SceneSchema = z.object({
    assets: z.array(z.string()),
    audio: z.string().nullable().optional(),
    durationInSeconds: z.number(),

    videoPlayback: VideoPlaybackSchema.optional(),
    zoomDirection: ZoomDirectionSchema.optional(),
    kenBurns: KenBurnsSchema.optional(),

    titleCard: TitleCardSchema.optional(),
    subtitles: z.array(SubtitleSchema).optional(),
    lowerThird: LowerThirdSchema.optional(),

    // NEW: Advanced Elements
    progressBar: ProgressBarSchema.optional(),
    particles: ParticleEffectSchema.optional(),
    chart: ChartSchema.optional(),
    visualizer: AudioVisualizerSchema.optional(),

    transitionAfter: TransitionTypeSchema.optional(),
    transitionDuration: z.number().optional(),
});

export const EndScreenSchema = z.object({
    text: z.string(),
    callToAction: z.string().optional(),
    socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string(),
    })).optional(),
    duration: z.number(),
});

export const WatermarkSchema = z.object({
    imageUrl: z.string().optional(),
    text: z.string().optional(),
    position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
    opacity: z.number().min(0).max(1).optional(),
    scale: z.number().optional(),
});

export const ShortsConfigSchema = z.object({
    startInSeconds: z.number(),
    endInSeconds: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
});

export const CineVideoSchemaBase = z.object({
    scenes: z.array(SceneSchema),
    backgroundMusic: z.string().nullable().optional(),
    backgroundMusicVolume: z.number().optional(),
    fps: z.number().optional(),
    audioDucking: z.boolean().optional(),

    watermark: WatermarkSchema.optional(),
    endScreen: EndScreenSchema.optional(),
    shorts: z.array(ShortsConfigSchema).optional(),
    selectedShortIndex: z.number().optional(), // New: Optimization for rendering a specific short
    data: z.any().optional(),
    targetDuration: z.number().optional(), // New: Total video duration in seconds (for looping)
});

export const CineVideoSchema = z.union([
    CineVideoSchemaBase,
    z.array(CineVideoSchemaBase).min(1).transform(a => a[0])
]);

export type CineVideoProps = z.infer<typeof CineVideoSchemaBase>;
export type SceneProps = z.infer<typeof SceneSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
export type KenBurnsEffect = z.infer<typeof KenBurnsSchema>;
export type TitleCard = z.infer<typeof TitleCardSchema>;
export type Subtitle = z.infer<typeof SubtitleSchema>;
export type LowerThird = z.infer<typeof LowerThirdSchema>;
export type ProgressBar = z.infer<typeof ProgressBarSchema>;
export type ParticleEffect = z.infer<typeof ParticleEffectSchema>;
export type Chart = z.infer<typeof ChartSchema>;
export type AudioVisualizer = z.infer<typeof AudioVisualizerSchema>;
export type EndScreen = z.infer<typeof EndScreenSchema>;
export type Watermark = z.infer<typeof WatermarkSchema>;
