import type { Express } from "express";
import { createServer, type Server } from "http";
import { reportProductionTunnel, resolveModelConfig } from "./icdu/config";
import { mountPublicAi } from "./icdu/router";
import { sessionSecret } from "./icdu/session";
import { openPostgresAiStore } from "./icdu/store";
import { log } from "./log";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const secret = sessionSecret();
  const [store, tunnel] = await Promise.all([
    secret ? openPostgresAiStore() : Promise.resolve(null),
    reportProductionTunnel(),
  ]);
  const model = resolveModelConfig();
  if (!secret) {
    log("icdu public chat disabled: session secret is not configured");
  } else if (!store) {
    log("icdu public chat disabled: shared store is not configured");
  } else if (!model) {
    log("icdu public chat disabled: model settings are incomplete");
  } else {
    log(`icdu public chat enabled (${model.label}; production tunnel ${tunnel})`);
  }
  mountPublicAi(app, { store, model, secret });
  return httpServer;
}
