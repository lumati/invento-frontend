import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { KaiadminThemeProvider } from '@/theme';

import App from './App';

function renderApp(): string {
  return renderToStaticMarkup(
    <KaiadminThemeProvider>
      <App />
    </KaiadminThemeProvider>,
  );
}

describe('App placeholder', () => {
  it('mounts inside the Kaiadmin theme provider', () => {
    const markup = renderApp();
    expect(markup).toContain('Invento Admin');
    expect(markup).toContain('Scaffold ready');
  });

  it('paints the canvas background and Public Sans body font through CssBaseline', () => {
    const markup = renderApp();
    expect(markup).toContain('#F5F7FD');
    expect(markup).toContain('Public Sans');
  });
});
