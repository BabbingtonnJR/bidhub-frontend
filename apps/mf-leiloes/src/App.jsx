import { useState } from "react";
import Catalogo from "./telas/Catalogo.jsx";
import LeilaoAoVivo from "./telas/LeilaoAoVivo.jsx";
import NovoLeilao from "./telas/NovoLeilao.jsx";

// MF Leilões: Catálogo (painel com GET /aggregated-data), Leilão ao vivo (lance, abrir, encerrar) e Novo leilão
export default function App() {
  const [tela, setTela] = useState({ nome: "catalogo" });
  const irPara = (nome, extra = {}) => setTela({ nome, ...extra });

  if (tela.nome === "leilao") return <LeilaoAoVivo id={tela.id} aoVoltar={() => irPara("catalogo")} />;
  if (tela.nome === "novo") return <NovoLeilao aoVoltar={() => irPara("catalogo")} aoCriar={(id) => irPara("leilao", { id })} />;
  return <Catalogo aoAbrir={(id) => irPara("leilao", { id })} aoNovo={() => irPara("novo")} />;
}
