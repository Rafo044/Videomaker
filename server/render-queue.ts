import {
  makeCancelSignal,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { CineVideoProps } from "../remotion/schema";

interface JobData extends CineVideoProps { }

type JobState =
  | {
    status: "queued";
    data: JobData;
    cancel: () => void;
  }
  | {
    status: "in-progress";
    progress: number;
    data: JobData;
    cancel: () => void;
  }
  | {
    status: "completed";
    videoUrl: string;
    data: JobData;
  }
  | {
    status: "failed";
    error: string;
    data: JobData;
  };

const compositionId = "CineVideo";

export const makeRenderQueue = ({
  port,
  serveUrl,
  rendersDir,
}: {
  port: number;
  serveUrl: string;
  rendersDir: string;
}) => {
  const jobs = new Map<string, JobState>();
  let queue: Promise<unknown> = Promise.resolve();

  // Create renders directory if it doesn't exist
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  const processRender = async (jobId: string) => {
    const job = jobs.get(jobId);
    if (!job) {
      throw new Error(`Render job ${jobId} not found`);
    }

    const { cancel, cancelSignal } = makeCancelSignal();

    jobs.set(jobId, {
      progress: 0,
      status: "in-progress",
      cancel: cancel,
      data: job.data,
    });

    try {
      const inputProps = job.data;

      const chromiumOptions = {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-zygote",
          "--disable-web-security",
          "--allow-file-access-from-files",
        ],
      };

      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
        chromiumOptions,
      });

      await renderMedia({
        cancelSignal,
        serveUrl,
        composition,
        inputProps,
        codec: "h264",
        chromiumOptions,
        concurrency: 1,
        onProgress: (progress) => {
          const p = typeof progress === "number" ? progress : progress.progress;
          console.info(`${jobId} render progress:`, (p * 100).toFixed(1) + "%");
          jobs.set(jobId, {
            progress: p,
            status: "in-progress",
            cancel: cancel,
            data: job.data,
          });
        },
        outputLocation: path.join(rendersDir, `${jobId}.mp4`),
      });

      jobs.set(jobId, {
        status: "completed",
        videoUrl: `http://localhost:${port}/renders/${jobId}.mp4`,
        data: job.data,
      });

      console.info(`Render job ${jobId} completed`);
    } catch (error) {
      console.error(`Render job ${jobId} failed:`, error);
      jobs.set(jobId, {
        status: "failed",
        error: (error as Error).message,
        data: job.data,
      });
    }
  };

  const queueRender = async ({
    jobId,
    data,
  }: {
    jobId: string;
    data: JobData;
  }) => {
    jobs.set(jobId, {
      status: "queued",
      data,
      cancel: () => {
        jobs.delete(jobId);
      },
    });

    queue = queue.then(() => processRender(jobId));
  };

  function createJob(data: JobData) {
    const jobId = randomUUID();
    queueRender({ jobId, data });
    return jobId;
  }

  return {
    createJob,
    jobs,
  };
};
