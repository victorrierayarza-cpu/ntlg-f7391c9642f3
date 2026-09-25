/* ============================================================
   Service Worker de La Inteligencia.
   Permite abrir la app sin conexión (guarda una copia), pero
   CUANDO HAY INTERNET siempre intenta traer lo más reciente.
   Al cambiar el diseño, sube VERSION y el ?v= de los archivos.
   ============================================================ */

const VERSION = 'inteligencia-v2';

// Archivos base de la app (el "esqueleto"), para poder abrir sin conexión.
const BASICOS = [
  './',
  './index.html',
  './hemeroteca.html',
  './assets/css/estilo.css?v=4',
  './assets/js/app.js?v=4',
  './manifest.webmanifest',
  './assets/iconos/icono-192.png',
  './assets/iconos/icono-512.png',
  './assets/fotos/_marcador.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // Borra caches de versiones anteriores.
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

  // 1) Datos (JSON) y 2) navegación (abrir una página): PRIMERO RED.
  //    Así ves siempre la última edición cuando hay internet;
  //    si no hay, se usa la copia guardada.
  const esDatos = url.pathname.includes('/data/');
  const esNavegacion = req.mode === 'navigate';
  if (esDatos || esNavegacion) {
    e.respondWith(
      fetch(req).then((res) => {
        const copia = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copia));
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // 3) Resto (CSS, JS, imágenes): primero la copia guardada (rápido),
  //    y si no está, la red. Como llevan ?v=, al cambiar el número se piden de nuevo.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copia = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copia));
      return res;
    }))
  );
});
