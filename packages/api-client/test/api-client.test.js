import { describe, test, expect, beforeEach } from "vitest";
import { criarApiClient, ErroApi, formatarMoeda } from "../src/index.js";

function fetchFalso(respostas) {
  const chamadas = [];
  const fn = async (url, opcoes) => {
    chamadas.push({ url, ...opcoes });
    const r = respostas.shift() || { status: 200, corpo: {} };
    return { ok: r.status < 400, status: r.status, text: async () => (r.corpo === undefined ? "" : JSON.stringify(r.corpo)) };
  };
  fn.chamadas = chamadas;
  return fn;
}

describe("api-client", () => {
  beforeEach(() => { delete globalThis.window; });

  test("usa a configuração da Shell (window.__BIDHUB__) e envia a chave do Gateway", async () => {
    globalThis.window = { __BIDHUB__: { apiUrl: "https://apim.azure-api.net/api/", apiKey: "k123" } };
    const f = fetchFalso([{ status: 200, corpo: { leiloes: [] } }]);
    await criarApiClient({ fetchImpl: f }).dadosAgregados();
    expect(f.chamadas[0].url).toBe("https://apim.azure-api.net/api/aggregated-data");
    expect(f.chamadas[0].headers["Ocp-Apim-Subscription-Key"]).toBe("k123");
  });

  test("monta as rotas do BFF", async () => {
    const f = fetchFalso([]);
    const api = criarApiClient({ baseUrl: "http://bff", fetchImpl: f });
    await api.darLance(3, 1500);
    await api.listarLeiloes("ao-vivo");
    await api.atualizarStatusComissao(2, "COBRADA");
    expect(f.chamadas.map((c) => `${c.method} ${c.url}`)).toEqual([
      "POST http://bff/leiloes/3/lances",
      "GET http://bff/leiloes?status=ao-vivo",
      "PUT http://bff/comissoes/2",
    ]);
    expect(JSON.parse(f.chamadas[0].body)).toEqual({ valor: 1500 });
  });

  test("erro do serviço vira ErroApi com a mensagem do domínio e o status", async () => {
    const f = fetchFalso([{ status: 409, corpo: { erro: "Outro lance foi registrado antes do seu." } }]);
    const erro = await criarApiClient({ baseUrl: "http://bff", fetchImpl: f }).darLance(1, 10).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.status).toBe(409);
    expect(erro.conflito).toBe(true);
    expect(erro.message).toBe("Outro lance foi registrado antes do seu.");
  });

  test("falha de rede vira ErroApi status 0", async () => {
    const erro = await criarApiClient({ baseUrl: "http://bff", fetchImpl: async () => { throw new TypeError("fetch failed"); } }).dadosAgregados().catch((e) => e);
    expect(erro.status).toBe(0);
  });

  test("formata moeda em reais", () => {
    expect(formatarMoeda(1825).replace(/\s/g, " ")).toBe("R$ 1.825,00");
  });
});
