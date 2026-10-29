import { euro } from "../lib/checkout";
interface Props {
  quantity: number;
  totalPaid: number;
  onReturnHome: () => void;
  onViewStatue: () => void;
}
export default function ThankYouPage({
  quantity,
  totalPaid,
  onReturnHome,
  onViewStatue,
}: Props) {
  return (
    <section className="confirmation-page">
      <p className="eyebrow">WAYNE COLLECTION / FINE DEL PERCORSO</p>
      <span className="confirmation-symbol" aria-hidden="true">
        ✓
      </span>
      <h1>
        Simulazione
        <br />
        completata.
      </h1>
      <p>
        La leggenda continua. Grazie per aver esplorato questo progetto
        accademico.
      </p>
      <dl className="confirmation-summary">
        <div>
          <dt>Quantità dimostrativa</dt>
          <dd>{quantity}</dd>
        </div>
        <div>
          <dt>Totale simulato</dt>
          <dd>{euro(totalPaid)}</dd>
        </div>
      </dl>
      <p className="demo-banner">
        Nessun addebito effettuato. Nessun ordine creato e nessun dato del form
        salvato o inviato.
      </p>
      <div className="action-row">
        <button onClick={onViewStatue}>Rivedi la statua</button>
        <button className="secondary" onClick={onReturnHome}>
          Torna all’inizio
        </button>
      </div>
    </section>
  );
}
