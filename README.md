# BidHub — Front-end (Shell + Microfrontends)

Interface do BidHub em **React**, dividida em microfrontends com **Module Federation** (Vite +
`@originjs/vite-plugin-federation`). O front só conversa com o **API Gateway**, que repassa ao BFF; ele nunca chama
um microsserviço diretamente.

## Onde este serviço entra

```
Navegador ──> Shell + MFs (Static Web Apps) ──> API Gateway (APIM) ──> BFF ──┬──> Leilão Service ──> MongoDB Atlas
                                                                             │          │ publica LeilaoEncerrado
                                                                             │          v
                                                                             │     Service Bus (fila leilao-encerrado)
                                                                             │          │
                                                                             ├──> Comissão Service ──> Azure SQL
                                                                             │          │
                                                                             └──> Function Calcular Comissão <┘
```

## Estrutura

| App | Porta local | O que tem |
|---|---|---|
| `apps/shell` (host) | 5000 | layout, menu (Leilões, Financeiro), carrega os `remoteEntry.js` dos MFs em tempo de execução |
| `apps/mf-leiloes` (remote) | 5001 | **Catálogo/painel** (`GET /aggregated-data`), leilão ao vivo (dar lance, abrir, encerrar, excluir), novo leilão |
| `apps/mf-financeiro` (remote) | 5002 | lista de comissões, detalhe (cobrada → conciliada, excluir), cadastro manual, simulador |
| `packages/api-client` | — | cliente HTTP comum dos dois MFs (envia `Ocp-Apim-Subscription-Key`) |
| `packages/design` | — | estilos compartilhados (mesma identidade visual) |

`react` e `react-dom` são compartilhados como dependências únicas entre Shell e remotes. A Shell define
`window.__BIDHUB__ = { apiUrl, apiKey }` e os dois MFs usam essa mesma configuração. Se um remote não carregar,
só a área dele mostra o erro.

## Tecnologias

React 19 · Vite 6 · @originjs/vite-plugin-federation · Vitest · Azure Static Web Apps

## Como rodar localmente

Com os backends rodando (BFF em `http://localhost:3000`):

```bash
npm ci
npm run local            # build dos 3 apps + preview: abra http://localhost:5000
```

O plugin de federation só gera o `remoteEntry.js` no build, por isso os remotes rodam com `vite preview`.
Para apontar para a nuvem, crie `apps/shell/.env` a partir de `apps/shell/.env.example`:

| Variável | Exemplo |
|---|---|
| `VITE_API_URL` | `https://<apim>.azure-api.net/api` |
| `VITE_API_KEY` | chave de assinatura do APIM |
| `VITE_MF_LEILOES_URL` / `VITE_MF_FINANCEIRO_URL` | URL do `remoteEntry.js` de cada MF |

## Publicar no Azure Static Web Apps

- **Um site só** (mais simples): `npm run build:site` monta `dist-site/` com a Shell na raiz e cada MF em sua
  subpasta (`/mf-leiloes/`, `/mf-financeiro/`). O workflow `.github/workflows/ci.yml` faz isso e publica com o
  token `AZURE_STATIC_WEB_APPS_API_TOKEN`. Configure `VITE_API_URL` (variável) e `VITE_API_KEY` (segredo) no repositório.
- **Um site por MF**: publique `apps/mf-leiloes/dist` e `apps/mf-financeiro/dist` em Static Web Apps próprios
  (o `staticwebapp.config.json` de cada um já libera o CORS do `remoteEntry.js`) e faça o build da Shell com
  `VITE_MF_LEILOES_URL` e `VITE_MF_FINANCEIRO_URL` apontando para eles.

## Testes

```bash
npm test                 # testes do api-client (Vitest): rotas, chave do Gateway, erros 409/0, formatação
```

## Endereços publicados

Preencher depois da implantação (os mesmos endereços vão na Seção 7.3 do arc42).

| Item | URL |
|---|---|
| Front-end | https://<front>.azurestaticapps.net |

## Repositórios do projeto

| Componente | Repositório |
|---|---|
| Front-end (Shell + MF Leilões + MF Financeiro) | https://github.com/BabbingtonnJR/bidhub-frontend |
| BFF | https://github.com/BabbingtonnJR/bidhub-bff |
| Microsserviço 1 — Leilão Service (MongoDB) | https://github.com/BabbingtonnJR/bidhub-leilao-service |
| Microsserviço 2 — Comissão Service (Azure SQL) | https://github.com/BabbingtonnJR/bidhub-comissao-service |
| Azure Function — Calcular Comissão | https://github.com/BabbingtonnJR/bidhub-function |

## Alunos

- André Gustavo
- Babbingtonn Luiz
- Gabriel Carmo
- Marcel Araújo

Disciplina: Arquitetura e Soluções Cloud · Professor: Manoel Valerio da Silveira Neto · PUCPR
