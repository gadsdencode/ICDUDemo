import { Pool, type PoolClient } from "pg";
import type { AiLimits } from "./limits.ts";
import { hourWindow, secondsUntil, TURN_TTL_MS } from "./limits.ts";

export type QuotaScope = "session" | "ip" | "session_runs" | "ip_runs";

export type QuotaDecision =
  | { ok: true; remaining: number }
  | { ok: false; scope: QuotaScope; retryAfterSeconds: number };

export type TurnDecision =
  | { ok: true; release: () => Promise<void> }
  | { ok: false; scope: "session" | "ip"; retryAfterSeconds: number };

export type ThreadAccess = "owned" | "foreign" | "absent";

export type ConsumeInput = {
  sessionId: string;
  ipHash: string;
  now: Date;
  chargeUserMessage: boolean;
  limits: AiLimits;
};

export interface AiStore {
  rememberSession(sessionId: string, expiresAt: Date): Promise<void>;
  userMessagesUsed(sessionId: string, now: Date): Promise<number>;
  consume(input: ConsumeInput): Promise<QuotaDecision>;
  beginTurn(input: {
    sessionId: string;
    ipHash: string;
    now: Date;
    limits: AiLimits;
  }): Promise<TurnDecision>;
  claimThread(threadId: string, sessionId: string): Promise<ThreadAccess>;
  threadAccess(threadId: string, sessionId: string): Promise<ThreadAccess>;
}

type Bucket = { count: number; expiresAt: number };
type Turn = { ipHash: string; expiresAt: number };
type MemoryState = {
  sessions: Map<string, number>;
  buckets: Map<string, Bucket>;
  turns: Map<string, Turn>;
  threads: Map<string, string>;
};

function bucketKey(kind: string, owner: string, hourId: string): string {
  return `${kind}:${owner}:${hourId}`;
}

export class MemoryAiStore implements AiStore {
  private chain: Promise<void> = Promise.resolve();
  private state: MemoryState = {
    sessions: new Map(),
    buckets: new Map(),
    turns: new Map(),
    threads: new Map(),
  };

  constructor(private readonly initial: MemoryState = {
    sessions: new Map(),
    buckets: new Map(),
    turns: new Map(),
    threads: new Map(),
  }) {
    this.state = initial;
  }

