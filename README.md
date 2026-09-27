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
| `functions/api/contact.js` | Pages Function que recibe el formulario de contacto y lo envía por email con Resend |
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
- `minesweeper` (o `buscaminas`) abre el Buscaminas en una ventana; `guess` (o `adivina`) inicia el juego de adivinar el número dentro de la terminal.
- El dock de la parte inferior muestra las apps abiertas: clic para abrir, traer al frente o recuperar una ventana minimizada.
- `open <n>` abre el proyecto número `n` de la lista.
- El icono **Proyectos** abre una ventana con tarjetas y filtros por lenguaje, generada desde `projects` en `content.js` (campo opcional `demo` para enlazar una demo).
- El icono **Contacto** y el comando `mail` (o `mail <texto>`) abren el formulario de contacto.

## Formulario de contacto

El formulario envía los datos a `/api/contact` (Pages Function en `functions/api/contact.js`), que los reenvía por email con [Resend](https://resend.com).

1. Crea una cuenta en Resend, verifica el dominio `josejordan.dev` (añade los registros DNS que te indique en Cloudflare) y genera una API key.
2. En Cloudflare Pages > proyecto `josejordandev` > Settings > Variables and Secrets, añade el secreto `RESEND_API_KEY`. Opcionales: `CONTACT_TO` (por defecto `info@josejordan.dev`) y `CONTACT_FROM` (por defecto `josejordan.dev <web@josejordan.dev>`).
3. Opcional, captcha con Turnstile: crea un widget en Cloudflare > Turnstile para `josejordan.dev`, pon la *site key* en `turnstileSiteKey` (`content.js`) y el secreto en `TURNSTILE_SECRET_KEY`.
4. Vuelve a desplegar para que la función lea las variables.

Protección antispam sin captcha: campo trampa oculto, tiempo mínimo de 3 segundos y comprobación del `Origin`. Mientras no haya `RESEND_API_KEY` (o en local con `python3 -m http.server`, o en la variante Workers), el formulario muestra un enlace `mailto:` con el mensaje ya escrito.
