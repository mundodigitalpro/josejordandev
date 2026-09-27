/*
 * POST /api/contact: recibe el formulario de contacto de la web y lo envía por email
 * con Cloudflare Email Routing (binding send_email del Worker, sin servicios externos).
 *
 * Variables del Worker (Settings > Variables and Secrets):
 *   CONTACT_TO            Obligatoria. Dirección que recibe los mensajes; tiene que estar
 *                         verificada en Email Routing (por ejemplo, el Gmail al que reenvías info@).
 *   CONTACT_FROM          Opcional. Remitente, por defecto web@josejordan.dev. Debe ser del
 *                         dominio que tiene Email Routing activo.
 *   TURNSTILE_SECRET_KEY  Opcional. Si existe, se exige el captcha de Turnstile
 *                         (la clave pública va en turnstileSiteKey, en content.js).
 */

const LIMITS = { name: 100, email: 254, message: 5000, minMessage: 10, token: 2048, body: 20000 };
const MIN_ELAPSED_MS = 3000; // un humano tarda más que esto en rellenar el formulario
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const DEFAULT_FROM = 'web@josejordan.dev';

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

/* ---------- Mensaje MIME (texto plano UTF-8, sin librerías) ---------- */

function base64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

const encodeHeader = (value) => (/^[\x20-\x7e]*$/.test(value) ? value : '=?UTF-8?B?' + base64(value) + '?=');

export function buildMime({ from, to, replyTo, subject, body, domain }) {
    const headers = [
        'From: ' + encodeHeader('josejordan.dev') + ' <' + from + '>',
        'To: <' + to + '>',
        'Reply-To: <' + replyTo + '>',
        'Subject: ' + encodeHeader(subject),
        'Date: ' + new Date().toUTCString(),
        'Message-ID: <' + crypto.randomUUID() + '@' + domain + '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: base64'
    ];
    const encoded = base64(body.replace(/\r?\n/g, '\r\n')).replace(/.{76}/g, '$&\r\n');
    return headers.join('\r\n') + '\r\n\r\n' + encoded + '\r\n';
}

/* ---------- Petición ---------- */

/*
 * send(from, to, raw) entrega el mensaje; en el Worker usa el binding send_email
 * (ver worker/index.js). Se inyecta para poder probar este módulo fuera de Cloudflare.
 */
export async function handleContact(request, env, send) {
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST' });

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

    if (!send || !env.CONTACT_TO) return fail('not_configured', 503);

    if (env.TURNSTILE_SECRET_KEY) {
        const human = token && await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request.headers.get('CF-Connecting-IP'));
        if (!human) return fail('captcha', 400);
    }

    const from = env.CONTACT_FROM || DEFAULT_FROM;
    const mime = buildMime({
        from,
        to: env.CONTACT_TO,
        replyTo: email,
        subject: '[josejordan.dev] Mensaje de ' + name,
        domain: from.split('@')[1],
        body: [
            'Nombre: ' + name,
            'Email: ' + email,
            'Versión: ' + (lang === 'en' ? 'inglés (/en/)' : 'español (/)'),
            '',
            message,
            '',
            '--',
            'Enviado desde el formulario de contacto de https://josejordan.dev',
            'Responde a este correo para contestar directamente a ' + email + '.'
        ].join('\n')
    });

    try {
        await send(from, env.CONTACT_TO, mime);
    } catch (error) {
        console.error('send_email error', error && error.message);
        return fail('server', 502);
    }
    return json({ ok: true });
}
