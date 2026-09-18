/*
 * Terminal interactiva de josejordan.dev.
 * El contenido editable (textos, proyectos, enlaces) vive en content.js.
 */
(() => {
    'use strict';

    const site = typeof CONTENT !== 'undefined' ? CONTENT : {};
    const $ = (id) => document.getElementById(id);

    const terminal = $('terminal');
    const header = $('terminal-header');
    const body = $('terminal-body');
    const output = $('terminal-output');
    const form = $('input-form');
    const input = $('command-input');
    const desktopNote = $('desktop-note');
    const clock = $('clock');

    const mobileLayout = window.matchMedia('(max-width: 720px)');
    const touchLike = window.matchMedia('(hover: none) and (pointer: coarse)');
    const links = site.links || {};

    if (clock) startClock();
    if (!terminal || !input) return;

    /* ---------- Construcción de nodos ---------- */

    function el(tag, className, content) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        append(node, content);
        return node;
    }

    function append(node, content) {
        if (content == null) return;
        if (Array.isArray(content)) {
            content.forEach((item) => append(node, item));
        } else {
            node.append(content); // las cadenas se insertan como texto, nunca como HTML
        }
    }

    function link(href, text) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text || href;
        if (/^https?:/i.test(href)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        return a;
    }

    function kbd(text) {
        return el('kbd', null, text);
    }

    function shortUrl(url) {
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    }

    function createOutput() {
        const box = el('div', 'output');
        output.append(box);
        const api = {
            box,
            line: (content, cls) => box.append(el('p', 'line' + (cls ? ' ' + cls : ''), content)),
            muted: (content) => api.line(content, 'muted'),
            error: (content) => api.line(content, 'err'),
            node: (node) => box.append(node)
        };
        return api;
    }

    function echoCommand(text) {
        output.append(el('p', 'line', [el('span', 'prompt', '$'), ' ', el('span', 'cmd', text)]));
    }

    function scrollToEnd() {
        body.scrollTop = body.scrollHeight;
    }

    function pick(list) {
        return list && list.length ? list[Math.floor(Math.random() * list.length)] : '';
    }

    function openUrl(url) {
        window.open(url, '_blank', 'noopener');
    }

    /* ---------- Comandos ---------- */

    const commands = new Map();
    const history = [];
    let historyIndex = 0;
    let draft = '';

    function define(name, description, run, options) {
        commands.set(name, { name, description, run, hidden: Boolean(options && options.hidden) });
    }

    define('help', 'Lista los comandos disponibles', (out) => {
        const rows = el('div', 'rows');
        commands.forEach((cmd) => {
            if (!cmd.hidden) rows.append(el('span', 'key', cmd.name), el('span', null, cmd.description));
        });
        out.node(rows);
        out.muted(['Truco: ', kbd('Tab'), ' completa un comando y ', kbd('↑'), ' recupera los anteriores.']);
    });

    define('about', 'Quién soy', (out) => {
        (site.about || []).forEach((paragraph) => out.line(paragraph));
    });

    define('skills', 'Tecnologías con las que trabajo', (out) => {
        const rows = el('div', 'rows');
        (site.skills || []).forEach((group) => {
            rows.append(el('span', 'key', group.area), el('span', null, group.items.join(', ')));
        });
        out.node(rows);
    });

    define('projects', 'Proyectos destacados en GitHub', (out) => {
        const list = el('ol', 'projects');
        (site.projects || []).forEach((project) => {
            list.append(el('li', null, [link(project.url, project.name), el('span', 'tag', project.lang), el('br'), project.desc]));
        });
        out.node(list);
        out.muted(['Escribe ', kbd('open 1'), ' para abrir un proyecto o ', kbd('open github'), ' para ver todos los repositorios.']);
    });

    define('experience', 'Experiencia profesional', (out) => {
        const rows = el('div', 'rows spaced');
        (site.experience || []).forEach((job) => {
            const title = [el('strong', null, job.role)];
            if (job.place) title.push(' ', el('span', 'tag', job.place));
            rows.append(el('span', 'key', job.period), el('span', null, [...title, el('br'), job.desc]));
        });
        out.node(rows);
        out.muted(['El detalle completo está en el CV: escribe ', kbd('cv'), '.']);
    });

    define('education', 'Formación y certificaciones', (out) => {
        const rows = el('div', 'rows spaced');
        const lines = (items) => items.flatMap((text, i) => (i ? [el('br'), text] : [text]));
        if ((site.education || []).length) rows.append(el('span', 'key', 'Formación'), el('span', null, lines(site.education)));
        if ((site.certifications || []).length) rows.append(el('span', 'key', 'Certificaciones'), el('span', null, lines(site.certifications)));
        out.node(rows);
    });

    define('contact', 'Cómo contactar conmigo', (out) => {
        const rows = el('div', 'rows');
        const add = (key, href, text) => rows.append(el('span', 'key', key), el('span', null, link(href, text)));
        if (links.email) add('Email', 'mailto:' + links.email, links.email);
        if (links.linkedin) add('LinkedIn', links.linkedin, shortUrl(links.linkedin));
        if (links.github) add('GitHub', links.github, shortUrl(links.github));
        if (links.twitter) add('X', links.twitter, links.twitterHandle || shortUrl(links.twitter));
        out.node(rows);
    });

    define('cv', 'Currículum', (out) => {
        if (site.cvUrl) {
            out.line(['Abriendo el CV en una pestaña nueva: ', link(site.cvUrl, site.cvUrl)]);
            openUrl(site.cvUrl);
            return;
        }
        out.line('El CV en PDF no está publicado en la web.');
        const alternatives = [];
        if (links.linkedin) alternatives.push('Mi trayectoria está al día en ', link(links.linkedin, 'LinkedIn'));
        if (links.email) alternatives.push(alternatives.length ? ' y puedes pedírmelo por email a ' : 'Puedes pedírmelo por email a ', link('mailto:' + links.email, links.email));
        if (alternatives.length) out.line([...alternatives, '.']);
    });

    define('open', 'Abre un enlace: open github | linkedin | email | cv | <nº de proyecto>', (out, args) => {
        const target = (args[0] || '').toLowerCase();
        const projects = site.projects || [];
        const known = {
            github: links.github,
            linkedin: links.linkedin,
            twitter: links.twitter,
            x: links.twitter,
            email: links.email ? 'mailto:' + links.email : '',
            mail: links.email ? 'mailto:' + links.email : '',
            cv: site.cvUrl
        };
        let url = known[target];
        let label = target;
        if (/^\d+$/.test(target)) {
            const project = projects[Number(target) - 1];
            if (project) {
                url = project.url;
                label = project.name;
            }
        }
        if (!url) {
            out.error('open: no sé abrir «' + (args[0] || '') + '».');
            out.muted(['Prueba con ', kbd('open github'), ', ', kbd('open linkedin'), ', ', kbd('open email'), ' o ', kbd('open 1'), ' (número de proyecto).']);
            return;
        }
        out.line(['Abriendo ' + label + ' en una pestaña nueva: ', link(url, url.replace(/^mailto:/, ''))]);
        openUrl(url);
    });

    define('clear', 'Limpia la pantalla', () => {
        output.replaceChildren();
    });

    define('history', 'Muestra los últimos comandos', (out) => {
        const recent = history.slice(-20);
        if (!recent.length) {
            out.muted('Todavía no has escrito ningún comando.');
            return;
        }
        const start = history.length - recent.length + 1;
        recent.forEach((entry, i) => out.line(String(start + i).padStart(4) + '  ' + entry));
    });

    define('date', 'Fecha y hora actual', (out) => {
        out.line(new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'medium' }).format(new Date()));
    });

    define('echo', 'Repite lo que escribas', (out, args, argText) => {
        if (!argText) {
            out.line('');
            return;
        }
        out.line([argText, el('span', 'muted', ' (eco... eco... eco...)')]);
    });

    define('joke', 'Un chiste de programación', (out) => out.line(pick(site.jokes)));

    define('quote', 'Una cita sobre programación', (out) => out.line(pick(site.quotes)));

    /* Pequeños guiños que no aparecen en help */

    define('whoami', 'Usuario actual', (out) => out.line('invitado'), { hidden: true });
    define('hostname', 'Nombre del equipo', (out) => out.line(site.host || location.hostname), { hidden: true });
    define('pwd', 'Directorio actual', (out) => out.line('/home/' + (site.user || 'jose')), { hidden: true });

    const files = { 'about.txt': 'about', 'skills.txt': 'skills', 'projects.md': 'projects', 'contact.txt': 'contact', 'bienvenida.txt': null };
    const cvFile = site.cvUrl ? site.cvUrl.split('/').pop() : '';

    define('ls', 'Lista los ficheros', (out) => {
        const names = Object.keys(files);
        if (cvFile) names.push(cvFile);
        out.line(names.join('  '));
    }, { hidden: true });

    define('cat', 'Muestra un fichero', (out, args) => {
        const name = args[0] || '';
        if (cvFile && (name === cvFile || name === 'cv.pdf')) return commands.get('cv').run(out, [], '');
        if (name === 'bienvenida.txt') {
            out.line((site.about || [])[0] || site.name || '');
            out.muted(['Escribe ', kbd('help'), ' para ver los comandos.']);
            return;
        }
        const command = files[name];
        if (command) return commands.get(command).run(out, [], '');
        out.error('cat: ' + (name || '(ninguno)') + ': no existe el fichero. Prueba con ' + Object.keys(files).join(', ') + '.');
    }, { hidden: true });

    define('sudo', 'Permisos de administrador', (out) => {
        out.error('invitado no está en el fichero sudoers. Este incidente será reportado.');
    }, { hidden: true });

    define('exit', 'Cierra la terminal', () => closeTerminal(), { hidden: true });
    define('hola', 'Saludo', (out) => out.line(['¡Hola! Encantado de verte por aquí. Escribe ', kbd('help'), ' para empezar.']), { hidden: true });
    define('hello', 'Saludo', (out) => commands.get('hola').run(out, [], ''), { hidden: true });

    /* Alias en español (ocultos en help) */
    const aliases = { ayuda: 'help', habilidades: 'skills', proyectos: 'projects', experiencia: 'experience', formacion: 'education', 'formación': 'education', contacto: 'contact', limpiar: 'clear', fecha: 'date', salir: 'exit' };
    Object.entries(aliases).forEach(([name, target]) => {
        const command = commands.get(target);
        define(name, command.description, (out, args, argText) => command.run(out, args, argText), { hidden: true });
    });

    /* ---------- Ejecución ---------- */

    function suggest(name) {
        let best = null;
        let bestScore = 3;
        commands.forEach((cmd) => {
            const score = levenshtein(name, cmd.name);
            if (score < bestScore || (score === bestScore && best && !cmd.hidden && commands.get(best).hidden)) {
                best = cmd.name;
                bestScore = score;
            }
        });
        return bestScore <= 2 ? best : null;
    }

    function levenshtein(a, b) {
        const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            let diag = prev[0];
            prev[0] = i;
            for (let j = 1; j <= b.length; j++) {
                const tmp = prev[j];
                prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
                diag = tmp;
            }
        }
        return prev[b.length];
    }

    function run(raw) {
        const text = raw.trim();
        echoCommand(text);
        input.value = '';
        draft = '';
        if (text) {
            if (history[history.length - 1] !== text) history.push(text);
            historyIndex = history.length;
            const parts = text.split(/\s+/);
            const name = parts[0].toLowerCase();
            const args = parts.slice(1);
            const argText = text.slice(parts[0].length).trim();
            const command = commands.get(name);
            const out = createOutput();
            if (command) {
                command.run(out, args, argText);
            } else {
                out.error('bash: ' + parts[0] + ': comando no encontrado');
                const alternative = suggest(name);
                out.muted(alternative
                    ? ['¿Quisiste decir ', kbd(alternative), '?']
                    : ['Escribe ', kbd('help'), ' para ver los comandos disponibles.']);
            }
        }
        scrollToEnd();
    }

    function navigateHistory(step) {
        if (!history.length) return;
        if (historyIndex === history.length) draft = input.value;
        historyIndex = Math.min(Math.max(historyIndex + step, 0), history.length);
        input.value = historyIndex === history.length ? draft : history[historyIndex];
        input.setSelectionRange(input.value.length, input.value.length);
    }

    function complete() {
        const value = input.value;
        if (!value || /\s/.test(value.trim())) return;
        const prefix = value.trim().toLowerCase();
        const matches = [...commands.keys()].filter((name) => name.startsWith(prefix));
        if (matches.length === 1) {
            input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            echoCommand(value);
            createOutput().line(matches.join('  '));
            scrollToEnd();
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        run(input.value);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            navigateHistory(-1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            navigateHistory(1);
        } else if (event.key === 'Tab' && !event.shiftKey && input.value) {
            event.preventDefault();
            complete();
        } else if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection().toString()) {
            event.preventDefault();
            echoCommand(input.value + '^C');
            input.value = '';
            scrollToEnd();
        } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            output.replaceChildren();
        }
    });

    /* Cualquier clic en la terminal enfoca el input, salvo que se esté seleccionando texto */
    body.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input')) return;
        if (window.getSelection().toString()) return;
        input.focus({ preventScroll: true });
    });

    /* Escribir con la terminal desenfocada la despierta */
    document.addEventListener('keydown', (event) => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest('input, textarea, select, [contenteditable]')) return;
        if (event.key.length !== 1 && event.key !== 'Enter') return;
        openTerminal();
        input.focus();
    });

    /* ---------- Ventana ---------- */

    const closeButton = $('close-button');
    const minimizeButton = $('minimize-button');
    const maximizeButton = $('maximize-button');

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const menubarHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menubar-h')) || 0;

    function isMaximized() { return terminal.classList.contains('maximized'); }
    function isMinimized() { return terminal.classList.contains('minimized'); }

    function positionExplicitly() {
        if (terminal.classList.contains('is-positioned')) return;
        const rect = terminal.getBoundingClientRect();
        terminal.style.left = rect.left + 'px';
        terminal.style.top = rect.top + 'px';
        terminal.classList.add('is-positioned');
    }

    function keepInViewport() {
        if (!terminal.classList.contains('is-positioned') || isMaximized() || mobileLayout.matches) return;
        const rect = terminal.getBoundingClientRect();
        terminal.style.left = clamp(rect.left, 160 - rect.width, window.innerWidth - 160) + 'px';
        terminal.style.top = clamp(rect.top, menubarHeight(), window.innerHeight - 44) + 'px';
    }

    function openTerminal() {
        const wasHidden = terminal.classList.contains('is-closed') || isMinimized();
        terminal.classList.remove('is-closed', 'minimized');
        if (desktopNote) desktopNote.hidden = true;
        if (wasHidden) scrollToEnd();
    }

    function closeTerminal() {
        terminal.classList.add('is-closed');
        input.blur();
        if (desktopNote) desktopNote.hidden = false;
    }

    function toggleMaximize() {
        terminal.classList.remove('minimized');
        terminal.classList.toggle('maximized');
        maximizeButton.setAttribute('aria-label', isMaximized() ? 'Restaurar tamaño de la terminal' : 'Maximizar terminal');
        maximizeButton.title = isMaximized() ? 'Restaurar' : 'Maximizar';
        scrollToEnd();
    }

    closeButton.addEventListener('click', closeTerminal);

    minimizeButton.addEventListener('click', () => {
        terminal.classList.toggle('minimized');
        if (!isMinimized()) {
            scrollToEnd();
            input.focus({ preventScroll: true });
        }
    });

    maximizeButton.addEventListener('click', () => {
        toggleMaximize();
        input.focus({ preventScroll: true });
    });

    header.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        if (isMinimized()) openTerminal();
    });

    header.addEventListener('dblclick', (event) => {
        if (event.target.closest('button') || mobileLayout.matches) return;
        toggleMaximize();
    });

    let drag = null;

    header.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('button') || isMaximized() || mobileLayout.matches) return;
        positionExplicitly();
        const rect = terminal.getBoundingClientRect();
        drag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top, width: rect.width, moved: false };
        header.setPointerCapture(event.pointerId);
        terminal.classList.add('is-dragging');
    });

    header.addEventListener('pointermove', (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        drag.moved = true;
        terminal.style.left = clamp(event.clientX - drag.dx, 160 - drag.width, window.innerWidth - 160) + 'px';
        terminal.style.top = clamp(event.clientY - drag.dy, menubarHeight(), window.innerHeight - 44) + 'px';
    });

    function endDrag(event) {
        if (!drag || event.pointerId !== drag.id) return;
        drag = null;
        terminal.classList.remove('is-dragging');
    }

    header.addEventListener('pointerup', endDrag);
    header.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', keepInViewport);

    /* ---------- Iconos del escritorio ---------- */

    document.querySelectorAll('.icon[data-command]').forEach((icon) => {
        icon.addEventListener('click', () => {
            openTerminal();
            run(icon.dataset.command);
            if (!touchLike.matches) input.focus({ preventScroll: true });
        });
    });

    document.querySelectorAll('.icon[data-action="terminal"]').forEach((icon) => {
        icon.addEventListener('click', () => {
            openTerminal();
            input.focus({ preventScroll: true });
        });
    });

    /* ---------- Reloj ---------- */

    function startClock() {
        const format = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const tick = () => {
            const now = new Date();
            clock.textContent = format.format(now);
            clock.dateTime = now.toISOString();
        };
        tick();
        setInterval(tick, 15000);
    }

    /* ---------- Arranque ---------- */

    if (!touchLike.matches) input.focus({ preventScroll: true });
})();
