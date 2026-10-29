import { useEffect, useRef } from "react";
export default function PauseOverlay({ onResume }: { onResume: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const nav = document.querySelector<HTMLElement>("nav");
    if (nav) nav.inert = true;
    button.current?.focus();
    return () => {
      if (nav) nav.inert = false;
      previous?.focus();
    };
  }, []);
  return (
    <section
      className="pause-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          button.current?.focus();
        }
      }}
    >
      <p className="eyebrow">WAYNE TECH / STANDBY</p>
      <h2 id="pause-title">Esperienza in pausa</h2>
      <p>Tempo, sequenze e audio sono sospesi.</p>
      <button ref={button} onClick={onResume}>
        Riprendi
      </button>
    </section>
  );
}
