# Ozymandias Website

This folder contains a minimal static marketing site with a download link to the locally-built APK.


How to preview locally:

1. From the repository root, run a simple static server so the APK path is available. Examples:

```powershell
# Python 3 (serve repo root)
python -m http.server 8000

# or using Node (serve repo root)
npx http-server -p 8000
```

2. Open http://localhost:8000/website/

Notes:
- The download link points to `/app/build/outputs/apk/debug/app-debug.apk` — ensure that file exists (it does after a successful build).
- For production payments, integrate a server-side payment provider (Stripe, PayPal). This site includes a placeholder button only.
