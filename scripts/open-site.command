#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f dist/index.html ]; then npm run build; fi
open http://localhost:4173
npm run preview -- --port 4173 --strictPort
