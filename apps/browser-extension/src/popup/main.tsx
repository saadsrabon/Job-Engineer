import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function Popup() {
  return (
    <div style={{ width: 320, padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>JobOS</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginTop: 8 }}>
        Browser assistant coming in Phase 3 — job capture and auto-fill.
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
