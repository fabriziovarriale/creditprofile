# Emergency Fix: Se worker version mismatch persiste

## Se dopo il redeploy vedi ancora l'errore

L'errore potrebbe essere causato da un problema con il bundler di Vite che non aggiorna correttamente il worker path.

### Fix Alternativo: Usa worker locale invece di CDN

**File**: `src/services/pdfExtractionService.ts`

```typescript
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { supabase } from '@/lib/supabaseClient';
// IMPORTA IL WORKER DIRETTAMENTE
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Usa il worker importato invece del CDN
if (typeof GlobalWorkerOptions !== 'undefined') {
  GlobalWorkerOptions.workerSrc = pdfjsWorker;
}
```

Questo forza Vite a bundlare il worker con la versione corretta.

### Fix Alternativo 2: Downgrade a pdfjs-dist v3.11.174

Se il fix sopra non funziona:

```bash
npm install pdfjs-dist@3.11.174
```

E riporta il worker URL alla versione vecchia:
```typescript
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
```

Questo risolverà il version mismatch tornando alla versione stabile.

