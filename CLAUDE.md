# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jose Jordan (software developer in Córdoba, Spain: Kotlin/Android apps and AI integrations). The site simulates a desktop environment with an interactive terminal that acts as the portfolio and contact interface. The whole site is in Spanish.

## Architecture

Static site: HTML, CSS and vanilla JavaScript. No build step, no package manager, no external dependencies (the font is self-hosted).

### Files
- **index.html**: desktop (menu bar, icons) and the terminal window. Contains SEO metadata, Open Graph tags and JSON-LD.
- **content.js**: all editable content (about text, skills, projects with GitHub URLs, links, jokes, quotes, optional `cvUrl`). Defines a global `CONTENT` object. Edit this file to update what the terminal shows.
- **script.js**: terminal logic. Commands are registered with `define(name, description, run, { hidden })`; output is built with DOM nodes (never `innerHTML` with user input). Also handles history (↑/↓), Tab completion, unknown-command suggestions, the draggable/minimizable/maximizable window (Pointer Events), desktop icons, and the menu bar clock.
- **styles.css**: design tokens in `:root`, wallpaper (CSS gradients plus an inline SVG pattern of horseshoe arches), icons, terminal window, mobile layout (`max-width: 720px`), reduced-motion support.
- **404.html**: custom not-found page (uses absolute paths to `/styles.css`).
- **privacy.html** + **privacy.css**: privacy policy for the mobile apps. Legal text must stay intact.
- **fonts/**: JetBrains Mono variable font (subset, SIL OFL) and its license.
- **favicon.svg**, **apple-touch-icon.png**, **og.png**: icons and social preview image.
- **robots.txt**, **sitemap.xml**.

### Terminal commands
Visible in `help`: `help`, `about`, `skills`, `projects`, `contact`, `cv`, `open`, `clear`, `history`, `date`, `echo`, `joke`, `quote`.
Hidden extras: `whoami`, `hostname`, `pwd`, `ls`, `cat`, `sudo`, `exit`, `hola`, `hello`.

## Cloudflare hosting

- The domain **josejordan.dev is served by Cloudflare Pages** (project `josejordandev`, connected to GitHub; every push to `main` deploys; no build command; output directory is the repo root).
- **wrangler.jsonc** is a Workers configuration (static assets). Pages ignores it (no `pages_build_output_dir`). It allows an alternative deployment with `npx wrangler deploy`.
- **_headers**: security headers including a strict Content-Security-Policy (`script-src 'self'`, `style-src 'self'`). Do not add inline `<script>` or `<style>` blocks or inline `style=""` attributes; put JS/CSS in files. JSON-LD blocks are fine.
- **_redirects**: redirects repository files (CLAUDE.md, README.md, wrangler.jsonc, .gitignore, .assetsignore) to `/` so they are not exposed on Pages.
- **.assetsignore**: excludes the same files from Workers static asset uploads.
- **404.html** is served for unknown paths (Pages does this automatically; Workers via `not_found_handling: "404-page"`).

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
