import { useState } from "react";
import { api } from "@bidhub/api-client";

export default function NovaComissao({ aoVoltar, aoCriar }) {
  const [dados, setDados] = useState({ leilaoId: "", categoria: "", vendedor: "", valorBase: "" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const campo = (nome) => ({ id: nome, value: dados[nome], onChange: (e) => setDados({ ...dados, [nome]: e.target.value }) });

  async function enviar(ev) {
    ev.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const criada = await api.criarComissao({ ...dados, leilaoId: Number(dados.leilaoId), valorBase: Number(dados.valorBase) });
      aoCriar(criada.id);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <button className="link-voltar" onClick={aoVoltar}>← Voltar às comissões</button>
      <div className="cabecalho-tela"><h2>Cadastrar comissão</h2></div>
      <p className="subtitulo" style={{ marginBottom: 14 }}>Normalmente a comissão é gerada sozinha quando o leilão é encerrado. Use o cadastro manual para lançamentos avulsos; o valor é calculado pela Function.</p>
      {erro && <div className="aviso aviso-erro">{erro}</div>}
      <form className="cartao" onSubmit={enviar}>
        <div className="formulario">
          <div className="campo"><label htmlFor="leilaoId">Leilão (id)</label><input type="number" min="1" {...campo("leilaoId")} /></div>
          <div className="campo"><label htmlFor="categoria">Categoria</label><input {...campo("categoria")} /></div>
          <div className="campo"><label htmlFor="vendedor">Vendedor</label><input {...campo("vendedor")} /></div>
          <div className="campo"><label htmlFor="valorBase">Valor base (R$)</label><input type="number" min="0" step="any" {...campo("valorBase")} /></div>
        </div>
        <div className="acoes-formulario">
          <button className="botao botao-destaque" disabled={enviando}>Cadastrar</button>
          <button type="button" className="botao botao-secundario" onClick={aoVoltar}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}
