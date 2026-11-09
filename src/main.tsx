import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { onLocalChange, reload } from './lib/store';
import { scheduleSync, syncNow } from './lib/sync';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void reload().then(() => {
  onLocalChange(() => scheduleSync());
  void syncNow();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void syncNow();
});
window.addEventListener('online', () => void syncNow());
