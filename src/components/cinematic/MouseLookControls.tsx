import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
export function MouseLookControls({
  enabled = true,
}: {
  enabled?: boolean;
  hoveredCountRef?: unknown;
}) {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const pointer = useRef({ x: 0, y: 0 });
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const pressed = keys.current;
    const move = (e: MouseEvent) => {
      // Hit testing the projected control is more reliable than compositor
      // :hover timing on software renderers. Hold the camera before the click.
      const clue =
        (e.target as Element)?.closest?.(".clue-card") ??
        document.elementFromPoint(e.clientX, e.clientY)?.closest(".clue-card");
      if (!clue && (e.clientX <= 12 || e.clientX >= innerWidth - 12)) {
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && focused.matches(".clue-card"))
          focused.blur();
      }
      if (clue && e.clientX > 12 && e.clientX < innerWidth - 12) {
        pointer.current = { x: 0, y: 0 };
        return;
      }
      pointer.current = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: 1 - (e.clientY / innerHeight) * 2,
      };
    };
    const leave = () => {
      pointer.current = { x: 0, y: 0 };
      pressed.clear();
    };
    const key = (e: KeyboardEvent) => {
      if (
        !enabled ||
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) ||
        (e.target as HTMLElement).closest(
          "input,textarea,select,button,[contenteditable]",
        )
      )
        return;
      e.preventDefault();
      pointer.current = { x: 0, y: 0 };
      keys.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener("mousemove", move);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", leave);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", leave);
      document.removeEventListener("mouseleave", leave);
      pressed.clear();
    };
  }, [enabled]);
  useFrame((_, delta) => {
    if (
      !enabled ||
      document.querySelector(".keyboard-clues:focus-within, .clue-card:focus")
    )
      return;
    const hovered = document.querySelector(".clue-card:hover");
    const bounds = hovered?.getBoundingClientRect();
    // The outermost edge keeps rotating even when a card passes underneath.
    // Move onto its center to hold it still and inspect it.
    if (bounds && Math.abs(pointer.current.x) < 0.98) return;
    const speed = (n: number) =>
      Math.abs(n) > 0.25
        ? Math.sign(n) * ((Math.abs(n) - 0.25) / 0.75) ** 2
        : 0;
    const yaw =
      (keys.current.has("ArrowLeft") ? 1 : 0) -
      (keys.current.has("ArrowRight") ? 1 : 0) -
      speed(pointer.current.x);
    const pitch =
      (keys.current.has("ArrowUp") ? 1 : 0) -
      (keys.current.has("ArrowDown") ? 1 : 0) +
      speed(pointer.current.y);
    euler.current.y += yaw * Math.min(delta, 0.05);
    euler.current.x = THREE.MathUtils.clamp(
      euler.current.x + pitch * Math.min(delta, 0.05),
      -1.3,
      1.3,
    );
    camera.quaternion.setFromEuler(euler.current);
  });
  return null;
}
