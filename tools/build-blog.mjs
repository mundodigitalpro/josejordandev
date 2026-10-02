#!/usr/bin/env node
/*
 * Generador del blog de josejordan.dev (sin dependencias).
 *
 *   node tools/build-blog.mjs          genera el blog a partir de posts/*.md
 *   node tools/build-blog.mjs --check  solo comprueba que lo generado está al día
 *
 * Cada nota es un fichero posts/<slug>.md con una cabecera:
 *
 *   ---
 *   title: Título de la nota
 *   description: Resumen de una o dos frases (para Google, RSS y redes)
 *   date: 2026-10-02             (o 2026-10-02 18:30, hora de España, para ordenar
 *                                notas del mismo día: la más reciente sale primero)
 *   lang: es                      (es | en)
 *   tags: [web, javascript]
 *   translation: slug-de-la-otra-version   (opcional)
 *   draft: true                   (opcional: no se publica)
 *   ---
 *
 * Genera blog/<slug>/index.html, blog/index.html, en/blog/index.html,
 * blog/feed.xml (RSS), blog/posts.json (para la terminal y la ventana Notas)
 * y el bloque del blog en sitemap.xml. El Markdown no admite HTML: todo se escapa.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://josejordan.dev';
const POSTS_DIR = 'posts';
const MARKER = '<!-- Generado con tools/build-blog.mjs. No lo edites a mano: cambia posts/ y vuelve a generarlo. -->';
const SITEMAP_START = '<!-- blog:start (generado con tools/build-blog.mjs) -->';
const SITEMAP_END = '<!-- blog:end -->';

const L = {
    es: {
        locale: 'es_ES',
        months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        date: (d, m, y) => d + ' de ' + m + ' de ' + y,
        reading: (n) => n + ' min de lectura',
        blog: 'Notas',
        blogTitle: 'Notas de Jose Jordan',
        blogDescription: 'Notas de Jose Jordan sobre desarrollo web, datos, Python, Kotlin e inteligencia artificial.',
        intro: 'Lo que voy aprendiendo y construyendo: desarrollo web, datos, apps e inteligencia artificial.',
        empty: 'Todavía no hay notas publicadas.',
        allPosts: '← Todas las notas',
        desktop: 'Volver al escritorio',
        readOther: 'Read in English',
        otherLang: 'en inglés',
        rss: 'RSS',
        home: '/',
        index: '/blog/',
        image: '/og.png?v=2'
    },
    en: {
        locale: 'en_US',
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        date: (d, m, y) => d + ' ' + m + ' ' + y,
        reading: (n) => n + ' min read',
        blog: 'Notes',
        blogTitle: 'Notes by Jose Jordan',
        blogDescription: 'Notes by Jose Jordan on web development, data, Python, Kotlin and artificial intelligence.',
        intro: 'What I am learning and building: web development, data, apps and artificial intelligence.',
        empty: 'No notes published yet.',
        allPosts: '← All notes',
        desktop: 'Back to the desktop',
        readOther: 'Leer en español',
        otherLang: 'in Spanish',
        rss: 'RSS',
        home: '/en/',
        index: '/en/blog/',
        image: '/og-en.png?v=1'
    }
};

/* ---------- Markdown ---------- */

export function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function slugify(text) {
    return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Solo enlaces http(s), mailto, rutas y anclas: nada de javascript: ni data:
function safeUrl(url) {
    return /^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?|mailto):/i.test(url) ? '#' : url;
}

