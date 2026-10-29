# Strumenti supportati

- `open-site.command`: avvia la build locale via HTTP, risolvendo la root dal percorso dello script. Non aprire `dist/index.html` tramite `file://`: la build usa moduli e chunk.
- `extract-frame.mjs`: rigenera i tre JPG delle panoramiche dagli MP4 attuali; richiede FFmpeg disponibile nel PATH.
- `test-app.js`: inoltra alla suite Playwright corrente; preferire `npm run test:e2e`.
- `design-audit.cjs`: controllo euristico storico; i risultati richiedono verifica manuale e non certificano conformità.
- `push.sh`: utility storica di pubblicazione Git; il rilascio verificato è descritto nel README.

Gli script legati alla vecchia pipeline PNG, al vecchio checkout e alle riscritture automatiche dei CSS sono stati ritirati. Le versioni originali rimangono nella storia Git.

Le vecchie conversioni `convert_360_hq.sh`, `convert_batcaverna.sh` e `convert_batcaverna_hq.sh` sono archiviate in `docs/history/scripts`, con il relativo avviso di ritiro. Non vengono incluse nel pacchetto Vercel.
