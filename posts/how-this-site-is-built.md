---
title: How this site is built
description: A desktop with a terminal in plain HTML, CSS and JavaScript, with no dependencies or build step, hosted for free on Cloudflare.
date: 2026-10-02
lang: en
tags: [web, javascript, cloudflare, pwa]
translation: como-esta-hecha-esta-web
---

I wanted my portfolio to be more than a page with my CV: a site you can actually **use**. That is why josejordan.dev is a small desktop with a menu bar, icons, a dock and a terminal where you can browse my experience and projects, or write to me.

## No dependencies, no build step

Everything is plain HTML, CSS and JavaScript. There is no framework, no `node_modules` and no build step: the files in the repository are exactly the files that get published. The only font, JetBrains Mono, is self-hosted.

This has very practical advantages:

- The site loads fast and does not depend on a library still being maintained five years from now.
- Any change can be understood by reading a single file.
- It can be hosted anywhere that serves static files.

## A window manager in a few functions

Each window (the terminal, Projects, Contact, Minesweeper and these Notes) is an HTML element with a header and some buttons. A small manager in `script.js` takes care of:

1. Dragging them with Pointer Events, so it works the same with a mouse or a finger.
2. Bringing the one you click to the front.
3. Minimizing them to the dock, closing and maximizing them.

On phones the windows fill the screen, because dragging windows around on six inches makes no sense.

## The terminal

The terminal has more than twenty commands: `about`, `projects`, `experience`, `cv`, `mail`, `theme`, `neofetch`… and a few hidden ones. It has history with the arrow keys, `Tab` completion and suggestions when you mistype.

All the content lives in `content.js`, separate from the logic, and all output is built with DOM nodes, never with `innerHTML`, so whatever you type cannot inject HTML.

## Two languages without duplicated code

The Spanish version lives at `/` and the English one at `/en/`. A tiny script detects your browser language (or the one you picked) and takes you to your version, without ever redirecting Google or social media previews, so each version is indexed at its own address.

## Security: a strict CSP

The site is served with a Content Security Policy that only allows scripts and styles from the site itself. No inline `<script>` and no `style=""` attributes. It is a good discipline: it keeps the code tidy and closes the door to many attacks.

## An app that works offline

It is a PWA: you can install it on your phone or computer. A service worker always asks the network for the latest version first and, when there is no connection, serves the saved copy. Every change shows up immediately and the site still works in airplane mode.

## Free hosting on Cloudflare

Cloudflare publishes the site automatically on every push to GitHub. Since it is all static files, the free plan is more than enough: requests to static pages are unlimited.

## Tests on every change

There are tests with `node:test`, which ships with Node, and real-browser tests with Playwright: the commands, the windows, the contact form, offline mode and that the Spanish and English pages share the same structure. GitHub Actions runs them on every push.

## And this blog

I write each note in Markdown. A small script of my own, also dependency-free, turns it into an HTML page with its RSS entry, its sitemap entry and its social media tags. Publishing means adding a `.md` file and pushing.

If you are curious about the code, it is all on [GitHub](https://github.com/mundodigitalpro/josejordandev). And if you want to tell me something, type `mail` in the terminal.
