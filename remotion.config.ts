import { Config } from "@remotion/cli/config";

// Video format və əsas parametrlər
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Timeout parametrləri (Remotion 4.0+ versiyası üçün)
Config.setDelayRenderTimeoutInMilliseconds(240000); // 4 dəqiqə
