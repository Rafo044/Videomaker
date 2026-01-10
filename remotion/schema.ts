import { z } from "zod";

export const TransitionTypeSchema = z.enum([
    "fade",
    "wipe",
    "slide",
    "flip",
    "none",
    "random"
]).default("fade");

export const SceneSchema = z.object({
    images: z.array(z.string()), // Support for multiple images per scene segment
    audio: z.string(),
    durationInSeconds: z.number(),
    zoomDirection: z.enum(["in", "out", "left-to-right", "right-to-left", "still"]).default("in"),
    transitionOverride: TransitionTypeSchema.optional(),
});

export const CineVideoSchema = z.object({
    scenes: z.array(SceneSchema),
    backgroundMusic: z.string().optional(),
    backgroundMusicVolume: z.number().default(0.1),
    transitionType: TransitionTypeSchema,
    transitionDurationInSeconds: z.number().default(1),
    fps: z.number().default(30),
    audioDucking: z.boolean().default(true),
});

export type CineVideoProps = z.infer<typeof CineVideoSchema>;
export type SceneProps = z.infer<typeof SceneSchema>;
export type TransitionType = z.infer<typeof TransitionTypeSchema>;
