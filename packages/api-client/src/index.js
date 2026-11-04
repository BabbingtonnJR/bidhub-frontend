// Cliente HTTP comum dos microfrontends. Fala só com o API Gateway (que repassa ao BFF).
// A URL e a chave vêm da Shell (window.__BIDHUB__), para os dois MFs usarem a mesma configuração.

export class ErroApi extends Error {
  constructor(status, mensagem, corpo) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.corpo = corpo;
  }

  get conflito() {
    return this.status === 409;
  }
}

function configuracaoGlobal() {
  return (typeof window !== "undefined" && window.__BIDHUB__) || {};
}

export function criarApiClient({ baseUrl, apiKey, fetchImpl } = {}) {
  const config = () => {
    const global = configuracaoGlobal();
    return {
      baseUrl: (baseUrl ?? global.apiUrl ?? "http://localhost:3000").replace(/\/+$/, ""),
      apiKey: apiKey ?? global.apiKey ?? "",
    };
  };

  async function requisitar(metodo, caminho, corpo) {
    const { baseUrl: base, apiKey: chave } = config();
    const headers = { accept: "application/json" };
    if (corpo !== undefined) headers["content-type"] = "application/json";
    if (chave) headers["Ocp-Apim-Subscription-Key"] = chave;

    let resposta;
    try {
      resposta = await (fetchImpl || globalThis.fetch)(`${base}${caminho}`, {
        method: metodo,
        headers,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
    } catch (err) {
      throw new ErroApi(0, `Não foi possível falar com a API (${base}). Verifique a conexão.`, null);
    }

    const texto = await resposta.text();
    let dados = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = { erro: texto };
    }
    if (!resposta.ok) {
      const mensagem = (dados && (dados.erro || dados.message)) || `Erro ${resposta.status}`;
      throw new ErroApi(resposta.status, mensagem, dados);
    }
    return dados;
  }

  const query = (params) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
    return q.toString() ? `?${q}` : "";
  };

  return {
    // painel: Leilão Service + Comissão Service + Function em uma chamada
    dadosAgregados: () => requisitar("GET", "/aggregated-data"),

    listarLeiloes: (status) => requisitar("GET", `/leiloes${query({ status })}`),
    buscarLeilao: (id) => requisitar("GET", `/leiloes/${id}`),
    criarLeilao: (dados) => requisitar("POST", "/leiloes", dados),
    atualizarLeilao: (id, dados) => requisitar("PUT", `/leiloes/${id}`, dados),
    excluirLeilao: (id) => requisitar("DELETE", `/leiloes/${id}`),
    darLance: (id, valor) => requisitar("POST", `/leiloes/${id}/lances`, { valor }),
    encerrarLeilao: (id) => requisitar("POST", `/leiloes/${id}/encerramento`),

    listarComissoes: (status) => requisitar("GET", `/comissoes${query({ status })}`),
    buscarComissao: (id) => requisitar("GET", `/comissoes/${id}`),
    criarComissao: (dados) => requisitar("POST", "/comissoes", dados),
    atualizarStatusComissao: (id, status) => requisitar("PUT", `/comissoes/${id}`, { status }),
    excluirComissao: (id) => requisitar("DELETE", `/comissoes/${id}`),

    simularComissao: (valorBase, categoria) => requisitar("POST", "/simulacoes/comissao", { valorBase, categoria }),
  };
}

export const api = criarApiClient();

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarMoeda = (v) => moeda.format(Number(v) || 0);
export const formatarPercentual = (v) => `${(Number(v) || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
export const formatarData = (iso) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
