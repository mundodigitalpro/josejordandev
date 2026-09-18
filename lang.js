/*
 * Se carga en <head> sin defer para redirigir antes de pintar la página.
 *
 * Regla: en las portadas (/ y /en/) el sitio se abre en el idioma elegido con
 * el selector o con "lang"; si no hay elección guardada, en el primer idioma
 * del navegador que sea español o inglés (inglés si no hay ninguno de los dos).
 * Los rastreadores no se redirigen: cada versión se indexa en su URL.
 */
(function () {
    var current = document.documentElement.lang === 'en' ? 'en' : 'es';
    var path = location.pathname;
    if (path !== '/' && path !== '/en/' && path !== '/en') return;
    if (/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegrambot|discordbot/i.test(navigator.userAgent)) return;

    var preferred = null;
    try { preferred = localStorage.getItem('lang'); } catch (error) { /* sin almacenamiento local */ }

    if (preferred !== 'en' && preferred !== 'es') {
        var codes = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
        preferred = 'en';
        for (var i = 0; i < codes.length; i++) {
            if (/^es/i.test(codes[i])) { preferred = 'es'; break; }
            if (/^en/i.test(codes[i])) { preferred = 'en'; break; }
        }
    }

    if (preferred !== current) {
        location.replace((preferred === 'en' ? '/en/' : '/') + location.search + location.hash);
    }
})();
