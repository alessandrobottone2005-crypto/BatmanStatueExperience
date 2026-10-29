interface Props {
  onComplete: () => void;
  initialTime?: number;
}
export default function BatcomputerBootOverlay({
  onComplete,
  initialTime = 180,
}: Props) {
  return (
    <section className="briefing-page">
      <div className="briefing-heading">
        <p className="eyebrow">BATCOMPUTER / PROTOCOLLO DI EMERGENZA</p>
        <h1>
          La sfida
          <br />
          del Joker.
        </h1>
        <p>Un ordigno nella Batcaverna. Cinque indizi per disinnescarlo.</p>
      </div>
      <div className="briefing-details">
        <div className="mission-stat">
          <strong>{String(initialTime / 60).padStart(2, "0")}:00</strong>
          <span>IL TEMPO A TUA DISPOSIZIONE</span>
        </div>
        <ol className="rules-list">
          <li>
            <strong>Esplora a 360°</strong>
            <p>
              Muovi il mouse ai bordi o usa le frecce per orientare la visuale.
            </p>
          </li>
          <li>
            <strong>Trova cinque carte</strong>
            <p>
              Due al Batcomputer, una nell’Armeria e due alla Batmobile. Con Tab
              puoi raggiungere gli indizi; Invio li apre.
            </p>
          </li>
          <li>
            <strong>Risolvi gli enigmi</strong>
            <p>
              Scegli la risposta con mouse o tastiera. Esc chiude la carta; Esc
              durante l’esplorazione mette in pausa.
            </p>
          </li>
          <li>
            <strong>Batti il tempo</strong>
            <p>
              Primi due indizi entro 45 secondi: +60 secondi. Missione sotto 90
              secondi: premio demo del 15%.
            </p>
          </li>
        </ol>
        <button onClick={onComplete}>
          Inizia la missione <span aria-hidden="true">→</span>
        </button>
        <p className="caption">
          Dopo un minuto di ricerca, il Joker ti offrirà un indizio.
        </p>
      </div>
    </section>
  );
}
