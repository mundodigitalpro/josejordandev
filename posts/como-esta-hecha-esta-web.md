---
title: Cómo está hecha esta web
description: Un escritorio con terminal en HTML, CSS y JavaScript sin dependencias ni proceso de build, alojado gratis en Cloudflare.
date: 2026-10-02
lang: es
tags: [web, javascript, cloudflare, pwa]
translation: how-this-site-is-built
---

Quería que mi portfolio fuera algo más que una página con mi CV: un sitio que se pudiera **usar**. Por eso josejordan.dev es un pequeño escritorio con su barra de menú, sus iconos, un dock y una terminal desde la que puedes ver mi experiencia, mis proyectos o escribirme.

## Sin dependencias y sin build

Todo es HTML, CSS y JavaScript "a pelo". No hay framework, ni `node_modules`, ni proceso de compilación: los ficheros del repositorio son exactamente los que se publican. La única fuente es JetBrains Mono, alojada en la propia web.

Esto tiene ventajas muy prácticas:

- La web carga rápido y no depende de que una librería siga mantenida dentro de cinco años.
- Cualquier cambio se entiende leyendo un solo fichero.
- Se puede alojar en cualquier sitio que sirva ficheros estáticos.

## Un gestor de ventanas en unas pocas funciones

Cada ventana (la terminal, Proyectos, Contacto, el Buscaminas y estas Notas) es un elemento HTML con una cabecera y unos botones. Un pequeño gestor en `script.js` se encarga de:

1. Arrastrarlas con Pointer Events, para que funcione igual con ratón y con el dedo.
2. Traer al frente la que pulsas.
3. Minimizarlas al dock, cerrarlas y maximizarlas.

En el móvil las ventanas pasan a ocupar la pantalla, porque arrastrar ventanas en 6 pulgadas no tiene sentido.

## La terminal

La terminal tiene más de veinte comandos: `about`, `projects`, `experience`, `cv`, `mail`, `theme`, `neofetch`… y alguno escondido. Tiene historial con las flechas, autocompletado con `Tab` y sugerencias cuando te equivocas al escribir.

Todo el contenido vive en `content.js`, separado de la lógica, y toda la salida se construye con nodos del DOM, nunca con `innerHTML`, así que lo que escribas en la terminal no puede inyectar HTML.

## Dos idiomas sin duplicar código

La versión en español está en `/` y la inglesa en `/en/`. Un script mínimo detecta el idioma del navegador (o el que elegiste) y te lleva a tu versión, sin redirigir nunca a Google ni a las vistas previas de las redes sociales, para que cada versión se indexe en su dirección.

## Seguridad: una CSP estricta

La web se sirve con una *Content Security Policy* que solo permite scripts y estilos de la propia web. Nada de `<script>` en línea ni atributos `style=""`. Es una buena disciplina: obliga a tener el código ordenado y cierra la puerta a muchos ataques.

## Una app que funciona sin conexión

Es una PWA: puedes instalarla en el móvil o en el ordenador. Un *service worker* pide siempre primero la versión más reciente a la red y, si no hay conexión, sirve la copia guardada. Así cada cambio se ve al momento y, aun así, la web funciona en modo avión.

## Alojamiento gratis en Cloudflare

Cloudflare publica la web automáticamente con cada push a GitHub. Al ser ficheros estáticos, el plan gratuito sobra: las visitas a páginas estáticas no tienen límite.

## Tests en cada cambio

Hay tests con `node:test`, que viene con Node, y pruebas en un navegador real con Playwright: los comandos, las ventanas, el formulario, el modo sin conexión y que la versión española y la inglesa tengan la misma estructura. GitHub Actions los ejecuta en cada push.

## Y este blog

Escribo cada nota en Markdown. Un script propio, también sin dependencias, la convierte en una página HTML con su RSS, su entrada en el sitemap y sus etiquetas para redes sociales. Publicar es añadir un fichero `.md` y hacer push.

Si te interesa el código, está todo en [GitHub](https://github.com/mundodigitalpro/josejordandev). Y si quieres comentarme algo, escribe `mail` en la terminal.
