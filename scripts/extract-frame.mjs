import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['BatCaverna_Batcomputer360','BatCaverna_Armeria360','BatCaverna_BatMobile360']) {
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','1','-i',resolve(root,'public/assets/textures',name+'.mp4'),'-frames:v','1','-q:v','3',resolve(root,'public/assets/textures',name+'.jpg')],{stdio:'inherit'});
}
console.log('Tre fallback JPG aggiornati dagli MP4 correnti.');
