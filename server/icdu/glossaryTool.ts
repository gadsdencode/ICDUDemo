import { tool, type Tool } from "ai";
import { z } from "zod";
import { glossaryTerms } from "../../client/src/data/examples.ts";
import { knowledgeEntries, normalize } from "./knowledge/corpus.ts";

const termSchema = z
  .object({
    term: z.string().trim().min(1).max(80),
  })
  .strict();

function findTerm(term: string): { term: string; definition: string } | null {
  const needle = normalize(term);
  const alias = knowledgeEntries.find(e => e.kind === "definition" &&
    [e.title, ...e.aliases].some(a => normalize(a) === needle));
  const match = glossaryTerms.find((entry) => normalize(entry.term) === needle || entry.term === alias?.title);
  if (!match) return null;
  return { term: match.term, definition: match.definition };
}

export const glossaryLookup = tool({
  description:
    "Look up one published ICDU glossary term. This is read-only and cannot change the site, accounts, or data.",
  inputSchema: termSchema,
  execute: async (input) => {
    const parsed = termSchema.safeParse(input);
    if (!parsed.success) return { found: false, error: "That term was not accepted." };
    const match = findTerm(parsed.data.term);
    if (!match) return { found: false, term: parsed.data.term };
    return { found: true, term: match.term, definition: match.definition };
  },
}) as Tool<unknown, unknown>;

export function lookupPublishedTerm(term: string): { found: boolean; term?: string; definition?: string } {
  const parsed = termSchema.safeParse({ term });
  if (!parsed.success) return { found: false };
  const match = findTerm(parsed.data.term);
  if (!match) return { found: false, term: parsed.data.term };
  return { found: true, term: match.term, definition: match.definition };
}
