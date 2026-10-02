/*
 * Service worker de josejordan.dev: permite instalar la web y usarla sin conexión.
 *
 * Estrategia: primero la red y, si falla, la copia guardada. Así cada despliegue
 * se ve al momento (nunca se mezcla HTML nuevo con JS viejo) y sin conexión
 * sigue funcionando todo lo que ya se haya visitado o esté en PRECACHE.
 * Las peticiones a la red se hacen con cache: 'no-cache': el navegador siempre
 * pregunta al servidor (con ETag, así que una respuesta 304 cuesta casi nada)
 * en vez de reutilizar por su cuenta una copia antigua de su caché HTTP.
 * Sube VERSION si cambias la lista PRECACHE o este fichero.
 */
const VERSION = 'v2';
const CACHE = 'josejordan-' + VERSION;
const PRECACHE = [
    '/',
    '/en/',
    '/styles.css',
    '/lang.js',
    '/content.js',
    '/script.js',
    '/minesweeper.js',
    '/fonts/JetBrainsMono-var.woff2',
    '/favicon.svg',
    '/icon-192.png',
    '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'no-cache' }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key.startsWith('josejordan-') && key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
    event.respondWith(networkFirst(request, url));
});

async function networkFirst(request, url) {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request, { cache: 'no-cache' });
        // Las redirecciones no se guardan: servirlas desde aquí rompe la navegación
        if (response.ok && response.type === 'basic' && !response.redirected) cache.put(request, response.clone());
        return response;
    } catch (error) {
        const navigation = request.mode === 'navigate';
        const cached = await cache.match(request, { ignoreSearch: navigation });
        if (cached) return cached;
        if (navigation) {
            const home = await cache.match(url.pathname.startsWith('/en') ? '/en/' : '/');
            if (home) return home;
        }
        return Response.error();
    }
}
