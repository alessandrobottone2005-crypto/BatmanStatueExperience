import { useEffect } from "react";
import { BatcavernAudio } from "../../lib/audioManager";
export default function JokerHintSystem({
  hintActive,
  hintPhase,
  isMuted,
  isPaused,
}: {
  hintActive: boolean;
  hintPhase: number;
  isMuted: boolean;
  isPaused: boolean;
}) {
  useEffect(() => {
    if (hintActive && !isMuted && !isPaused) BatcavernAudio.beep(440);
  }, [hintActive, isMuted, isPaused]);
  return hintActive && !isPaused ? (
    <p className="hint-notice" role="status">
      Un indizio ti aspetta. Cerca la carta evidenziata oppure raggiungila con
      Tab. <span className="sr-only">Livello aiuto {hintPhase}</span>
    </p>
  ) : null;
}