  private lock<T>(fn: () => T): Promise<T> {
    const run = this.chain.then(() => fn());
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async rememberSession(sessionId: string, expiresAt: Date): Promise<void> {
    await this.lock(() => {
      this.state.sessions.set(sessionId, expiresAt.getTime());
    });
  }

  async userMessagesUsed(sessionId: string, now: Date): Promise<number> {
    return this.lock(() => {
      const hour = hourWindow(now);
      return this.state.buckets.get(bucketKey("smsg", sessionId, hour.id))?.count ?? 0;
    });
  }

  async consume(input: ConsumeInput): Promise<QuotaDecision> {
    return this.lock(() => {
      const hour = hourWindow(input.now);
      const retryAfterSeconds = secondsUntil(hour.end, input.now);
      const checks: Array<{ key: string; limit: number; scope: QuotaScope; charge: boolean }> = [
        {
          key: bucketKey("srun", input.sessionId, hour.id),
          limit: input.limits.sessionRuns,
          scope: "session_runs",
          charge: true,
        },
        {
          key: bucketKey("irun", input.ipHash, hour.id),
          limit: input.limits.ipRuns,
          scope: "ip_runs",
          charge: true,
        },
      ];
      if (input.chargeUserMessage) {
        checks.unshift(
          {
            key: bucketKey("smsg", input.sessionId, hour.id),
            limit: input.limits.sessionMessages,
            scope: "session",
            charge: true,
          },
          {
            key: bucketKey("imsg", input.ipHash, hour.id),
            limit: input.limits.ipMessages,
            scope: "ip",
            charge: true,
          },
        );
      }
      for (const check of checks) {
        const current = this.state.buckets.get(check.key)?.count ?? 0;
        if (current >= check.limit) {
          return { ok: false, scope: check.scope, retryAfterSeconds };
        }
      }
      let sessionCount = 0;
      for (const check of checks) {
        const next = (this.state.buckets.get(check.key)?.count ?? 0) + 1;
        this.state.buckets.set(check.key, { count: next, expiresAt: hour.end.getTime() });
        if (check.key.startsWith("smsg:")) sessionCount = next;
      }
      const remaining = input.chargeUserMessage
        ? Math.max(0, input.limits.sessionMessages - sessionCount)
        : Math.max(
            0,
            input.limits.sessionMessages -
              (this.state.buckets.get(bucketKey("smsg", input.sessionId, hour.id))?.count ?? 0),
          );
      return { ok: true, remaining };
    });
  }

  async beginTurn(input: {
    sessionId: string;
    ipHash: string;
    now: Date;
    limits: AiLimits;
  }): Promise<TurnDecision> {
    return this.lock(() => {
      const nowMs = input.now.getTime();
      for (const [id, turn] of Array.from(this.state.turns.entries())) {
        if (turn.expiresAt <= nowMs) this.state.turns.delete(id);
      }
      const current = this.state.turns.get(input.sessionId);
      if (current && current.expiresAt > nowMs) {
        return { ok: false, scope: "session", retryAfterSeconds: 5 };
      }
      let others = 0;
      for (const [id, turn] of Array.from(this.state.turns.entries())) {
        if (id !== input.sessionId && turn.ipHash === input.ipHash && turn.expiresAt > nowMs) {
          others += 1;
        }
      }
      if (others >= input.limits.ipActive) {
        return { ok: false, scope: "ip", retryAfterSeconds: 15 };
      }
      this.state.turns.set(input.sessionId, {
        ipHash: input.ipHash,
        expiresAt: nowMs + TURN_TTL_MS,
      });
      return {
        ok: true,
        release: async () => {
          await this.lock(() => {
            this.state.turns.delete(input.sessionId);
          });
        },
      };
    });
  }

  async claimThread(threadId: string, sessionId: string): Promise<ThreadAccess> {
    return this.lock(() => {
      const owner = this.state.threads.get(threadId);
      if (!owner) {
        this.state.threads.set(threadId, sessionId);
        return "owned";
      }
      return owner === sessionId ? "owned" : "foreign";
    });
  }

  async threadAccess(threadId: string, sessionId: string): Promise<ThreadAccess> {
    return this.lock(() => {
      const owner = this.state.threads.get(threadId);
      if (!owner) return "absent";
      return owner === sessionId ? "owned" : "foreign";
    });
  }
}

async function withClient<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // The connection is already unusable.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function bump(
  client: PoolClient,
  key: string,
  start: Date,
  end: Date,
  limit: number,
): Promise<number | null> {
  const result = await client.query<{ message_count: number }>(
    `INSERT INTO ai_usage_buckets (bucket_key, message_count, bucket_start, expires_at)
     VALUES ($1, 1, $2, $3)
     ON CONFLICT (bucket_key) DO UPDATE
     SET message_count = ai_usage_buckets.message_count + 1
     WHERE ai_usage_buckets.message_count < $4
     RETURNING message_count`,
    [key, start.toISOString(), end.toISOString(), limit],
  );
  if (result.rowCount === 0) return null;
  return result.rows[0].message_count;
}

export class PostgresAiStore implements AiStore {
  constructor(private readonly pool: Pool) {}

  async rememberSession(sessionId: string, expiresAt: Date): Promise<void> {
    await this.pool.query(
      `INSERT INTO ai_visitor_sessions (id, expires_at)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET expires_at = excluded.expires_at`,
      [sessionId, expiresAt.toISOString()],
    );
  }

  async userMessagesUsed(sessionId: string, now: Date): Promise<number> {
    const hour = hourWindow(now);
    const result = await this.pool.query<{ message_count: number }>(
      `SELECT message_count FROM ai_usage_buckets WHERE bucket_key = $1`,
      [bucketKey("smsg", sessionId, hour.id)],
    );
    return result.rows[0]?.message_count ?? 0;
  }

  async consume(input: ConsumeInput): Promise<QuotaDecision> {
    const hour = hourWindow(input.now);
    const retryAfterSeconds = secondsUntil(hour.end, input.now);
    return withClient(this.pool, async (client) => {
      await client.query(`DELETE FROM ai_usage_buckets WHERE expires_at < $1`, [
        input.now.toISOString(),
      ]);
      const checks: Array<{ key: string; limit: number; scope: QuotaScope }> = [
        { key: bucketKey("srun", input.sessionId, hour.id), limit: input.limits.sessionRuns, scope: "session_runs" },
        { key: bucketKey("irun", input.ipHash, hour.id), limit: input.limits.ipRuns, scope: "ip_runs" },
      ];
      if (input.chargeUserMessage) {
        checks.unshift(
          { key: bucketKey("smsg", input.sessionId, hour.id), limit: input.limits.sessionMessages, scope: "session" },
          { key: bucketKey("imsg", input.ipHash, hour.id), limit: input.limits.ipMessages, scope: "ip" },
        );
      }
      let sessionCount = 0;
      for (const check of checks) {
        const count = await bump(client, check.key, hour.start, hour.end, check.limit);
        if (count == null) {
          throw Object.assign(new Error("quota"), {
            quota: { ok: false, scope: check.scope, retryAfterSeconds } satisfies QuotaDecision,
          });
        }
        if (check.scope === "session") sessionCount = count;
      }
      const used =
        sessionCount ||
        (
          await client.query<{ message_count: number }>(
            `SELECT message_count FROM ai_usage_buckets WHERE bucket_key = $1`,
            [bucketKey("smsg", input.sessionId, hour.id)],
          )
        ).rows[0]?.message_count ||
        0;
      return {
        ok: true,
        remaining: Math.max(0, input.limits.sessionMessages - used),
      } satisfies QuotaDecision;
    }).catch((error: unknown) => {
      if (error && typeof error === "object" && "quota" in error) {
        return (error as { quota: QuotaDecision }).quota;
      }
      throw error;
    });
  }

