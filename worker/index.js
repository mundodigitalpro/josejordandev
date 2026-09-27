/*
 * Worker de josejordan.dev: sirve la web estática (binding ASSETS) y atiende
 * POST /api/contact, que envía el formulario de contacto con Cloudflare Email Routing.
 * La configuración está en wrangler.jsonc.
 */
import { EmailMessage } from 'cloudflare:email';
import { handleContact } from './contact.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === '/api/contact') {
            const send = env.MAILER
                ? (from, to, raw) => env.MAILER.send(new EmailMessage(from, to, raw))
                : null;
            return handleContact(request, env, send);
        }
        return env.ASSETS.fetch(request);
    }
};
