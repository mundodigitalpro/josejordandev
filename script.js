/*
 * Terminal interactiva de josejordan.dev (español e inglés).
 * El contenido editable (textos, proyectos, enlaces) vive en content.js.
 * El idioma lo marca el atributo lang del <html>: "es" en / y "en" en /en/.
 */
(() => {
    'use strict';

    const site = typeof CONTENT !== 'undefined' ? CONTENT : {};
    const LANG = document.documentElement.lang === 'en' ? 'en' : 'es';
    const LOCALE = LANG === 'en' ? 'en-GB' : 'es-ES';
    const OTHER_HOME = LANG === 'en' ? '/' : '/en/';
    const text = (site.text && site.text[LANG]) || {};
    const links = site.links || {};
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

    function link(href, label) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label || href;
        if (/^https?:/i.test(href)) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        return a;
    }

    function kbd(label) {
        return el('kbd', null, label);
    }

    function shortUrl(url) {
        return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    }

    function readPreference() {
        try { return localStorage.getItem('lang'); } catch (error) { return null; }
    }

    function savePreference(lang) {
        try { localStorage.setItem('lang', lang); } catch (error) { /* almacenamiento no disponible */ }
    }

    /* ---------- Textos de la interfaz ---------- */

    const UI = {
        es: {
            desc: {
                help: 'Lista los comandos disponibles',
                about: 'Quién soy',
                skills: 'Tecnologías con las que trabajo',
                projects: 'Proyectos destacados en GitHub',
                experience: 'Experiencia profesional',
                education: 'Formación y certificaciones',
                contact: 'Cómo contactar conmigo',
                cv: 'Currículum',
                open: 'Abre un enlace: open github | linkedin | email | cv | <nº de proyecto>',
                lang: 'Cambia el idioma: lang en | lang es',
                clear: 'Limpia la pantalla',
                history: 'Muestra los últimos comandos',
                date: 'Fecha y hora actual',
                echo: 'Repite lo que escribas',
                joke: 'Un chiste de programación',
                quote: 'Una cita sobre programación',
                whoami: 'Usuario actual',
                hostname: 'Nombre del equipo',
                pwd: 'Directorio actual',
                ls: 'Lista los ficheros',
                cat: 'Muestra un fichero',
                sudo: 'Permisos de administrador',
                exit: 'Cierra la terminal',
                hola: 'Saludo'
            },
            helpHint: () => ['Truco: ', kbd('Tab'), ' completa un comando y ', kbd('↑'), ' recupera los anteriores.'],
            projectsHint: () => ['Escribe ', kbd('open 1'), ' para abrir un proyecto o ', kbd('open github'), ' para ver todos los repositorios.'],
            experienceHint: () => ['El detalle completo está en el CV: escribe ', kbd('cv'), '.'],
            training: 'Formación',
            certifications: 'Certificaciones',
            cvOpening: 'Abriendo el CV en una pestaña nueva: ',
            cvMissing: 'El CV en PDF no está publicado en la web.',
            cvLinkedin: 'Mi trayectoria está al día en ',
            cvEmailAnd: ' y puedes pedírmelo por email a ',
            cvEmailOnly: 'Puedes pedírmelo por email a ',
            opening: (label) => 'Abriendo ' + label + ' en una pestaña nueva: ',
            openUnknown: (target) => 'open: no sé abrir «' + target + '».',
            openUsage: () => ['Prueba con ', kbd('open github'), ', ', kbd('open linkedin'), ', ', kbd('open email'), ' o ', kbd('open 1'), ' (número de proyecto).'],
            historyEmpty: 'Todavía no has escrito ningún comando.',
            echoSuffix: ' (eco... eco... eco...)',
            guest: 'invitado',
            welcomeFile: 'bienvenida.txt',
            welcomeHint: () => ['Escribe ', kbd('help'), ' para ver los comandos.'],
            catMissing: (name, list) => 'cat: ' + name + ': no existe el fichero. Prueba con ' + list + '.',
            catNone: '(ninguno)',
            sudo: 'invitado no está en el fichero sudoers. Este incidente será reportado.',
            greeting: () => ['¡Hola! Encantado de verte por aquí. Escribe ', kbd('help'), ' para empezar.'],
            notFound: (name) => 'bash: ' + name + ': comando no encontrado',
            didYouMean: (alternative) => ['¿Quisiste decir ', kbd(alternative), '?'],
            seeHelp: () => ['Escribe ', kbd('help'), ' para ver los comandos disponibles.'],
            langCurrent: () => ['Idioma actual: español. Escribe ', kbd('lang en'), ' para cambiar a inglés.'],
            langSame: 'Ya estás en la versión en español.',
            langSwitching: 'Cambiando a inglés…',
            otherLanguage: () => ['This site is also available in ', link('/en/', 'English'), '.'],
            restoreLabel: 'Restaurar tamaño de la terminal',
            maximizeLabel: 'Maximizar terminal',
            restore: 'Restaurar',
            maximize: 'Maximizar'
        },
        en: {
            desc: {
                help: 'List the available commands',
                about: 'Who I am',
                skills: 'Technologies I work with',
                projects: 'Featured projects on GitHub',
                experience: 'Work experience',
                education: 'Education and certifications',
                contact: 'How to reach me',
                cv: 'Résumé (CV)',
                open: 'Open a link: open github | linkedin | email | cv | <project number>',
                lang: 'Switch language: lang en | lang es',
                clear: 'Clear the screen',
                history: 'Show recent commands',
                date: 'Current date and time',
                echo: 'Repeat what you type',
                joke: 'A programming joke',
                quote: 'A quote about programming',
                whoami: 'Current user',
                hostname: 'Host name',
                pwd: 'Current directory',
                ls: 'List files',
                cat: 'Show a file',
                sudo: 'Administrator rights',
                exit: 'Close the terminal',
                hola: 'Greeting'
            },
            helpHint: () => ['Tip: ', kbd('Tab'), ' completes a command and ', kbd('↑'), ' brings back previous ones.'],
            projectsHint: () => ['Type ', kbd('open 1'), ' to open a project or ', kbd('open github'), ' to see all repositories.'],
            experienceHint: () => ['The full details are in the CV: type ', kbd('cv'), '.'],
            training: 'Education',
            certifications: 'Certifications',
            cvOpening: 'Opening the CV in a new tab: ',
            cvOpeningSpanish: 'Opening the CV (in Spanish) in a new tab: ',
            cvMissing: 'The CV is not published on this site yet.',
            cvLinkedin: 'My career history is up to date on ',
            cvEmailAnd: ' and you can request it by email at ',
            cvEmailOnly: 'You can request it by email at ',
            opening: (label) => 'Opening ' + label + ' in a new tab: ',
            openUnknown: (target) => "open: I don't know how to open “" + target + '”.',
            openUsage: () => ['Try ', kbd('open github'), ', ', kbd('open linkedin'), ', ', kbd('open email'), ' or ', kbd('open 1'), ' (project number).'],
            historyEmpty: 'You have not typed any commands yet.',
            echoSuffix: ' (echo... echo... echo...)',
            guest: 'guest',
            welcomeFile: 'welcome.txt',
            welcomeHint: () => ['Type ', kbd('help'), ' to see the commands.'],
            catMissing: (name, list) => 'cat: ' + name + ': no such file. Try ' + list + '.',
            catNone: '(none)',
            sudo: 'guest is not in the sudoers file. This incident will be reported.',
            greeting: () => ['Hi! Nice to see you here. Type ', kbd('help'), ' to get started.'],
            notFound: (name) => 'bash: ' + name + ': command not found',
            didYouMean: (alternative) => ['Did you mean ', kbd(alternative), '?'],
            seeHelp: () => ['Type ', kbd('help'), ' to see the available commands.'],
            langCurrent: () => ['Current language: English. Type ', kbd('lang es'), ' to switch to Spanish.'],
            langSame: 'You are already reading the English version.',
            langSwitching: 'Switching to Spanish…',
            otherLanguage: () => ['Este sitio también está disponible en ', link('/', 'español'), '.'],
            restoreLabel: 'Restore terminal size',
            maximizeLabel: 'Maximize terminal',
            restore: 'Restore',
            maximize: 'Maximize'
        }
    };

    const T = UI[LANG];

    /* ---------- Idioma: selector y aviso ---------- */

    document.querySelectorAll('.lang-switch a[hreflang]').forEach((anchor) => {
        anchor.addEventListener('click', () => savePreference(anchor.getAttribute('hreflang')));
    });

    const langHint = $('lang-hint');
    if (langHint) {
        const codes = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
        const detected = codes.reduce((found, code) => found || (/^es/i.test(code) ? 'es' : /^en/i.test(code) ? 'en' : ''), '') || 'en';
        if (detected !== LANG && readPreference() !== LANG) {
            langHint.replaceChildren(...T.otherLanguage());
            langHint.hidden = false;
        }
    }

    if (clock) startClock();
    if (!terminal || !input) return;

    /* ---------- Salida ---------- */

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

    function echoCommand(value) {
        output.append(el('p', 'line', [el('span', 'prompt', '$'), ' ', el('span', 'cmd', value)]));
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

    /* Las rutas relativas de content.js se resuelven contra la raíz del sitio, también desde /en/ */
    const siteUrl = (url) => (!url || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : '/' + url);
    const cvUrl = siteUrl(LANG === 'en' && site.cvUrlEn ? site.cvUrlEn : site.cvUrl);
    const cvInSpanish = LANG === 'en' && !site.cvUrlEn;
    const cvFile = cvUrl ? cvUrl.split('/').pop() : '';

    /* ---------- Comandos ---------- */

    const commands = new Map();
    const history = [];
    let historyIndex = 0;
    let draft = '';

    function define(name, run, options) {
        commands.set(name, { name, description: T.desc[name] || (options && options.description) || '', run, hidden: Boolean(options && options.hidden) });
    }

    define('help', (out) => {
        const rows = el('div', 'rows');
        commands.forEach((cmd) => {
            if (!cmd.hidden) rows.append(el('span', 'key', cmd.name), el('span', null, cmd.description));
        });
        out.node(rows);
        out.muted(T.helpHint());
    });

    define('about', (out) => {
        (text.about || []).forEach((paragraph) => out.line(paragraph));
    });

    define('skills', (out) => {
        const rows = el('div', 'rows');
        (text.skills || []).forEach((group) => {
            rows.append(el('span', 'key', group.area), el('span', null, group.items.join(', ')));
        });
        out.node(rows);
    });

    define('projects', (out) => {
        const list = el('ol', 'projects');
        (site.projects || []).forEach((project) => {
            const desc = typeof project.desc === 'string' ? project.desc : (project.desc[LANG] || project.desc.es || '');
            list.append(el('li', null, [link(project.url, project.name), el('span', 'tag', project.lang), el('br'), desc]));
        });
        out.node(list);
        out.muted(T.projectsHint());
    });

    define('experience', (out) => {
        const rows = el('div', 'rows spaced');
        (text.experience || []).forEach((job) => {
            const title = [el('strong', null, job.role)];
            if (job.place) title.push(' ', el('span', 'tag', job.place));
            rows.append(el('span', 'key', job.period), el('span', null, [...title, el('br'), job.desc]));
        });
        out.node(rows);
        out.muted(T.experienceHint());
    });

    define('education', (out) => {
        const rows = el('div', 'rows spaced');
        const lines = (items) => items.flatMap((item, i) => (i ? [el('br'), item] : [item]));
        if ((text.education || []).length) rows.append(el('span', 'key', T.training), el('span', null, lines(text.education)));
        if ((text.certifications || []).length) rows.append(el('span', 'key', T.certifications), el('span', null, lines(text.certifications)));
        out.node(rows);
    });

    define('contact', (out) => {
        const rows = el('div', 'rows');
        const add = (key, href, label) => rows.append(el('span', 'key', key), el('span', null, link(href, label)));
        if (links.email) add('Email', 'mailto:' + links.email, links.email);
        if (links.linkedin) add('LinkedIn', links.linkedin, shortUrl(links.linkedin));
        if (links.github) add('GitHub', links.github, shortUrl(links.github));
        if (links.twitter) add('X', links.twitter, links.twitterHandle || shortUrl(links.twitter));
        out.node(rows);
    });

    define('cv', (out) => {
        if (cvUrl) {
            out.line([cvInSpanish && T.cvOpeningSpanish ? T.cvOpeningSpanish : T.cvOpening, link(cvUrl, cvFile)]);
            openUrl(cvUrl);
            return;
        }
        out.line(T.cvMissing);
        const alternatives = [];
        if (links.linkedin) alternatives.push(T.cvLinkedin, link(links.linkedin, 'LinkedIn'));
        if (links.email) alternatives.push(alternatives.length ? T.cvEmailAnd : T.cvEmailOnly, link('mailto:' + links.email, links.email));
        if (alternatives.length) out.line([...alternatives, '.']);
    });

    define('open', (out, args) => {
        const target = (args[0] || '').toLowerCase();
        const projects = site.projects || [];
        const known = {
            github: links.github,
            linkedin: links.linkedin,
            twitter: links.twitter,
            x: links.twitter,
            email: links.email ? 'mailto:' + links.email : '',
            mail: links.email ? 'mailto:' + links.email : '',
            cv: cvUrl
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
            out.error(T.openUnknown(args[0] || ''));
            out.muted(T.openUsage());
            return;
        }
        out.line([T.opening(label), link(url, url.replace(/^mailto:/, ''))]);
        openUrl(url);
    });

    define('lang', (out, args) => {
        const target = (args[0] || '').toLowerCase();
        if (target === 'en' || target === 'es') {
            if (target === LANG) {
                out.line(T.langSame);
                return;
            }
            savePreference(target);
            out.line(T.langSwitching);
            setTimeout(() => location.assign(OTHER_HOME), 250);
            return;
        }
        out.line(T.langCurrent());
    });

    define('clear', () => {
        output.replaceChildren();
    });

    define('history', (out) => {
        const recent = history.slice(-20);
        if (!recent.length) {
            out.muted(T.historyEmpty);
            return;
        }
        const start = history.length - recent.length + 1;
        recent.forEach((entry, i) => out.line(String(start + i).padStart(4) + '  ' + entry));
    });

    define('date', (out) => {
        out.line(new Intl.DateTimeFormat(LOCALE, { dateStyle: 'full', timeStyle: 'medium' }).format(new Date()));
    });

    define('echo', (out, args, argText) => {
        if (!argText) {
            out.line('');
            return;
        }
        out.line([argText, el('span', 'muted', T.echoSuffix)]);
    });

    define('joke', (out) => out.line(pick(text.jokes)));

    define('quote', (out) => out.line(pick(text.quotes)));

    /* Pequeños guiños que no aparecen en help */

    define('whoami', (out) => out.line(T.guest), { hidden: true });
    define('hostname', (out) => out.line(site.host || location.hostname), { hidden: true });
    define('pwd', (out) => out.line('/home/' + (site.user || 'jose')), { hidden: true });

    const files = { 'about.txt': 'about', 'skills.txt': 'skills', 'projects.md': 'projects', 'experience.txt': 'experience', 'education.txt': 'education', 'contact.txt': 'contact' };
    files[T.welcomeFile] = null;

    define('ls', (out) => {
        const names = Object.keys(files);
        if (cvFile) names.push(cvFile);
        out.line(names.join('  '));
    }, { hidden: true });

    define('cat', (out, args) => {
        const name = args[0] || '';
        if (cvFile && (name === cvFile || name === 'cv.pdf')) return commands.get('cv').run(out, [], '');
        if (name === T.welcomeFile) {
            out.line((text.about || [])[0] || site.name || '');
            out.muted(T.welcomeHint());
            return;
        }
        const command = files[name];
        if (command) return commands.get(command).run(out, [], '');
        out.error(T.catMissing(name || T.catNone, Object.keys(files).join(', ')));
    }, { hidden: true });

    define('sudo', (out) => out.error(T.sudo), { hidden: true });
    define('exit', () => closeTerminal(), { hidden: true });
    define('hola', (out) => out.line(T.greeting()), { hidden: true });
    define('hello', (out) => out.line(T.greeting()), { hidden: true, description: T.desc.hola });

    /* Alias ocultos (español y algunos en inglés) */
    const aliases = {
        ayuda: 'help', habilidades: 'skills', proyectos: 'projects', experiencia: 'experience', formacion: 'education', 'formación': 'education',
        contacto: 'contact', idioma: 'lang', limpiar: 'clear', fecha: 'date', salir: 'exit', language: 'lang', resume: 'cv'
    };
    Object.entries(aliases).forEach(([name, targetName]) => {
        const command = commands.get(targetName);
        define(name, (out, args, argText) => command.run(out, args, argText), { hidden: true, description: command.description });
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
        const value = raw.trim();
        echoCommand(value);
        input.value = '';
        draft = '';
        if (value) {
            if (history[history.length - 1] !== value) history.push(value);
            historyIndex = history.length;
            const parts = value.split(/\s+/);
            const name = parts[0].toLowerCase();
            const args = parts.slice(1);
            const argText = value.slice(parts[0].length).trim();
            const command = commands.get(name);
            const out = createOutput();
            if (command) {
                command.run(out, args, argText);
            } else {
                out.error(T.notFound(parts[0]));
                const alternative = suggest(name);
                out.muted(alternative ? T.didYouMean(alternative) : T.seeHelp());
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
        maximizeButton.setAttribute('aria-label', isMaximized() ? T.restoreLabel : T.maximizeLabel);
        maximizeButton.title = isMaximized() ? T.restore : T.maximize;
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
        drag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top, width: rect.width };
        header.setPointerCapture(event.pointerId);
        terminal.classList.add('is-dragging');
    });

    header.addEventListener('pointermove', (event) => {
        if (!drag || event.pointerId !== drag.id) return;
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
        const format = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
