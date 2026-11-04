import { useState } from "react";
import { api, formatarMoeda, formatarPercentual } from "@bidhub/api-client";

// POST /simulacoes/comissao (BFF -> Function Calcular Comissão)
export default function Simulador() {
  const [valor, setValor] = useState("220000");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  async function simular(ev) {
    ev.preventDefault();
    setErro(null);
    try {
      setResultado(await api.simularComissao(Number(valor)));
    } catch (e) {
      setErro(e.message);
      setResultado(null);
    }
  }

  return (
    <div className="cartao">
      <h3 style={{ marginBottom: 10 }}>Simular comissão</h3>
      <form onSubmit={simular} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="campo" style={{ flex: 1, minWidth: 160 }}>
          <label htmlFor="sim-valor">Valor arrematado (R$)</label>
          <input id="sim-valor" type="number" min="0" step="any" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <button className="botao">Calcular</button>
      </form>
      {erro && <div className="aviso aviso-erro" style={{ marginTop: 12 }}>{erro}</div>}
      {resultado && (
        <div style={{ marginTop: 12 }}>
          <div className="linha-valores">
            <div><span className="rotulo">Comissão</span><strong>{formatarMoeda(resultado.valorCobrado)}</strong></div>
            <div><span className="rotulo">Percentual efetivo</span><strong>{formatarPercentual(resultado.percentual)}</strong></div>
          </div>
          <ul className="faixas">
            {resultado.faixas.map((f, i) => (
              <li key={i}>{(f.aliquota * 100).toFixed(0)}% sobre {formatarMoeda(f.base)} {f.ate ? `(até ${formatarMoeda(f.ate)})` : "(excedente)"} = {formatarMoeda(f.valor)}</li>
            ))}
          </ul>
          <p className="subtitulo">Regra calculada pela Azure Function: 5% até R$ 100.000 e 3% sobre o excedente.</p>
        </div>
      )}
    </div>
  );
}
