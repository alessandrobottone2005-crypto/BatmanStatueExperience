import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { MouseLookControls } from "./MouseLookControls";
import JokerCard from "../joker/JokerCard";
import JokerHintSystem from "../joker/JokerHintSystem";
import { useJokerHint } from "../../hooks/useJokerHint";
export type PanoramaScene = "batcomputer" | "armeria" | "batmobile";
interface Props {
  scene: PanoramaScene;
  onProgress: (count: number) => void;
  baseCompleted: number;
  isPaused: boolean;
  onNext: () => void;
  isMuted?: boolean;
  isMissionActive?: boolean;
  onReady?: (ready: boolean) => void;
  onExit?: () => void;
}
const BATCOMPUTER_RIDDLES = [
  {
    id: 1,
    riddle:
      "Non è un uomo, non è un mostro, non è un re… eppure tutta Gotham trattiene il fiato quando compare nel cielo notturno.",
    options: ["Joker", "Batsegnale", "Pinguino", "Arkham"],
    correctAnswer: "Batsegnale",
  },
  {
    id: 2,
    riddle:
      "Porto un sorriso eterno, ma non ho mai conosciuto la gioia. Più rido… più Gotham brucia.",
    options: ["Due Facce", "Robin", "Joker", "Enigmista"],
    correctAnswer: "Joker",
  },
];
const ARMERIA_RIDDLE = {
  id: 3,
  riddle:
    "Non ho poteri sovrumani, eppure i criminali tremano al mio nome. Le tenebre sono il mio dominio.",
  options: ["Superman", "Batman", "Bane", "Flash"],
  correctAnswer: "Batman",
};
const BATMOBILE_RIDDLES = [
  {
    id: 4,
    riddle:
      "DIVORO L'ASFALTO DI GOTHAM A VELOCITÀ IMPOSSIBILI. LASCIO SOLO FUMO E TERRORE. COSA SONO?",
    options: ["Batwing", "Batmobile", "Joker Van", "Treno di Gotham"],
    correctAnswer: "Batmobile",
  },
  {
    id: 5,
    riddle:
      "RUGGIO NELL’OSCURITÀ DI GOTHAM, IL CUORE PULSANTE DELLA MACCHINA DEL CAVALIERE. COSA SONO?",
    options: ["Reattore", "Turbina", "Pistone"],
    correctAnswer: "Reattore",
  },
];

