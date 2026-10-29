import { useState } from "react";
interface Props {
  timeTaken: number;
  onComplete: () => void;
  isPaused?: boolean;
}
export default function FinalReveal({ timeTaken, onComplete }: Props) {
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState(false);
  const formatted = `${String(Math.floor(timeTaken / 60)).padStart(2, "0")}:${String(timeTaken % 60).padStart(2, "0")}`;
  const speedrun = timeTaken > 0 && timeTaken < 90;
  const text = `Ho disinnescato la bomba del Joker in ${formatted}! Scopri Batman 87th Anniversary: https://batman-87th-anniversary.vercel.app`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Risultato copiato.");
      setManual(false);
    } catch {
      setMessage(
        "Copia automatica non disponibile. Seleziona il testo qui sotto.",
      );
      setManual(true);
    }
  }
  return (
    <section className="victory-page">
      <div>
        <p className="eyebrow">WAYNE TECH / ANALISI POST-MISSIONE</p>
        <h1>
          Gotham
          <br />è salva.
        </h1>
        <p>
          «Per una volta non era mia intenzione farti saltare in aria. Goditi la
          tua preziosa reliquia — te la sei guadagnata.»
        </p>
        <span className="caption">JOKER</span>
      </div>
      <div className="victory-score">
        <p className="eyebrow">BOMBA DISINNESCATA</p>
        <strong>{formatted}</strong>
        <h2>
          {timeTaken < 60
            ? "Leggendario"
            : timeTaken < 90
              ? "Eccellente"
              : "Missione completata"}
        </h2>
        {speedrun && (
          <p className="demo-banner">
            SPEEDRUN · Premio demo del 15% sbloccato
          </p>
        )}
        <button onClick={onComplete}>
          Scopri la statua <span aria-hidden="true">→</span>
        </button>
        <button className="text-button" onClick={copy}>
          Copia e condividi il risultato
        </button>
        <p role="status">{message}</p>
        {manual && (
          <textarea
            aria-label="Risultato da copiare"
            readOnly
            value={text}
            onFocus={(e) => e.currentTarget.select()}
          />
        )}
      </div>
    </section>
  );
}
