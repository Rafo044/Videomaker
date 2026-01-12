import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

console.log("Remotion: Entry point loading...");
registerRoot(RemotionRoot);
console.log("Remotion: Root registered.");