const ARMERIA_RIDDLES = [ARMERIA_RIDDLE];
const MEDIA = {
  batcomputer: "BatCaverna_Batcomputer360",
  armeria: "BatCaverna_Armeria360",
  batmobile: "BatCaverna_BatMobile360",
};
const POSITIONS: Record<PanoramaScene, [number, number, number][]> = {
  batcomputer: [
    [190, -30, 60],
    [-160, -20, 120],
  ],
  armeria: [[170, 40, -100]],
  batmobile: [
    [-180, -10, 80],
    [120, 30, -170],
  ],
};
function Clue({
  position,
  id,
  hint,
  onOpen,
  disabled,
}: {
  position: [number, number, number];
  id: number;
  hint: boolean;
  onOpen: () => void;
  disabled: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => ref.current?.quaternion.copy(camera.quaternion));
  return (
    <group position={position} ref={ref}>
      <Html transform distanceFactor={120} center>
        <button
          className={`clue-card ${hint ? "clue-hint" : ""}`}
          disabled={disabled}
          onClick={onOpen}
          aria-label={`Apri indizio ${id}`}
        >
          <img src="/assets/images/JollyJokerCard_Front.jpg" alt="" />
          <span>INDIZIO {id}</span>
        </button>
      </Html>
    </group>
  );
}
export default function SharedPanoramaCanvas({
  scene,
  onProgress,
  baseCompleted,
  isPaused,
  onNext,
  isMuted = false,
  isMissionActive = true,
  onReady,
  onExit,
}: Props) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [graphics, setGraphics] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  useEffect(() => {
    const probe = document.createElement("canvas");
    try {
      const gl = probe.getContext("webgl2");
      setGraphics(gl ? "available" : "unavailable");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setGraphics("unavailable");
    }
  }, [retry]);
  const [feedback, setFeedback] = useState("");
  const video = useRef<HTMLVideoElement | null>(null);
  const reduced = !!useReducedMotion();
  const riddles =
    scene === "batcomputer"
      ? BATCOMPUTER_RIDDLES
      : scene === "armeria"
        ? ARMERIA_RIDDLES
        : BATMOBILE_RIDDLES;
  const hint = useJokerHint(
    isPaused || loading,
    isMissionActive,
    completed,
    active,
  );
  const { startHintTimer, resetHint } = hint;
  useEffect(() => {
    if (active !== null) return;
    const next = riddles.find((r) => !completed.includes(r.id));
    if (next) startHintTimer(next.id);
    else resetHint();
  }, [riddles, completed, active, startHintTimer, resetHint]);
  useEffect(() => {
    let alive = true,
      fallback = false;
    const textures = new Set<THREE.Texture>();
    setLoading(true);
    setFailed(false);
    setTexture(null);
    onReady?.(false);
    const ready = (tex: THREE.Texture) => {
      if (!alive) {
        tex.dispose();
        return;
      }
      textures.add(tex);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      setTexture(tex);
      setLoading(false);
      onReady?.(true);
    };
    const nextScene =
      scene === "batcomputer"
        ? "armeria"
        : scene === "armeria"
          ? "batmobile"
          : null;
    if (nextScene) {
      const poster = new Image();
      poster.src = `/assets/textures/${MEDIA[nextScene]}.jpg`;
    }
    const loadStatic = () => {
      if (!alive || fallback) return;
      fallback = true;
      video.current?.pause();
      new THREE.TextureLoader().load(
        `/assets/textures/${MEDIA[scene]}.jpg`,
        ready,
        undefined,
        () => {
          if (alive) {
            setFailed(true);
            setLoading(false);
          }
        },
      );
    };
    const el = document.createElement("video");
    video.current = el;
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.preload = "metadata";
    const tex = new THREE.VideoTexture(el);
    textures.add(tex);
    const playing = () => {
      if (!fallback) ready(tex);
    };
    el.addEventListener("playing", playing);
    el.addEventListener("error", loadStatic);
    if (reduced) loadStatic();
    else {
      el.src = `/assets/textures/${MEDIA[scene]}.mp4`;
      void el.play().catch(loadStatic);
    }
    const timeout = setTimeout(() => {
      if (el.readyState < 2) loadStatic();
    }, 8000);
    return () => {
      alive = false;
      clearTimeout(timeout);
      el.removeEventListener("playing", playing);
      el.removeEventListener("error", loadStatic);
      el.pause();
      el.removeAttribute("src");
      el.load();
      video.current = null;
      for (const item of textures) item.dispose();
      onReady?.(false);
    };
  }, [scene, retry, reduced, onReady]);
  useEffect(() => {
    const el = video.current;
    if (!el || reduced || !el.getAttribute("src")) return;
    if (isPaused) el.pause();
    else void el.play().catch(() => {});
  }, [isPaused, reduced]);
  const complete = useCallback(
    (id: number) => {
      if (completed.includes(id) || isPaused) return;
      const next = [...completed, id];
      setCompleted(next);
      setActive(null);
      setFeedback("Risposta corretta. Indizio raccolto.");
      onProgress(baseCompleted + next.length);
      if (next.length === riddles.length) onNext();
    },
    [completed, isPaused, baseCompleted, onProgress, onNext, riddles.length],
  );
  const current = riddles.find((r) => r.id === active);
  if (graphics === "unavailable")
    return (
      <section className="result-screen">
        <p className="eyebrow">MODALITÀ ALTERNATIVA</p>
        <h1>La Batcaverna non è disponibile.</h1>
        <p>
          Il browser non riesce ad avviare WebGL. Puoi riprovare o scoprire
          direttamente la statua.
        </p>
        <div className="action-row">
          <button
            onClick={() => {
              setGraphics("checking");
              setRetry((r) => r + 1);
            }}
          >
            Riprova
          </button>
          <button className="secondary" onClick={onExit}>
            Scopri la statua
          </button>
        </div>
      </section>
    );
  if (graphics === "checking")
    return (
      <div className="loading-screen" role="status">
        Verifica grafica…
      </div>
    );
  if (failed || contextLost)
    return (
      <section className="result-screen">
        <h1>Ambiente non disponibile</h1>
        <p>
          Non è stato possibile caricare questa area. Puoi riprovare oppure
          scoprire la statua.
        </p>
        <div className="action-row">
          <button
            onClick={() => {
              setContextLost(false);
              setRetry((r) => r + 1);
            }}
          >
            Riprova
          </button>
          <button className="secondary" onClick={onExit}>
            Scopri la statua
          </button>
        </div>
      </section>
    );
  return (
    <section className="panorama-scene" aria-label={`Esplorazione: ${scene}`}>
      <div
        aria-hidden={active !== null || isPaused}
        inert={active !== null || isPaused ? true : undefined}
      >
        <Canvas
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              "webglcontextlost",
              (e) => {
                e.preventDefault();
                onReady?.(false);
                setContextLost(true);
              },
              { once: true },
            );
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 0.1]} fov={75} />
          <MouseLookControls
            enabled={active === null && !isPaused && !loading}
          />
          {texture && (
            <mesh scale={[-1, 1, 1]} rotation={[0, -Math.PI / 2, 0]}>
              <sphereGeometry args={[500, 64, 64]} />
              <meshBasicMaterial map={texture} side={THREE.BackSide} />
            </mesh>
          )}
          {riddles.map(
            (r, i) =>
              !completed.includes(r.id) && (
                <Clue
                  key={r.id}
                  position={POSITIONS[scene][i]}
                  id={r.id}
                  hint={hint.hintCardId === r.id}
                  onOpen={() => setActive(r.id)}
                  disabled={isPaused || loading}
                />
              ),
          )}
        </Canvas>
        <div className="scene-caption">
          <p className="eyebrow">BATCAVERNA / {scene}</p>
          <p>
            Muovi il mouse ai bordi · Frecce: visuale · Tab: indizi · Esc: pausa
          </p>
          <p role="status">
            {completed.length} / {riddles.length} indizi raccolti. {feedback}
          </p>
        </div>
        <div
          className="keyboard-clues"
          aria-label="Indizi raggiungibili da tastiera"
        >
          {riddles.map((r) => (
            <button
              key={r.id}
              disabled={completed.includes(r.id) || loading || isPaused}
              onClick={() => setActive(r.id)}
            >
              {completed.includes(r.id) ? "✓" : "Apri"} indizio {r.id}
            </button>
          ))}
        </div>
      </div>
      <JokerHintSystem {...hint} isMuted={isMuted} isPaused={isPaused} />
      {loading && (
        <div className="loading-screen" role="status">
          Sincronizzazione area…
        </div>
      )}
      {current && (
        <JokerCard
          key={current.id}
          {...current}
          onClose={() => setActive(null)}
          onSuccess={complete}
          isFlipped
          isPaused={isPaused}
        />
      )}
    </section>
  );
}
