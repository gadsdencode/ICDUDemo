import { existsSync } from "node:fs";
import path from "node:path";

// npm scripts do not pass --env-file. Read the project .env before ICDU
// config. Variables already set in the process are left alone.
const envFile = path.resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

// CopilotKit reads this when the runtime loads. Leave an explicit
// "false" or "0" alone so telemetry can be turned on later.
if (
  process.env.COPILOTKIT_TELEMETRY_DISABLED == null ||
  process.env.COPILOTKIT_TELEMETRY_DISABLED.trim() === ""
) {
  process.env.COPILOTKIT_TELEMETRY_DISABLED = "true";
}
