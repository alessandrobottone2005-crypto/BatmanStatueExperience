import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
const BRIEFING = [
  "Batman… ho lasciato un regalino nella tua preziosa caverna.",
  "Trova i miei cinque indizi. Dimostra che sai ancora giocare.",
  "Tre minuti. Risolvi gli enigmi prima che sia troppo tardi.",
];
interface Props {
  onBegin: () => void;
  onViewStatue: () => void;
  isPaused?: boolean;
}
export default function IntroScreen({
  onBegin,
  onViewStatue,
  isPaused,
}: Props) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? 3 : 0);
  const remaining = useRef(4000);
  useEffect(() => {
    if (isPaused || step >= 3) return;
    const started = performance.now();
    let fired = false;
    const t = setTimeout(() => {
      fired = true;
      remaining.current = 4000;
      setStep((s) => s + 1);
    }, remaining.current);
    return () => {
      clearTimeout(t);
      if (!fired)
        remaining.current = Math.max(
          0,
          remaining.current - (performance.now() - started),
        );
    };
  }, [step, isPaused]);
  return (
    <section className="intro-editorial">
      <div className="intro-art" aria-hidden="true" />
      <div className="intro-copy">
        <p className="eyebrow">GOTHAM CITY / SEGNALE INTERCETTATO</p>
        <p className="edition-mark">
          87<span>ANNI DI LEGGENDA</span>
        </p>
        <h1>
          Entra
          <br />
          nell’oscurità.
        </h1>
        <p className="intro-message" aria-live="polite">
          {BRIEFING[Math.min(step, 2)]}
        </p>
        <div className="action-row">
          {step >= 3 ? (
            <button disabled={isPaused} onClick={onBegin}>
              Accetta la sfida <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <button disabled={isPaused} onClick={() => setStep(3)}>
              Salta intro <span aria-hidden="true">→</span>
            </button>
          )}
          <button className="secondary" onClick={onViewStatue}>
            Scopri la statua
          </button>
        </div>
        <p className="caption">
          Esperienza desktop · Mouse o tastiera · Audio facoltativo
        </p>
        <p className="caption">Ricaricando la pagina la missione ricomincia.</p>
      </div>
    </section>
  );
}
