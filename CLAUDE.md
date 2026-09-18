# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jose Jordan (full-stack developer in Córdoba, Spain: Python ETL and data work, Vue.js, Kotlin/Android apps, AI training). Content mirrors his CV (`cv-jose-jordan.pdf`). The site simulates a desktop environment with an interactive terminal that acts as the portfolio and contact interface. It is bilingual: Spanish at `/` (index.html) and English at `/en/` (en/index.html).

## Architecture

Static site: HTML, CSS and vanilla JavaScript. No build step, no package manager, no external dependencies (the font is self-hosted).

### Files
- **index.html** (Spanish) and **en/index.html** (English): desktop (menu bar with ES/EN switch and clock, icons) and the terminal window, with SEO metadata, `hreflang` alternates, Open Graph tags and JSON-LD. Both files share the same structure; structural changes must be applied to both (only text differs). Both use absolute paths (`/styles.css`, `/script.js`), so serve the site with a local server rather than opening the files directly.
- **lang.js**: loaded in `<head>` without `defer`. On the two home pages it redirects to the language saved in `localStorage` (`lang`) or, if none, to the first browser language that is Spanish or English (English otherwise). Crawlers (Googlebot, Bingbot, social previews, Lighthouse) are never redirected.
- **content.js**: all editable content. Shared data (`links`, `projects` with `desc.es`/`desc.en`, `cvUrl`, optional `cvUrlEn`) plus `text.es` and `text.en` (about, skills, experience, education, certifications, jokes, quotes). Defines a global `CONTENT` object. Edit this file to update what the terminal shows, in both languages.
- **script.js**: terminal logic. The language comes from `<html lang>`; interface strings live in the `UI` dictionary (es/en) inside the file. Commands are registered with `define(name, run, { hidden, description })` and take their description from `UI[lang].desc`; output is built with DOM nodes (never `innerHTML` with user input). Also handles history (↑/↓), Tab completion, unknown-command suggestions, the draggable/minimizable/maximizable window (Pointer Events), desktop icons, and the menu bar clock.
- **styles.css**: design tokens in `:root`, wallpaper (CSS gradients plus an inline SVG pattern of horseshoe arches), icons, terminal window, mobile layout (`max-width: 720px`), reduced-motion support.
- **404.html**: custom not-found page (uses absolute paths to `/styles.css`).
- **privacy.html** + **privacy.css**: privacy policy for the mobile apps. Legal text must stay intact.
- **fonts/**: JetBrains Mono variable font (subset, SIL OFL) and its license.
- **favicon.svg**, **apple-touch-icon.png**, **og.png** (Spanish) and **og-en.png** (English): icons and social preview images. The `og:image` URLs carry a `?v=` version; bump it when regenerating an image, because the edge cache keeps the old one.
- **cv-jose-jordan.pdf**: the CV opened by the `cv` command and the CV desktop icon (`cvUrl` in content.js).
- **robots.txt**, **sitemap.xml**.

### Terminal commands
Visible in `help`: `help`, `about`, `skills`, `projects`, `experience`, `education`, `contact`, `cv`, `open`, `lang`, `clear`, `history`, `date`, `echo`, `joke`, `quote`. Command names are the same in both languages; `lang en` / `lang es` switches the version and saves the choice.
Hidden extras: `whoami`, `hostname`, `pwd`, `ls`, `cat`, `sudo`, `exit`, `hola`, `hello`, plus aliases (`ayuda`, `habilidades`, `proyectos`, `experiencia`, `formacion`, `contacto`, `idioma`, `limpiar`, `fecha`, `salir`, `language`, `resume`).

## Cloudflare hosting

- The domain **josejordan.dev is served by Cloudflare Pages** (project `josejordandev`, connected to GitHub; every push to `main` deploys; no build command; output directory is the repo root).
- **wrangler.jsonc** is a Workers configuration (static assets). Pages ignores it (no `pages_build_output_dir`). It allows an alternative deployment with `npx wrangler deploy`.
- **_headers**: security headers including a strict Content-Security-Policy (`script-src 'self'`, `style-src 'self'`). Do not add inline `<script>` or `<style>` blocks or inline `style=""` attributes; put JS/CSS in files. JSON-LD blocks are fine.
- **_redirects**: redirects repository files (CLAUDE.md, README.md, wrangler.jsonc, .gitignore, .assetsignore) to `/` so they are not exposed on Pages.
- **.assetsignore**: excludes the same files from Workers static asset uploads.
- **404.html** (bilingual) is served for unknown paths (Pages does this automatically; Workers via `not_found_handling: "404-page"`).
- **sitemap.xml** lists `/`, `/en/` (with `xhtml:link` alternates) and `/privacy`. The privacy policy exists only in Spanish.

## Development Commands

Any static server works:
- `python3 -m http.server 8000`
- `npx wrangler pages dev .` reproduces Pages behaviour (headers, redirects, 404).
- `npx wrangler dev` reproduces the Workers variant.

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
