import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
const FRAMES = 800,
  CONCURRENCY = 6,
  CACHE_LIMIT = 48;
const source = (index: number) =>
  `/assets/showreel/${String(index).padStart(4, "0")}.webp`;
const BEATS = [
  ["Scultura di precisione.", "Ogni ombra di Gotham, scolpita nel dettaglio."],
  [
    "Materiali d’élite.",
    "Superfici e finiture che danno forma al Cavaliere Oscuro.",
  ],
  [
    "Edizione limitata.",
    "Un tributo alla leggenda. Una presenza nella tua collezione.",
  ],
  [
    "Presenza leggendaria.",
    "Ottantasette anni di storie. Un’icona senza tempo.",
  ],
];
export default function BatmanCamera({
  onPreorder,
}: {
  onPreorder?: () => void;
}) {
  const reduced = !!useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gallery, setGallery] = useState(1);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const cv = canvas.current;
    const section = container.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !section || !ctx) {
      setFailed(true);
      return;
    }
    let alive = true,
      active = 0,
      target = 1,
      raf = 0;
    const images = new Map<number, HTMLImageElement>();
    const pending = new Set<number>();
    const errors = new Set<number>();
    let queue: number[] = [];
    setLoaded(false);
    setFailed(false);
    function draw() {
      if (!alive) return;
      const closest = [...images.keys()].sort(
        (a, b) => Math.abs(a - target) - Math.abs(b - target),
      )[0];
      const image = images.get(closest);
      if (!image) return;
      ctx!.clearRect(0, 0, cv!.width, cv!.height);
      const scale = Math.min(
        cv!.width / image.naturalWidth,
        cv!.height / image.naturalHeight,
      );
      const width = image.naturalWidth * scale,
        height = image.naturalHeight * scale;
      ctx!.drawImage(
        image,
        (cv!.width - width) / 2,
        (cv!.height - height) / 2,
        width,
        height,
      );
      setLoaded(true);
    }
    function pump() {
      while (alive && active < CONCURRENCY && queue.length) {
        const index = queue.shift()!;
        if (images.has(index) || pending.has(index) || errors.has(index))
          continue;
        pending.add(index);
        active++;
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          pending.delete(index);
          active--;
          if (!alive) return;
          images.set(index, image);
          if (images.size > CACHE_LIMIT) {
            const evict = [...images.keys()]
              .filter((i) => i !== 1)
              .sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
            images.delete(evict);
          }
          draw();
          pump();
        };
        image.onerror = () => {
          pending.delete(index);
          active--;
          if (!alive) return;
          errors.add(index);
          if (!images.size && !queue.length && active === 0) setFailed(true);
          pump();
        };
        image.src = source(index);
      }
    }
    function request() {
      queue = [];
      for (let distance = 0; distance < 22; distance++)
        for (const index of distance === 0
          ? [target]
          : [target + distance, target - distance])
          if (
            index >= 1 &&
            index <= FRAMES &&
            !images.has(index) &&
            !pending.has(index) &&
            !errors.has(index)
          )
            queue.push(index);
      if (!images.has(1) && !errors.has(1)) queue.push(1);
      pump();
      draw();
    }
    function scroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const distance = section!.offsetHeight - innerHeight;
        const p = Math.max(
          0,
          Math.min(
            1,
            -section!.getBoundingClientRect().top / Math.max(1, distance),
          ),
        );
        target = Math.max(
          1,
          Math.min(FRAMES, Math.round(p * (FRAMES - 1)) + 1),
        );
        setProgress(p);
        request();
      });
    }
    function resize() {
      cv!.width = innerWidth * Math.min(devicePixelRatio, 1.5);
      cv!.height = innerHeight * Math.min(devicePixelRatio, 1.5);
      draw();
      scroll();
    }
    resize();
    request();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      queue = [];
      images.clear();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, retry]);
  const beat = Math.min(3, Math.floor(progress * 4));
  if (reduced)
    return (
      <section className="statue-gallery">
        <div>
          <p className="eyebrow">BATMAN / 87 ANNI DI LEGGENDA</p>
          <h1>
            Il Cavaliere
            <br />
            Oscuro.
          </h1>
          <p>
            Un tributo alla presenza, alla precisione e alla storia di un’icona.
          </p>
          <p className="caption">
            Modalità a movimento ridotto: scegli un’immagine.
          </p>
          <div className="gallery-options">
            {[1, 200, 400, 600, 800].map((frame, i) => (
              <button
                className={gallery === frame ? "" : "secondary"}
                key={frame}
                aria-pressed={gallery === frame}
                onClick={() => setGallery(frame)}
              >
                Vista {i + 1}
              </button>
            ))}
          </div>
          <button onClick={onPreorder}>Esplora il checkout demo</button>
        </div>
        <img
          src={source(gallery)}
          alt={`Statua Batman, vista ${[1, 200, 400, 600, 800].indexOf(gallery) + 1}`}
          onError={(e) => {
            if (!e.currentTarget.src.endsWith("0001.webp"))
              e.currentTarget.src = source(1);
          }}
        />
      </section>
    );
  return (
    <div ref={container} className="statue-scroll">
      <section
        className="statue-stage"
        aria-label="Presentazione della statua Batman"
      >
        <canvas
          ref={canvas}
          aria-label="Sequenza della statua Batman controllata dallo scorrimento"
          role="img"
        />
        <div className="statue-story">
          <p className="eyebrow">BATMAN / COLLECTOR’S EDITION</p>
          <h1>
            {progress < 0.08
              ? "La leggenda prende forma."
              : progress > 0.91
                ? "L’eredità è tua."
                : BEATS[beat][0]}
          </h1>
          <p>
            {progress < 0.08
              ? "87 anni nell’oscurità. Un’icona senza tempo."
              : BEATS[beat][1]}
          </p>
        </div>
        <div className="statue-bottom">
          <span>
            {progress < 0.08
              ? "Scorri per scoprire la statua ↓"
              : `${Math.round(progress * 100)}% / EDIZIONE ANNIVERSARIO`}
          </span>
          <button onClick={onPreorder}>
            Checkout demo <span aria-hidden="true">↗</span>
          </button>
        </div>
        {!loaded && (
          <div className="statue-loading" role="status">
            {failed ? (
              <>
                <p>
                  Sequenza non disponibile. Puoi riprovare o proseguire con la
                  demo.
                </p>
                <button onClick={() => setRetry((r) => r + 1)}>Riprova</button>
              </>
            ) : (
              "Preparazione del primo fotogramma…"
            )}
          </div>
        )}
      </section>
    </div>
  );
}
