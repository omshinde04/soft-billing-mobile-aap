const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../dist");
const publicDir = path.resolve(__dirname, "../public");
const assetsDir = path.resolve(__dirname, "../assets");
const distAssetsDir = path.join(distDir, "assets");

if (!fs.existsSync(distDir)) {
  console.error("dist directory does not exist!");
  process.exit(1);
}

if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

// 1. Copy manifest.json & sw.js
fs.copyFileSync(path.join(publicDir, "manifest.json"), path.join(distDir, "manifest.json"));
fs.copyFileSync(path.join(publicDir, "sw.js"), path.join(distDir, "sw.js"));

// 2. Copy PWA icons
if (fs.existsSync(path.join(assetsDir, "icon-192.png"))) {
  fs.copyFileSync(path.join(assetsDir, "icon-192.png"), path.join(distAssetsDir, "icon-192.png"));
}
if (fs.existsSync(path.join(assetsDir, "icon-512.png"))) {
  fs.copyFileSync(path.join(assetsDir, "icon-512.png"), path.join(distAssetsDir, "icon-512.png"));
}

// 3. Enhance dist/index.html with full PWA meta & Service Worker registration
const indexPath = path.join(distDir, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const pwaHeadTags = `
    <title>GaavBilling - गाव बिलिंग | Smart FMCG Distribution</title>
    <meta name="description" content="GaavBilling - Production-grade offline FMCG Sales & Order Distribution System. Developed by Om Vilas Shinde." />
    <meta name="theme-color" content="#1B4332" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="GaavBilling" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/icon-192.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/assets/icon-512.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
      body { background-color: #0D2018; margin: 0; padding: 0; }
    </style>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
            .then(function(reg) {
              console.log('[GaavBilling PWA] Service Worker registered active with scope:', reg.scope);
            })
            .catch(function(err) {
              console.warn('[GaavBilling PWA] SW registration failed:', err);
            });
        });
      }
    </script>
`;

html = html.replace("<title>GaavBilling</title>", pwaHeadTags);
fs.writeFileSync(indexPath, html);
console.log("✓ GaavBilling PWA successfully compiled with Service Worker, manifest, and icons!");
