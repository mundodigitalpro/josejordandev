/* Tests del generador del blog (tools/build-blog.mjs). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { markdownToHtml, parsePost, build, slugify } from '../tools/build-blog.mjs';
import { ROOT } from './server.mjs';

test('markdown: headings, emphasis, lists, code and quotes', () => {
    const html = markdownToHtml([
        '# Título', '', 'Texto con **negrita**, *cursiva* y `código`.', '',
        '- uno', '- dos', '', '1. primero', '2. segundo', '',
        '```js', 'const a = 1 < 2;', '```', '', '> cita', '', '---'
    ].join('\n'));
    assert.match(html, /<h2 id="titulo">Título<\/h2>/);
    assert.match(html, /<strong>negrita<\/strong>, <em>cursiva<\/em> y <code>código<\/code>/);
    assert.match(html, /<ul><li>uno<\/li><li>dos<\/li><\/ul>/);
    assert.match(html, /<ol><li>primero<\/li><li>segundo<\/li><\/ol>/);
    assert.match(html, /<pre><code class="language-js">const a = 1 &lt; 2;<\/code><\/pre>/);
    assert.match(html, /<blockquote><p>cita<\/p><\/blockquote>/);
    assert.match(html, /<hr>/);
});

test('markdown: raw HTML is escaped and dangerous links are neutralised', () => {
    const html = markdownToHtml('<script>alert(1)</script> [a](javascript:alert(1)) [b](https://example.com) [c](/blog/) ![x](data:image/png;base64,AAA)');
    assert.doesNotMatch(html, /<script/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /<a href="#">a<\/a>/);
    assert.match(html, /<a href="https:\/\/example\.com" rel="noopener noreferrer">b<\/a>/);
    assert.match(html, /<a href="\/blog\/">c<\/a>/);
    assert.match(html, /<img src="#" alt="x"/);
});

test('markdown: repeated headings get unique ids', () => {
    const html = markdownToHtml('## Uno\n\n## Uno');
    assert.match(html, /id="uno"/);
    assert.match(html, /id="uno-2"/);
});

test('slugify removes accents and symbols', () => {
    assert.equal(slugify('¿Cómo está hecha esta web?'), 'como-esta-hecha-esta-web');
});

test('parsePost reads the front matter and validates it', () => {
    const post = parsePost('---\ntitle: Hola\ndate: 2026-10-02\nlang: es\ntags: [a, "b"]\n---\n\nUna nota corta.', 'hola.md');
    assert.equal(post.url, '/blog/hola/');
    assert.deepEqual(post.tags, ['a', 'b']);
    assert.equal(post.readingMinutes, 1);
    assert.throws(() => parsePost('sin cabecera', 'x.md'), /cabecera/);
    assert.throws(() => parsePost('---\ntitle: X\ndate: 2026-10-02\nlang: fr\n---\n', 'x.md'), /lang/);
    assert.throws(() => parsePost('---\ntitle: X\ndate: 2/10/2026\nlang: es\n---\n', 'x.md'), /date/);
    assert.throws(() => parsePost('---\ntitle: X\ndate: 2026-10-02\nlang: es\n---\n', 'Mal Nombre.md'), /nombre del fichero/);
});

test('the generated blog in the repository is up to date', () => {
    const { files, stale } = build();
    for (const [file, content] of files) {
        const target = path.join(ROOT, file);
        assert.ok(fs.existsSync(target) && fs.readFileSync(target, 'utf8') === content, file + ' is stale: run node tools/build-blog.mjs');
    }
    assert.deepEqual(stale, []);
});
