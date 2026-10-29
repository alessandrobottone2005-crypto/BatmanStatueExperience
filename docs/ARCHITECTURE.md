# Architettura corrente

Il gate desktop viene valutato prima di montare `Experience`. I dispositivi touch/mobile ricevono solo l’avviso. Le finestre desktop strette restano utilizzabili per non bloccare lo zoom.

Il reducer `src/lib/experience.ts` definisce fasi, stato della missione, progresso, premio e ordine simulato. Solo `purchase` da checkout con quantità/totale validi può creare una conferma. Nessuna scorciatoia di sviluppo salta le fasi in produzione.

Il timer usa `performance.now`, compensando pausa, caricamento e transizioni. Gli effect cancellano gli intervalli e i callback quando il relativo componente viene abbandonato. Il checkout annulla il timeout all’unmount e protegge l’invio duplicato.

Il routing usa hash per intro, statua, checkout e conferma. Le aree di gioco sono stato effimero: il refresh le resetta. Il back del browser segue le schermate principali; nessun dato del form passa nell’URL o nello storage.

Le sezioni pesanti sono importate in modo asincrono. Three.js non è parte del bundle iniziale. Il renderer WebGL è preceduto da una verifica di capacità, gestisce la perdita del contesto e offre uscita verso il prodotto; un ErrorBoundary copre gli errori React.

La build è Vite a moduli, minificata. `dist` non è una fonte da modificare né un output versionato. Le versioni storiche dei documenti sono in `history`.
