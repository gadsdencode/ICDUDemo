import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

const PRESETS = ["balanced", "fast", "quality", "low_memory"] as const;
type Preset = (typeof PRESETS)[number];
const TRAINING_PHASES = [
  "exporting_data",
  "building_config",
  "validating_config",
  "training",
  "complete",
  "failed",
] as const;
type TrainingPhase = (typeof TRAINING_PHASES)[number];
const MAX_PREVIEW_ROWS = 5;
const IDEAL_RESPONSE_PREVIEW_MAX_LENGTH = 120;
const REQUIRED_FIELDS = [
  "application_prompt",
  "persona_archetype",
  "user_intent",
  "capability_layer",
  "governing_principle",
  "ideal_response_final",
] as const;

type PreflightSummary = {
  jobId: string;
  configPath: string;
  trainSftPath: string;
  validationSftPath: string;
  datasetReportPath: string;
  warnings: string[];
};

type JobStatusSummary = {
  status: string;
  phase: string;
  message: string;
  lastUpdatedIso: string;
};

type PreviewRow = {
  lineNumber: number;
  applicationPrompt: string;
  personaArchetype: string;
  userIntent: string;
  capabilityLayer: string;
  governingPrinciple: string;
  idealResponseFinalPreview: string;
};

type MissingFieldHint = {
  lineNumber: number;
  missingFields: string[];
};

type InvalidLineHint = {
  lineNumber: number;
  reason: string;
};

type FilePreview = {
  fileName: string;
  inspectedRows: number;
  rows: PreviewRow[];
  missingFieldHints: MissingFieldHint[];
  invalidLineHints: InvalidLineHint[];
  cotMetadataLines: number[];
};

type DistributionEntry = {
  label: string;
  count: number;
};

type DatasetReportSummary = {
  trainRowCount: number | null;
  validationRowCount: number | null;
  duplicatePromptWarnings: string[];
  trainValidationOverlapWarning: string;
  personaDistributionTop5: DistributionEntry[];
  capabilityLayerDistribution: DistributionEntry[];
  governingPrincipleDistribution: DistributionEntry[];
  warnings: string[];
};

