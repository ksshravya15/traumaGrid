# TraumaGrid Frontend (Mobile PWA & Command Center)

Modern React 18 + Vite + Tailwind CSS application featuring:
- **Mobile-First Bystander PWA**: Scene safety survey, camera capture, edge AI injury assessment, contactless rPPG pulse estimation, START/RTS triage, micro-telemetry packet generation.
- **Responder Command Dashboard (`/dashboard`)**: Real-time WebSocket incident dispatch, tactical OpenStreetMap/Leaflet visualization, CAD response actions.
- **Offline & 2G Simulation**: LocalStorage incident queue, Service Worker PWA caching, and auto-sync.

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

The application runs on `http://localhost:5173`.
Proxy is configured in `vite.config.js` to route `/api` and `/ws` to `http://localhost:8000`.

## Production Build

```bash
npm run build
```
Outputs static assets into `dist/`.
