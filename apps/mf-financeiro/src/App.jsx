import { useState } from "react";
import ListaComissoes from "./telas/ListaComissoes.jsx";
import DetalheComissao from "./telas/DetalheComissao.jsx";
import NovaComissao from "./telas/NovaComissao.jsx";

// MF Financeiro: lista, detalhe (mudança de status, exclusão), cadastro manual e simulação de comissão
export default function App() {
  const [tela, setTela] = useState({ nome: "lista" });
  const irPara = (nome, extra = {}) => setTela({ nome, ...extra });

  if (tela.nome === "detalhe") return <DetalheComissao id={tela.id} aoVoltar={() => irPara("lista")} />;
  if (tela.nome === "nova") return <NovaComissao aoVoltar={() => irPara("lista")} aoCriar={(id) => irPara("detalhe", { id })} />;
  return <ListaComissoes aoAbrir={(id) => irPara("detalhe", { id })} aoNova={() => irPara("nova")} />;
}