function inline(text) {
    const codes = [];
    let html = text.replace(/`([^`]+)`/g, (match, code) => {
        codes.push(code);
        return '\u0000' + (codes.length - 1) + '\u0000';
    });
    html = escapeHtml(html);
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, src) => '<img src="' + safeUrl(src) + '" alt="' + alt + '" loading="lazy">');
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
        const url = safeUrl(href);
        const external = /^https?:/i.test(url) && !url.startsWith(SITE);
        return '<a href="' + url + '"' + (external ? ' rel="noopener noreferrer"' : '') + '>' + label + '</a>';
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*(?![*\w])/g, '$1<em>$2</em>');
    return html.replace(/\u0000(\d+)\u0000/g, (match, i) => '<code>' + escapeHtml(codes[Number(i)]) + '</code>');
}

export function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    const usedIds = new Set();
    let paragraph = [];

    const flush = () => {
        if (paragraph.length) out.push('<p>' + inline(paragraph.join(' ')) + '</p>');
        paragraph = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fence = line.match(/^```\s*([\w+-]*)\s*$/);
        if (fence) {
            flush();
            const code = [];
            while (++i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i]);
            const cls = fence[1] ? ' class="language-' + fence[1] + '"' : '';
            out.push('<pre><code' + cls + '>' + escapeHtml(code.join('\n')) + '</code></pre>');
            continue;
        }
        const heading = line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
        if (heading) {
            flush();
            const level = Math.max(2, heading[1].length); // el h1 es el título de la nota
            let id = slugify(heading[2]) || 'seccion';
            for (let n = 2; usedIds.has(id); n++) id = slugify(heading[2]) + '-' + n;
            usedIds.add(id);
            out.push('<h' + level + ' id="' + id + '">' + inline(heading[2]) + '</h' + level + '>');
            continue;
        }
        if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
            flush();
            out.push('<hr>');
            continue;
        }
        if (/^>\s?/.test(line)) {
            flush();
            const quote = [];
            for (; i < lines.length && /^>\s?/.test(lines[i]); i++) quote.push(lines[i].replace(/^>\s?/, ''));
            i--;
            out.push('<blockquote>' + markdownToHtml(quote.join('\n')) + '</blockquote>');
            continue;
        }
        const listItem = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (listItem) {
            flush();
            const ordered = /\d/.test(listItem[2]);
            const items = [];
            for (; i < lines.length; i++) {
                const item = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
                if (item && /\d/.test(item[1]) === ordered) items.push(item[2]);
                else if (items.length && /^\s{2,}\S/.test(lines[i])) items[items.length - 1] += ' ' + lines[i].trim();
                else break;
            }
            i--;
            const tag = ordered ? 'ol' : 'ul';
            out.push('<' + tag + '>' + items.map((item) => '<li>' + inline(item) + '</li>').join('') + '</' + tag + '>');
            continue;
        }
        if (!line.trim()) {
            flush();
            continue;
        }
        paragraph.push(line.trim());
    }
    flush();
    return out.join('\n');
}

/* ---------- Notas ---------- */

