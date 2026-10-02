# josejordan.dev

Portfolio personal de Jose Jordan: un escritorio simulado con una terminal interactiva, en español (`/`) e inglés (`/en/`).
Sitio estático (HTML, CSS y JavaScript sin dependencias ni proceso de build) alojado en Cloudflare.

## Estructura

| Fichero | Para qué sirve |
| --- | --- |
| `index.html`, `en/index.html` | Escritorio, iconos y ventana de terminal en español e inglés (misma estructura, solo cambia el texto) |
| `lang.js` | Detecta el idioma del navegador o la preferencia guardada y abre la versión adecuada |
| `content.js` | Textos en `text.es` y `text.en`, proyectos y enlaces. **Edita este fichero para actualizar el contenido.** |
| `script.js` | Escritorio y terminal: gestor de ventanas, dock, comandos, historial, autocompletado y el juego de adivinar el número |
| `minesweeper.js` | Buscaminas: se abre en su propia ventana desde el icono, el dock o el comando `minesweeper` |
| `worker/index.js`, `worker/contact.js` | Worker: sirve la web y envía el formulario de contacto con Cloudflare Email Routing |
| `styles.css` | Estilos del escritorio y la terminal |
| `cv-jose-jordan.pdf` | CV que abren el comando `cv` y el icono CV |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | PWA: la web se puede instalar y funciona sin conexión |
| `tests/`, `.github/workflows/ci.yml` | Tests automáticos y su ejecución en GitHub Actions |
| `404.html` | Página de error |
| `privacy.html`, `privacy.css` | Política de privacidad de las apps |
| `fonts/` | JetBrains Mono (SIL Open Font License) |
| `_headers`, `_redirects` | Cabeceras de seguridad y redirecciones que aplica Cloudflare |
| `.assetsignore`, `wrangler.jsonc` | Configuración del Worker (assets estáticos, formulario y binding `send_email`) |

## Desarrollo local

Las páginas usan rutas absolutas (`/styles.css`), así que hace falta un servidor local:

```bash
python3 -m http.server 8000
```

Para reproducir el comportamiento de Cloudflare (cabeceras, redirecciones y página 404):

```bash
npx wrangler dev              # como Cloudflare Worker (incluye /api/contact; secretos en .dev.vars)
npx wrangler pages dev .      # como Cloudflare Pages
```

## Tests

```bash
node --test tests/*.test.mjs                 # comprobaciones del sitio y del formulario
npm install --no-save playwright && npx playwright install chromium
node --test tests/*.test.mjs                 # ahora también las pruebas en navegador
```

GitHub Actions (`.github/workflows/ci.yml`) ejecuta lo mismo en cada push a `main` y en cada pull request.

## Despliegue

- **Cloudflare Workers** (recomendado, necesario para el formulario): `npx wrangler deploy` o Workers Builds conectado a GitHub, usando `wrangler.jsonc`. Ver *Formulario de contacto*.
- **Cloudflare Pages** (actual hasta migrar): el proyecto `josejordandev` publica cada push a `main`. Sin comando de build; directorio de salida `/`. Todo funciona salvo el envío del formulario (usa `mailto:`).

## Contenido

Los comandos de la terminal leen de `content.js`:

- `about`, `skills`, `projects` y `contact` muestran lo que hay en ese fichero.
- `cv` abre el PDF indicado en `cvUrl` (o `cvUrlEn` en la versión inglesa, si existe); si está vacío, remite a LinkedIn y al email.
- `lang en` y `lang es` cambian de idioma y guardan la elección; el selector ES/EN de la barra superior hace lo mismo.
- `minesweeper` (o `buscaminas`) abre el Buscaminas en una ventana; `guess` (o `adivina`) inicia el juego de adivinar el número dentro de la terminal.
- El dock de la parte inferior muestra las apps abiertas: clic para abrir, traer al frente o recuperar una ventana minimizada.
- `open <n>` abre el proyecto número `n` de la lista.
- `theme` lista los temas del escritorio (`cordoba`, `noche`, `mezquita`, `matrix`) y `theme <nombre>` aplica uno y lo recuerda; `neofetch` muestra una ficha del sistema y `matrix` una lluvia de código.
- El icono **Proyectos** abre una ventana con tarjetas y filtros por lenguaje, generada desde `projects` en `content.js` (campo opcional `demo` para enlazar una demo).
- El icono **Contacto** y el comando `mail` (o `mail <texto>`) abren el formulario de contacto.

## Formulario de contacto

El formulario envía los datos a `/api/contact`, que atiende el Worker (`worker/contact.js`) y reenvía por email con **Cloudflare Email Routing**: sin cuentas ni APIs de terceros. Las Pages Functions no pueden enviar correo, así que el formulario solo funciona desplegando la web como Worker.

Requisitos: Email Routing activo en `josejordan.dev` (ya lo está si `info@josejordan.dev` te llega al Gmail) y la dirección de destino verificada en *Email Routing > Destination addresses*.

Pasos para mover la web de Pages a Workers:

1. Cloudflare > Workers & Pages > Create > **Import a repository** y elige este repositorio. Sin comando de build; el comando de despliegue es `npx wrangler deploy` (lee `wrangler.jsonc`).
2. En el Worker `josejordan-portfolio` > Settings > Variables and Secrets, añade el secreto **`CONTACT_TO`** con tu dirección verificada (tu Gmail). No la pongas en el repositorio. Opcional: `CONTACT_FROM` (por defecto `web@josejordan.dev`).
3. Prueba el formulario en la URL `*.workers.dev` del Worker.
4. Quita el dominio personalizado `josejordan.dev` del proyecto de Pages (Custom domains) y añádelo al Worker (Settings > Domains & Routes). Después puedes pausar o borrar el proyecto de Pages.

Captcha opcional con Turnstile: crea un widget en Cloudflare > Turnstile para `josejordan.dev`, pon la *site key* en `turnstileSiteKey` (`content.js`) y el secreto en `TURNSTILE_SECRET_KEY`.

Protección antispam sin captcha: campo trampa oculto, tiempo mínimo de 3 segundos y comprobación del `Origin`. Mientras no haya `CONTACT_TO` (o en Pages, o con `python3 -m http.server`), el formulario muestra un enlace `mailto:` con el mensaje ya escrito.
