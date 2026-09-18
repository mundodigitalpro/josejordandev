# josejordan.dev

Portfolio personal de Jose Jordan: un escritorio simulado con una terminal interactiva, en español (`/`) e inglés (`/en/`).
Sitio estático (HTML, CSS y JavaScript sin dependencias ni proceso de build) alojado en Cloudflare.

## Estructura

| Fichero | Para qué sirve |
| --- | --- |
| `index.html`, `en/index.html` | Escritorio, iconos y ventana de terminal en español e inglés (misma estructura, solo cambia el texto) |
| `lang.js` | Detecta el idioma del navegador o la preferencia guardada y abre la versión adecuada |
| `content.js` | Textos en `text.es` y `text.en`, proyectos y enlaces. **Edita este fichero para actualizar el contenido.** |
| `script.js` | Lógica de la terminal (comandos, historial, autocompletado, ventana arrastrable) |
| `styles.css` | Estilos del escritorio y la terminal |
| `cv-jose-jordan.pdf` | CV que abren el comando `cv` y el icono CV |
| `404.html` | Página de error |
| `privacy.html`, `privacy.css` | Política de privacidad de las apps |
| `fonts/` | JetBrains Mono (SIL Open Font License) |
| `_headers`, `_redirects` | Cabeceras de seguridad y redirecciones que aplica Cloudflare |
| `.assetsignore`, `wrangler.jsonc` | Configuración para desplegar como Cloudflare Worker con assets estáticos |

## Desarrollo local

Las páginas usan rutas absolutas (`/styles.css`), así que hace falta un servidor local:

```bash
python3 -m http.server 8000
```

Para reproducir el comportamiento de Cloudflare (cabeceras, redirecciones y página 404):

```bash
npx wrangler pages dev .      # como Cloudflare Pages
npx wrangler dev              # como Cloudflare Worker
```

## Despliegue

- **Cloudflare Pages** (actual): el proyecto `josejordandev` está conectado a este repositorio y publica cada push a `main`. Sin comando de build; directorio de salida `/`.
- **Cloudflare Workers** (alternativa): `npx wrangler deploy` usando `wrangler.jsonc`.

## Contenido

Los comandos de la terminal leen de `content.js`:

- `about`, `skills`, `projects` y `contact` muestran lo que hay en ese fichero.
- `cv` abre el PDF indicado en `cvUrl` (o `cvUrlEn` en la versión inglesa, si existe); si está vacío, remite a LinkedIn y al email.
- `lang en` y `lang es` cambian de idioma y guardan la elección; el selector ES/EN de la barra superior hace lo mismo.
- `open <n>` abre el proyecto número `n` de la lista.
