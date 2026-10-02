/* Tests del formulario de contacto (worker/contact.js), sin Cloudflare ni red. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact, buildMime } from '../worker/contact.js';

const ORIGIN = 'https://josejordan.dev';
const valid = { name: 'Ana Núñez', email: 'ana@example.com', message: 'Hola, me interesa tu perfil.', website: '', elapsed: 5000, lang: 'es' };

function post(body, headers = {}) {
    return new Request(ORIGIN + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body)
    });
}

function setup(env = { CONTACT_TO: 'owner@example.com' }) {
    const sent = [];
    return { env, sent, send: async (from, to, raw) => { sent.push({ from, to, raw }); } };
}

const decodeBody = (raw) => Buffer.from(raw.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8');

test('sends a valid message with Reply-To and an encoded subject', async () => {
    const { env, sent, send } = setup();
    const response = await handleContact(post(valid), env, send);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].from, 'web@josejordan.dev');
    assert.equal(sent[0].to, 'owner@example.com');
    const [headers] = sent[0].raw.split('\r\n\r\n');
    assert.match(headers, /^Reply-To: <ana@example\.com>$/m);
    assert.match(headers, /^Subject: =\?UTF-8\?B\?/m);
    assert.match(headers, /^Message-ID: <[0-9a-f-]+@josejordan\.dev>$/m);
    assert.match(decodeBody(sent[0].raw), /Hola, me interesa tu perfil\./);
});

test('rejects other methods and cross-origin posts', async () => {
    const { env, send } = setup();
    assert.equal((await handleContact(new Request(ORIGIN + '/api/contact'), env, send)).status, 405);
    assert.equal((await handleContact(post(valid, { Origin: 'https://evil.example' }), env, send)).status, 403);
});

test('rejects invalid fields', async () => {
    const { env, sent, send } = setup();
    for (const patch of [{ name: '' }, { email: 'not-an-email' }, { email: 'a@b.c\r\nBcc: x@y.z' }, { message: 'corto' }, { name: 'x'.repeat(101) }]) {
        const response = await handleContact(post({ ...valid, ...patch }), env, send);
        assert.equal(response.status, 400, JSON.stringify(patch));
        assert.equal((await response.json()).error, 'invalid');
    }
    assert.equal((await handleContact(post('{not json'), env, send)).status, 400);
    assert.equal(sent.length, 0);
});

test('silently drops bots (honeypot or too fast)', async () => {
    const { env, sent, send } = setup();
    for (const patch of [{ website: 'http://spam.example' }, { elapsed: 500 }, { elapsed: undefined }]) {
        const response = await handleContact(post({ ...valid, ...patch }), env, send);
        assert.equal(response.status, 200);
    }
    assert.equal(sent.length, 0);
});

test('answers 503 when the destination is not configured', async () => {
    const { send } = setup();
    const response = await handleContact(post(valid), {}, send);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'not_configured');
});

test('answers 502 when sending fails', async () => {
    const original = console.error;
    console.error = () => {};
    try {
        const response = await handleContact(post(valid), { CONTACT_TO: 'owner@example.com' }, async () => { throw new Error('boom'); });
        assert.equal(response.status, 502);
    } finally {
        console.error = original;
    }
});

test('buildMime keeps lines short and uses CRLF', () => {
    const raw = buildMime({ from: 'web@josejordan.dev', to: 'a@b.co', replyTo: 'c@d.es', subject: 'Prueba', body: 'ñ'.repeat(300), domain: 'josejordan.dev' });
    const lines = raw.split('\r\n');
    assert.ok(lines.every((line) => line.length <= 78));
    assert.ok(!/[^\r]\n/.test(raw));
    assert.equal(decodeBody(raw), 'ñ'.repeat(300));
});
