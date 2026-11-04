import { useCallback, useEffect, useState } from "react";
import { api, formatarMoeda, formatarData, formatarPercentual } from "@bidhub/api-client";
import SeloComissao from "./SeloComissao.jsx";

const PROXIMO = { PENDENTE: "COBRADA", COBRADA: "CONCILIADA", CONCILIADA: null };
const ACAO = { COBRADA: "Marcar como cobrada", CONCILIADA: "Marcar como conciliada" };

export default function DetalheComissao({ id, aoVoltar }) {
  const [comissao, setComissao] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setComissao(await api.buscarComissao(id));
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function avancar() {
    setOcupado(true);
    setMensagem(null);
    try {
      const atualizada = await api.atualizarStatusComissao(id, PROXIMO[comissao.status]);
      setComissao(atualizada);
      setMensagem({ tipo: "ok", texto: `Comissão agora está ${atualizada.status}.` });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    setOcupado(true);
    try {
      await api.excluirComissao(id);
      aoVoltar();
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
      setOcupado(false);
    }
  }

  return (
    <section>
      <button className="link-voltar" onClick={aoVoltar}>← Voltar às comissões</button>
      {mensagem && <div className={`aviso aviso-${mensagem.tipo}`}>{mensagem.texto}</div>}
      {!comissao ? (
        !mensagem && <p className="carregando">Carregando…</p>
      ) : (
        <div className="cartao" style={{ maxWidth: 640 }}>
          <div className="cabecalho-tela">
            <div>
              <h2>Comissão #{comissao.id}</h2>
              <p className="subtitulo">Leilão #{comissao.leilaoId} · {comissao.categoria} · {comissao.vendedor}</p>
            </div>
            <div className="acoes"><SeloComissao status={comissao.status} /></div>
          </div>
          <div className="lance-atual">{formatarMoeda(comissao.valorCobrado)}</div>
          <dl className="lista-dados" style={{ marginTop: 12 }}>
            <dt>Valor base</dt><dd>{formatarMoeda(comissao.valorBase)}</dd>
            <dt>Percentual efetivo</dt><dd>{formatarPercentual(comissao.percentual)}</dd>
            <dt>Criada em</dt><dd>{formatarData(comissao.criadoEm)}</dd>
            <dt>Atualizada em</dt><dd>{formatarData(comissao.atualizadoEm)}</dd>
          </dl>
          <div className="acoes-formulario">
            {PROXIMO[comissao.status] && <button className="botao" disabled={ocupado} onClick={avancar}>{ACAO[PROXIMO[comissao.status]]}</button>}
            {comissao.status === "PENDENTE" && <button className="botao botao-perigo" disabled={ocupado} onClick={excluir}>Excluir</button>}
          </div>
          <p className="rodape-dados">Fluxo: PENDENTE → COBRADA → CONCILIADA, sem volta. Só comissão PENDENTE pode ser excluída.</p>
        </div>
      )}
    </section>
  );
}
