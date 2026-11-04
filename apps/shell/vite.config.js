import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Shell: host do Module Federation. Carrega os remoteEntry.js dos MFs em tempo de execução.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE || "/",
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {
          mfLeiloes: env.VITE_MF_LEILOES_URL || "http://localhost:5001/assets/remoteEntry.js",
          mfFinanceiro: env.VITE_MF_FINANCEIRO_URL || "http://localhost:5002/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom"],
      }),
    ],
    build: { target: "esnext", modulePreload: false, minify: true, cssCodeSplit: false },
    server: { port: 5000, strictPort: true },
    preview: { port: 5000, strictPort: true },
  };
});