  async beginTurn(input: {
    sessionId: string;
    ipHash: string;
    now: Date;
    limits: AiLimits;
  }): Promise<TurnDecision> {
    const expires = new Date(input.now.getTime() + TURN_TTL_MS);
    return withClient(this.pool, async (client) => {
      await client.query(`DELETE FROM ai_active_turns WHERE expires_at <= $1`, [
        input.now.toISOString(),
      ]);
      const others = await client.query<{ n: number }>(
        `SELECT count(*)::int AS n FROM ai_active_turns
         WHERE ip_hash = $1 AND session_id <> $2 AND expires_at > $3`,
        [input.ipHash, input.sessionId, input.now.toISOString()],
      );
      if ((others.rows[0]?.n ?? 0) >= input.limits.ipActive) {
        throw Object.assign(new Error("turn"), {
          turn: { ok: false, scope: "ip", retryAfterSeconds: 15 } satisfies TurnDecision,
        });
      }
      const inserted = await client.query(
        `INSERT INTO ai_active_turns (session_id, ip_hash, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (session_id) DO UPDATE
         SET ip_hash = excluded.ip_hash, expires_at = excluded.expires_at
         WHERE ai_active_turns.expires_at <= $4
         RETURNING session_id`,
        [input.sessionId, input.ipHash, expires.toISOString(), input.now.toISOString()],
      );
      if (inserted.rowCount === 0) {
        throw Object.assign(new Error("turn"), {
          turn: { ok: false, scope: "session", retryAfterSeconds: 5 } satisfies TurnDecision,
        });
      }
      return {
        ok: true,
        release: async () => {
          await this.pool.query(`DELETE FROM ai_active_turns WHERE session_id = $1`, [
            input.sessionId,
          ]);
        },
      } satisfies TurnDecision;
    }).catch((error: unknown) => {
      if (error && typeof error === "object" && "turn" in error) {
        return (error as { turn: TurnDecision }).turn;
      }
      throw error;
    });
  }

  async claimThread(threadId: string, sessionId: string): Promise<ThreadAccess> {
    return withClient(this.pool, async (client) => {
      await client.query(
        `INSERT INTO ai_thread_owners (thread_id, session_id)
         VALUES ($1, $2)
         ON CONFLICT (thread_id) DO NOTHING`,
        [threadId, sessionId],
      );
      const owner = await client.query<{ session_id: string }>(
        `SELECT session_id FROM ai_thread_owners WHERE thread_id = $1`,
        [threadId],
      );
      const session = owner.rows[0]?.session_id;
      if (!session) return "absent";
      return session === sessionId ? "owned" : "foreign";
    });
  }

  async threadAccess(threadId: string, sessionId: string): Promise<ThreadAccess> {
    const owner = await this.pool.query<{ session_id: string }>(
      `SELECT session_id FROM ai_thread_owners WHERE thread_id = $1`,
      [threadId],
    );
    const session = owner.rows[0]?.session_id;
    if (!session) return "absent";
    return session === sessionId ? "owned" : "foreign";
  }
}

export async function ensureAiTables(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_visitor_sessions (
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_usage_buckets (
      bucket_key text PRIMARY KEY,
      message_count integer NOT NULL,
      bucket_start timestamptz NOT NULL,
      expires_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_active_turns (
      session_id text PRIMARY KEY,
      ip_hash text NOT NULL,
      expires_at timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS ai_active_turns_ip_idx ON ai_active_turns (ip_hash);
    CREATE TABLE IF NOT EXISTS ai_thread_owners (
      thread_id text PRIMARY KEY,
      session_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS ai_thread_owners_session_idx ON ai_thread_owners (session_id);
  `);
}

export async function openPostgresAiStore(): Promise<PostgresAiStore | null> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5_000,
  });
  try {
    await pool.query("SELECT 1");
    await ensureAiTables(pool);
    return new PostgresAiStore(pool);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
    console.error(`icdu shared store is not reachable (${code})`);
    await pool.end().catch(() => undefined);
    return null;
  }
}