function defaultJobId() {
  return `job_${Date.now()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readUnknownField(
  source: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    if (key in source && source[key] !== undefined) {
      return source[key];
    }

    const pathSegments = key.split(".");
    let current: unknown = source;
    let found = true;

    for (const segment of pathSegments) {
      if (!isRecord(current) || !(segment in current)) {
        found = false;
        break;
      }
      current = current[segment];
    }

    if (found && current !== undefined) {
      return current;
    }
  }

  return undefined;
}

function readStringField(
  source: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = readUnknownField(source, [key]);
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function readNumberField(
  source: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = readUnknownField(source, [key]);
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readWarnings(value: unknown): string[] {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? [normalized] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter(Boolean)),
  );
}

function parseDistribution(
  value: unknown,
  options?: { limit?: number },
): DistributionEntry[] {
  const entries: DistributionEntry[] = [];

  if (isRecord(value)) {
    for (const [key, rawCount] of Object.entries(value)) {
      const count =
        typeof rawCount === "number"
          ? rawCount
          : typeof rawCount === "string"
            ? Number(rawCount)
            : NaN;
      if (Number.isFinite(count)) {
        entries.push({ label: key, count });
      }
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (Array.isArray(item) && item.length >= 2) {
        const label = toDisplayString(item[0]).trim();
        const parsedCount = Number(item[1]);
        if (label && Number.isFinite(parsedCount)) {
          entries.push({ label, count: parsedCount });
        }
        continue;
      }

      if (!isRecord(item)) {
        continue;
      }

      const label = readStringField(item, [
        "label",
        "name",
        "key",
        "value",
        "persona",
        "persona_archetype",
        "capability_layer",
        "governing_principle",
      ]);

      const count = readNumberField(item, [
        "count",
        "rows",
        "row_count",
        "frequency",
        "total",
      ]);

      if (label && count !== null) {
        entries.push({ label, count });
      }
    }
  }

  entries.sort((a, b) => b.count - a.count);
  return options?.limit ? entries.slice(0, options.limit) : entries;
}

function isHighOverlapWarning(value: string): boolean {
  const normalized = value.toLowerCase();
  const mentionsOverlap = normalized.includes("overlap");
  const marksSeverity =
    normalized.includes("high") ||
    normalized.includes("severe") ||
    normalized.includes("excessive");
  return mentionsOverlap && marksSeverity;
}

function isEmptyDatasetWarning(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("empty dataset") ||
    normalized.includes("no rows") ||
    normalized.includes("0 rows")
  );
}

function isFatalDatasetWarning(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    isHighOverlapWarning(value) ||
    isEmptyDatasetWarning(value) ||
    normalized.includes("fatal") ||
    normalized.includes("cannot train") ||
    normalized.includes("blocking")
  );
}

function normalizeTrainingPhase(status: string, phase: string): TrainingPhase | null {
  const normalizedStatus = status.trim().toLowerCase();
  const normalizedPhase = phase.trim().toLowerCase();

  if (normalizedStatus === "failed" || normalizedPhase === "failed") {
    return "failed";
  }
  if (normalizedStatus === "complete" || normalizedPhase === "complete") {
    return "complete";
  }

  const phaseMatch = TRAINING_PHASES.find((item) => item === normalizedPhase);
  return phaseMatch ?? null;
}

function parseDatasetReport(
  rawBody: Record<string, unknown>,
): DatasetReportSummary {
  const wrappedReport = readUnknownField(rawBody, ["report", "dataset_report"]);
  const source = isRecord(wrappedReport) ? wrappedReport : rawBody;

  const trainRowCount = readNumberField(source, [
    "train_row_count",
    "train_rows",
    "row_counts.train",
    "row_counts.train_rows",
    "counts.train",
    "counts.train_rows",
  ]);

  const validationRowCount = readNumberField(source, [
    "validation_row_count",
    "validation_rows",
    "row_counts.validation",
    "row_counts.validation_rows",
    "counts.validation",
    "counts.validation_rows",
  ]);

  const duplicatePromptWarnings = readWarnings(
    readUnknownField(source, [
      "duplicate_prompt_warnings",
      "duplicate_prompts_warnings",
      "duplicate_warnings",
    ]),
  );

  const duplicatePromptCount = readNumberField(source, [
    "duplicate_prompt_count",
    "duplicate_prompts_count",
    "duplicate_count",
  ]);

  if (duplicatePromptWarnings.length === 0 && (duplicatePromptCount ?? 0) > 0) {
    duplicatePromptWarnings.push(
      `${duplicatePromptCount} duplicate prompt(s) detected.`,
    );
  }

  const trainValidationOverlapWarning = readStringField(source, [
    "train_validation_overlap_warning",
    "validation_overlap_warning",
    "overlap_warning",
    "train_validation.overlap_warning",
  ]);

  const warnings = uniqueStrings(
    readWarnings(
      readUnknownField(source, [
        "warnings",
        "warning_messages",
        "alerts",
        "summary.warnings",
      ]),
    ),
  );

  const personaDistributionTop5 = parseDistribution(
    readUnknownField(source, [
      "persona_distribution",
      "persona_archetype_distribution",
      "distributions.persona",
      "distributions.persona_archetype",
    ]),
    { limit: 5 },
  );

  const capabilityLayerDistribution = parseDistribution(
    readUnknownField(source, [
      "capability_layer_distribution",
      "distributions.capability_layer",
      "capability_distribution",
    ]),
  );

  const governingPrincipleDistribution = parseDistribution(
    readUnknownField(source, [
      "governing_principle_distribution",
      "distributions.governing_principle",
      "principle_distribution",
    ]),
  );

  return {
    trainRowCount,
    validationRowCount,
    duplicatePromptWarnings,
    trainValidationOverlapWarning,
    personaDistributionTop5,
    capabilityLayerDistribution,
    governingPrincipleDistribution,
    warnings,
  };
}

function toDisplayString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[unserializable]";
    }
  }
  return String(value);
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
}

async function parseJsonlPreview(file: File): Promise<FilePreview> {
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const rows: PreviewRow[] = [];
  const missingFieldHints: MissingFieldHint[] = [];
  const invalidLineHints: InvalidLineHint[] = [];
  const cotMetadataLines: number[] = [];
  let inspectedRows = 0;

  for (let index = 0; index < lines.length && inspectedRows < MAX_PREVIEW_ROWS; index += 1) {
    const rawLine = lines[index].trim();
    if (!rawLine) {
      continue;
    }

    inspectedRows += 1;
    const lineNumber = index + 1;

    try {
      const parsed = JSON.parse(rawLine) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Line is not a JSON object");
      }

      const record = parsed as Record<string, unknown>;
      const applicationPrompt = toDisplayString(record.application_prompt);
      const personaArchetype = toDisplayString(record.persona_archetype);
      const userIntent = toDisplayString(record.user_intent);
      const capabilityLayer = toDisplayString(record.capability_layer);
      const governingPrinciple = toDisplayString(record.governing_principle);
      const idealResponseFinal = toDisplayString(record.ideal_response_final);
      const idealResponseCot = toDisplayString(record.ideal_response_cot);

      const missingFields = REQUIRED_FIELDS.filter((fieldName) => {
        const value = toDisplayString(record[fieldName]);
        return value.trim().length === 0;
      });

      if (missingFields.length > 0) {
        missingFieldHints.push({ lineNumber, missingFields: [...missingFields] });
      }

      if (idealResponseCot.trim().length > 0) {
        cotMetadataLines.push(lineNumber);
      }

      rows.push({
        lineNumber,
        applicationPrompt,
        personaArchetype,
        userIntent,
        capabilityLayer,
        governingPrinciple,
        idealResponseFinalPreview: truncateText(
          idealResponseFinal,
          IDEAL_RESPONSE_PREVIEW_MAX_LENGTH,
        ),
      });
    } catch (error) {
      invalidLineHints.push({
        lineNumber,
        reason: error instanceof Error ? error.message : "Invalid JSON line",
      });
    }
  }

  return {
    fileName: file.name,
    inspectedRows,
    rows,
    missingFieldHints,
    invalidLineHints,
    cotMetadataLines,
  };
}

export default function FineTune() {
  useSEO({
    title: "Fine-Tuning Developer Page | ICDU",
    description:
      "Minimal ICDU training API integration for running preflight uploads and polling job status.",
  });

  useEffect(() => {
    trackPageViewed("fine_tune");
  }, []);

  const apiBaseUrl = useMemo(
    () =>
      (import.meta.env.VITE_ICDU_API_BASE_URL ?? "http://localhost:8000")
        .trim()
        .replace(/\/+$/, ""),
    [],
  );

  const [jobId, setJobId] = useState(defaultJobId);
  const [modelName, setModelName] = useState("Qwen/Qwen3-4B-Instruct-2507");
  const [preset, setPreset] = useState<Preset>("balanced");
  const [enableAdaptive, setEnableAdaptive] = useState(false);
  const [trainFile, setTrainFile] = useState<File | null>(null);
  const [validationFile, setValidationFile] = useState<File | null>(null);

  const [preflightError, setPreflightError] = useState("");
  const [isRunningPreflight, setIsRunningPreflight] = useState(false);
  const [preflightSummary, setPreflightSummary] =
    useState<PreflightSummary | null>(null);

  const [pollingJobId, setPollingJobId] = useState("");
  const [statusError, setStatusError] = useState("");
  const [jobStatus, setJobStatus] = useState<JobStatusSummary | null>(null);
  const [jobStatusRaw, setJobStatusRaw] = useState<Record<string, unknown> | null>(
    null,
  );
  const [trainPreview, setTrainPreview] = useState<FilePreview | null>(null);
  const [validationPreview, setValidationPreview] = useState<FilePreview | null>(
    null,
  );
  const [isParsingTrainPreview, setIsParsingTrainPreview] = useState(false);
  const [isParsingValidationPreview, setIsParsingValidationPreview] =
    useState(false);
  const [trainPreviewError, setTrainPreviewError] = useState("");
  const [validationPreviewError, setValidationPreviewError] = useState("");
  const [datasetReport, setDatasetReport] = useState<DatasetReportSummary | null>(
    null,
  );
  const [isLoadingDatasetReport, setIsLoadingDatasetReport] = useState(false);
  const [datasetReportError, setDatasetReportError] = useState("");
  const [isStartingTraining, setIsStartingTraining] = useState(false);
  const [startTrainingError, setStartTrainingError] = useState("");
  const [startTrainingNotice, setStartTrainingNotice] = useState("");
  const [hasAcknowledgedTrainingImpact, setHasAcknowledgedTrainingImpact] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!trainFile) {
      setTrainPreview(null);
      setTrainPreviewError("");
      setIsParsingTrainPreview(false);
      return;
    }

    setIsParsingTrainPreview(true);
    setTrainPreviewError("");
    setTrainPreview(null);

    void parseJsonlPreview(trainFile)
      .then((preview) => {
        if (!cancelled) {
          setTrainPreview(preview);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setTrainPreviewError(
            error instanceof Error ? error.message : "Failed to parse file preview",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsParsingTrainPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trainFile]);

  useEffect(() => {
    let cancelled = false;

    if (!validationFile) {
      setValidationPreview(null);
      setValidationPreviewError("");
      setIsParsingValidationPreview(false);
      return;
    }

    setIsParsingValidationPreview(true);
    setValidationPreviewError("");
    setValidationPreview(null);

    void parseJsonlPreview(validationFile)
      .then((preview) => {
        if (!cancelled) {
          setValidationPreview(preview);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setValidationPreviewError(
            error instanceof Error ? error.message : "Failed to parse file preview",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsParsingValidationPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [validationFile]);

  useEffect(() => {
    if (!pollingJobId) {
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/training-jobs/${encodeURIComponent(pollingJobId)}`,
        );

        if (!response.ok) {
          const text = (await response.text()) || response.statusText;
          throw new Error(`${response.status}: ${text}`);
        }

        const body = (await response.json()) as Record<string, unknown>;
        const status = readStringField(body, ["status"]) || "unknown";
        const phase = readStringField(body, ["phase"]) || "unknown";
        const message = readStringField(body, ["message", "detail"]) || "-";

        if (!cancelled) {
          setStatusError("");
          setJobStatusRaw(body);
          setJobStatus({
            status,
            phase,
            message,
            lastUpdatedIso: new Date().toISOString(),
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Status polling failed";

        if (!cancelled) {
          setStatusError(message);
        }
      }
    };

    void fetchStatus();
    const intervalId = window.setInterval(fetchStatus, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [apiBaseUrl, pollingJobId]);

  useEffect(() => {
    const nextJobId = preflightSummary?.jobId;
    if (!nextJobId) {
      setDatasetReport(null);
      setDatasetReportError("");
      setIsLoadingDatasetReport(false);
      return;
    }

    let cancelled = false;
    setDatasetReport(null);
    setDatasetReportError("");
    setIsLoadingDatasetReport(true);

    const fetchDatasetReport = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/training-jobs/${encodeURIComponent(
            nextJobId,
          )}/dataset-report`,
        );
        if (!response.ok) {
          const text = (await response.text()) || response.statusText;
          throw new Error(`${response.status}: ${text}`);
        }

        const body = await response.json();
        if (!isRecord(body)) {
          throw new Error("Dataset report payload is not a JSON object.");
        }

        if (!cancelled) {
          setDatasetReport(parseDatasetReport(body));
        }
      } catch (error) {
        if (!cancelled) {
          setDatasetReportError(
            error instanceof Error
              ? error.message
              : "Failed to fetch dataset report",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDatasetReport(false);
        }
      }
    };

    void fetchDatasetReport();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, preflightSummary?.jobId]);

  const reportWarnings = useMemo(() => {
    if (!datasetReport) {
      return [];
    }

    return uniqueStrings([
      ...datasetReport.warnings,
      ...datasetReport.duplicatePromptWarnings,
      datasetReport.trainValidationOverlapWarning,
    ]);
  }, [datasetReport]);

  const fatalDatasetWarnings = useMemo(
    () => reportWarnings.filter((warning) => isFatalDatasetWarning(warning)),
    [reportWarnings],
  );
  const nonFatalDatasetWarnings = useMemo(
    () =>
      reportWarnings.filter((warning) => !isFatalDatasetWarning(warning)),
    [reportWarnings],
  );

  const startTrainingBlockers = useMemo(() => {
    const blockers: string[] = [];

    if (!preflightSummary) {
      blockers.push("Run preflight first.");
      return blockers;
    }

    if (isLoadingDatasetReport) {
      blockers.push("Dataset report is still loading.");
      return blockers;
    }

    if (datasetReportError) {
      blockers.push("Dataset report failed to load.");
      return blockers;
    }

    if (!datasetReport) {
      blockers.push("Dataset report is unavailable.");
      return blockers;
    }

    if ((datasetReport.trainRowCount ?? 0) <= 0) {
      blockers.push("Train dataset is empty.");
    }

    if ((datasetReport.validationRowCount ?? 0) <= 0) {
      blockers.push("Validation dataset is empty.");
    }

    if (fatalDatasetWarnings.length > 0) {
      blockers.push(
        ...fatalDatasetWarnings.map((warning) => `Fatal dataset warning: ${warning}`),
      );
    }

    if (!hasAcknowledgedTrainingImpact) {
      blockers.push("Acknowledge local training resource impact.");
    }

    return uniqueStrings(blockers);
  }, [
    preflightSummary,
    isLoadingDatasetReport,
    datasetReportError,
    datasetReport,
    fatalDatasetWarnings,
    hasAcknowledgedTrainingImpact,
  ]);

  const canStartTraining = startTrainingBlockers.length === 0;
  const activePhase = useMemo(
    () => normalizeTrainingPhase(jobStatus?.status ?? "", jobStatus?.phase ?? ""),
    [jobStatus?.status, jobStatus?.phase],
  );
  const activePhaseIndex = activePhase
    ? TRAINING_PHASES.indexOf(activePhase)
    : -1;

  async function runPreflight() {
    if (!trainFile || !validationFile) {
      setPreflightError("Both training and validation JSONL files are required.");
      return;
    }

    setIsRunningPreflight(true);
    setPreflightError("");
    setStatusError("");
    setPreflightSummary(null);
    setDatasetReport(null);
    setDatasetReportError("");
    setStartTrainingError("");
    setStartTrainingNotice("");

    try {
      const nextJobId = jobId.trim() || defaultJobId();
      const nextModelName = modelName.trim();
      if (!nextModelName) {
        throw new Error("Model name is required.");
      }

      const formData = new FormData();
      formData.append("job_id", nextJobId);
      formData.append("model_name", nextModelName);
      formData.append("preset", preset);
      formData.append("enable_adaptive", String(enableAdaptive));
      formData.append("train_file", trainFile);
      formData.append("validation_file", validationFile);

      const response = await fetch(`${apiBaseUrl}/training-jobs/preflight-upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = (await response.text()) || response.statusText;
        throw new Error(`${response.status}: ${text}`);
      }

      const body = (await response.json()) as Record<string, unknown>;
      const returnedJobId = readStringField(body, ["job_id"]) || nextJobId;

      setJobId(returnedJobId);
      setPreflightSummary({
        jobId: returnedJobId,
        configPath: readStringField(body, ["config_path", "config"]),
        trainSftPath: readStringField(body, ["train_sft_path", "train_sft"]),
        validationSftPath: readStringField(body, [
          "validation_sft_path",
          "validation_sft",
        ]),
        datasetReportPath: readStringField(body, [
          "dataset_report_path",
          "dataset_report",
        ]),
        warnings: readWarnings(body.warnings),
      });
      setPollingJobId(returnedJobId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Preflight request failed";
      setPreflightError(message);
    } finally {
      setIsRunningPreflight(false);
    }
  }

  async function startTraining() {
    if (!preflightSummary || !canStartTraining) {
      return;
    }

    const nextJobId = preflightSummary.jobId || jobId.trim();
    const nextModelName = modelName.trim();
    if (!nextJobId || !nextModelName) {
      setStartTrainingError("Job ID and model name are required to start training.");
      return;
    }

    setIsStartingTraining(true);
    setStartTrainingError("");
    setStartTrainingNotice("");

    const jsonPayload = {
      job_id: nextJobId,
      model_name: nextModelName,
      preset,
      enable_adaptive: enableAdaptive,
      run_training: true,
    };

    try {
      let response = await fetch(`${apiBaseUrl}/training-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      });

      if (!response.ok) {
        const fallbackFormData = new FormData();
        fallbackFormData.append("job_id", nextJobId);
        fallbackFormData.append("model_name", nextModelName);
        fallbackFormData.append("preset", preset);
        fallbackFormData.append("enable_adaptive", String(enableAdaptive));
        fallbackFormData.append("run_training", "true");
        if (trainFile) {
          fallbackFormData.append("train_file", trainFile);
        }
        if (validationFile) {
          fallbackFormData.append("validation_file", validationFile);
        }

        const fallbackResponse = await fetch(`${apiBaseUrl}/training-jobs/upload`, {
          method: "POST",
          body: fallbackFormData,
        });

        if (fallbackResponse.ok) {
          response = fallbackResponse;
        } else {
          const primaryError =
            (await response.text()) || `${response.status} ${response.statusText}`;
          const fallbackError =
            (await fallbackResponse.text()) ||
            `${fallbackResponse.status} ${fallbackResponse.statusText}`;
          throw new Error(
            `Start training failed. /training-jobs: ${primaryError}. /training-jobs/upload: ${fallbackError}`,
          );
        }
      }

      let body: Record<string, unknown> = {};
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const parsed = await response.json();
        if (isRecord(parsed)) {
          body = parsed;
        }
      }

      const returnedJobId =
        readStringField(body, ["job_id", "id", "training_job_id"]) || nextJobId;
      const status = readStringField(body, ["status"]) || "submitted";
      const phase = readStringField(body, ["phase"]) || "exporting_data";
      const message =
        readStringField(body, ["message", "detail"]) ||
        "Training start request submitted.";

      setJobId(returnedJobId);
      setPollingJobId(returnedJobId);
      setJobStatusRaw(body);
      setJobStatus({
        status,
        phase,
        message,
        lastUpdatedIso: new Date().toISOString(),
      });
      setStartTrainingNotice(
        "Training start request submitted. Local training may take a long time depending on your hardware.",
      );
    } catch (error) {
      setStartTrainingError(
        error instanceof Error ? error.message : "Failed to start training",
      );
    } finally {
      setIsStartingTraining(false);
    }
  }

  function renderPreviewSection({
    title,
    preview,
    isParsing,
    error,
  }: {
    title: string;
    preview: FilePreview | null;
    isParsing: boolean;
    error: string;
  }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title} Preview</CardTitle>
          <CardDescription>
            First {MAX_PREVIEW_ROWS} non-empty rows parsed locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isParsing && (
            <div className="text-sm text-muted-foreground">Parsing preview...</div>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}

          {!isParsing && !error && !preview && (
            <div className="text-sm text-muted-foreground">
              Select a JSONL file to preview structured fields.
            </div>
          )}

          {preview && (
            <>
              <div className="text-xs text-muted-foreground">
                File: <span className="font-mono">{preview.fileName}</span> • inspected{" "}
                {preview.inspectedRows} row(s)
              </div>

              {preview.invalidLineHints.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Invalid JSON lines</div>
                  <ul className="list-disc ml-5 mt-1 space-y-1 text-muted-foreground">
                    {preview.invalidLineHints.map((hint) => (
                      <li key={`${preview.fileName}-invalid-${hint.lineNumber}`}>
                        line {hint.lineNumber}: {hint.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.missingFieldHints.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Missing required fields</div>
                  <ul className="list-disc ml-5 mt-1 space-y-1 text-muted-foreground">
                    {preview.missingFieldHints.map((hint) => (
                      <li key={`${preview.fileName}-missing-${hint.lineNumber}`}>
                        line {hint.lineNumber}: {hint.missingFields.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.cotMetadataLines.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Metadata note:
                  </span>{" "}
                  <span className="font-mono">ideal_response_cot</span> exists on line(s){" "}
                  {preview.cotMetadataLines.join(", ")} and is treated as metadata,
                  not a visible training target.
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>application_prompt</TableHead>
                    <TableHead>persona_archetype</TableHead>
                    <TableHead>user_intent</TableHead>
                    <TableHead>capability_layer</TableHead>
                    <TableHead>governing_principle</TableHead>
                    <TableHead>ideal_response_final preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.length > 0 ? (
                    preview.rows.map((row) => (
                      <TableRow key={`${preview.fileName}-row-${row.lineNumber}`}>
                        <TableCell className="max-w-[220px] break-words">
                          {row.applicationPrompt || "-"}
                        </TableCell>
                        <TableCell className="max-w-[180px] break-words">
                          {row.personaArchetype || "-"}
                        </TableCell>
                        <TableCell className="max-w-[180px] break-words">
                          {row.userIntent || "-"}
                        </TableCell>
                        <TableCell className="max-w-[180px] break-words">
                          {row.capabilityLayer || "-"}
                        </TableCell>
                        <TableCell className="max-w-[180px] break-words">
                          {row.governingPrinciple || "-"}
                        </TableCell>
                        <TableCell className="max-w-[280px] break-words">
                          {row.idealResponseFinalPreview || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No valid JSON objects found in sampled rows.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderDistributionSection(
    title: string,
    rows: DistributionEntry[],
    emptyMessage: string,
  ) {
    return (
      <div className="rounded-md border p-3">
        <div className="font-medium mb-2">{title}</div>
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${title}-${row.label}`}>
                  <TableCell className="break-words">{row.label}</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container px-4 mx-auto max-w-4xl space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">
            Developer
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold">Start Fine-Tuning</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Minimal local integration for the ICDU training API.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            API base URL: <span className="font-mono">{apiBaseUrl}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Training Job Inputs</CardTitle>
            <CardDescription>
              Upload ICDU JSONL files and run preflight before launching training.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job-id">Job ID</Label>
                <Input
                  id="job-id"
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="job_1714711200000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={modelName}
                  onChange={(event) => setModelName(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preset">Preset</Label>
                <Select
                  value={preset}
                  onValueChange={(value) => setPreset(value as Preset)}
                >
                  <SelectTrigger id="preset">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((presetOption) => (
                      <SelectItem key={presetOption} value={presetOption}>
                        {presetOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label
                  htmlFor="enable-adaptive"
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    id="enable-adaptive"
                    checked={enableAdaptive}
                    onCheckedChange={(checked) =>
                      setEnableAdaptive(checked === true)
                    }
                  />
                  Enable adaptive/PDE
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="train-file">Train ICDU JSONL</Label>
                <Input
                  id="train-file"
                  type="file"
                  accept=".jsonl,application/json,text/plain"
                  onChange={(event) =>
                    setTrainFile(event.target.files?.[0] ?? null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validation-file">Validation ICDU JSONL</Label>
                <Input
                  id="validation-file"
                  type="file"
                  accept=".jsonl,application/json,text/plain"
                  onChange={(event) =>
                    setValidationFile(event.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => void runPreflight()}
                disabled={isRunningPreflight || isStartingTraining}
              >
                {isRunningPreflight ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Preflight...
                  </>
                ) : (
                  "Run Preflight"
                )}
              </Button>
              <Button
                variant="destructive"
                disabled={!canStartTraining || isStartingTraining}
                onClick={() => void startTraining()}
                title={
                  canStartTraining
                    ? "Ready for advanced training action"
                    : "Blocked by dataset safety checks"
                }
              >
                {isStartingTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting Training...
                  </>
                ) : (
                  "Start Training"
                )}
              </Button>
            </div>
            <label
              htmlFor="confirm-training-impact"
              className="flex items-start gap-2 text-sm"
            >
              <Checkbox
                id="confirm-training-impact"
                checked={hasAcknowledgedTrainingImpact}
                onCheckedChange={(checked) =>
                  setHasAcknowledgedTrainingImpact(checked === true)
                }
              />
              <span>
                I understand this will start a local training job and may use
                significant GPU/CPU resources.
              </span>
            </label>
            <p className="text-xs text-muted-foreground">
              Files stay local in the browser until you click{" "}
              <span className="font-medium">Run Preflight</span>.
            </p>
            <p className="text-xs text-muted-foreground">
              Local training can take a long time and runtime depends on your
              model choice and hardware.
            </p>
            {startTrainingBlockers.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Start Training Blocked</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    {startTrainingBlockers.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {startTrainingError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Start Training Error</AlertTitle>
                <AlertDescription>{startTrainingError}</AlertDescription>
              </Alert>
            )}
            {startTrainingNotice && (
              <Alert>
                <AlertTitle>Start Training</AlertTitle>
                <AlertDescription>{startTrainingNotice}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {renderPreviewSection({
          title: "Train JSONL",
          preview: trainPreview,
          isParsing: isParsingTrainPreview,
          error: trainPreviewError,
        })}

        {renderPreviewSection({
          title: "Validation JSONL",
          preview: validationPreview,
          isParsing: isParsingValidationPreview,
          error: validationPreviewError,
        })}

        {preflightError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Preflight Failed</AlertTitle>
            <AlertDescription>{preflightError}</AlertDescription>
          </Alert>
        )}

        {preflightSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Preflight Summary</CardTitle>
              <CardDescription>
                Returned by <span className="font-mono">/training-jobs/preflight-upload</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">job_id:</span>{" "}
                <span className="font-mono break-all">{preflightSummary.jobId || "-"}</span>
              </div>
              <div>
                <span className="font-medium">config path:</span>{" "}
                <span className="font-mono break-all">
                  {preflightSummary.configPath || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium">train_sft path:</span>{" "}
                <span className="font-mono break-all">
                  {preflightSummary.trainSftPath || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium">validation_sft path:</span>{" "}
                <span className="font-mono break-all">
                  {preflightSummary.validationSftPath || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium">dataset report path:</span>{" "}
                <span className="font-mono break-all">
                  {preflightSummary.datasetReportPath || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium">warnings:</span>
                {preflightSummary.warnings.length > 0 ? (
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    {preflightSummary.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-muted-foreground">none</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {preflightSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Backend Dataset Report</CardTitle>
              <CardDescription>
                Loaded from{" "}
                <span className="font-mono">
                  /training-jobs/{preflightSummary.jobId}/dataset-report
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {isLoadingDatasetReport && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading dataset report...
                </div>
              )}

              {datasetReportError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Dataset Report Error</AlertTitle>
                  <AlertDescription>{datasetReportError}</AlertDescription>
                </Alert>
              )}

              {datasetReport && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">
                        Train row count
                      </div>
                      <div className="text-xl font-semibold">
                        {datasetReport.trainRowCount ?? "-"}
                      </div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">
                        Validation row count
                      </div>
                      <div className="text-xl font-semibold">
                        {datasetReport.validationRowCount ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">
                      Duplicate prompt warnings
                    </div>
                    {datasetReport.duplicatePromptWarnings.length > 0 ? (
                      <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                        {datasetReport.duplicatePromptWarnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted-foreground">none</div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium mb-1">
                      Train/validation overlap warning
                    </div>
                    <div className="text-muted-foreground">
                      {datasetReport.trainValidationOverlapWarning || "none"}
                    </div>
                  </div>

                  {fatalDatasetWarnings.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Fatal Warnings (Training Blocked)</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          {fatalDatasetWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {nonFatalDatasetWarnings.length > 0 && (
                    <Alert>
                      <AlertTitle>Dataset Warnings (Review Carefully)</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          {nonFatalDatasetWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-3 lg:grid-cols-3">
                    {renderDistributionSection(
                      "Persona distribution (top 5)",
                      datasetReport.personaDistributionTop5,
                      "No persona distribution data.",
                    )}
                    {renderDistributionSection(
                      "Capability layer distribution",
                      datasetReport.capabilityLayerDistribution,
                      "No capability layer distribution data.",
                    )}
                    {renderDistributionSection(
                      "Governing principle distribution",
                      datasetReport.governingPrincipleDistribution,
                      "No governing principle distribution data.",
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {pollingJobId && (
          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
              <CardDescription>
                Polling every 2s from{" "}
                <span className="font-mono">
                  /training-jobs/{pollingJobId}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div className="font-medium">Phases</div>
                <div className="flex flex-wrap gap-2">
                  {TRAINING_PHASES.map((phase) => {
                    let variant: "default" | "secondary" | "outline" | "destructive" =
                      "outline";

                    if (activePhase === "failed") {
                      variant = phase === "failed" ? "destructive" : "outline";
                    } else if (activePhase === phase) {
                      variant = "default";
                    } else if (activePhaseIndex >= 0) {
                      const phaseIndex = TRAINING_PHASES.indexOf(phase);
                      if (phaseIndex < activePhaseIndex) {
                        variant = "secondary";
                      }
                    }

                    return (
                      <Badge key={`phase-${phase}`} variant={variant}>
                        {phase}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="font-medium">status:</span>{" "}
                <span className="font-mono">{jobStatus?.status ?? "-"}</span>
              </div>
              <div>
                <span className="font-medium">phase:</span>{" "}
                <span className="font-mono">{jobStatus?.phase ?? "-"}</span>
              </div>
              <div>
                <span className="font-medium">message:</span>{" "}
                <span>{jobStatus?.message ?? "-"}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {jobStatus?.lastUpdatedIso ?? "-"}
              </div>
              <div>
                <div className="font-medium mb-1">Status JSON</div>
                <pre className="max-h-72 overflow-auto rounded-md border bg-muted/20 p-3 text-xs">
                  {jobStatusRaw
                    ? JSON.stringify(jobStatusRaw, null, 2)
                    : "{}"}
                </pre>
              </div>
              {statusError && (
                <div className="text-xs text-destructive">
                  Polling error: {statusError}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
