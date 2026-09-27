// CopilotKit reads this when the runtime loads. Leave an explicit
// "false" or "0" alone so telemetry can be turned on later.
if (
  process.env.COPILOTKIT_TELEMETRY_DISABLED == null ||
  process.env.COPILOTKIT_TELEMETRY_DISABLED.trim() === ""
) {
  process.env.COPILOTKIT_TELEMETRY_DISABLED = "true";
}
