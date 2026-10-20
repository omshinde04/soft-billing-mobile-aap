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

// 1. Copy manifest.json
fs.copyFileSync(path.join(publicDir, "manifest.json"), path.join(distDir, "manifest.json"));

// 2. Copy PWA icons
if (fs.existsSync(path.join(assetsDir, "icon-192.png"))) {
  fs.copyFileSync(path.join(assetsDir, "icon-192.png"), path.join(distAssetsDir, "icon-192.png"));
}
if (fs.existsSync(path.join(assetsDir, "icon-512.png"))) {
  fs.copyFileSync(path.join(assetsDir, "icon-512.png"), path.join(distAssetsDir, "icon-512.png"));
}

// 3. Scan dist directory for all static files to pre-cache
function getFiles(dir, base = "") {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relPath = path.join(base, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      results.push("/" + relPath.replace(/\\/g, "/"));
    }
  });
  return results;
}

const allDistFiles = getFiles(distDir).filter(
  (f) => !f.endsWith("sw.js") && !f.endsWith("metadata.json")
);

// Ensure root and index.html are present
const precacheList = Array.from(new Set(["/", "/index.html", "/manifest.json", ...allDistFiles]));
const buildVersion = "gaavbilling-v" + Date.now();

console.log("Pre-caching " + precacheList.length + " assets for 100% offline usage:", precacheList);

// 4. Generate Production-Grade sw.js with full offline pre-cache
const swContent = `
const CACHE_NAME = "${buildVersion}";
const STATIC_ASSETS = ${JSON.stringify(precacheList, null, 2)};

// Install: Pre-cache every single file in the app bundle
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[GaavBilling SW] Pre-caching all app files...");
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(new Request(asset, { cache: "reload" }));
        } catch (err) {
          console.warn("[GaavBilling SW] Could not pre-cache: " + asset, err);
        }
      }
      console.log("[GaavBilling SW] Pre-cache complete!");
    })
  );
});

// Activate: Immediately claim control and clean up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[GaavBilling SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log("[GaavBilling SW] Claiming clients for instant offline control");
      return self.clients.claim();
    })
  );
});

// Fetch: Bulletproof offline interceptor
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET and cloud sync endpoints (Firestore handles its own offline cache)
  if (req.method !== "GET" || url.origin.includes("firestore.googleapis.com") || url.origin.includes("firebase")) {
    return;
  }

  // A. Navigation requests (Opening the app, entering URL, or refreshing)
  if (req.mode === "navigate" || (req.headers.get("accept") && req.headers.get("accept").includes("text/html"))) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", clone));
          }
          return networkRes;
        })
        .catch(async () => {
          // Device is OFFLINE: Return cached index.html
          console.log("[GaavBilling SW] Offline navigation: returning cached index.html");
          const cachedIndex = await caches.match("/index.html");
          if (cachedIndex) return cachedIndex;
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          return new Response("<h1>GaavBilling Offline</h1><p>Please open once with network.</p>", {
            headers: { "Content-Type": "text/html" }
          });
        })
    );
    return;
  }

  // B. Static Assets (JS bundles, images, icons, fonts)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cachedRes) => {
      if (cachedRes) {
        // Return instantly from cache!
        return cachedRes;
      }

      // If not in cache, fetch from network and store
      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          // If offline and request is for a script or html, fallback to index
          if (req.destination === "document") {
            return caches.match("/index.html");
          }
          return new Response("", { status: 408, statusText: "Offline" });
        });
    })
  );
});
`;

fs.writeFileSync(path.join(distDir, "sw.js"), swContent);

// 5. Enhance dist/index.html with immediate SW registration & offline banner
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
      #offline-toast {
        display: none;
        position: fixed;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #1B4332;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 800;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid #40916C;
        letter-spacing: 0.3px;
      }
    </style>
    <script>
      // Immediate Service Worker Registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(function(reg) {
            console.log('[GaavBilling PWA] Service Worker registered active with scope:', reg.scope);
            if (reg.active) {
              showOfflineReadyToast();
            }
            reg.onupdatefound = function() {
              var installing = reg.installing;
              installing.onstatechange = function() {
                if (installing.state === 'installed') {
                  showOfflineReadyToast();
                }
              };
            };
          })
          .catch(function(err) {
            console.warn('[GaavBilling PWA] SW registration failed:', err);
          });

        navigator.serviceWorker.ready.then(function() {
          showOfflineReadyToast();
        });
      }

      function showOfflineReadyToast() {
        try {
          var toast = document.getElementById('offline-toast');
          if (toast && !sessionStorage.getItem('offline_notified')) {
            toast.style.display = 'block';
            sessionStorage.setItem('offline_notified', '1');
            setTimeout(function() { toast.style.display = 'none'; }, 3000);
          }
        } catch(e) {}
      }
    </script>
`;

html = html.replace("<title>GaavBilling</title>", pwaHeadTags);
if (!html.includes('id="offline-toast"')) {
  html = html.replace("<body>", '<body><div id="offline-toast">✓ ऑफलाइन वापरण्यासाठी तयार (Offline Ready)</div>');
}

fs.writeFileSync(indexPath, html);
console.log("✓ Production-Grade PWA successfully configured for 100% offline execution!");
