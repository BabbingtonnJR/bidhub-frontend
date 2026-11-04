import { useCallback, useEffect, useState } from "react";
import { api, formatarMoeda, formatarData } from "@bidhub/api-client";
import Selo from "./Selo.jsx";

export default function LeilaoAoVivo({ id, aoVoltar }) {
  const [leilao, setLeilao] = useState(null);
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState(null); // { tipo: "ok" | "erro" | "alerta" | "info", texto }
  const [ocupado, setOcupado] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const l = await api.buscarLeilao(id);
      setLeilao(l);
      setValor(String(l.lanceMinimo));
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function executar(acao, sucesso) {
    setOcupado(true);
    setMensagem(null);
    try {
      const resultado = await acao();
      if (resultado?.lanceAtual !== undefined) { setLeilao(resultado); setValor(String(resultado.lanceMinimo)); }
      if (resultado?.leilao) setLeilao(resultado.leilao);
      if (sucesso) setMensagem({ tipo: "ok", texto: typeof sucesso === "function" ? sucesso(resultado) : sucesso });
      return true;
    } catch (e) {
      if (e.conflito) {
        setMensagem({ tipo: "alerta", texto: `${e.message} O lance atual foi atualizado.` });
        await carregar();
      } else {
        setMensagem({ tipo: "erro", texto: e.message });
      }
      return false;
    } finally {
      setOcupado(false);
    }
  }

  const darLance = (ev) => {
    ev.preventDefault();
    executar(() => api.darLance(id, Number(valor)), (l) => `Lance de ${formatarMoeda(l.lanceAtual)} registrado.`);
  };

  if (!leilao) {
    return (
      <section>
        <button className="link-voltar" onClick={aoVoltar}>← Voltar ao catálogo</button>
        {mensagem ? <div className={`aviso aviso-${mensagem.tipo}`}>{mensagem.texto}</div> : <p className="carregando">Carregando…</p>}
      </section>
    );
  }

  return (
    <section>
      <button className="link-voltar" onClick={aoVoltar}>← Voltar ao catálogo</button>
      <div className="cabecalho-tela">
        <span style={{ fontSize: "2.2rem" }}>{leilao.imagem}</span>
        <div>
          <h2>{leilao.titulo}</h2>
          <p className="subtitulo">Lote {leilao.lote} · {leilao.categoria} · {leilao.vendedor}</p>
        </div>
        <div className="acoes"><Selo status={leilao.status} /></div>
      </div>

      {mensagem && <div className={`aviso aviso-${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="detalhe-leilao">
        <div className="cartao">
          <p className="subtitulo">{leilao.status === "encerrado" ? "Valor final" : "Lance atual"}</p>
          <div className="lance-atual">{formatarMoeda(leilao.lanceAtual)}</div>
          {leilao.status === "ao-vivo" && (
            <form onSubmit={darLance} style={{ marginTop: 16 }}>
              <div className="campo">
                <label htmlFor="valor">Seu lance</label>
                <input id="valor" type="number" step="any" value={valor} onChange={(e) => setValor(e.target.value)} />
                <span className="ajuda">Mínimo {formatarMoeda(leilao.lanceMinimo)} (lance atual + incremento de {formatarMoeda(leilao.incrementoMinimo)})</span>
              </div>
              <div className="acoes-formulario"><button className="botao botao-destaque" disabled={ocupado}>Dar lance</button></div>
            </form>
          )}
          {leilao.status === "agendado" && <p className="aviso aviso-info" style={{ marginTop: 16 }}>Leilão agendado para {leilao.horario}. Abra o leilão para receber lances.</p>}
          {leilao.status === "encerrado" && <p className="aviso aviso-info" style={{ marginTop: 16 }}>Encerrado em {formatarData(leilao.encerradoEm)}. A comissão é gerada pelo Comissão Service a partir do evento LeilaoEncerrado.</p>}
        </div>

        <div className="cartao">
          <h3 style={{ marginBottom: 12 }}>Dados do leilão</h3>
          <dl className="lista-dados">
            <dt>Lance inicial</dt><dd>{formatarMoeda(leilao.lanceInicial)}</dd>
            <dt>Incremento</dt><dd>{formatarMoeda(leilao.incrementoMinimo)}</dd>
            <dt>Horário</dt><dd>{leilao.horario}</dd>
            <dt>Espectadores</dt><dd>{leilao.espectadores}</dd>
          </dl>
          <div className="acoes-formulario" style={{ flexWrap: "wrap" }}>
            {leilao.status === "agendado" && (
              <button className="botao" disabled={ocupado} onClick={() => executar(() => api.atualizarLeilao(id, { status: "ao-vivo" }), "Leilão aberto para lances.")}>Abrir leilão</button>
            )}
            {leilao.status === "ao-vivo" && (
              <button className="botao" disabled={ocupado} onClick={() => executar(() => api.encerrarLeilao(id), (r) => `Leilão encerrado por ${formatarMoeda(r.leilao.lanceAtual)}. Evento LeilaoEncerrado publicado; a comissão aparece no Financeiro em instantes.`)}>Encerrar leilão</button>
            )}
            {!confirmarExclusao ? (
              <button className="botao botao-perigo" disabled={ocupado} onClick={() => setConfirmarExclusao(true)}>Excluir</button>
            ) : (
              <button className="botao botao-perigo" disabled={ocupado} onClick={() => executar(() => api.excluirLeilao(id)).then((ok) => ok && aoVoltar())}>Confirmar exclusão</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
