import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import PauseOverlay from "./components/ui/PauseOverlay";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import IntroScreen from "./sections/IntroScreen";
import BatcomputerBootOverlay from "./components/ui/BatcomputerBootOverlay";
import FinalReveal from "./sections/FinalReveal";
import { useDesktop } from "./hooks/useDesktop";
import { useMissionTimer } from "./hooks/useMissionTimer";
import {
  experienceReducer,
  initialExperience,
  phaseFromHash,
} from "./lib/experience";
import { BatcavernAudio } from "./lib/audioManager";
import ErrorBoundary from "./components/ui/ErrorBoundary";
const Panorama = lazy(
  () => import("./components/cinematic/SharedPanoramaCanvas"),
);
const Transition = lazy(
  () => import("./components/cinematic/CinematicVideoPlayer"),
);
const Statue = lazy(() => import("./components/cinematic/BatmanCamera"));
const Checkout = lazy(() => import("./sections/Checkout"));
const Confirmation = lazy(() => import("./sections/ThankYouPage"));
const JokerAudio = lazy(() => import("./components/joker/JokerAudioManager"));

export default function App() {
  const desktop = useDesktop();
  return desktop ? (
    <MotionConfig reducedMotion="user">
      <Experience />
    </MotionConfig>
  ) : (
    <main className="desktop-notice">
      <div className="notice-mark" aria-hidden="true">
        87
      </div>
      <p className="eyebrow">BATMAN / ANNIVERSARY EXPERIENCE</p>
      <h1>
        Gotham ti aspetta.
        <br />
        Da desktop.
      </h1>
      <p>
        Questa esperienza è disponibile solo da computer desktop, con mouse o
        tastiera. Apri questo stesso indirizzo dal tuo computer per entrare
        nella Batcaverna.
      </p>
      <span className="caption">Progetto accademico · Alessandro Bottone</span>
    </main>
  );
}
function Experience() {
  const [state, dispatch] = useReducer(
    experienceReducer,
    initialExperience,
    (s) =>
      experienceReducer(s, {
        type: "navigate",
        phase: phaseFromHash(location.hash),
      }),
  );
  const { phase, status, run } = state;
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = !!useReducedMotion();
  const heading = useRef<HTMLDivElement>(null);
  const transition = phase === "transition1" || phase === "transition2";
  const scene =
    phase === "armeria" || phase === "transition2"
      ? "armeria"
      : phase === "batmobile"
        ? "batmobile"
        : "batcomputer";
  const playing =
    status === "active" &&
    ["batcomputer", "armeria", "batmobile"].includes(phase);
  const time = useMissionTimer(
    status,
    paused || !ready,
    transition,
    useCallback(() => dispatch({ type: "fail" }), []),
  );
  const { resetTimer } = time;
  useEffect(() => {
    resetTimer();
  }, [run, resetTimer]);
  useEffect(() => {
    setPaused(false);
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, [phase]);
  useEffect(() => {
    if (state.completed === 5 && status === "active")
      dispatch({ type: "win", time: time.elapsedSeconds });
  }, [state.completed, status, time.elapsedSeconds]);
  useEffect(() => {
    if (
      state.completed === 2 &&
      status === "active" &&
      time.elapsedSeconds <= 45 &&
      !time.bonusTimeGranted
    )
      time.grantBonusTime(60);
  }, [state.completed, status, time]);
  useEffect(() => {
    BatcavernAudio.setMuted(muted);
    BatcavernAudio.setPaused(paused);
  }, [muted, paused]);
  useEffect(() => () => BatcavernAudio.stop(), []);
  const navigate = useCallback((target: "intro" | "showreel" | "checkout") => {
    const hash =
      target === "showreel"
        ? "#statua"
        : target === "checkout"
          ? "#checkout"
          : "";
    if (location.hash !== hash)
      history.pushState(null, "", location.pathname + location.search + hash);
    dispatch({ type: "navigate", phase: target });
  }, []);
  useEffect(() => {
    const change = () =>
      dispatch({ type: "navigate", phase: phaseFromHash(location.hash) });
    window.addEventListener("popstate", change);
    window.addEventListener("hashchange", change);
    return () => {
      window.removeEventListener("popstate", change);
      window.removeEventListener("hashchange", change);
    };
  }, []);
  useEffect(() => {
    if (location.hash === "#conferma" && !state.order)
      history.replaceState(null, "", "#statua");
  }, [state.order]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (playing || transition)) setPaused((p) => !p);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [playing, transition]);
  const goStatue = () => navigate("showreel");
  return (
    <div className="experience-shell" data-phase={phase}>
      <a
        className="skip-link"
        href="#experience-content"
        onClick={(e) => {
          e.preventDefault();
          heading.current?.focus();
        }}
      >
        Salta al contenuto
      </a>
      <Navbar
        phase={
          playing
            ? "gamification"
            : transition || phase === "tutorial"
              ? "intro"
              : phase === "reveal"
                ? "reveal"
                : phase === "showreel"
                  ? "showreel"
                  : phase === "checkout"
                    ? "checkout"
                    : phase === "thankyou"
                      ? "thankyou"
                      : "intro"
        }
        isMuted={muted}
        onToggleMute={() => {
          BatcavernAudio.start();
          setMuted((m) => !m);
        }}
        isPaused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        completedCount={state.completed}
        timeLeft={playing ? time.timeLeft : undefined}
        onPreorder={() => navigate("checkout")}
        onBack={goStatue}
      />
      <main id="experience-content" ref={heading} tabIndex={-1}>
        <div inert={paused ? true : undefined}>
          <Suspense
            fallback={
              <div className="loading-screen" role="status">
                Inizializzazione della Batcaverna…
              </div>
            }
          >
            {phase === "intro" && (
              <IntroScreen
                onBegin={() => {
                  BatcavernAudio.start();
                  dispatch({ type: "tutorial" });
                }}
                onViewStatue={goStatue}
                isPaused={paused}
              />
            )}
            {phase === "tutorial" && (
              <BatcomputerBootOverlay
                onComplete={() => dispatch({ type: "start" })}
              />
            )}
            {playing && status === "active" && (
              <ErrorBoundary key={run + scene} onExit={goStatue}>
                <Panorama
                  key={run + scene}
                  scene={scene}
                  onProgress={(count) => dispatch({ type: "progress", count })}
                  baseCompleted={
                    scene === "batcomputer" ? 0 : scene === "armeria" ? 2 : 3
                  }
                  isPaused={paused}
                  isMuted={muted}
                  isMissionActive
                  onNext={() => dispatch({ type: "next" })}
                  onReady={setReady}
                  onExit={goStatue}
                />
              </ErrorBoundary>
            )}
            {transition && (
              <Transition
                key={phase}
                src={
                  phase === "transition1"
                    ? "./assets/videos/BatCaverna_PassaggioBatComputerAArmeria.mp4"
                    : "./assets/videos/BatCaverna_PassaggioArmeriaABatMobile.mp4"
                }
                isPaused={paused}
                reducedMotion={reduced}
                onEnded={() => dispatch({ type: "next" })}
              />
            )}
            {phase === "reveal" && (
              <FinalReveal timeTaken={state.time} onComplete={goStatue} />
            )}
            {phase === "showreel" && (
              <>
                <Statue onPreorder={() => navigate("checkout")} />
                <Footer />
              </>
            )}
            {phase === "checkout" && (
              <Checkout
                speedrunUnlocked={state.speedrun}
                onClose={goStatue}
                onSuccess={(quantity, total) => {
                  dispatch({ type: "purchase", order: { quantity, total } });
                  history.pushState(null, "", "#conferma");
                }}
              />
            )}
            {phase === "thankyou" && state.order && (
              <Confirmation
                quantity={state.order.quantity}
                totalPaid={state.order.total}
                onReturnHome={() => navigate("intro")}
                onViewStatue={goStatue}
              />
            )}
            {playing && !reduced && (
              <JokerAudio
                isActive={status === "active"}
                isMuted={muted}
                isPaused={paused}
              />
            )}
          </Suspense>
          {status === "failed" && (
            <section className="result-screen" aria-labelledby="failed-title">
              <p className="eyebrow">MISSIONE TERMINATA</p>
              <h1 id="failed-title">Il tempo è scaduto.</h1>
              <p>
                Gotham ha ancora bisogno di te. Riprova, oppure scopri la
                statua.
              </p>
              <div className="action-row">
                <button onClick={() => navigate("intro")}>
                  Riprova la missione
                </button>
                <button className="secondary" onClick={goStatue}>
                  Scopri la statua
                </button>
              </div>
            </section>
          )}
        </div>
        {paused && <PauseOverlay onResume={() => setPaused(false)} />}
        {status === "active" && time.bonusTimeGranted && (
          <p className="bonus-note" role="status">
            Bonus esplorazione: +60 secondi
          </p>
        )}
      </main>
    </div>
  );
}
