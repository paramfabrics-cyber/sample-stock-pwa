# Sample Stock System — PWA

Internal inventory management system for TL and Swatches departments.  
**Progressive Web App** — installable, offline-capable, mobile-first.

---

## 🚀 Deploy to Vercel (3 steps)

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel          # follow prompts, done
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo — Vercel auto-detects Vite → click **Deploy**

> ⚡ Vercel automatically serves HTTPS, which is **required** for camera/QR scanning on iOS Safari.

---

## 🛠 Local Development

```bash
npm install
npm run dev        # http://localhost:5173
```

> **Camera on localhost**: Chrome allows `getUserMedia` on `localhost` without HTTPS.  
> Safari on iOS requires HTTPS even for localhost — use a tunnel (e.g. `ngrok`) or deploy to Vercel.

### Local HTTPS (optional)
```bash
npm install -D @vitejs/plugin-basic-ssl
```
Then in `vite.config.js`, uncomment the `server.https: true` block.

---

## 📱 PWA Features

| Feature | Details |
|---|---|
| **Install** | "Add to Home Screen" prompt on Android/Chrome; manual on iOS Safari |
| **Offline** | App shell cached by Service Worker; works without network |
| **Standalone** | Full-screen mode, no browser chrome |
| **QR Camera** | jsQR via canvas — works on Chrome, Firefox, Safari (HTTPS required) |
| **iOS safe areas** | Notch/home-bar respected via `env(safe-area-inset-*)` |
| **SW Updates** | In-app "Update available" banner with one-click reload |

---

## 🔐 Demo Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Full access |
| `staff` | `staff123` | Add & Dispatch |
| `accountant` | `acc123` | View only |

---

## 📁 Project Structure

```
stock-pwa/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/
│       ├── icon-192.png       # PWA icon
│       ├── icon-512.png       # PWA icon (large)
│       └── apple-touch-icon.png
├── src/
│   ├── main.jsx               # React entry
│   └── App.jsx                # Full application
├── index.html                 # HTML shell with all meta tags
├── vite.config.js             # Vite config
├── vercel.json                # Vercel deployment + headers
└── package.json
```

---

## 🍎 iOS Safari Camera Notes

Safari on iOS requires:
1. **HTTPS** — camera API blocked on plain HTTP
2. **User permission** — prompted on first use
3. If denied: Settings → Safari → Camera → Allow for your domain

The app handles all three cases with clear in-app guidance.

---

## 🏗 Tech Stack

- **React 18** — UI framework
- **Vite 5** — build tool
- **jsQR** — QR decoding (CDN, loaded on demand)
- **Service Worker** — cache-first offline strategy
- **Vercel** — hosting + HTTPS + edge CDN
