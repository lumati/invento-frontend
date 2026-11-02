import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import { KaiadminThemeProvider } from '@/theme';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container "#root" is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <KaiadminThemeProvider>
      <App />
    </KaiadminThemeProvider>
  </StrictMode>,
);
