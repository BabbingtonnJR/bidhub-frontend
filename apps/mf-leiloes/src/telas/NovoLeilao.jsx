import { useState } from "react";
import { api } from "@bidhub/api-client";

const CAMPOS = [
  ["lote", "Lote", "text", "005"],
  ["titulo", "Título", "text", "Relógio de bolso suíço, 1910"],
  ["categoria", "Categoria", "text", "Antiguidades"],
  ["vendedor", "Vendedor", "text", "Galeria Tempo Antigo"],
  ["lanceInicial", "Lance inicial (R$)", "number", "9000"],
  ["incrementoMinimo", "Incremento mínimo (R$)", "number", "500"],
  ["horario", "Horário", "text", "Sexta, 18:00"],
  ["imagem", "Ícone", "text", "⌚"],
];

export default function NovoLeilao({ aoVoltar, aoCriar }) {
  const [dados, setDados] = useState({ status: "agendado" });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(ev) {
    ev.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const corpo = { ...dados, lanceInicial: Number(dados.lanceInicial), incrementoMinimo: Number(dados.incrementoMinimo) };
      const criado = await api.criarLeilao(corpo);
      aoCriar(criado.id);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <button className="link-voltar" onClick={aoVoltar}>← Voltar ao catálogo</button>
      <div className="cabecalho-tela"><h2>Novo leilão</h2></div>
      {erro && <div className="aviso aviso-erro">{erro}</div>}
      <form className="cartao" onSubmit={enviar}>
        <div className="formulario">
          {CAMPOS.map(([nome, rotulo, tipo, exemplo]) => (
            <div className="campo" key={nome}>
              <label htmlFor={nome}>{rotulo}</label>
              <input id={nome} type={tipo} placeholder={exemplo} value={dados[nome] || ""} onChange={(e) => setDados({ ...dados, [nome]: e.target.value })} />
            </div>
          ))}
          <div className="campo">
            <label htmlFor="status">Status inicial</label>
            <select id="status" value={dados.status} onChange={(e) => setDados({ ...dados, status: e.target.value })}>
              <option value="agendado">Agendado</option>
              <option value="ao-vivo">Ao vivo</option>
            </select>
          </div>
        </div>
        <div className="acoes-formulario">
          <button className="botao botao-destaque" disabled={enviando}>Cadastrar leilão</button>
          <button type="button" className="botao botao-secundario" onClick={aoVoltar}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}
