import { useEffect, useRef, useState } from "react";
interface Props {
  src: string;
  onEnded: () => void;
  isPaused?: boolean;
  reducedMotion?: boolean;
  label?: string;
  nextAsset?: string;
}
export default function CinematicVideoPlayer({
  src,
  onEnded,
  isPaused,
  reducedMotion,
  label = "Accedi alla prossima area",
}: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const done = useRef(false);
  const callback = useRef(onEnded);
  callback.current = onEnded;
  const [failed, setFailed] = useState(false);
  const finish = () => {
    if (!done.current && !isPaused) {
      done.current = true;
      callback.current();
    }
  };
  useEffect(() => {
    const el = video.current;
    if (!el || reducedMotion) return;
    if (isPaused) el.pause();
    else void el.play().catch(() => setFailed(true));
  }, [isPaused, reducedMotion, src]);
  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const t = setTimeout(() => setFailed(true), 30000);
    return () => clearTimeout(t);
  }, [isPaused, reducedMotion]);
  return (
    <section className="transition-player">
      {!reducedMotion && !failed && (
        <video
          ref={video}
          src={src}
          muted
          playsInline
          onEnded={finish}
          onError={() => setFailed(true)}
        />
      )}
      <div className="transition-controls">
        <p>
          {failed
            ? "Il filmato non è disponibile. Puoi continuare."
            : reducedMotion
              ? "Modalità a movimento ridotto"
              : "Trasferimento alla prossima area"}
        </p>
        <button disabled={isPaused} onClick={finish}>
          {label}
        </button>
      </div>
    </section>
  );
}
