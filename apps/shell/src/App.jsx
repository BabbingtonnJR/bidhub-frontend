import { Component, lazy, Suspense, useEffect, useState } from "react";

// microfrontends remotos (Module Federation)
const MfLeiloes = lazy(() => import("mfLeiloes/App"));
const MfFinanceiro = lazy(() => import("mfFinanceiro/App"));

const ROTAS = {
  "#/leiloes": { rotulo: "Leilões", Componente: MfLeiloes, nome: "MF Leilões" },
  "#/financeiro": { rotulo: "Financeiro", Componente: MfFinanceiro, nome: "MF Financeiro" },
};

const ALUNOS = "André Gustavo, Babbingtonn Luiz, Gabriel Carmo, Marcel Araújo";

// se um remote não carregar, só aquela área mostra o erro; a Shell continua de pé
class LimiteDeErro extends Component {
  state = { erro: null };
  static getDerivedStateFromError(erro) {
    return { erro };
  }
  componentDidUpdate(anteriores) {
    if (anteriores.chave !== this.props.chave && this.state.erro) this.setState({ erro: null });
  }
  render() {
    if (this.state.erro) {
      return <div className="aviso aviso-erro">Não foi possível carregar o {this.props.nome}. Verifique se ele está publicado. ({this.state.erro.message})</div>;
    }
    return this.props.children;
  }
}

function usarRota() {
  const atual = () => (ROTAS[window.location.hash] ? window.location.hash : "#/leiloes");
  const [rota, setRota] = useState(atual);
  useEffect(() => {
    const aoMudar = () => setRota(atual());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);
  return rota;
}

export default function App() {
  const rota = usarRota();
  const { Componente, nome } = ROTAS[rota];

  return (
    <>
      <header className="shell-topo">
        <div className="shell-topo-conteudo">
          <div className="shell-marca">
            <strong>BidHub</strong>
            <span>leilões ao vivo</span>
          </div>
          <nav className="shell-nav">
            {Object.entries(ROTAS).map(([hash, r]) => (
              <a key={hash} href={hash} className={rota === hash ? "ativo" : ""}>{r.rotulo}</a>
            ))}
          </nav>
          <div className="shell-api">API: <code>{window.__BIDHUB__.apiUrl}</code></div>
        </div>
      </header>
      <main className="shell-principal">
        <LimiteDeErro nome={nome} chave={rota}>
          <Suspense fallback={<p className="carregando">Carregando {nome}…</p>}>
            <Componente key={rota} />
          </Suspense>
        </LimiteDeErro>
      </main>
      <footer className="shell-rodape">
        BidHub · PJBL Arquitetura e Soluções Cloud · {ALUNOS}
      </footer>
    </>
  );
}
