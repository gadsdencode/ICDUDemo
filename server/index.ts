import "./bootstrapEnv";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { log } from "./log";
import { replitProxyHops } from "./icdu/clientIp";
import { MAX_BODY_BYTES } from "./icdu/limits";
import { ASSISTANT_TOO_LARGE } from "../shared/aiPublic";

import { mountAssistantLibrary } from "./assistant/routes";

const app = express();
mountAssistantLibrary(app);
app.set("trust proxy", replitProxyHops());
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "80kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
      const url = req.url ?? "";
      if (url.startsWith("/api/copilotkit") && buf.length > MAX_BODY_BYTES) {
        const error = new Error(ASSISTANT_TOO_LARGE) as Error & { status: number };
        error.status = 413;
        throw error;
      }
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // CopilotKit responses can contain the conversation. Keep them out of this log.
      if (capturedJsonResponse && !path.startsWith("/api/copilotkit")) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const path = req.path || "";

    if (path.startsWith("/api/copilotkit")) {
      console.error(`icdu chat error ${status}`);
    } else {
      console.error("Internal Server Error:", err);
    }

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      // Windows sockets reject SO_REUSEPORT; Replit's Linux runtime still uses it.
      ...(process.platform === "win32" ? {} : { reusePort: true }),
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
