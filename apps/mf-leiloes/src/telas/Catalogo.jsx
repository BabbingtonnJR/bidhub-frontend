import { useCallback, useEffect, useMemo, useState } from "react";
import { api, formatarMoeda, formatarData, formatarPercentual } from "@bidhub/api-client";
import Selo from "./Selo.jsx";

const FONTES = { "leilao-service": "Leilões", "comissao-service": "Comissões", "function-calcular-comissao": "Cálculo de comissão" };
const FILTROS = [["", "Todos"], ["ao-vivo", "Ao vivo"], ["agendado", "Agendados"], ["encerrado", "Encerrados"]];

// Catálogo + painel: uma única chamada ao BFF (GET /aggregated-data), Seção 6.1
export default function Catalogo({ aoAbrir, aoNovo }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await api.dadosAgregados());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const projecaoPorLeilao = useMemo(() => new Map((dados?.projecao || []).map((p) => [p.leilaoId, p])), [dados]);
  const leiloes = (dados?.leiloes || []).filter((l) => !filtro || l.status === filtro);
  const r = dados?.resumo;

  return (
    <section>
      <div className="cabecalho-tela">
        <div>
          <h2>Leilões</h2>
          <p className="subtitulo">Catálogo e painel em tempo real</p>
        </div>
        <div className="acoes">
          <button className="botao botao-secundario" onClick={carregar} disabled={carregando}>Atualizar</button>
          <button className="botao botao-destaque" onClick={aoNovo}>Novo leilão</button>
        </div>
      </div>

      {erro && <div className="aviso aviso-erro">{erro}</div>}
      {dados?.erros?.length > 0 && (
        <div className="aviso aviso-alerta">
          Parte do painel está indisponível agora: {dados.erros.map((e) => FONTES[e.fonte] || e.fonte).join(", ")}. Mostrando o que chegou.
        </div>
      )}

      {r && (
        <div className="grade grade-indicadores">
          <div className="cartao indicador"><div className="rotulo">Ao vivo</div><div className="valor">{r.leiloesPorStatus["ao-vivo"]}</div><div className="detalhe">{r.totalLeiloes} leilões no total</div></div>
          <div className="cartao indicador"><div className="rotulo">Em disputa</div><div className="valor">{formatarMoeda(r.valorEmDisputa)}</div><div className="detalhe">soma dos lances atuais</div></div>
          <div className="cartao indicador"><div className="rotulo">Comissão projetada</div><div className="valor">{formatarMoeda(r.comissaoProjetadaTotal)}</div><div className="detalhe">se fechassem agora</div></div>
          <div className="cartao indicador"><div className="rotulo">Comissões pendentes</div><div className="valor">{formatarMoeda(r.valorComissoesPendentes)}</div><div className="detalhe">{r.comissoesPorStatus.PENDENTE} a cobrar</div></div>
          <div className="cartao indicador"><div className="rotulo">Aguardando comissão</div><div className="valor">{r.encerradosAguardandoComissao}</div><div className="detalhe">encerrados, evento em processamento</div></div>
        </div>
      )}

      <div className="filtros">
        {FILTROS.map(([valor, rotulo]) => (
          <button key={valor} className={`filtro ${filtro === valor ? "ativo" : ""}`} onClick={() => setFiltro(valor)}>{rotulo}</button>
        ))}
      </div>

      {carregando && !dados && <p className="carregando">Carregando…</p>}
      {dados && leiloes.length === 0 && <div className="cartao vazio">Nenhum leilão neste filtro.</div>}

      <div className="grade grade-leiloes">
        {leiloes.map((l) => {
          const proj = projecaoPorLeilao.get(l.id);
          return (
            <article key={l.id} className="cartao leilao-card" onClick={() => aoAbrir(l.id)}>
              <div className="topo"><span className="icone">{l.imagem}</span><Selo status={l.status} /></div>
              <div>
                <div className="titulo">{l.titulo}</div>
                <div className="meta">Lote {l.lote} · {l.categoria} · {l.vendedor}</div>
              </div>
              <div className="linha-valores">
                <div><span className="rotulo">{l.status === "encerrado" ? "Valor final" : "Lance atual"}</span><strong>{formatarMoeda(l.lanceAtual)}</strong></div>
                {l.status === "ao-vivo" && <div><span className="rotulo">Mínimo</span><strong>{formatarMoeda(l.lanceMinimo)}</strong></div>}
              </div>
              {proj && <div className="meta">Comissão projetada: {formatarMoeda(proj.valorCobrado)} ({formatarPercentual(proj.percentual)})</div>}
              {l.status === "agendado" && <div className="meta">{l.horario}</div>}
            </article>
          );
        })}
      </div>

      {dados && <p className="rodape-dados">Dados de GET /aggregated-data (BFF) · gerado em {formatarData(dados.geradoEm)}</p>}
    </section>
  );
}
