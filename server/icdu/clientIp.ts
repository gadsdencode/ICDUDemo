import type { Request } from "express";

/** Replit's edge is one proxy hop. A larger value would trust client-supplied addresses. */
export function replitProxyHops(
  raw = process.env.REPLIT_PROXY_HOPS,
): number {
  if (raw == null || raw.trim() === "") return 1;
  if (!/^[1-5]$/.test(raw.trim())) return 1;
  return Number(raw.trim());
}

export function normalizeIp(ip: string): string {
  const trimmed = ip.trim().replace(/^::ffff:/i, "");
  return trimmed;
}

/**
 * Client address after the verified proxy hop.
 * When X-Forwarded-For is present, only req.ip (hop-limited) is accepted.
 * A missing or unmoved address is rejected instead of using the leftmost, spoofable value.
 * Direct connections with no forwarded header use the socket peer.
 */
export function clientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const hasForwarded =
    (typeof forwarded === "string" && forwarded.trim() !== "") ||
    (Array.isArray(forwarded) && forwarded.some((value) => value.trim() !== ""));
  if (hasForwarded) {
    const resolved = req.ip?.trim();
    const socket = req.socket?.remoteAddress?.trim();
    if (!resolved || (socket && normalizeIp(resolved) === normalizeIp(socket))) {
      return null;
    }
    return normalizeIp(resolved);
  }
  const socket = req.socket?.remoteAddress?.trim();
  return socket ? normalizeIp(socket) : null;
}
