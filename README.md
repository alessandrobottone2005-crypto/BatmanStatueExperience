# Batman 87th Anniversary

Esperienza accademica desktop di Alessandro Bottone: esplorazione della Batcaverna, cinque enigmi del Joker e presentazione cinematica di una statua da collezione. **Non è un negozio:** il checkout è una simulazione locale; usare soltanto dati fittizi.

## Avvio riproducibile

Richiede Node.js 22.12+ oppure 24 e npm. Vercel usa Node 24.

```sh
npm ci
npm run dev
```

Per controllare la build pubblicabile:

```sh
npm run check
npm run preview
```

Aprire l’URL HTTP mostrato dal comando. `file://` non è supportato: Vite produce moduli e chunk. Gli script usano percorsi relativi espliciti per funzionare anche quando la directory del progetto contiene `:`.

## Verifiche

```sh
npm run typecheck
npm run lint
npm test
./node_modules/.bin/playwright install chromium firefox webkit
npm run test:e2e
npm audit
```

Playwright verifica Chromium, Firefox e WebKit; salva screenshot/tracce dei fallimenti in `test-results` e report HTML in `playwright-report`. Per una preview ospitata: `BASE_URL=https://deployment.vercel.app npm run test:e2e`. Non usare dati personali durante le prove. La suite automatica non è una certificazione WCAG né una prova su tutti i dispositivi reali.

## Percorso e regole

- Smartphone e tablet touch: solo avviso desktop, senza avviare audio, video o frame.
- Desktop: intro → tutorial → Batcomputer (2 indizi) → Armeria (1) → Batmobile (2) → vittoria → statua → checkout demo → esito locale.
- Mouse ai bordi o frecce per la visuale; Tab e Invio per gli indizi e le risposte; Esc chiude la carta o mette in pausa l’esplorazione.
- 180 secondi di missione; pausa, caricamento e transizioni video non consumano tempo.
- Primi due indizi entro 45 secondi: +60 secondi. Missione sotto 90 secondi: `SPEEDRUN15`, valido soltanto nella sessione che lo ha sbloccato.
- Dopo 60 secondi di ricerca senza una carta aperta, l’hint si attiva; aumenta a 80 e 100 secondi.
- Un refresh durante la missione ricomincia dall’intro. Nessun progresso o dato del form è persistito.
- `/#statua` e `/#checkout` aprono le schermate corrispondenti. `/#conferma` richiede un esito valido nella sessione corrente; altrimenti torna alla statua.
- `prefers-reduced-motion` usa panorami statici, transizioni manuali e una galleria selezionabile della statua.

## Struttura e asset

React + TypeScript, Vite, Three.js/React Three Fiber per le panoramiche. `src/lib/experience.ts` contiene le transizioni ammesse; `src/lib/checkout.ts` validazione, prezzi demo e premio. Token e componenti visivi sono definiti nell’implementazione corrente: non esiste una cartella `src/design-system` importata da Figma.

`public` è la fonte degli asset: 800 WebP numerati 0001–0800 (1536×864), tre MP4 panoramici, due MP4 di transizione, tre fallback JPG estratti dai panorami e file audio. Il renderer dello showreel usa massimo sei richieste concorrenti e conserva al massimo 48 immagini caricate, oltre alle richieste in corso. Gli errori non contano come caricamenti riusciti. I cinque MP4 non vengono scaricati integralmente all’apertura.

## Pubblicazione

Repository: https://github.com/alessandrobottone2005-crypto/BatmanStatueExperience

Sito: https://batman-87th-anniversary.vercel.app

`dist` è generata e ignorata da Git. Vercel esegue `npm ci` e `npm run build`, pubblicando `dist`. Le pubblicazioni automatiche di `main` e del vecchio `preview/draft-review` sono disattivate nella configurazione del repository per consentire il rilascio controllato: preview del branch → test → merge → produzione senza assegnazione dominio → verifiche → promozione. Prima di rilasciare verificare account, progetto, commit e deployment precedente per rollback.

## Documentazione

- [Architettura](docs/ARCHITECTURE.md)
- [Sistema visivo](docs/DESIGN_SYSTEM.md)
- [Gameplay](docs/GAMEPLAY_SYSTEMS.md)
- [Asset](docs/ASSET_STRUCTURE.md)
- [Strumenti](scripts/README.md)
- [Stato audit](docs/AUDIT_REMEDIATION.md)

I documenti in `docs/history` conservano le specifiche precedenti: non descrivono il funzionamento corrente. La fedeltà al file Figma originale non è certificata da questa revisione. I marchi e i personaggi rappresentati appartengono ai rispettivi titolari; il progetto ha finalità accademiche e non implica affiliazione commerciale.
