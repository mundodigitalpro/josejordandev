/*
 * Servidor local para los tests: sirve la web y atiende /api/contact con el
 * mismo código del Worker, pero con un envío falso que guarda los mensajes.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from '../worker/contact.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.png': 'image/png', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json',
    '.json': 'application/json', '.xml': 'application/xml'
};

export function startServer(env = { CONTACT_TO: 'owner@example.com' }) {
    const sent = [];
    const send = async (from, to, raw) => { sent.push({ from, to, raw }); };
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/api/contact') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            const request = new Request(new URL(req.url, 'http://' + req.headers.host), {
                method: req.method,
                headers: req.headers,
                body: req.method === 'POST' ? Buffer.concat(chunks) : undefined
            });
            const response = await handleContact(request, env, send);
            res.writeHead(response.status, Object.fromEntries(response.headers));
            res.end(await response.text());
            return;
        }
        let file = path.join(ROOT, decodeURIComponent(url.pathname));
        if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
        if (file.endsWith(path.sep)) file += 'index.html';
        try {
            const data = await fs.readFile(file);
            res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
            res.end(data);
        } catch (error) {
            res.writeHead(404);
            res.end();
        }
    });
    return new Promise((resolve) => {
        // "localhost" para que el service worker se registre como en HTTPS
        server.listen(0, 'localhost', () => {
            resolve({ url: 'http://localhost:' + server.address().port, sent, close: () => new Promise((done) => server.close(done)) });
        });
    });
}
