import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootEl);

window.addEventListener('error', (event) => {
  rootEl.innerHTML = `
    <div style="padding:16px;font-family:system-ui;background:#fff;color:#111;white-space:pre-wrap">
      <h2 style="margin:0 0 12px 0">Frontend error</h2>
      <div><strong>Message:</strong> ${String((event as ErrorEvent).error?.message || event.message || 'Unknown error')}</div>
      <div style="margin-top:8px"><strong>File:</strong> ${String((event as ErrorEvent).filename || '')}</div>
      <div><strong>Line:</strong> ${String((event as ErrorEvent).lineno || '')}:${String((event as ErrorEvent).colno || '')}</div>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = (event as PromiseRejectionEvent).reason;
  rootEl.innerHTML = `
    <div style="padding:16px;font-family:system-ui;background:#fff;color:#111;white-space:pre-wrap">
      <h2 style="margin:0 0 12px 0">Unhandled promise rejection</h2>
      <div>${String(reason?.message || reason || 'Unknown rejection')}</div>
    </div>
  `;
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
