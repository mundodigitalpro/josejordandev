/* Comprobaciones estáticas del sitio: estructura bilingüe, ficheros referenciados, CSP y PWA. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './server.mjs';

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = (urlPath) => fs.existsSync(path.join(ROOT, urlPath.replace(/^\//, '').split(/[?#]/)[0]));
const BLOG_PAGES = ['blog', 'en/blog'].flatMap((dir) => fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir), { recursive: true }).filter((file) => String(file).endsWith('.html')).map((file) => dir + '/' + file)
    : []);
const PAGES = ['index.html', 'en/index.html', '404.html', 'privacy.html', ...BLOG_PAGES];

// Esqueleto de etiquetas, atributos estructurales y ningún texto
function skeleton(html) {
    return html
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
        .replace(/<head>[\s\S]*?<\/head>/, '')
        .match(/<\/?[a-z][^>]*>/gi)
        .map((tag) => tag.replace(/\s(?:aria-label|title|lang|hreflang|aria-current|href)="[^"]*"/g, ''));
}

test('Spanish and English home pages share the same structure', () => {
    assert.deepEqual(skeleton(read('en/index.html')), skeleton(read('index.html')));
});

test('every local file referenced by the pages exists', () => {
    for (const page of PAGES) {
        const refs = [...read(page).matchAll(/\s(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
        for (const ref of refs) {
            if (ref === '/privacy') continue;
            assert.ok(exists(ref) || (ref.endsWith('/') && exists(ref + 'index.html')), page + ' references a missing file: ' + ref);
        }
    }
});

test('pages respect the CSP (no inline scripts, styles or handlers)', () => {
    for (const page of PAGES) {
        const html = read(page);
        assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>/i, page + ': inline <script>');
        assert.doesNotMatch(html, /<style[\s>]/i, page + ': inline <style>');
        assert.doesNotMatch(html, /\sstyle="/i, page + ': style="" attribute');
        assert.doesNotMatch(html, /\son[a-z]+="/i, page + ': inline event handler');
    }
});

test('JSON-LD blocks are valid JSON', () => {
    for (const page of ['index.html', 'en/index.html', ...BLOG_PAGES.filter((file) => !/^(en\/)?blog\/index\.html$/.test(file))]) {
        const block = read(page).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert.ok(block, page + ' has JSON-LD');
        assert.doesNotThrow(() => JSON.parse(block[1]), page);
    }
});

test('the PWA manifest and the service worker only point to existing files', () => {
    const manifest = JSON.parse(read('manifest.webmanifest'));
    for (const icon of manifest.icons) assert.ok(exists(icon.src), 'manifest icon ' + icon.src);
    const precache = read('sw.js').match(/const PRECACHE = \[([\s\S]*?)\]/)[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
    assert.ok(precache.length > 5);
    for (const file of precache) {
        if (file === '/' || file === '/en/') continue;
        assert.ok(exists(file), 'sw.js precaches a missing file: ' + file);
    }
});

test('content.js has every project and text in both languages', () => {
    const sandbox = {};
    new Function('globalThis', read('content.js') + '\nglobalThis.CONTENT = CONTENT;')(sandbox);
    const { projects, text } = sandbox.CONTENT;
    for (const project of projects) {
        assert.ok(project.name && /^https:\/\//.test(project.url), 'project ' + project.name);
        assert.ok(typeof project.desc === 'string' || (project.desc.es && project.desc.en), 'desc of ' + project.name);
    }
    assert.deepEqual(Object.keys(text.en).sort(), Object.keys(text.es).sort());
});

test('repository-only files are hidden from the deployed site', () => {
    const redirects = read('_redirects');
    const ignored = read('.assetsignore');
    for (const entry of ['CLAUDE.md', 'README.md', 'wrangler.jsonc', 'worker', 'tests', 'posts', 'tools', '.github']) {
        assert.ok(redirects.includes('/' + entry), '_redirects misses ' + entry);
        assert.ok(ignored.split('\n').includes(entry), '.assetsignore misses ' + entry);
    }
});

test('code always revalidates, so a new HTML page never runs an old script', () => {
    // Sin esto el navegador puede reutilizar un script.js antiguo de su caché HTTP (pasó con la ventana Notas)
    assert.match(read('sw.js'), /fetch\(request, \{ cache: 'no-cache' \}\)/);
    const headers = read('_headers');
    for (const file of ['/sw.js', '/script.js', '/content.js', '/lang.js', '/minesweeper.js', '/styles.css', '/blog.css', '/blog/posts.json']) {
        assert.match(headers, new RegExp('^' + file.replace(/[.*/]/g, '\\$&') + '\\n  Cache-Control: no-cache$', 'm'), file);
    }
});
