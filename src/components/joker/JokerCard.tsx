import { useEffect, useRef, useState } from "react";
import { BatcavernAudio } from "../../lib/audioManager";
interface Props {
  id: number;
  riddle: string;
  options: string[];
  correctAnswer: string;
  onSuccess: (id: number) => void;
  onClose: () => void;
  isFlipped: boolean;
  isPaused?: boolean;
}
export default function JokerCard({
  id,
  riddle,
  options,
  correctAnswer,
  onSuccess,
  onClose,
  isPaused,
}: Props) {
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const actions = useRef({ onClose, isPaused });
  actions.current = { onClose, isPaused };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const navigation = document.querySelector<HTMLElement>("nav");
    if (navigation) navigation.inert = true;
    first.current?.focus();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !actions.current.isPaused) {
        e.preventDefault();
        e.stopImmediatePropagation();
        actions.current.onClose();
      }
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      window.removeEventListener("keydown", escape, true);
      if (navigation) navigation.inert = false;
      previous?.focus();
    };
  }, []);
  return (
    <div className="riddle-backdrop">
      <div
        className="riddle-panel"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`riddle-${id}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            if (!isPaused) onClose();
          }
          if (e.key === "Tab") {
            const buttons = panel.current?.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            );
            if (!buttons?.length) return;
            const firstButton = buttons[0],
              lastButton = buttons[buttons.length - 1];
            if (e.shiftKey && document.activeElement === firstButton) {
              e.preventDefault();
              lastButton.focus();
            } else if (!e.shiftKey && document.activeElement === lastButton) {
              e.preventDefault();
              firstButton.focus();
            }
          }
        }}
      >
        <div className="riddle-header">
          <p className="eyebrow">
            JOKER / INDIZIO {String(id).padStart(2, "0")}
          </p>
          <button
            ref={first}
            aria-label="Chiudi indizio"
            className="close-riddle"
            onClick={onClose}
            disabled={isPaused}
          >
            ×
          </button>
        </div>
        <h2 id={`riddle-${id}`}>{riddle}</h2>
        <p className="caption">Scegli una risposta.</p>
        <div className="riddle-options">
          {options.map((option) => (
            <button
              key={option}
              disabled={solved || isPaused}
              onClick={() => {
                if (option === correctAnswer) {
                  setSolved(true);
                  setMessage("Risposta corretta. Indizio raccolto.");
                  BatcavernAudio.beep(880);
                  onSuccess(id);
                } else {
                  setMessage("Risposta errata. Riprova.");
                  BatcavernAudio.beep(150, "sawtooth");
                }
              }}
            >
              {option}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <p role="status" className="riddle-feedback">
          {message}
        </p>
      </div>
    </div>
  );
}
