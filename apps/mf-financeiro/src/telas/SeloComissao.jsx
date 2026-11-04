export default function SeloComissao({ status }) {
  return <span className={`selo selo-${status}`}>{status}</span>;
}
