# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jose Jordan (full-stack developer in Córdoba, Spain: Python ETL and data work, Vue.js, Kotlin/Android apps, AI training). Content mirrors his CV (`cv-jose-jordan.pdf`). The site simulates a desktop environment with an interactive terminal that acts as the portfolio and contact interface. It is bilingual: Spanish at `/` (index.html) and English at `/en/` (en/index.html).

## Architecture

Static site: HTML, CSS and vanilla JavaScript. No build step, no package manager, no external dependencies (the font is self-hosted). The only server code is a small Cloudflare Worker (`worker/`) that serves the static files and handles the contact form with Email Routing.

### Files
- **index.html** (Spanish) and **en/index.html** (English): desktop (menu bar with ES/EN switch and clock, icons, dock), the terminal window and the Projects, Contact and Minesweeper windows, with SEO metadata, `hreflang` alternates, Open Graph tags and JSON-LD. Both files share the same structure; structural changes must be applied to both (only text differs). Both use absolute paths (`/styles.css`, `/script.js`), so serve the site with a local server rather than opening the files directly.
- **lang.js**: loaded in `<head>` without `defer`. On the two home pages it redirects to the language saved in `localStorage` (`lang`) or, if none, to the first browser language that is Spanish or English (English otherwise). Crawlers (Googlebot, Bingbot, social previews, Lighthouse) are never redirected.
- **content.js**: all editable content. Shared data (`links`, `projects` with `desc.es`/`desc.en` and optional `demo`, `cvUrl`, optional `cvUrlEn`, optional `turnstileSiteKey`) plus `text.es` and `text.en` (about, skills, experience, education, certifications, jokes, quotes). Defines a global `CONTENT` object. Edit this file to update what the terminal shows, in both languages.
- **script.js**: desktop and terminal logic. It contains a small window manager (`registerWindow`: drag, focus/z-order, minimize to the dock, close, maximize where a maximize button exists) and the dock (`.dock-item[data-window]` launchers with running/minimized/active states). Windows are `.window` elements with `.window-header`, `.window-title`, `.window-body` and `[data-action]` buttons; desktop icons open them with `data-open`. The language comes from `<html lang>`; interface strings live in the `UI` dictionary (es/en) inside the file. It also renders the Projects window (cards from `CONTENT.projects` with language filters) and the Contact window (form posted as JSON to `/api/contact`; honeypot field, elapsed time, optional Turnstile widget loaded only when `turnstileSiteKey` is set; if the endpoint fails or is missing it offers a `mailto:` link with the message prefilled).
- **minesweeper.js**: the Minesweeper game (`Minesweeper.mount(container, lang)`), mounted lazily the first time its window opens. Three levels, first click always safe, flags with right click, long press or the flag-mode toggle, keyboard navigation (arrows, Enter, F), best times in `localStorage` (`ms-best-<level>`). `Minesweeper.last.state()` exposes the board for tests. Commands are registered with `define(name, run, { hidden, description })` and take their description from `UI[lang].desc`; output is built with DOM nodes (never `innerHTML` with user input). Also handles history (↑/↓), Tab completion, unknown-command suggestions, the draggable/minimizable/maximizable window (Pointer Events), desktop icons, and the menu bar clock.
- **worker/index.js** + **worker/contact.js**: Worker entry (`main` in wrangler.jsonc). `/api/contact` runs first (`run_worker_first`); everything else goes to `env.ASSETS`. `handleContact(request, env, send)` validates the fields, checks the Origin, silently drops bots (honeypot or sent in under 3 s), verifies Turnstile when `TURNSTILE_SECRET_KEY` is set, builds a plain-text UTF-8 MIME message by hand (no libraries) and sends it through the `send_email` binding `MAILER` (Cloudflare Email Routing) to `CONTACT_TO` (a secret: an Email Routing verified address; it must not be committed), from `CONTACT_FROM` (default `web@josejordan.dev`), with `Reply-To` set to the visitor. Without `CONTACT_TO` it answers 503 and the page falls back to `mailto:`. `send` is injected so `contact.js` can be tested outside Cloudflare.
- **styles.css**: design tokens in `:root`, wallpaper (CSS gradients plus an inline SVG pattern of horseshoe arches), icons, terminal window, mobile layout (`max-width: 720px`), reduced-motion support.
- **404.html**: custom not-found page (uses absolute paths to `/styles.css`).
- **privacy.html** + **privacy.css**: privacy policy for the mobile apps. Legal text must stay intact.
- **fonts/**: JetBrains Mono variable font (subset, SIL OFL) and its license.
- **favicon.svg**, **apple-touch-icon.png**, **og.png** (Spanish) and **og-en.png** (English): icons and social preview images. The `og:image` URLs carry a `?v=` version; bump it when regenerating an image, because the edge cache keeps the old one.
- **cv-jose-jordan.pdf**: the CV opened by the `cv` command and the CV desktop icon (`cvUrl` in content.js).
- **robots.txt**, **sitemap.xml**.

### Terminal commands
Visible in `help`: `help`, `about`, `skills`, `projects`, `experience`, `education`, `contact`, `mail` (opens the contact form window; `mail <text>` prefills the message), `cv`, `open`, `lang`, `minesweeper` (opens the game window), `guess` (guess-the-number game inside the terminal; while it runs the prompt is `?` and input goes to the game), `clear`, `history`, `date`, `echo`, `joke`, `quote`. Command names are the same in both languages; `lang en` / `lang es` switches the version and saves the choice.
Hidden extras: `whoami`, `hostname`, `pwd`, `ls`, `cat`, `sudo`, `exit`, `hola`, `hello`, plus aliases (`ayuda`, `habilidades`, `proyectos`, `experiencia`, `formacion`, `contacto`, `idioma`, `buscaminas`, `mines`, `adivina`, `limpiar`, `fecha`, `salir`, `language`, `resume`, `mensaje`, `message`, `email`).

## Cloudflare hosting

- **Target: Cloudflare Workers** (`wrangler.jsonc`: worker `josejordan-portfolio`, `main: worker/index.js`, static assets from the repo root, `send_email` binding `MAILER`). Deploy with Workers Builds connected to GitHub or `npx wrangler deploy`. The contact form only works here, because Pages Functions cannot use `send_email`.
- **Legacy: Cloudflare Pages** (project `josejordandev`, connected to GitHub; every push to `main` deploys; output directory is the repo root). Until the domain moves to the Worker, josejordan.dev is served from Pages: the site works the same but `/api/contact` does not exist, so the form falls back to `mailto:`. Pages ignores wrangler.jsonc.
- **_headers**: security headers including a strict Content-Security-Policy (`script-src 'self'`, `style-src 'self'`; `challenges.cloudflare.com` is allowed in `script-src` and `frame-src` for Turnstile). Do not add inline `<script>` or `<style>` blocks or inline `style=""` attributes; put JS/CSS in files. JSON-LD blocks are fine.
- **_redirects**: redirects repository files (CLAUDE.md, README.md, wrangler.jsonc, .gitignore, .assetsignore, worker/) to `/` so they are not exposed on Pages.
- **.assetsignore**: excludes the same files (plus `.dev.vars`) from Workers static asset uploads.
- **404.html** (bilingual) is served for unknown paths (Pages does this automatically; Workers via `not_found_handling: "404-page"`).
- **sitemap.xml** lists `/`, `/en/` (with `xhtml:link` alternates) and `/privacy`. The privacy policy exists only in Spanish.

## Development Commands

Any static server works:
- `python3 -m http.server 8000`
- `npx wrangler dev` runs the Worker (static files, headers, redirects, 404 and `/api/contact`; put `CONTACT_TO=...` in a git-ignored `.dev.vars`). Locally, wrangler simulates `send_email` and writes the message to a file instead of sending it.
- `npx wrangler pages dev .` reproduces the legacy Pages behaviour (no contact endpoint).

## Contact Information
- **Developer**: Jose Jordan
- **Email**: info@josejordan.dev
- **LinkedIn**: https://www.linkedin.com/in/josejordan1/
- **GitHub**: github.com/mundodigitalpro
- **X (Twitter)**: @josejordandev

## Notes
- Keep the site static and dependency-free so it stays compatible with Cloudflare Pages/Workers.
- Content changes go in `content.js`; keep logic in `script.js`.
- Respect the CSP in `_headers` when adding features.
