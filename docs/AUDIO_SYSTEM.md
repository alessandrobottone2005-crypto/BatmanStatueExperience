# Audio corrente

`src/lib/audioManager.ts` centralizza musica, clip e beep con una sola politica di mute e pausa. Nessun Audio o AudioContext viene creato al semplice ingresso sul sito o nell’avviso mobile. L’avvio richiede un’interazione dell’utente e gestisce il rifiuto di autoplay senza bloccare l’esperienza.

La musica usa un elemento HTMLAudio condiviso. Le clip sono registrate per applicare immediatamente mute e pausa alle sorgenti già attive; i beep usano un AudioContext e un gain principale condivisi. Sorgenti e connessioni terminano al completamento; all’uscita dall’esperienza si fermano clip, musica e contesto.

La risata periodica viene cancellata all’abbandono della scena. La risata conserva rallentamento, filtro passa basso, posizione stereo casuale ed eco, collegati al gain principale comune. Il grafo viene disconnesso a fine riproduzione.
