/*
 * Pruebas en navegador con Playwright (Chromium). Si Playwright no está instalado
 * se omiten. En CI: npm install --no-save playwright && npx playwright install chromium.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from './server.mjs';

let chromium = null;
try {
    ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch (error) {
    /* Playwright no disponible */
}

const skip = chromium ? false : 'Playwright no está instalado';

test('desktop, terminal and windows work in both languages', { skip, timeout: 90000 }, async () => {
    const server = await startServer();
    const browser = await chromium.launch();
    try {
        for (const [lang, home] of [['es', '/'], ['en', '/en/']]) {
            const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.addInitScript((value) => localStorage.setItem('lang', value), lang);
            await page.goto(server.url + home);
            assert.equal(await page.getAttribute('html', 'lang'), lang);

            const run = async (command) => {
                await page.fill('#command-input', command);
                await page.press('#command-input', 'Enter');
                return page.locator('.output').last().textContent();
            };

            assert.match(await run('help'), /neofetch/);
            assert.ok((await run('about')).length > 100, 'about text');
            assert.match(await run('nonexistent'), /nonexistent/);
            assert.match(await run('neofetch'), /jose@josejordan\.dev/);

            await run('theme noche');
            assert.equal(await page.getAttribute('html', 'data-theme'), 'noche');
            await run('theme cordoba');
            assert.equal(await page.getAttribute('html', 'data-theme'), null);

            await page.click('.icon[data-open="projects"]');
            const cards = await page.locator('#projects .pj-card').count();
            assert.ok(cards > 3, 'project cards');
            await page.click('#projects .pj-filter:has-text("Python")');
            const visible = await page.locator('#projects .pj-card:visible').count();
            assert.ok(visible > 0 && visible < cards, 'language filter');

            await page.click('.dock-item[data-window="minesweeper"]');
            assert.ok(await page.locator('#minesweeper .ms-cell').count() > 50, 'minesweeper board');

            await page.click('.dock-item[data-window="terminal"]');
            await run('mail Hola, me interesa tu perfil');
            assert.equal(await page.inputValue('#cf-message'), 'Hola, me interesa tu perfil');
            await page.fill('#cf-name', 'Ana');
            await page.fill('#cf-email', 'ana@example.com');
            await page.waitForTimeout(3100); // el servidor descarta envíos de menos de 3 s
            await page.click('#contact .cf-submit');
            await page.waitForSelector('#contact .cf-status.is-ok');

            assert.deepEqual(errors, []);
            await page.close();
        }
        assert.equal(server.sent.length, 2);
    } finally {
        await browser.close();
        await server.close();
    }
});

test('mobile layout keeps the dock on screen', { skip, timeout: 60000 }, async () => {
    const server = await startServer();
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
        await page.addInitScript(() => localStorage.setItem('lang', 'es'));
        await page.goto(server.url + '/?open=projects');
        assert.equal(await page.locator('#projects:not(.is-closed)').count(), 1);
        assert.ok(await page.evaluate(() => document.querySelector('.dock').scrollWidth <= window.innerWidth));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    } finally {
        await browser.close();
        await server.close();
    }
});

test('the service worker makes the site work offline', { skip, timeout: 60000 }, async () => {
    const server = await startServer();
    const browser = await chromium.launch();
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.addInitScript(() => localStorage.setItem('lang', 'es'));
        await page.goto(server.url + '/');
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.reload(); // ya controlada por el service worker
        await context.setOffline(true);
        await page.reload();
        await page.fill('#command-input', 'skills');
        await page.press('#command-input', 'Enter');
        assert.match(await page.locator('.output').last().textContent(), /Python/);
    } finally {
        await browser.close();
        await server.close();
    }
});
