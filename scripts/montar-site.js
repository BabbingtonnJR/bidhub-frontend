// Monta um único site estático com a Shell na raiz e cada MF em sua subpasta:
//   dist-site/               -> Shell
//   dist-site/mf-leiloes/    -> MF Leilões     (remoteEntry em /mf-leiloes/assets/remoteEntry.js)
//   dist-site/mf-financeiro/ -> MF Financeiro
// Útil para publicar tudo em um Static Web App só. VITE_API_URL e VITE_API_KEY vêm do ambiente.
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const destino = path.join(raiz, "dist-site");

function build(app, envExtra) {
  console.log(`\n> build ${app}`);
  execSync(`npm run build -w apps/${app}`, { cwd: raiz, stdio: "inherit", env: { ...process.env, ...envExtra } });
}

build("mf-leiloes", { VITE_BASE: "/mf-leiloes/" });
build("mf-financeiro", { VITE_BASE: "/mf-financeiro/" });
build("shell", {
  VITE_BASE: "/",
  VITE_MF_LEILOES_URL: "/mf-leiloes/assets/remoteEntry.js",
  VITE_MF_FINANCEIRO_URL: "/mf-financeiro/assets/remoteEntry.js",
});

fs.rmSync(destino, { recursive: true, force: true });
fs.cpSync(path.join(raiz, "apps/shell/dist"), destino, { recursive: true });
fs.cpSync(path.join(raiz, "apps/mf-leiloes/dist"), path.join(destino, "mf-leiloes"), { recursive: true });
fs.cpSync(path.join(raiz, "apps/mf-financeiro/dist"), path.join(destino, "mf-financeiro"), { recursive: true });
fs.rmSync(path.join(destino, "mf-leiloes/staticwebapp.config.json"), { force: true });
fs.rmSync(path.join(destino, "mf-financeiro/staticwebapp.config.json"), { force: true });
console.log(`\nSite montado em ${destino}`);
