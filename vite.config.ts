import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const copilotStylesId = "\0copilotkit-styles";

/**
 * CopilotKit keeps its button colors in @layer utilities. Unlayered site CSS
 * beats every layered rule, so the launcher stays transparent. Promote the
 * component and utility layers only; leave the base reset layered so it does
 * not override those utilities.
 */
function unwrapCssLayers(css: string): string {
  const promote = new Set(["components", "utilities"]);
  let out = "";
  let index = 0;
  while (index < css.length) {
    const match = /^@layer\s+([^{]+)\{/.exec(css.slice(index));
    if (!match) {
      out += css[index];
      index += 1;
      continue;
    }
    const layerName = match[1].trim();
    index += match[0].length;
    const start = index;
    let depth = 1;
    while (index < css.length && depth > 0) {
      const char = css[index];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      if (depth > 0) index += 1;
    }
    const inner = css.slice(start, index);
    out += promote.has(layerName) ? inner : `${match[0]}${inner}}`;
    index += 1;
  }
  return out;
}

/** CopilotKit ships Tailwind v4 CSS. The site's Tailwind v3 PostCSS plugin rejects those @layer rules. */
function copilotStylesBypass(): Plugin {
  const cssPath = path.resolve(
    rootDir,
    "node_modules/@copilotkit/react-core/dist/v2/index.css",
  );
  return {
    name: "copilotkit-styles-bypass",
    enforce: "pre" as const,
    async resolveId(source, importer) {
      const normalized = source.replace(/\\/g, "/");
      const importerPath = importer?.replace(/\\/g, "/") ?? "";
      const cssFromCopilot =
        normalized.endsWith(".css") &&
        (normalized.includes("@copilotkit/react-core") ||
          normalized.endsWith("/react-core/dist/v2/index.css") ||
          importerPath.includes("@copilotkit/react-core"));
      if (!cssFromCopilot) return null;
      if (
        normalized.includes("@copilotkit/react-core") ||
        normalized.endsWith("/react-core/dist/v2/index.css")
      ) {
        return copilotStylesId;
      }
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      const resolvedId = resolved?.id?.replace(/\\/g, "/") ?? "";
      if (resolvedId.includes("@copilotkit/react-core") && resolvedId.endsWith(".css")) {
        return copilotStylesId;
      }
      return null;
    },
    load(id: string) {
      if (id !== copilotStylesId) return null;
      const css = unwrapCssLayers(readFileSync(cssPath, "utf8"));
      return `if (typeof document !== "undefined") {
let style = document.querySelector("style[data-copilotkit-styles]");
if (!style) {
  style = document.createElement("style");
  style.setAttribute("data-copilotkit-styles", "");
  document.head.appendChild(style);
}
style.textContent = ${JSON.stringify(css)};
}`;
    },
  };
}

export default defineConfig({
  plugins: [
    copilotStylesBypass(),
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  root: path.resolve(rootDir, "client"),
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
