---
title: El service worker que casi me la lía
description: Añadí una ventana nueva a mi web, los tests pasaban y en mi navegador el icono no hacía nada. La culpa era de la caché, y la solución, una línea.
date: 2026-10-02
lang: es
tags: [pwa, service-worker, cache, javascript, depuracion]
translation: the-service-worker-that-almost-got-me
---

Hace poco añadí a esta web una ventana nueva, **Notas**, la que lista las entradas de este blog. Tenía su icono en el escritorio, su botón en el dock y su comando en la terminal. Los tests pasaban en local y en GitHub Actions. Lo publiqué, abrí la web en mi navegador, pulsé el icono… y no pasó nada.

Ni un error en pantalla. Simplemente, nada.

## El síntoma

El icono **estaba**: lo veía en el escritorio. Pero al pulsarlo la ventana no se abría. En un navegador limpio, en cambio, funcionaba perfectamente.

Esa combinación ya es una pista: si el HTML nuevo está ahí pero el comportamiento nuevo no, lo más probable es que **el navegador esté mezclando versiones**. HTML de hoy con JavaScript de ayer.

Y eso es justo lo que pasaba. El `index.html` nuevo traía el icono, pero mi navegador seguía ejecutando un `script.js` antiguo que no sabía nada de ninguna ventana Notas. El código buscaba la ventana, no la encontraba y no hacía nada. Silencio total.

## "Pero si mi service worker pide primero a la red…"

Esta web es una PWA y tiene un *service worker* precisamente para que funcione sin conexión. Cuando lo escribí elegí la estrategia **network-first**: para cada petición, primero se intenta la red y solo si falla se usa la copia guardada. La idea era evitar exactamente este problema: que cada despliegue se viera al momento y nunca se mezclaran versiones.

El código era más o menos este:

```js
async function networkFirst(request) {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        return cache.match(request);
    }
}
```

Parece impecable. El problema está en una palabra: `fetch(request)` **no significa "ve al servidor"**. Significa "consigue este recurso", y el navegador tiene su propia caché HTTP a la que puede recurrir antes de salir a la red.

## La caché heurística

Cuando una respuesta trae una cabecera `Cache-Control` clara, el navegador obedece. Pero cuando no dice nada sobre cuánto tiempo se puede guardar, el estándar HTTP permite que el navegador **decida por su cuenta**. Es lo que se llama *caché heurística*: si el fichero lleva una fecha de última modificación, el navegador puede considerarlo válido durante una fracción del tiempo que lleva sin cambiar, típicamente un 10 %.

Un `script.js` que no cambia en un mes puede darse por bueno durante unos tres días sin preguntar a nadie.

En mi fichero `_headers`, el que le dice a Cloudflare qué cabeceras enviar, había reglas para las imágenes y las fuentes, pero **ninguna para los scripts**. El service worker hacía `fetch(request)`, el navegador consultaba su caché HTTP, veía una copia "todavía válida" según su heurística y la devolvía sin llegar a preguntar al servidor. El network-first nunca llegaba a la red.

## Reproducirlo (y tropezar por el camino)

Antes de arreglar nada quería ver el fallo en una prueba. Monté un servidor local que servía `script.js` sin `Cache-Control` y con una fecha de modificación antigua, y le añadía al final una marca de versión: `A` en la primera visita y `B` después de "desplegar".

La primera prueba, con Playwright, decía que seguía cargando `A` incluso con el arreglo puesto. Al contar las peticiones que llegaban al servidor, vi que en la segunda visita **ni siquiera se pedía** `script.js`. Chromium lo estaba sacando de su caché en memoria porque mi prueba navegaba otra vez dentro de la misma pestaña, algo que no pasa cuando un visitante vuelve días después.

Cambié la prueba para abrir una pestaña nueva, como haría una visita real, y entonces sí:

- con el service worker antiguo, la página seguía ejecutando la versión `A` y la petición no llegaba al servidor;
- con el arreglo, el servidor recibía la petición y la página cargaba la versión `B`.

Moraleja dentro de la moraleja: **cuando una prueba de caché te dé un resultado raro, cuenta las peticiones que llegan al servidor** antes de fiarte de ella.

## El arreglo

La corrección principal es una sola opción en el `fetch` del service worker:

```js
const response = await fetch(request, { cache: 'no-cache' });
```

`no-cache` no quiere decir "no guardes nada", aunque el nombre confunda. Quiere decir "**puedes usar tu copia, pero pregunta antes al servidor si sigue valiendo**". Si no ha cambiado, el servidor responde `304 Not Modified`, una respuesta minúscula, y se usa la copia. Si ha cambiado, llega la versión nueva. El coste es casi nulo y desaparece la mezcla de versiones.

Para cubrir también las visitas que todavía no pasan por el service worker, añadí la misma instrucción a `_headers` para los ficheros que cambian en cada despliegue:

```
/script.js
  Cache-Control: no-cache
/styles.css
  Cache-Control: no-cache
```

Y subí la versión del service worker para que los navegadores que ya tenían el antiguo instalasen el nuevo.

## Que no vuelva a pasar

Añadí un test que comprueba dos cosas: que el service worker hace sus peticiones con `cache: 'no-cache'` y que `_headers` incluye esa cabecera para los scripts y las hojas de estilo. Es un test sencillo, casi de texto, pero me avisará si un día alguien (probablemente yo) "limpia" esas líneas sin saber por qué están ahí.

## Lo que me llevo

- **`fetch()` dentro de un service worker no garantiza ir a la red.** Si quieres red de verdad, dilo con `cache: 'no-cache'` o `cache: 'reload'`.
- **Si no le dices al navegador cuánto puede cachear, lo decidirá él.** Pon `Cache-Control` explícito a todo lo que cambie con cada despliegue.
- **"HTML nuevo, comportamiento viejo" casi siempre significa versiones mezcladas.** Es lo primero que hay que mirar.
- **Los tests en un navegador limpio no ven este tipo de fallos.** Hay que simular al visitante que vuelve.

Lo mejor de tener un blog es que este fallo, en vez de quedarse en un commit, se ha convertido en una nota. Si te ha pasado algo parecido, escríbeme con `mail` desde la terminal: me encantará leerlo.
