import { createRoot } from "react-dom/client";
import "@bidhub/design/estilos.css";
import App from "./App.jsx";

// configuração única para os dois microfrontends: URL do API Gateway e chave de assinatura
window.__BIDHUB__ = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  apiKey: import.meta.env.VITE_API_KEY || "",
};

createRoot(document.getElementById("root")).render(<App />);
