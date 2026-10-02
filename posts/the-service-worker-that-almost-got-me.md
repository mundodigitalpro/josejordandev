---
title: The service worker that almost got me
description: I added a new window to my site, the tests passed, and in my browser the icon did nothing. The cache was to blame, and the fix was one line.
date: 2026-10-02
lang: en
tags: [pwa, service-worker, cache, javascript, debugging]
translation: el-service-worker-que-casi-me-la-lia
draft: true
---

I recently added a new window to this site, **Notes**, the one that lists the posts on this blog. It had its icon on the desktop, its button in the dock and its command in the terminal. The tests passed locally and on GitHub Actions. I deployed it, opened the site in my browser, clicked the icon… and nothing happened.

No error on screen. Just nothing.

## The symptom

The icon **was there**: I could see it on the desktop. But clicking it did not open the window. In a clean browser, on the other hand, it worked perfectly.

That combination is already a clue: if the new HTML is there but the new behaviour is not, the browser is most likely **mixing versions**. Today's HTML with yesterday's JavaScript.

And that is exactly what was happening. The new `index.html` had the icon, but my browser was still running an old `script.js` that knew nothing about a Notes window. The code looked for the window, did not find it, and did nothing. Total silence.

## "But my service worker goes to the network first…"

This site is a PWA and has a service worker precisely so that it works offline. When I wrote it I chose a **network-first** strategy: for every request, try the network first and use the saved copy only if that fails. The whole point was to avoid this very problem: every deploy should show up immediately and versions should never mix.

The code looked roughly like this:

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

It looks flawless. The problem is in one word: `fetch(request)` **does not mean "go to the server"**. It means "get me this resource", and the browser has its own HTTP cache that it can use before going out to the network.

## Heuristic caching

When a response carries a clear `Cache-Control` header, the browser obeys it. But when the response says nothing about how long it may be kept, the HTTP standard lets the browser **decide for itself**. This is called *heuristic caching*: if the file has a last-modified date, the browser may treat it as fresh for a fraction of the time since it last changed, typically 10%.

A `script.js` that has not changed for a month can be considered good for about three days without asking anyone.

My `_headers` file, which tells Cloudflare which headers to send, had rules for images and fonts, but **none for the scripts**. The service worker called `fetch(request)`, the browser checked its HTTP cache, saw a copy that was "still fresh" according to its heuristic and returned it without ever asking the server. Network-first never reached the network.

## Reproducing it (and tripping on the way)

Before fixing anything I wanted to see the bug in a test. I set up a local server that served `script.js` without `Cache-Control` and with an old modification date, and appended a version marker to it: `A` on the first visit and `B` after "deploying".

The first Playwright test said it was still loading `A`, even with the fix in place. When I counted the requests reaching the server, I saw that on the second visit `script.js` **was not even requested**. Chromium was taking it from its in-memory cache because my test navigated again inside the same tab, something that does not happen when a visitor comes back days later.

I changed the test to open a new tab, like a real visit, and then it was clear:

- with the old service worker, the page kept running version `A` and the request never reached the server;
- with the fix, the server got the request and the page loaded version `B`.

A lesson inside the lesson: **when a cache test gives you a strange result, count the requests that reach the server** before trusting it.

## The fix

The main fix is a single option on the service worker's `fetch`:

```js
const response = await fetch(request, { cache: 'no-cache' });
```

Despite its confusing name, `no-cache` does not mean "do not store anything". It means "**you may use your copy, but ask the server first whether it is still valid**". If nothing changed, the server answers `304 Not Modified`, a tiny response, and the copy is used. If it changed, the new version arrives. The cost is almost zero and mixed versions are gone.

To also cover visits that do not go through the service worker yet, I added the same instruction to `_headers` for the files that change on every deploy:

```
/script.js
  Cache-Control: no-cache
/styles.css
  Cache-Control: no-cache
```

And I bumped the service worker version so that browsers with the old one installed would pick up the new one.

## Making sure it does not happen again

I added a test that checks two things: that the service worker makes its requests with `cache: 'no-cache'` and that `_headers` includes that header for the scripts and stylesheets. It is a simple, almost textual test, but it will warn me if someone (probably me) ever "cleans up" those lines without knowing why they are there.

## What I take away

- **`fetch()` inside a service worker does not guarantee going to the network.** If you really want the network, say so with `cache: 'no-cache'` or `cache: 'reload'`.
- **If you do not tell the browser how long it may cache something, it will decide for you.** Set an explicit `Cache-Control` on everything that changes with each deploy.
- **"New HTML, old behaviour" almost always means mixed versions.** It is the first thing to check.
- **Tests in a clean browser do not catch this kind of bug.** You have to simulate the returning visitor.

The best thing about having a blog is that this bug, instead of staying buried in a commit, became a note. If something similar has happened to you, write to me with `mail` from the terminal: I would love to read it.
