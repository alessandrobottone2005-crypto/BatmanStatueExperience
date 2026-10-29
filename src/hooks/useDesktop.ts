import { useEffect, useState } from "react";
export function useDesktop() {
  const read = () =>
    !matchMedia("(pointer: coarse)").matches &&
    !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const [desktop, setDesktop] = useState(read);
  useEffect(() => {
    const q = matchMedia("(pointer: coarse)");
    const update = () => setDesktop(read());
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  return desktop;
}
