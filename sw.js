/* ============================================================
   Service Worker de La Inteligencia.
   Permite que la app abra aunque no haya conexión, guardando
   una copia de los archivos. Cuando publiquemos una edicion nueva,
   sube el numero de VERSION para que se refresque la cache.
   ============================================================ */

const VERSION = 'inteligencia-v1';

// Archivos base de la app (el "esqueleto").
const BASICOS = [
  './',
  './index.html',
  './hemeroteca.html',
  './assets/css/estilo.css',
  './assets/js/app.js',
  './manifest.webmanifest',
  './assets/iconos/icono-192.png',
  './assets/iconos/icono-512.png',
  './assets/fotos/_marcador.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // Borra caches viejas de versiones anteriores.
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Datos (JSON): primero red, y si falla, la copia guardada.
  // Asi ves siempre la edicion mas reciente cuando hay internet.
  if (url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(req).then((res) => {
        const copia = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copia));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Resto: primero la copia guardada (rapido), y si no, la red.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copia = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copia));
      return res;
    }))
  );
});
