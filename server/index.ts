import express from "express";
import { makeRenderQueue } from "./render-queue";
import { bundle } from "@remotion/bundler";
import path from "node:path";
import { ensureBrowser } from "@remotion/renderer";
import { CineVideoSchema } from "../remotion/schema";
import fs from "node:fs";

const { PORT = 3000, REMOTION_SERVE_URL } = process.env;

function setupApp({ remotionBundleUrl }: { remotionBundleUrl: string }) {
  const app = express();

  const rendersDir = path.resolve("renders");
  const assetsDir = path.resolve("test_data");

  const queue = makeRenderQueue({
    port: Number(PORT),
    serveUrl: remotionBundleUrl,
    rendersDir,
  });

  app.use(express.json({ limit: "100mb" }));

  // Serve static files
  app.use("/renders", express.static(rendersDir));
  app.use("/assets", express.static(assetsDir));

  // ROOT / HEALTH
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "Remotion Pro Video Service" });
  });

  // PROFESSIONAL RENDER ENDPOINT
  app.post("/render", async (req, res) => {
    try {
      const validation = CineVideoSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: validation.error.format()
        });
      }

      const jobId = queue.createJob(validation.data);

      res.json({
        status: "success",
        jobId,
        pollUrl: `http://localhost:${PORT}/status/${jobId}`
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ status: "error", message: (error as Error).message });
    }
  });

  // STATUS TICKER
  app.get("/status/:jobId", (req, res) => {
    const jobId = req.params.jobId;
    const job = queue.jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ status: "error", message: "Job not found" });
    }

    res.json(job);
  });

  // LIST RENDERS
  app.get("/files", (req, res) => {
    const files = fs.readdirSync(rendersDir).filter((f) => f.endsWith('.mp4'));
    res.json({
      renders: files.map((f) => ({
        filename: f,
        url: `http://localhost:${PORT}/renders/${f}`
      }))
    });
  });

  return app;
}

async function main() {
  console.info("Starting Remotion Pro Video Service...");

  await ensureBrowser();

  const remotionBundleUrl = REMOTION_SERVE_URL
    ? REMOTION_SERVE_URL
    : await bundle({
      entryPoint: path.resolve("remotion/index.ts"),
      onProgress(progress) {
        console.info(`Bundling Remotion: ${progress}%`);
      },
    });

  const app = setupApp({ remotionBundleUrl });

  app.listen(PORT, () => {
    console.info(`REMOTION PRO SERVICE ACTIVE ON PORT ${PORT}`);
    console.info(`Use POST /render to create cinematic videos`);
  });
}

main();
