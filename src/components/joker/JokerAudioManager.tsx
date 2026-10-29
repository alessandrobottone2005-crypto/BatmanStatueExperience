import { useEffect } from "react";
import { BatcavernAudio } from "../../lib/audioManager";
export default function JokerAudioManager({
  isActive,
  isMuted,
  isPaused,
}: {
  isActive: boolean;
  isMuted: boolean;
  isPaused: boolean;
}) {
  useEffect(() => {
    if (!isActive || isMuted || isPaused) return;
    let stop = () => {};
    const timer = setInterval(() => {
      stop();
      stop = BatcavernAudio.spatialLaugh();
    }, 60000);
    return () => {
      clearInterval(timer);
      stop();
    };
  }, [isActive, isMuted, isPaused]);
  return null;
}
