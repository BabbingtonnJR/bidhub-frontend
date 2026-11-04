import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// MF Financeiro: remote do Module Federation. Expõe ./App para a Shell.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE || "/",
    plugins: [
      react(),
      federation({
        name: "mfFinanceiro",
        filename: "remoteEntry.js",
        exposes: { "./App": "./src/App.jsx" },
        shared: ["react", "react-dom"],
      }),
    ],
    build: { target: "esnext", modulePreload: false, minify: true, cssCodeSplit: false },
    server: { port: 5002, strictPort: true, cors: true },
    preview: { port: 5002, strictPort: true, cors: true },
  };
});
