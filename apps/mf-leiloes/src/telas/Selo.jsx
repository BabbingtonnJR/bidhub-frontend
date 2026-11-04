const ROTULOS = { "ao-vivo": "Ao vivo", agendado: "Agendado", encerrado: "Encerrado" };

export default function Selo({ status }) {
  return <span className={`selo selo-${status}`}>{ROTULOS[status] || status}</span>;
}
