// execução isolada do microfrontend (sem a Shell), útil no desenvolvimento
import { createRoot } from "react-dom/client";
import "@bidhub/design/estilos.css";
import App from "./App.jsx";

window.__BIDHUB__ = window.__BIDHUB__ || { apiUrl: import.meta.env.VITE_API_URL, apiKey: import.meta.env.VITE_API_KEY };
createRoot(document.getElementById("root")).render(<main className="shell-principal"><App /></main>);
