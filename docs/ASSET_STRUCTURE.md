# Asset correnti

- `public/assets/showreel/0001.webp` … `0800.webp`: 800 frame 1536×864 della sequenza statua, conservati integralmente.
- `public/assets/textures`: tre MP4 panoramici e relativi JPG di fallback. Rigenerazione: `node scripts/extract-frame.mjs` con FFmpeg installato.
- `public/assets/videos`: i due filmati di passaggio tra aree.
- `public/assets/audio`: musica e risata del Joker.
- `public/assets/images` e immagini alla root di `public`: carte, schermate e loghi.

Nessun preload integrale iniziale dei cinque MP4. Lo showreel prioritizza il frame richiesto e quelli vicini, massimo sei richieste concorrenti e cache di 48 immagini caricate. Il primo frame viene dipinto al caricamento; gli errori non incrementano successi. Nel movimento ridotto vengono richieste le sole viste selezionate.

Gli asset sorgente vivono in `public`; la copia generata in `dist` è ignorata da Git. Gli screenshot storici negli asset non sono una prova della versione corrente.
