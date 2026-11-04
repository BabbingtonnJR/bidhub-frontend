import { useCallback, useEffect, useState } from "react";
import { api, formatarMoeda, formatarData, formatarPercentual } from "@bidhub/api-client";
import SeloComissao from "./SeloComissao.jsx";
import Simulador from "./Simulador.jsx";

const FILTROS = [["", "Todas"], ["PENDENTE", "Pendentes"], ["COBRADA", "Cobradas"], ["CONCILIADA", "Conciliadas"]];

export default function ListaComissoes({ aoAbrir, aoNova }) {
  const [comissoes, setComissoes] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setComissoes(await api.listarComissoes(filtro || undefined));
    } catch (e) {
      setErro(e.message);
    }
  }, [filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  const total = (comissoes || []).reduce((s, c) => s + c.valorCobrado, 0);

  return (
    <section>
      <div className="cabecalho-tela">
        <div>
          <h2>Financeiro</h2>
          <p className="subtitulo">Comissões geradas pelo encerramento dos leilões (Azure SQL)</p>
        </div>
        <div className="acoes">
          <button className="botao botao-secundario" onClick={carregar}>Atualizar</button>
          <button className="botao botao-destaque" onClick={aoNova}>Cadastrar comissão</button>
        </div>
      </div>

      {erro && <div className="aviso aviso-erro">{erro}</div>}

      <div className="grade grade-financeiro">
        <div className="cartao">
          <div className="filtros">
            {FILTROS.map(([valor, rotulo]) => (
              <button key={valor} className={`filtro ${filtro === valor ? "ativo" : ""}`} onClick={() => setFiltro(valor)}>{rotulo}</button>
            ))}
          </div>
          {!comissoes && !erro && <p className="carregando">Carregando…</p>}
          {comissoes && comissoes.length === 0 && <p className="vazio">Nenhuma comissão. Encerre um leilão para gerar a primeira.</p>}
          {comissoes && comissoes.length > 0 && (
            <div className="rolagem">
              <table className="tabela">
                <thead>
                  <tr><th>Leilão</th><th>Vendedor</th><th className="num">Valor base</th><th className="num">Comissão</th><th>Status</th><th>Criada em</th></tr>
                </thead>
                <tbody>
                  {comissoes.map((c) => (
                    <tr key={c.id} onClick={() => aoAbrir(c.id)}>
                      <td>#{c.leilaoId} · {c.categoria}</td>
                      <td>{c.vendedor}</td>
                      <td className="num">{formatarMoeda(c.valorBase)}</td>
                      <td className="num">{formatarMoeda(c.valorCobrado)} <span className="subtitulo">({formatarPercentual(c.percentual)})</span></td>
                      <td><SeloComissao status={c.status} /></td>
                      <td>{formatarData(c.criadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="rodape-dados">{comissoes.length} comissões · total {formatarMoeda(total)}</p>
            </div>
          )}
        </div>
        <Simulador />
      </div>
    </section>
  );
}
