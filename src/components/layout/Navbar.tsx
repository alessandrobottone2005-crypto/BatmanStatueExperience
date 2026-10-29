import { ArrowLeft, Pause, Play, Volume2, VolumeX } from "lucide-react";
export type NavPhase =
  "intro" | "gamification" | "reveal" | "showreel" | "checkout" | "thankyou";
interface Props {
  phase: NavPhase;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
  completedCount?: number;
  totalClues?: number;
  timeLeft?: number;
  onPreorder?: () => void;
  onBack?: () => void;
}
export default function Navbar({
  phase,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  completedCount = 0,
  timeLeft,
  onPreorder,
  onBack,
}: Props) {
  return (
    <nav className="experience-nav" aria-label="Controlli esperienza">
      <div className="nav-identity">
        <img src="/logos-navbar_molecule.png" alt="Batman e Sideshow" />
        <span>87TH ANNIVERSARY</span>
      </div>
      {phase === "gamification" && (
        <div className="mission-hud">
          <span
            aria-label="Tempo residuo"
            className={
              timeLeft !== undefined && timeLeft <= 30 ? "timer-urgent" : ""
            }
          >
            {String(Math.floor((timeLeft ?? 180) / 60)).padStart(2, "0")}:
            {String((timeLeft ?? 180) % 60).padStart(2, "0")}
          </span>
          <span aria-label={`${completedCount} indizi raccolti su 5`}>
            INDIZI <strong>{completedCount}/5</strong>
          </span>
        </div>
      )}
      <div className="nav-actions">
        {phase === "showreel" && (
          <button className="secondary nav-checkout" onClick={onPreorder}>
            Checkout demo
          </button>
        )}
        {phase === "checkout" && (
          <button
            className="icon-control"
            aria-label="Torna alla statua"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {(phase === "intro" || phase === "gamification") && (
          <button
            className="icon-control"
            aria-label={
              isPaused ? "Riprendi esperienza" : "Metti in pausa esperienza"
            }
            aria-pressed={!!isPaused}
            onClick={onTogglePause}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        )}
        <button
          className="icon-control"
          aria-label={isMuted ? "Attiva audio" : "Silenzia audio"}
          aria-pressed={isMuted}
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </nav>
  );
}
