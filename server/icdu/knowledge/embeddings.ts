import type { ModelConfig } from "../config.ts";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./corpus.ts";

export async function embedTexts(config: ModelConfig, texts: string[], fetchImpl = fetch,
  signal?: AbortSignal): Promise<number[][]> {
  const timeout = AbortSignal.timeout(50_000);
  const response = await fetchImpl(`${config.baseURL.replace(/\/$/, "")}/embeddings`, {
    method: "POST", signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    headers: {"Content-Type": "application/json", "X-ICDU-Site": "icdu", Authorization: `Bearer ${config.apiKey}`},
    body: JSON.stringify({model: EMBEDDING_MODEL, input: texts, encoding_format: "float"}),
  });
  if (!response.ok) throw new Error("Knowledge embeddings unavailable");
  const payload = await response.json();
  if (payload.model !== EMBEDDING_MODEL || !Array.isArray(payload.data) || payload.data.length !== texts.length)
    throw new Error("Invalid embedding response");
  return payload.data.map((item: {index: number; embedding: unknown}, index: number) => {
    const v = item.embedding;
    if (item.index !== index || !Array.isArray(v) || v.length !== EMBEDDING_DIMENSIONS ||
        !v.every(n => typeof n === "number" && Number.isFinite(n)) || !v.some(n => n !== 0))
      throw new Error("Invalid embedding vector");
    return v as number[];
  });
}
