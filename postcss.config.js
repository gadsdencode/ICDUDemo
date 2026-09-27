import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

function skipVendorCss(createPlugin) {
  const inner = createPlugin();
  return {
    postcssPlugin: `${inner.postcssPlugin}-skip-vendor`,
    async Once(root, helpers) {
      const file = String(root.source?.input?.file || helpers.result.opts.from || "").replace(
        /\\/g,
        "/",
      );
      if (file.includes("/node_modules/")) return;
      if (Array.isArray(inner.plugins)) {
        for (const child of inner.plugins) {
          if (typeof child === "function") await child(root, helpers.result);
        }
        return;
      }
      if (typeof inner.Once === "function") await inner.Once(root, helpers);
    },
  };
}

export default {
  plugins: [skipVendorCss(tailwindcss), skipVendorCss(autoprefixer)],
};
