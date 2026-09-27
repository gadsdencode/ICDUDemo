import { createHash } from "node:crypto";
import seed from "./seed.json";
import { siteSections } from "../../../shared/siteKnowledge.ts";

export const EMBEDDING_MODEL = "icdu-embed-v1";
export const EMBEDDING_DIMENSIONS = 768;
export type KnowledgeEntry = {
  id: string; title: string; body: string; aliases: string[];
  sourceUrl: string; sourceFile: string; kind: string; revision: string;
};

export const knowledgeEntries: KnowledgeEntry[] = [
  ...seed.entries.map(e => ({id: e.id, title: e.title, body: e.answer,
    aliases: e.aliases, sourceUrl: e.source_url, sourceFile: e.source_file,
    kind: e.kind, revision: e.source_commit})),
  ...siteSections.map(e => ({id: `site:${e.pageId}:${e.sectionId}`, title: e.heading,
    body: e.text, aliases: [], sourceUrl: e.href, sourceFile: e.source,
    kind: "published-page", revision: "site-registry-v1"})),
];

export function entryHash(e: KnowledgeEntry): string {
  return createHash("sha256").update(JSON.stringify(e)).digest("hex");
}

export function documentText(e: KnowledgeEntry): string {
  return `title: ${e.title} | text: ${e.aliases.join(", ")}. ${e.body}`;
}

export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function aliasMatches(query: string, entry: KnowledgeEntry): boolean {
  const normalized = ` ${normalize(query)} `;
  return [entry.title, ...entry.aliases].some(alias => {
    if (alias === "AS" && !/\bAS\b/.test(query) && !/application|score/i.test(query)) return false;
    return normalized.includes(` ${normalize(alias)} `);
  });
}
