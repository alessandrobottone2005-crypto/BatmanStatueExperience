# Sistema visivo corrente

L’implementazione usa Space Grotesk con fallback di sistema, fondo quasi nero e palette oro/viola. La direzione è cinematica e editoriale: titoli ampi, composizioni a due colonne, superfici scure, controlli chiari e spaziature generose. Non è stato importato un sistema Atomic Design da Figma; le precedenti affermazioni sono conservate come storia.

I token in `src/index.css` sono la fonte condivisa: oro `#FFD700`, testo viola `#C8A1FF`, testo principale `#F4F2ED`, testo secondario `#B6B6C2`, superficie `#101014`. Il viola scuro può essere decorativo, ma non è usato come testo informativo su nero. Le coppie effettive vanno controllate anche con axe e ispezione visiva.

Bottoni principali almeno 48px, controlli icona 44px. Focus bianco con offset e contorno viola, distinto dal bordo decorativo. `FormInput` associa label e input e annuncia gli errori. La carta enigma è un dialogo con focus contenuto ed Esc; la pausa rende inerti i contenuti sottostanti.

Tutorial, vittoria, checkout e conferma scorrono quando l’altezza disponibile non basta. Le finestre desktop strette hanno layout a colonna; non viene attivato un blocco mobile soltanto in base alla larghezza.

La preferenza di movimento ridotto elimina transizioni decorative, usa immagini statiche per i panorami e una galleria della statua. La sequenza normale conserva 800 frame, con cache limitata e rendering del primo frame all’arrivo.
