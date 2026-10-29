import { useState } from "react";
const INFO = {
  progetto: [
    "Il progetto",
    "Batman 87th Anniversary è un progetto accademico di Alessandro Bottone. Racconta una statua da collezione attraverso una missione nella Batcaverna. Non è un negozio e non è affiliato commercialmente ai marchi rappresentati.",
  ],
  privacy: [
    "Dati della demo",
    "Il form è una simulazione locale: i dati non vengono inviati, salvati in storage o utilizzati per creare ordini. Usa soltanto dati fittizi. Il servizio di hosting può trattare i normali dati tecnici delle richieste secondo le proprie condizioni. Questo progetto non integra strumenti di analytics o marketing.",
  ],
  acquisto: [
    "Acquisto e assistenza",
    "Prezzi, spedizione e premio speedrun sono dimostrativi. Non avvengono addebiti, vendite o spedizioni; non sono disponibili resi o chat commerciale.",
  ],
};
export default function Footer() {
  const [open, setOpen] = useState<keyof typeof INFO | null>(null);
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">BATMAN / ANNIVERSARY EXPERIENCE</p>
        <p>
          Una leggenda. Un’esperienza.
          <br />
          Progetto accademico di Alessandro Bottone.
        </p>
      </div>
      <div className="footer-links">
        {Object.entries(INFO).map(([key, [title]]) => (
          <button
            key={key}
            className="text-button"
            aria-expanded={open === key}
            onClick={() =>
              setOpen(open === key ? null : (key as keyof typeof INFO))
            }
          >
            {title}
          </button>
        ))}
      </div>
      {open && (
        <section className="footer-info" aria-live="polite">
          <h2>{INFO[open][0]}</h2>
          <p>{INFO[open][1]}</p>
        </section>
      )}
      <p className="caption">2026 · Demo interattiva · Nessuna vendita reale</p>
    </footer>
  );
}
