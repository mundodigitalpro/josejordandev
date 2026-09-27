/*
 * Cloudflare Pages Function: POST /api/contact
 * Recibe el formulario de contacto de la web y lo reenvía por email con Resend (https://resend.com).
 *
 * Variables del proyecto de Pages (Settings > Variables and Secrets):
 *   RESEND_API_KEY        Secreto, obligatorio. Sin él la función responde 503 y la web ofrece el enlace mailto.
 *   TURNSTILE_SECRET_KEY  Secreto, opcional. Si existe, se exige el captcha de Turnstile
 *                         (la clave pública va en turnstileSiteKey, en content.js).
 *   CONTACT_TO            Opcional. Destinatario; por defecto info@josejordan.dev.
 *   CONTACT_FROM          Opcional. Remitente; por defecto "josejordan.dev <web@josejordan.dev>".
 *                         Su dominio tiene que estar verificado en Resend.
 */

const LIMITS = { name: 100, email: 254, message: 5000, minMessage: 10, token: 2048, body: 20000 };
const MIN_ELAPSED_MS = 3000; // un humano tarda más que esto en rellenar el formulario
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

function json(body, status, extraHeaders) {
    return new Response(JSON.stringify(body), {
        status: status || 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders }
    });
}

const fail = (error, status) => json({ ok: false, error }, status);
const text = (value) => (typeof value === 'string' ? value.trim() : '');

async function verifyTurnstile(secret, token, ip) {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
        const outcome = await response.json();
        return outcome.success === true;
    } catch (error) {
        return false;
    }
}

async function handlePost(request, env) {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return fail('forbidden', 403);
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) return fail('invalid', 415);

    const raw = await request.text();
    if (raw.length > LIMITS.body) return fail('invalid', 413);
    let data;
    try {
        data = JSON.parse(raw);
    } catch (error) {
        return fail('invalid', 400);
    }
    if (!data || typeof data !== 'object') return fail('invalid', 400);

    /* Bots: campo trampa relleno o envío instantáneo. Se responde como si todo fuera bien. */
    if (text(data.website) || !(Number(data.elapsed) >= MIN_ELAPSED_MS)) return json({ ok: true });

    const name = text(data.name).replace(/\s+/g, ' ');
    const email = text(data.email);
    const message = text(data.message);
    const token = text(data.token);
    const lang = data.lang === 'en' ? 'en' : 'es';
    if (!name || name.length > LIMITS.name) return fail('invalid', 400);
    if (email.length > LIMITS.email || !EMAIL_RE.test(email)) return fail('invalid', 400);
    if (message.length < LIMITS.minMessage || message.length > LIMITS.message) return fail('invalid', 400);
    if (token.length > LIMITS.token) return fail('invalid', 400);

    if (!env.RESEND_API_KEY) return fail('not_configured', 503);

    if (env.TURNSTILE_SECRET_KEY) {
        const human = token && await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request.headers.get('CF-Connecting-IP'));
        if (!human) return fail('captcha', 400);
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: env.CONTACT_FROM || 'josejordan.dev <web@josejordan.dev>',
            to: [env.CONTACT_TO || 'info@josejordan.dev'],
            reply_to: email,
            subject: '[josejordan.dev] Mensaje de ' + name,
            text: [
                'Nombre: ' + name,
                'Email: ' + email,
                'Versión: ' + (lang === 'en' ? 'inglés (/en/)' : 'español (/)'),
                '',
                message,
                '',
                '--',
                'Enviado desde el formulario de contacto de https://josejordan.dev'
            ].join('\n')
        })
    }).catch(() => null);

    if (!response || !response.ok) {
        console.error('Resend error', response ? response.status + ' ' + await response.text() : 'network');
        return fail('server', 502);
    }
    return json({ ok: true });
}

export async function onRequest({ request, env }) {
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST' });
    return handlePost(request, env || {});
}
