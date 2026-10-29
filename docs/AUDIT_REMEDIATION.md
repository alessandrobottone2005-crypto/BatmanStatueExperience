# Audit — registro di correzione

29 ottobre 2026. Riferimento: audit della revisione `3df7920`, 33 rilievi. Il checkout resta una demo locale; il mobile è escluso per scelta dell’autore. Questo registro descrive gli interventi; il riepilogo di esecuzione dei controlli sarà aggiornato prima del rilascio.

| ID | Intervento | Evidenza prevista |
|---|---|---|
| F01 | Rimosse scorciatoie di salto fase, conferma protetta dal reducer | Unit test e frecce nel checkout |
| F02 | Gate mobile prima del mount, nessun accesso all’esperienza | Viewport portrait/landscape e rete |
| F03 | Uscita da sconfitta verso statua con stato idle | Timeout, uscita e attesa |
| F04 | Tre JPG estratti dagli MP4 e fallback con errore gestito | MP4 bloccati, missione completabile |
| F05 | Visuale a frecce, indizi accessibili, dialogo risposte | Missione da tastiera e focus |
| F06 | Eliminato preload integrale MP4, prossima area preparata con poster | Rete iniziale senza MP4/WAV |
| F07 | Skip intro definitivo e timeout cancellato | Attesa dopo skip |
| F08 | Pausa di timer, briefing, video, hint e audio | Test pausa e tempo |
| F09 | Target hint reattivo e accumulo del tempo corretto | Clock browser oltre 60 secondi |
| F10 | Politica audio comune a musica, clip e beep | Controllo delle sorgenti attive |
| F11 | Render al caricamento del frame, primo canvas dipinto senza scroll | Lettura pixel canvas |
| F12 | Moduli, minificazione e chunk lazy | Build e rete iniziale |
| F13 | Sei richieste massime, cache di 48 frame e conteggio errori separato | Sorgente, frame bloccati e caricamento |
| F14 | Tutorial e vittoria nel flusso scrollabile, spazio navbar | Finestre basse e zoom equivalente |
| F15 | Solo avviso desktop sui dispositivi esclusi | Smartphone e tablet, entrambe le orientazioni |
| F16 | Token testuali leggibili e timer viola chiaro | Axe e coppie colore |
| F17 | Panorami statici, galleria e transizioni manuali in reduced motion | Browser con media reduce |
| F18 | Label associate, nomi dei controlli, un solo main | Axe e DOM |
| F19 | Focus visibile condiviso, diverso dai bordi decorativi | Tastiera e CSS |
| F20 | Form semantico, normalizzazione e validazione per campo | Unit test e dati errati browser |
| F21 | Timeout cancellato all’uscita, invio duplicato bloccato | Annullamento durante elaborazione |
| F22 | Avvisi demo, esito simulato, eliminate garanzie operative false | Schermate e assenza POST |
| F23 | Informazioni demo funzionanti, eliminate azioni commerciali finte | Apertura contenuti footer |
| F24 | Dipendenze inutili rimosse e aggiornamenti mirati | npm audit |
| F25 | Unit test, lint separato, Playwright e workflow qualità | Comandi e CI |
| F26 | Documentazione corrente riscritta, precedenti in history | README e docs |
| F27 | Premio validato contro unlock della sessione | Test promo bloccato/sbloccato |
| F28 | Reset al refresh dichiarato; hash prodotto e cronologia | Refresh e navigazione |
| F29 | Description, canonical e metadati social | HTML build |
| F30 | Script root-relative, pipeline obsolete ritirate | Script e relativa documentazione |
| F31 | dist ignorata, componenti/stili inutilizzati rimossi, token comuni | Git, build e CSS |
| F32 | Clipboard attesa, fallback manuale su errore | Rifiuto clipboard simulato |
| F33 | Preflight WebGL, errore/perdita contesto e uscita alternativa | Contesto negato nel browser |

## Limiti

La suite non certifica WCAG, sicurezza del servizio o prestazioni su ogni GPU/dispositivo. Il blocco mobile è una politica client basata su puntatore e segnali dispositivo, non una misura di sicurezza. Le prove di guasto sono simulate e le viewport equivalenti allo zoom non sostituiscono una prova manuale con tutte le tecnologie assistive. Il chunk Three.js resta significativo ma viene caricato soltanto entrando nella missione.