export function parsePost(source, file) {
    const match = source.replace(/\r\n?/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) throw new Error(file + ': falta la cabecera entre líneas ---');
    const meta = {};
    for (const line of match[1].split('\n')) {
        const field = line.match(/^(\w+):\s*(.*)$/);
        if (!field) continue;
        let value = field[2].trim().replace(/^(['"])(.*)\1$/, '$2');
        if (/^\[.*\]$/.test(value)) value = value.slice(1, -1).split(',').map((tag) => tag.trim().replace(/^(['"])(.*)\1$/, '$2')).filter(Boolean);
        meta[field[1]] = value;
    }
    const slug = path.basename(file, '.md');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(file + ': el nombre del fichero solo puede tener minúsculas, números y guiones');
    if (!meta.title) throw new Error(file + ': falta title');
    const when = String(meta.date || '').match(/^(\d{4}-\d{2}-\d{2})(?:[ T]([01]\d|2[0-3]):([0-5]\d))?$/);
    if (!when) throw new Error(file + ': date debe ser AAAA-MM-DD o AAAA-MM-DD HH:MM');
    if (meta.lang !== 'es' && meta.lang !== 'en') throw new Error(file + ': lang debe ser es o en');
    const body = match[2].trim();
    const words = body.split(/\s+/).filter(Boolean).length;
    return {
        slug,
        title: meta.title,
        description: meta.description || '',
        date: when[1],
        time: when[2] ? when[2] + ':' + when[3] : '',
        lang: meta.lang,
        tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
        translation: meta.translation || '',
        draft: meta.draft === 'true',
        url: '/blog/' + slug + '/',
        readingMinutes: Math.max(1, Math.round(words / 200)),
        html: markdownToHtml(body)
    };
}

export function loadPosts(root = ROOT) {
    const dir = path.join(root, POSTS_DIR);
    if (!fs.existsSync(dir)) return [];
    const posts = fs.readdirSync(dir).filter((file) => file.endsWith('.md')).sort()
        .map((file) => parsePost(fs.readFileSync(path.join(dir, file), 'utf8'), file))
        .filter((post) => !post.draft)
        .sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || a.slug.localeCompare(b.slug));
    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    for (const post of posts) {
        if (!post.translation) continue;
        const other = bySlug.get(post.translation);
        if (!other) throw new Error(post.slug + ': translation apunta a una nota que no existe o es borrador: ' + post.translation);
        if (other.lang === post.lang) throw new Error(post.slug + ': la traducción debe estar en el otro idioma');
    }
    return posts;
}

/* ---------- Plantillas ---------- */

function formatDate(date, lang) {
    const [y, m, d] = date.split('-').map(Number);
    return L[lang].date(d, L[lang].months[m - 1], y);
}

const sortKey = (post) => post.date + ' ' + (post.time || '00:00');

// La hora de las notas es la de España (Europe/Madrid), con su cambio de horario
function madridOffset(date, time) {
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', timeZoneName: 'longOffset' })
        .formatToParts(new Date(Date.UTC(y, m - 1, d, h, min)))
        .find((part) => part.type === 'timeZoneName').value;
    return name === 'GMT' ? '+00:00' : name.replace('GMT', '');
}

// Fecha ISO para datetime, JSON-LD y Open Graph: con hora y zona si la nota la indica
function published(post) {
    return post.time ? post.date + 'T' + post.time + ':00' + madridOffset(post.date, post.time) : post.date;
}

function rfc822(post) {
    if (post.time) return new Date(published(post)).toUTCString();
    const [y, m, d] = post.date.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 8)).toUTCString();
}

function head({ lang, title, description, canonical, type, alternates, extra }) {
    const t = L[lang];
    const lines = [
        '<!DOCTYPE html>',
        '<html lang="' + lang + '">',
        '<head>',
        '    ' + MARKER,
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '    <title>' + escapeHtml(title) + '</title>',
        '    <meta name="description" content="' + escapeHtml(description) + '">',
        '    <meta name="author" content="Jose Jordan">',
        '    <meta name="theme-color" content="#171321">',
        '    <link rel="canonical" href="' + SITE + canonical + '">'
    ];
    for (const [hreflang, href] of alternates || []) lines.push('    <link rel="alternate" hreflang="' + hreflang + '" href="' + SITE + href + '">');
    lines.push(
        '    <link rel="alternate" type="application/rss+xml" title="' + escapeHtml(t.blogTitle) + '" href="/blog/feed.xml">',
        '    <link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '    <link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '    <link rel="manifest" href="/manifest.webmanifest">',
        '',
        '    <meta property="og:type" content="' + type + '">',
        '    <meta property="og:locale" content="' + t.locale + '">',
        '    <meta property="og:site_name" content="josejordan.dev">',
        '    <meta property="og:title" content="' + escapeHtml(title) + '">',
        '    <meta property="og:description" content="' + escapeHtml(description) + '">',
        '    <meta property="og:url" content="' + SITE + canonical + '">',
        '    <meta property="og:image" content="' + SITE + t.image + '">',
        '    <meta property="og:image:width" content="1200">',
        '    <meta property="og:image:height" content="630">',
        '    <meta name="twitter:card" content="summary_large_image">',
        '    <meta name="twitter:site" content="@josejordandev">',
        '    <meta name="twitter:creator" content="@josejordandev">',
        ...(extra || []),
        '',
        '    <script src="/lang.js"></script>',
        '    <link rel="preload" href="/fonts/JetBrainsMono-var.woff2" as="font" type="font/woff2" crossorigin>',
        '    <link rel="stylesheet" href="/styles.css">',
        '    <link rel="stylesheet" href="/blog.css">',
        '</head>'
    );
    return lines.join('\n');
}

function menubar(lang) {
    const t = L[lang];
    return [
        '    <header class="menubar">',
        '        <a class="menubar-brand" href="' + t.home + '">josejordan.dev</a>',
        '        <nav class="blog-nav" aria-label="' + t.blog + '">',
        '            <a href="' + t.index + '">' + t.blog + '</a>',
        '            <a href="/blog/feed.xml">' + t.rss + '</a>',
        '        </nav>',
        '    </header>'
    ].join('\n');
}

function windowOpen(title, labelledBy) {
    return [
        '    <main class="blog-main">',
        '        <article class="blog-window" aria-labelledby="' + labelledBy + '">',
        '            <div class="window-header blog-window-header">',
        '                <div class="traffic-lights" aria-hidden="true"><span class="light close"></span><span class="light minimize"></span><span class="light maximize"></span></div>',
        '                <span class="window-title">' + escapeHtml(title) + '</span>',
        '            </div>',
        '            <div class="blog-body">'
    ].join('\n');
}

const windowClose = ['            </div>', '        </article>', '    </main>', '</body>', '</html>', ''].join('\n');

function tagsList(tags) {
    return tags.length ? '<ul class="post-tags">' + tags.map((tag) => '<li>#' + escapeHtml(tag) + '</li>').join('') + '</ul>' : '';
}

function renderPost(post, posts) {
    const t = L[post.lang];
    const other = post.translation ? posts.find((p) => p.slug === post.translation) : null;
    const alternates = other ? [[post.lang, post.url], [other.lang, other.url]] : [];
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: published(post),
        inLanguage: post.lang,
        url: SITE + post.url,
        mainEntityOfPage: SITE + post.url,
        keywords: post.tags.join(', '),
        author: { '@type': 'Person', name: 'Jose Jordan', url: SITE + '/' },
        image: SITE + t.image
    };
    const extra = [
        '    <meta property="article:published_time" content="' + published(post) + '">',
        ...post.tags.map((tag) => '    <meta property="article:tag" content="' + escapeHtml(tag) + '">'),
        '',
        '    <script type="application/ld+json">',
        '    ' + JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        '    </script>'
    ];
    return [
        head({ lang: post.lang, title: post.title + ' | ' + t.blogTitle, description: post.description || post.title, canonical: post.url, type: 'article', alternates, extra }),
        '<body class="page-blog">',
        menubar(post.lang),
        windowOpen('~/notas/' + post.slug + '.md', 'post-title'),
        '                <header class="post-header">',
        '                    <p class="post-meta"><time datetime="' + published(post) + '">' + formatDate(post.date, post.lang) + '</time> · ' + t.reading(post.readingMinutes) + '</p>',
        '                    <h1 id="post-title">' + escapeHtml(post.title) + '</h1>',
        post.description ? '                    <p class="post-lead">' + escapeHtml(post.description) + '</p>' : '',
        '                    ' + tagsList(post.tags),
        other ? '                    <p class="post-translation"><a href="' + other.url + '" hreflang="' + other.lang + '" lang="' + other.lang + '">' + t.readOther + '</a></p>' : '',
        '                </header>',
        '                <div class="post-content">',
        post.html,
        '                </div>',
        '                <footer class="post-footer">',
        '                    <a href="' + t.index + '">' + t.allPosts + '</a>',
        '                    <a href="' + t.home + '">' + t.desktop + '</a>',
        '                </footer>',
        windowClose
    ].filter((line) => line !== '').join('\n');
}

// En cada índice, una sola versión por nota: la del idioma del índice si existe
function postsFor(lang, posts) {
    return posts.filter((post) => post.lang === lang || !posts.some((other) => other.slug === post.translation && other.lang === lang));
}

function renderIndex(lang, posts) {
    const t = L[lang];
    const other = lang === 'es' ? 'en' : 'es';
    const list = postsFor(lang, posts);
    const items = list.length
        ? '<ol class="post-list">\n' + list.map((post) => [
            '                    <li>',
            '                        <p class="post-meta"><time datetime="' + published(post) + '">' + formatDate(post.date, lang) + '</time>' + (post.lang !== lang ? ' · <span lang="' + post.lang + '">' + t.otherLang + '</span>' : '') + '</p>',
            '                        <h2><a href="' + post.url + '"' + (post.lang !== lang ? ' hreflang="' + post.lang + '"' : '') + '>' + escapeHtml(post.title) + '</a></h2>',
            post.description ? '                        <p>' + escapeHtml(post.description) + '</p>' : '',
            '                        ' + tagsList(post.tags),
            '                    </li>'
        ].filter(Boolean).join('\n')).join('\n') + '\n                </ol>'
        : '<p class="muted">' + t.empty + '</p>';
    return [
        head({ lang, title: t.blogTitle, description: t.blogDescription, canonical: t.index, type: 'website', alternates: [[lang, t.index], [other, L[other].index]] }),
        '<body class="page-blog">',
        menubar(lang),
        windowOpen(lang === 'es' ? '~/notas' : '~/notes', 'blog-title'),
        '                <header class="post-header">',
        '                    <h1 id="blog-title">' + t.blog + '</h1>',
        '                    <p class="post-lead">' + t.intro + '</p>',
        '                </header>',
        '                ' + items,
        '                <footer class="post-footer">',
        '                    <a href="/blog/feed.xml">' + t.rss + '</a>',
        '                    <a href="' + t.home + '">' + t.desktop + '</a>',
        '                </footer>',
        windowClose
    ].join('\n');
}

function renderFeed(posts) {
    const cdata = (text) => '<![CDATA[' + text.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
    const items = posts.map((post) => [
        '    <item>',
        '      <title>' + escapeHtml(post.title) + '</title>',
        '      <link>' + SITE + post.url + '</link>',
        '      <guid isPermaLink="true">' + SITE + post.url + '</guid>',
        '      <pubDate>' + rfc822(post) + '</pubDate>',
        '      <description>' + escapeHtml(post.description) + '</description>',
        ...post.tags.map((tag) => '      <category>' + escapeHtml(tag) + '</category>'),
        '      <content:encoded>' + cdata(post.html) + '</content:encoded>',
        '    </item>'
    ].join('\n'));
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
        '  <channel>',
        '    <title>' + L.es.blogTitle + '</title>',
        '    <link>' + SITE + '/blog/</link>',
        '    <atom:link href="' + SITE + '/blog/feed.xml" rel="self" type="application/rss+xml"/>',
        '    <description>' + L.es.blogDescription + '</description>',
        '    <language>es</language>',
        posts.length ? '    <lastBuildDate>' + rfc822(posts[0]) + '</lastBuildDate>' : '',
        ...items,
        '  </channel>',
        '</rss>',
        ''
    ].filter(Boolean).join('\n');
}

function renderJson(posts) {
    const data = posts.map(({ slug, title, description, date, lang, tags, translation, url, readingMinutes }) => ({ slug, title, description, date, lang, tags, translation, url, readingMinutes }));
    return JSON.stringify(data, null, 2) + '\n';
}

function renderSitemap(current, posts) {
    const start = current.indexOf(SITEMAP_START);
    const end = current.indexOf(SITEMAP_END);
    const url = (loc, lastmod, alternates, priority) => [
        '  <url>',
        '    <loc>' + SITE + loc + '</loc>',
        ...alternates.map(([lang, href]) => '    <xhtml:link rel="alternate" hreflang="' + lang + '" href="' + SITE + href + '"/>'),
        lastmod ? '    <lastmod>' + lastmod + '</lastmod>' : '',
        '    <priority>' + priority + '</priority>',
        '  </url>'
    ].filter(Boolean).join('\n');
    const latest = posts.length ? posts[0].date : '';
    const indexAlternates = [['es', '/blog/'], ['en', '/en/blog/']];
    const entries = [
        url('/blog/', latest, indexAlternates, '0.7'),
        url('/en/blog/', latest, indexAlternates, '0.6'),
        ...posts.map((post) => {
            const other = post.translation ? posts.find((p) => p.slug === post.translation) : null;
            return url(post.url, post.date, other ? [[post.lang, post.url], [other.lang, other.url]] : [], '0.6');
        })
    ];
    const block = '  ' + SITEMAP_START + '\n' + entries.join('\n') + '\n  ' + SITEMAP_END;
    if (start !== -1 && end !== -1) return current.slice(0, current.lastIndexOf('\n', start) + 1) + block + current.slice(end + SITEMAP_END.length);
    return current.replace('</urlset>', block + '\n</urlset>');
}

/* ---------- Generación ---------- */

export function build(root = ROOT) {
    const posts = loadPosts(root);
    const files = new Map();
    for (const post of posts) files.set(path.join('blog', post.slug, 'index.html'), renderPost(post, posts));
    files.set(path.join('blog', 'index.html'), renderIndex('es', posts));
    files.set(path.join('en', 'blog', 'index.html'), renderIndex('en', posts));
    files.set(path.join('blog', 'feed.xml'), renderFeed(posts));
    files.set(path.join('blog', 'posts.json'), renderJson(posts));
    const sitemap = path.join(root, 'sitemap.xml');
    files.set('sitemap.xml', renderSitemap(fs.readFileSync(sitemap, 'utf8'), posts));

    // Páginas de notas que ya no existen (generadas antes y luego borradas o pasadas a borrador)
    const stale = [];
    const blogDir = path.join(root, 'blog');
    if (fs.existsSync(blogDir)) {
        for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
            const page = path.join('blog', entry.name, 'index.html');
            if (entry.isDirectory() && !files.has(page) && fs.existsSync(path.join(root, page)) && fs.readFileSync(path.join(root, page), 'utf8').includes(MARKER)) stale.push(path.join('blog', entry.name));
        }
    }
    return { posts, files, stale };
}

function main() {
    const check = process.argv.includes('--check');
    const { posts, files, stale } = build();
    const changed = [...files].filter(([file, content]) => {
        const target = path.join(ROOT, file);
        return !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content;
    });
    if (check) {
        if (changed.length || stale.length) {
            console.error('El blog no está al día. Ejecuta: node tools/build-blog.mjs');
            for (const [file] of changed) console.error('  cambia: ' + file);
            for (const dir of stale) console.error('  sobra:  ' + dir);
            process.exit(1);
        }
        console.log('Blog al día (' + posts.length + ' notas).');
        return;
    }
    for (const [file, content] of changed) {
        fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
        fs.writeFileSync(path.join(ROOT, file), content);
    }
    for (const dir of stale) fs.rmSync(path.join(ROOT, dir), { recursive: true });
    console.log('Blog generado: ' + posts.length + ' notas, ' + changed.length + ' ficheros actualizados' + (stale.length ? ', ' + stale.length + ' eliminados' : '') + '.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        main();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
