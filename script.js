/*
 * Escritorio y terminal interactiva de josejordan.dev (español e inglés).
 * El contenido editable (textos, proyectos, enlaces) vive en content.js.
 * El idioma lo marca el atributo lang del <html>: "es" en / y "en" en /en/.
 * El Buscaminas vive en minesweeper.js y se abre en su propia ventana.
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
    const body = $('terminal-body');
    const output = $('terminal-output');
    const form = $('input-form');
    const input = $('command-input');
    const desktopNote = $('desktop-note');
    const clock = $('clock');

    const mobileLayout = window.matchMedia('(max-width: 720px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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

    function readStorage(key) {
        try { return localStorage.getItem(key); } catch (error) { return null; }
    }

    function writeStorage(key, value) {
        try { localStorage.setItem(key, value); } catch (error) { /* almacenamiento no disponible */ }
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
                mail: 'Envíame un mensaje: mail [texto]',
                open: 'Abre un enlace: open github | linkedin | email | cv | <nº de proyecto>',
                lang: 'Cambia el idioma: lang en | lang es',
                minesweeper: 'Abre el Buscaminas en su ventana',
                guess: 'Juego: adivina el número del 1 al 100',
                theme: 'Cambia el tema del escritorio: theme [nombre]',
                neofetch: 'Ficha del sistema',
                matrix: 'Lluvia de código (pulsa una tecla para salir)',
                blog: 'Notas del blog: blog [nº] abre una',
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
            minesweeperOpened: 'Buscaminas abierto en su propia ventana. La terminal sigue disponible desde el dock.',
            guessIntro: () => ['He pensado un número entre 1 y 100. Escribe tu intento, o ', kbd('salir'), ' para dejarlo.'],
            guessInvalid: 'Escribe un número entero entre 1 y 100.',
            guessHigher: 'Más alto.',
            guessLower: 'Más bajo.',
            guessWin: (n) => '¡Correcto! Lo has adivinado en ' + n + (n === 1 ? ' intento.' : ' intentos.'),
            guessRecord: ' Nuevo récord.',
            guessBest: (n) => 'Tu mejor marca: ' + n + (n === 1 ? ' intento.' : ' intentos.'),
            guessQuit: (secret) => 'Partida abandonada. El número era ' + secret + '.',
            restoreLabel: { terminal: 'Restaurar tamaño de la terminal', projects: 'Restaurar tamaño de Proyectos', blog: 'Restaurar tamaño de Notas' },
            maximizeLabel: { terminal: 'Maximizar terminal', projects: 'Maximizar Proyectos', blog: 'Maximizar Notas' },
            restore: 'Restaurar',
            maximize: 'Maximizar',
            contactHint: () => ['Escribe ', kbd('mail'), ' para enviarme un mensaje sin salir de aquí.'],
            mailOpened: 'Formulario de contacto abierto en su propia ventana.',
            projectsIntro: 'Una selección de proyectos personales. Filtra por lenguaje o abre el código en GitHub.',
            projectsFilter: 'Filtrar por lenguaje',
            projectsAll: 'Todos',
            projectCode: 'Código',
            projectDemo: 'Demo',
            projectsMore: 'Más repositorios en ',
            contactIntro: '¿Un proyecto, una oferta o una pregunta? Escríbeme y te respondo por email.',
            contactName: 'Nombre',
            contactEmail: 'Tu email',
            contactMessage: 'Mensaje',
            contactHoneypot: 'Deja este campo vacío',
            contactSend: 'Enviar mensaje',
            contactSending: 'Enviando…',
            contactSent: '¡Mensaje enviado! Te responderé lo antes posible.',
            contactInvalid: 'Revisa los campos: nombre, un email válido y un mensaje de al menos 10 caracteres.',
            contactCaptcha: 'Completa la verificación antes de enviar.',
            contactFailed: 'No se ha podido enviar el mensaje. Puedes escribirme directamente a ',
            contactOr: 'También puedes escribirme a ',
            contactSubject: 'Contacto desde josejordan.dev',
            themes: {
                cordoba: 'Atardecer sobre Córdoba (por defecto)',
                noche: 'Noche azul junto al Guadalquivir',
                mezquita: 'Rojo y crema de los arcos de la Mezquita',
                matrix: 'Verde fósforo sobre negro'
            },
            themeHint: () => ['Escribe ', kbd('theme noche'), ' para cambiarlo. Se recuerda en tus próximas visitas.'],
            themeUnknown: (name) => 'theme: no existe el tema «' + name + '».',
            themeApplied: (name) => 'Tema «' + name + '» aplicado.',
            themeCurrent: '(actual)',
            neofetch: {
                os: 'SO', location: 'Ubicación', kernel: 'Núcleo', uptime: 'Activo', shell: 'Shell',
                resolution: 'Resolución', theme: 'Tema', language: 'Idioma', stack: 'Stack', commands: 'Comandos'
            },
            neofetchValues: {
                os: 'josejordan.dev (escritorio web)',
                location: 'Córdoba, España',
                kernel: 'JavaScript sin dependencias',
                language: 'español (lang en para inglés)',
                commands: (n) => n + ' visibles, y alguno escondido'
            },
            uptime: (minutes) => (minutes < 1 ? 'menos de un minuto' : minutes + (minutes === 1 ? ' minuto' : ' minutos')),
            matrixHint: 'Despierta, Neo… Pulsa cualquier tecla o toca la pantalla para salir.',
            matrixReduced: 'Tienes activada la reducción de movimiento, así que la lluvia de código se queda en el tintero.',
            blogIntro: 'Lo que voy aprendiendo y construyendo. Cada nota se abre en su propia página.',
            blogLoading: 'Cargando notas…',
            blogError: 'No se han podido cargar las notas. Puedes verlas en ',
            blogEmpty: 'Todavía no hay notas publicadas.',
            blogAll: 'Todas las notas',
            blogReading: (n) => n + ' min de lectura',
            blogOtherLang: 'en inglés',
            blogHint: () => ['Escribe ', kbd('blog 1'), ' para leer una nota o abre la ventana Notas del escritorio.'],
            blogOpening: (title) => 'Abriendo «' + title + '»…',
            blogUnknown: (n) => 'blog: no hay ninguna nota con el número ' + n + '.'
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
                mail: 'Send me a message: mail [text]',
                open: 'Open a link: open github | linkedin | email | cv | <project number>',
                lang: 'Switch language: lang en | lang es',
                minesweeper: 'Open Minesweeper in its own window',
                guess: 'Game: guess the number from 1 to 100',
                theme: 'Change the desktop theme: theme [name]',
                neofetch: 'System information',
                matrix: 'Digital rain (press any key to stop)',
                blog: 'Blog notes: blog [number] opens one',
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
            minesweeperOpened: 'Minesweeper is open in its own window. The terminal stays available from the dock.',
            guessIntro: () => ['I am thinking of a number between 1 and 100. Type your guess, or ', kbd('exit'), ' to give up.'],
            guessInvalid: 'Type a whole number between 1 and 100.',
            guessHigher: 'Higher.',
            guessLower: 'Lower.',
            guessWin: (n) => 'Correct! You got it in ' + n + (n === 1 ? ' try.' : ' tries.'),
            guessRecord: ' New record.',
            guessBest: (n) => 'Your best: ' + n + (n === 1 ? ' try.' : ' tries.'),
            guessQuit: (secret) => 'Game over. The number was ' + secret + '.',
            restoreLabel: { terminal: 'Restore terminal size', projects: 'Restore Projects size', blog: 'Restore Notes size' },
            maximizeLabel: { terminal: 'Maximize terminal', projects: 'Maximize Projects', blog: 'Maximize Notes' },
            restore: 'Restore',
            maximize: 'Maximize',
            contactHint: () => ['Type ', kbd('mail'), ' to send me a message from right here.'],
            mailOpened: 'The contact form is open in its own window.',
            projectsIntro: 'A selection of personal projects. Filter by language or open the code on GitHub.',
            projectsFilter: 'Filter by language',
            projectsAll: 'All',
            projectCode: 'Code',
            projectDemo: 'Demo',
            projectsMore: 'More repositories at ',
            contactIntro: 'A project, a job offer or a question? Write to me and I will reply by email.',
            contactName: 'Name',
            contactEmail: 'Your email',
            contactMessage: 'Message',
            contactHoneypot: 'Leave this field empty',
            contactSend: 'Send message',
            contactSending: 'Sending…',
            contactSent: 'Message sent! I will get back to you as soon as possible.',
            contactInvalid: 'Please check the fields: a name, a valid email and a message of at least 10 characters.',
            contactCaptcha: 'Please complete the verification before sending.',
            contactFailed: 'The message could not be sent. You can write to me directly at ',
            contactOr: 'You can also write to me at ',
            contactSubject: 'Contact from josejordan.dev',
            themes: {
                cordoba: 'Sunset over Córdoba (default)',
                noche: 'Blue night by the Guadalquivir',
                mezquita: 'Red and cream of the Mezquita arches',
                matrix: 'Phosphor green on black'
            },
            themeHint: () => ['Type ', kbd('theme noche'), ' to switch. It is remembered on your next visits.'],
            themeUnknown: (name) => 'theme: there is no theme “' + name + '”.',
            themeApplied: (name) => 'Theme “' + name + '” applied.',
            themeCurrent: '(current)',
            neofetch: {
                os: 'OS', location: 'Location', kernel: 'Kernel', uptime: 'Uptime', shell: 'Shell',
                resolution: 'Resolution', theme: 'Theme', language: 'Language', stack: 'Stack', commands: 'Commands'
            },
            neofetchValues: {
                os: 'josejordan.dev (web desktop)',
                location: 'Córdoba, Spain',
                kernel: 'Dependency-free JavaScript',
                language: 'English (lang es for Spanish)',
                commands: (n) => n + ' visible, and a few hidden ones'
            },
            uptime: (minutes) => (minutes < 1 ? 'less than a minute' : minutes + (minutes === 1 ? ' minute' : ' minutes')),
            matrixHint: 'Wake up, Neo… Press any key or tap the screen to stop.',
            matrixReduced: 'Reduced motion is on, so the digital rain stays in the drawer.',
            blogIntro: 'What I am learning and building. Each note opens on its own page.',
            blogLoading: 'Loading notes…',
            blogError: 'The notes could not be loaded. You can read them at ',
            blogEmpty: 'No notes published yet.',
            blogAll: 'All notes',
            blogReading: (n) => n + ' min read',
            blogOtherLang: 'in Spanish',
            blogHint: () => ['Type ', kbd('blog 1'), ' to read a note or open the Notes window on the desktop.'],
            blogOpening: (title) => 'Opening “' + title + '”…',
            blogUnknown: (n) => 'blog: there is no note number ' + n + '.'
        }
    };

    const T = UI[LANG];

    /* ---------- Idioma: selector y aviso ---------- */

    document.querySelectorAll('.lang-switch a[hreflang]').forEach((anchor) => {
        anchor.addEventListener('click', () => writeStorage('lang', anchor.getAttribute('hreflang')));
    });

    const langHint = $('lang-hint');
    if (langHint) {
        const codes = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
        const detected = codes.reduce((found, code) => found || (/^es/i.test(code) ? 'es' : /^en/i.test(code) ? 'en' : ''), '') || 'en';
        if (detected !== LANG && readStorage('lang') !== LANG) {
            langHint.replaceChildren(...T.otherLanguage());
            langHint.hidden = false;
        }
    }

    if (clock) startClock();
    if (!terminal || !input) return;

    /* ---------- Gestor de ventanas ---------- */

    const windows = new Map();
    const dockItems = new Map();
    let zTop = 10;
    let activeWindow = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const menubarHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menubar-h')) || 0;

    function registerWindow(id, hooks) {
        const element = $(id);
        if (!element) return null;
        const win = { id, el: element, header: element.querySelector('.window-header'), hooks: hooks || {}, drag: null };
        windows.set(id, win);

        element.querySelectorAll('[data-action]').forEach((button) => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'close') closeWindow(win);
                else if (action === 'minimize') minimizeWindow(win);
                else if (action === 'maximize') toggleMaximize(win);
            });
        });

        element.addEventListener('pointerdown', () => focusWindow(win));

        if (win.header) {
            win.header.addEventListener('pointerdown', (event) => startDrag(win, event));
            win.header.addEventListener('pointermove', (event) => moveDrag(win, event));
            win.header.addEventListener('pointerup', (event) => endDrag(win, event));
            win.header.addEventListener('pointercancel', (event) => endDrag(win, event));
            win.header.addEventListener('dblclick', (event) => {
                if (event.target.closest('button') || mobileLayout.matches) return;
                if (element.querySelector('[data-action="maximize"]')) toggleMaximize(win);
            });
        }
        return win;
    }

    const isClosed = (win) => win.el.classList.contains('is-closed');
    const isMinimized = (win) => win.el.classList.contains('minimized');
    const isMaximized = (win) => win.el.classList.contains('maximized');
    const isVisible = (win) => !isClosed(win) && !isMinimized(win);

    function openWindow(win) {
        const wasHidden = !isVisible(win);
        win.el.classList.remove('is-closed', 'minimized');
        focusWindow(win, true);
        if (wasHidden && win.hooks.onShow) win.hooks.onShow();
        renderDock();
    }

    function closeWindow(win) {
        win.el.classList.add('is-closed');
        if (win.hooks.onClose) win.hooks.onClose();
        if (activeWindow === win) activeWindow = null;
        renderDock();
    }

    function minimizeWindow(win) {
        win.el.classList.add('minimized');
        if (win.hooks.onHide) win.hooks.onHide();
        if (activeWindow === win) activeWindow = null;
        renderDock();
    }

    function focusWindow(win, force) {
        if (activeWindow === win && !force) return;
        windows.forEach((other) => other.el.classList.toggle('is-active', other === win));
        win.el.style.zIndex = String(++zTop);
        activeWindow = win;
        renderDock();
    }

    function toggleMaximize(win) {
        win.el.classList.remove('minimized');
        win.el.classList.toggle('maximized');
        const button = win.el.querySelector('[data-action="maximize"]');
        if (button) {
            const labels = isMaximized(win) ? T.restoreLabel : T.maximizeLabel;
            button.title = isMaximized(win) ? T.restore : T.maximize;
            button.setAttribute('aria-label', labels[win.id] || button.title);
        }
        if (win.hooks.onShow) win.hooks.onShow();
    }

    function positionExplicitly(win) {
        if (win.el.classList.contains('is-positioned')) return;
        const rect = win.el.getBoundingClientRect();
        win.el.style.left = rect.left + 'px';
        win.el.style.top = rect.top + 'px';
        win.el.classList.add('is-positioned');
    }

    function startDrag(win, event) {
        if (event.button !== 0 || event.target.closest('button, select, a') || isMaximized(win) || mobileLayout.matches) return;
        positionExplicitly(win);
        const rect = win.el.getBoundingClientRect();
        win.drag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top, width: rect.width };
        win.header.setPointerCapture(event.pointerId);
        win.el.classList.add('is-dragging');
    }

    function moveDrag(win, event) {
        if (!win.drag || event.pointerId !== win.drag.id) return;
        win.el.style.left = clamp(event.clientX - win.drag.dx, 160 - win.drag.width, window.innerWidth - 160) + 'px';
        win.el.style.top = clamp(event.clientY - win.drag.dy, menubarHeight(), window.innerHeight - 44) + 'px';
    }

    function endDrag(win, event) {
        if (!win.drag || event.pointerId !== win.drag.id) return;
        win.drag = null;
        win.el.classList.remove('is-dragging');
    }

    function keepInViewport() {
        windows.forEach((win) => {
            if (!win.el.classList.contains('is-positioned') || isMaximized(win) || mobileLayout.matches) return;
            const rect = win.el.getBoundingClientRect();
            win.el.style.left = clamp(rect.left, 160 - rect.width, window.innerWidth - 160) + 'px';
            win.el.style.top = clamp(rect.top, menubarHeight(), window.innerHeight - 44) + 'px';
        });
    }

    window.addEventListener('resize', keepInViewport);

    /* Dock: lanzadores con indicador de apps abiertas */

    document.querySelectorAll('.dock-item[data-window]').forEach((button) => {
        dockItems.set(button.dataset.window, button);
        button.addEventListener('click', () => {
            const win = windows.get(button.dataset.window);
            if (!win) return;
            if (isVisible(win) && activeWindow !== win) focusWindow(win);
            else openWindow(win);
        });
    });

    function renderDock() {
        dockItems.forEach((button, id) => {
            const win = windows.get(id);
            const running = Boolean(win) && !isClosed(win);
            button.classList.toggle('is-running', running);
            button.classList.toggle('is-minimized', running && isMinimized(win));
            button.classList.toggle('is-active', Boolean(win) && win === activeWindow);
            button.setAttribute('aria-pressed', String(Boolean(win) && win === activeWindow));
        });
    }

    /* ---------- Ventanas: terminal y Buscaminas ---------- */

    const terminalWindow = registerWindow('terminal', {
        onShow: () => {
            if (desktopNote) desktopNote.hidden = true;
            scrollToEnd();
        },
        onClose: () => {
            input.blur();
            if (desktopNote) desktopNote.hidden = false;
        }
    });

    let minesweeperGame = null;
    const minesweeperWindow = registerWindow('minesweeper', {
        onShow: () => {
            const container = $('minesweeper-body');
            if (!minesweeperGame && window.Minesweeper && container) minesweeperGame = window.Minesweeper.mount(container, LANG);
            const firstCell = container && container.querySelector('.ms-cell[tabindex="0"]');
            if (firstCell && !touchLike.matches) firstCell.focus({ preventScroll: true });
        },
        onClose: () => {
            if (minesweeperGame) minesweeperGame.reset();
        }
    });

    const projectsWindow = registerWindow('projects', {
        onShow: () => {
            const container = $('projects-body');
            if (container && !container.firstChild) renderProjects(container);
        }
    });

    const blogWindow = registerWindow('blog', {
        onShow: () => {
            const container = $('blog-body');
            if (container && !container.dataset.loaded) renderBlog(container);
        }
    });

    let contactForm = null;
    const contactWindow = registerWindow('contact', {
        onShow: () => {
            const container = $('contact-body');
            if (container && !contactForm) contactForm = renderContactForm(container);
            if (contactForm) contactForm.show();
        }
    });

    function openTerminal() {
        openWindow(terminalWindow);
    }

    function closeTerminal() {
        closeWindow(terminalWindow);
    }

    /* ---------- Temas ---------- */

    const THEMES = ['cordoba', 'noche', 'mezquita', 'matrix'];
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    function currentTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        return THEMES.includes(theme) ? theme : 'cordoba';
    }

    function syncThemeColor() {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--term-bg').trim();
        if (themeColorMeta && color) themeColorMeta.content = color;
    }

    function applyTheme(name) {
        if (name === 'cordoba') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', name);
        writeStorage('theme', name);
        syncThemeColor();
    }

    /* ---------- neofetch y matrix ---------- */

    // Un arco de herradura, como los de la Mezquita
    const NEOFETCH_ART = [
        "     .-'''''-.     ",
        "   .'  .---.  '.   ",
        "  /  .'     '.  \\  ",
        " |  /         \\  | ",
        " |  |         |  | ",
        " |  |         |  | ",
        " '--'         '--' "
    ].join('\n');

    const MATRIX_GLYPHS = 'アイウエオカキクケコサシスセソタチツテト0123456789JOSEJORDAN<>/{}[]=+*';

    function startMatrix(out) {
        if (reducedMotion.matches) {
            out.muted(T.matrixReduced);
            return;
        }
        if (document.querySelector('.matrix-rain')) return;
        out.muted(T.matrixHint);

        const canvas = el('canvas', 'matrix-rain');
        canvas.setAttribute('aria-hidden', 'true');
        document.body.append(canvas);
        const ctx = canvas.getContext('2d');
        const size = 16;
        const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3ddc63';
        let width = 0;
        let height = 0;
        let drops = [];
        let frame = 0;
        let last = 0;

        function resize() {
            const ratio = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            drops = Array.from({ length: Math.ceil(width / size) }, () => -Math.random() * height / size);
        }

        function draw(time) {
            frame = requestAnimationFrame(draw);
            if (time - last < 50) return;
            last = time;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = color;
            ctx.font = size + 'px "JetBrains Mono", monospace';
            drops.forEach((y, i) => {
                ctx.fillText(MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)], i * size, y * size);
                drops[i] = y * size > height && Math.random() > 0.975 ? 0 : y + 1;
            });
        }

        function stop() {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
            canvas.remove();
            window.removeEventListener('resize', resize);
            document.removeEventListener('keydown', stop, true);
            document.removeEventListener('pointerdown', stop, true);
        }

        resize();
        frame = requestAnimationFrame(draw);
        const timer = setTimeout(stop, 10000);
        window.addEventListener('resize', resize);
        // Un instante de margen para que el Enter que lanzó el comando no la cierre
        setTimeout(() => {
            if (!canvas.isConnected) return;
            document.addEventListener('keydown', stop, true);
            document.addEventListener('pointerdown', stop, true);
        }, 300);
    }

    /* ---------- Ventana de proyectos ---------- */

    function projectDesc(project) {
        return typeof project.desc === 'string' ? project.desc : (project.desc[LANG] || project.desc.es || '');
    }

    function renderProjects(container) {
        const projects = site.projects || [];
        const grid = el('ul', 'pj-grid');
        const cards = projects.map((project, i) => {
            const actions = [link(project.url, T.projectCode)];
            if (project.demo) actions.push(link(project.demo, T.projectDemo));
            const card = el('li', 'pj-card', [
                el('div', 'pj-head', [el('span', 'pj-num', String(i + 1).padStart(2, '0')), el('h3', 'pj-name', project.name)]),
                el('span', 'tag', project.lang),
                el('p', 'pj-desc', projectDesc(project)),
                el('div', 'pj-actions', actions)
            ]);
            card.dataset.lang = project.lang || '';
            grid.append(card);
            return card;
        });

        const parts = [el('p', 'pj-intro', T.projectsIntro)];
        const languages = [...new Set(projects.map((project) => project.lang).filter(Boolean))];
        if (languages.length > 1) {
            const filters = el('div', 'pj-filters');
            filters.setAttribute('role', 'group');
            filters.setAttribute('aria-label', T.projectsFilter);
            const buttons = [['', T.projectsAll], ...languages.map((lang) => [lang, lang])].map(([value, label]) => {
                const button = el('button', 'pj-filter', label);
                button.type = 'button';
                button.setAttribute('aria-pressed', String(!value));
                button.addEventListener('click', () => {
                    buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
                    cards.forEach((card) => { card.hidden = Boolean(value) && card.dataset.lang !== value; });
                });
                return button;
            });
            filters.append(...buttons);
            parts.push(filters);
        }
        parts.push(grid);
        if (links.github) parts.push(el('p', 'pj-more muted', [T.projectsMore, link(links.github, shortUrl(links.github))]));
        container.replaceChildren(...parts);
    }

    /* ---------- Notas (blog) ---------- */

    // Las páginas del blog se generan con tools/build-blog.mjs; aquí solo se lee su índice
    const BLOG_INDEX = LANG === 'en' ? '/en/blog/' : '/blog/';
    let blogPosts = null;

    function loadBlogPosts() {
        if (!blogPosts) {
            blogPosts = fetch('/blog/posts.json')
                .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.status))))
                .then((posts) => posts.filter((post) => post.lang === LANG || !posts.some((other) => other.slug === post.translation && other.lang === LANG)))
                .catch((error) => {
                    blogPosts = null; // se reintenta la próxima vez
                    throw error;
                });
        }
        return blogPosts;
    }

    function formatPostDate(date) {
        const [y, m, d] = date.split('-').map(Number);
        return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
    }

    function blogError() {
        return [T.blogError, link(BLOG_INDEX, location.host + BLOG_INDEX), '.'];
    }

    function renderBlog(container) {
        container.replaceChildren(el('p', 'muted', T.blogLoading));
        loadBlogPosts().then((posts) => {
            container.dataset.loaded = 'true';
            const parts = [el('p', 'pj-intro', T.blogIntro)];
            if (!posts.length) parts.push(el('p', 'muted', T.blogEmpty));
            const list = el('ol', 'nt-list');
            posts.forEach((post) => {
                const meta = [formatPostDate(post.date), ' · ', T.blogReading(post.readingMinutes)];
                if (post.lang !== LANG) meta.push(' · ', T.blogOtherLang);
                const title = link(post.url, post.title);
                if (post.lang !== LANG) title.hreflang = post.lang;
                const item = el('li', 'nt-item', [el('p', 'nt-meta', meta), el('h3', 'nt-title', title)]);
                if (post.description) item.append(el('p', 'nt-desc', post.description));
                if (post.tags.length) item.append(el('p', 'nt-tags', post.tags.map((tag) => '#' + tag).join('  ')));
                list.append(item);
            });
            if (posts.length) parts.push(list);
            parts.push(el('p', 'pj-more muted', [link(BLOG_INDEX, T.blogAll), ' · ', link('/blog/feed.xml', 'RSS')]));
            container.replaceChildren(...parts);
        }).catch(() => {
            container.replaceChildren(el('p', 'err', blogError()));
        });
    }

    /* ---------- Ventana de contacto ---------- */

    const CONTACT_ENDPOINT = '/api/contact';
    const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

    function mailtoLink(subject, message) {
        let href = 'mailto:' + links.email + '?subject=' + encodeURIComponent(subject);
        if (message) href += '&body=' + encodeURIComponent(message);
        return link(href, links.email);
    }

    function renderContactForm(container) {
        const siteKey = site.turnstileSiteKey || '';
        const form = el('form', 'cf');
        form.noValidate = true;

        function field(name, label, control) {
            control.name = name;
            control.id = 'cf-' + name;
            const labelNode = el('label', 'cf-label', label);
            labelNode.htmlFor = control.id;
            return el('div', 'cf-field', [labelNode, control]);
        }

        function textInput(type, maxLength, autocomplete) {
            const node = el('input', 'cf-input');
            node.type = type;
            node.maxLength = maxLength;
            node.required = true;
            node.autocomplete = autocomplete;
            return node;
        }

        const nameField = textInput('text', 100, 'name');
        const emailField = textInput('email', 254, 'email');
        emailField.spellcheck = false;
        const messageField = el('textarea', 'cf-input cf-message');
        messageField.required = true;
        messageField.minLength = 10;
        messageField.maxLength = 5000;
        messageField.rows = 6;

        /* Trampa para bots: los humanos no ven este campo */
        const trap = textInput('text', 100, 'off');
        trap.required = false;
        trap.tabIndex = -1;
        const trapField = field('website', T.contactHoneypot, trap);
        trapField.className = 'cf-trap';
        trapField.setAttribute('aria-hidden', 'true');

        const captchaBox = el('div', 'cf-captcha');
        const submit = el('button', 'cf-submit', T.contactSend);
        submit.type = 'submit';
        const status = el('p', 'cf-status');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');

        form.append(
            field('name', T.contactName, nameField),
            field('email', T.contactEmail, emailField),
            field('message', T.contactMessage, messageField),
            trapField,
            captchaBox,
            el('div', 'cf-actions', [submit]),
            status
        );

        const aside = links.email ? el('p', 'cf-aside muted', [T.contactOr, mailtoLink(T.contactSubject), '.']) : null;
        container.replaceChildren(el('p', 'cf-intro', T.contactIntro), form);
        if (aside) container.append(aside);

        let openedAt = Date.now();
        let sending = false;
        let captchaToken = '';
        let captchaWidget = null;

        function setStatus(content, kind) {
            status.className = 'cf-status' + (kind ? ' is-' + kind : '');
            status.replaceChildren();
            append(status, content);
        }

        /* Sin servidor de correo (desarrollo local, variante Workers o fallo): se ofrece el email con el mensaje ya escrito */
        function failure() {
            setStatus([T.contactFailed, links.email ? mailtoLink(T.contactSubject, messageField.value.trim()) : '', '.'], 'error');
        }

        function loadCaptcha() {
            if (!siteKey || captchaWidget) return;
            captchaWidget = 'loading';
            const render = () => {
                captchaWidget = window.turnstile.render(captchaBox, {
                    sitekey: siteKey,
                    theme: 'dark',
                    language: LANG,
                    callback: (token) => { captchaToken = token; },
                    'expired-callback': () => { captchaToken = ''; },
                    'error-callback': () => { captchaToken = ''; }
                });
            };
            if (window.turnstile) return render();
            const script = document.createElement('script');
            script.src = TURNSTILE_SCRIPT;
            script.async = true;
            script.addEventListener('load', render);
            script.addEventListener('error', () => { captchaWidget = null; });
            document.head.append(script);
        }

        function resetCaptcha() {
            captchaToken = '';
            if (captchaWidget && captchaWidget !== 'loading' && window.turnstile) window.turnstile.reset(captchaWidget);
        }

        function valid() {
            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const message = messageField.value.trim();
            return name.length > 0 && name.length <= 100 && emailField.validity.valid && /\S+@\S+\.\S+/.test(email) && message.length >= 10 && message.length <= 5000;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (sending) return;
            if (!valid()) {
                setStatus(T.contactInvalid, 'error');
                return;
            }
            if (siteKey && !captchaToken) {
                setStatus(T.contactCaptcha, 'error');
                return;
            }
            sending = true;
            submit.disabled = true;
            setStatus(T.contactSending);
            try {
                const response = await fetch(CONTACT_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameField.value.trim(),
                        email: emailField.value.trim(),
                        message: messageField.value.trim(),
                        website: trap.value,
                        elapsed: Date.now() - openedAt,
                        token: captchaToken,
                        lang: LANG
                    })
                });
                const result = await response.json().catch(() => ({}));
                if (response.ok && result.ok) {
                    form.reset();
                    openedAt = Date.now();
                    setStatus(T.contactSent, 'ok');
                } else if (result.error === 'invalid') {
                    setStatus(T.contactInvalid, 'error');
                } else if (result.error === 'captcha') {
                    setStatus(T.contactCaptcha, 'error');
                } else {
                    failure();
                }
            } catch (error) {
                failure();
            } finally {
                sending = false;
                submit.disabled = false;
                resetCaptcha();
            }
        });

        return {
            show() {
                loadCaptcha();
                if (!touchLike.matches) (nameField.value ? messageField : nameField).focus({ preventScroll: true });
            },
            prefill(message) {
                messageField.value = message;
                if (!touchLike.matches) (nameField.value ? messageField : nameField).focus({ preventScroll: true });
            }
        };
    }

    /* ---------- Salida ---------- */

    const promptLabel = form.querySelector('.prompt');
    let promptChar = '$';

    function setPrompt(symbol) {
        promptChar = symbol;
        if (promptLabel) promptLabel.textContent = symbol;
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

    function echoCommand(value) {
        output.append(el('p', 'line', [el('span', 'prompt', promptChar), ' ', el('span', 'cmd', value)]));
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
    let interactive = null; // juego activo en la terminal: recibe lo que se escribe

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
            list.append(el('li', null, [link(project.url, project.name), el('span', 'tag', project.lang), el('br'), projectDesc(project)]));
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
        if (contactWindow) out.muted(T.contactHint());
    });

    define('blog', (out, args) => {
        out.muted(T.blogLoading);
        const loading = out.box.lastChild;
        loadBlogPosts().then((posts) => {
            loading.remove();
            const target = args[0] || '';
            if (/^\d+$/.test(target)) {
                const post = posts[Number(target) - 1];
                if (!post) {
                    out.error(T.blogUnknown(target));
                } else {
                    out.line(T.blogOpening(post.title));
                    setTimeout(() => location.assign(post.url), 250);
                }
            } else if (!posts.length) {
                out.muted(T.blogEmpty);
            } else {
                const rows = el('div', 'rows');
                posts.forEach((post, i) => {
                    rows.append(el('span', 'key', String(i + 1)), el('span', null, [link(post.url, post.title), ' ', el('span', 'tag', formatPostDate(post.date))]));
                });
                out.node(rows);
                out.muted(T.blogHint());
            }
            scrollToEnd();
        }).catch(() => {
            loading.remove();
            out.error(blogError());
            scrollToEnd();
        });
    });

    define('mail', (out, args, argText) => {
        if (!contactWindow) return;
        out.line(T.mailOpened);
        openWindow(contactWindow);
        if (argText && contactForm) contactForm.prefill(argText);
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
            writeStorage('lang', target);
            out.line(T.langSwitching);
            setTimeout(() => location.assign(OTHER_HOME), 250);
            return;
        }
        out.line(T.langCurrent());
    });

    define('minesweeper', (out) => {
        if (!minesweeperWindow) return;
        out.line(T.minesweeperOpened);
        openWindow(minesweeperWindow);
    });

    define('guess', (out) => startGuessGame(out));

    define('theme', (out, args) => {
        const target = (args[0] || '').toLowerCase();
        if (!target) {
            const rows = el('div', 'rows');
            THEMES.forEach((name) => {
                const description = [T.themes[name]];
                if (name === currentTheme()) description.push(' ', el('span', 'muted', T.themeCurrent));
                rows.append(el('span', 'key', name), el('span', null, description));
            });
            out.node(rows);
            out.muted(T.themeHint());
            return;
        }
        if (!THEMES.includes(target)) {
            out.error(T.themeUnknown(args[0]));
            out.muted(T.themeHint());
            return;
        }
        applyTheme(target);
        out.line(T.themeApplied(target));
    });

    define('neofetch', (out) => {
        const N = T.neofetch;
        const V = T.neofetchValues;
        const visible = [...commands.values()].filter((cmd) => !cmd.hidden).length;
        const stack = [...new Set((text.skills || []).map((group) => (group.items[0] || '').replace(/\s*\(.*\)$/, '')).filter(Boolean))].slice(0, 5).join(' · ');
        const title = (site.user || 'jose') + '@' + (site.host || location.hostname);
        const info = el('div', 'nf-info', [
            el('p', 'nf-title', title),
            el('p', 'nf-rule', '-'.repeat(title.length))
        ]);
        const add = (label, value) => { if (value) info.append(el('p', null, [el('span', 'key', label), ': ', value])); };
        add(N.os, V.os);
        add(N.location, V.location);
        add(N.kernel, V.kernel);
        add(N.uptime, T.uptime(Math.floor(performance.now() / 60000)));
        add(N.shell, 'jsh 1.0');
        add(N.resolution, window.screen ? screen.width + 'x' + screen.height : '');
        add(N.theme, currentTheme());
        add(N.language, V.language);
        add(N.stack, stack);
        add(N.commands, V.commands(visible));
        info.append(el('p', 'nf-colors', ['nf-c1', 'nf-c2', 'nf-c3', 'nf-c4', 'nf-c5', 'nf-c6'].map((cls) => el('span', cls))));
        const art = el('pre', 'nf-art', NEOFETCH_ART);
        art.setAttribute('aria-hidden', 'true');
        out.node(el('div', 'neofetch', [art, info]));
    });

    define('matrix', (out) => startMatrix(out));

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
        contacto: 'contact', idioma: 'lang', buscaminas: 'minesweeper', mines: 'minesweeper', adivina: 'guess', limpiar: 'clear', fecha: 'date',
        salir: 'exit', language: 'lang', resume: 'cv', tema: 'theme', fetch: 'neofetch', notas: 'blog', notes: 'blog', mensaje: 'mail', message: 'mail', email: 'mail'
    };
    Object.entries(aliases).forEach(([name, targetName]) => {
        const command = commands.get(targetName);
        define(name, (out, args, argText) => command.run(out, args, argText), { hidden: true, description: command.description });
    });

    /* ---------- Juego en la terminal: adivina el número ---------- */

    function startGuessGame(out) {
        const secret = 1 + Math.floor(Math.random() * 100);
        let attempts = 0;
        const quitWords = ['salir', 'exit', 'quit', 'q'];
        out.line(T.guessIntro());
        setPrompt('?');
        interactive = {
            handle(value, reply) {
                const answer = value.trim().toLowerCase();
                if (quitWords.includes(answer)) return interactive.cancel(reply);
                const number = Number(answer);
                if (!/^\d+$/.test(answer) || number < 1 || number > 100) {
                    reply.error(T.guessInvalid);
                    return;
                }
                attempts++;
                if (number < secret) {
                    reply.line(T.guessHigher);
                } else if (number > secret) {
                    reply.line(T.guessLower);
                } else {
                    const previous = Number(readStorage('guess-best')) || 0;
                    const record = !previous || attempts < previous;
                    if (record) writeStorage('guess-best', String(attempts));
                    reply.line(T.guessWin(attempts) + (record ? T.guessRecord : ''));
                    reply.muted(T.guessBest(record ? attempts : previous));
                    endInteractive();
                }
            },
            cancel(reply) {
                reply.muted(T.guessQuit(secret));
                endInteractive();
            }
        };
    }

    function endInteractive() {
        interactive = null;
        setPrompt('$');
    }

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
            const out = createOutput();
            if (interactive) {
                interactive.handle(value, out);
            } else {
                const parts = value.split(/\s+/);
                const name = parts[0].toLowerCase();
                const args = parts.slice(1);
                const argText = value.slice(parts[0].length).trim();
                const command = commands.get(name);
                if (command) {
                    command.run(out, args, argText);
                } else {
                    out.error(T.notFound(parts[0]));
                    const alternative = suggest(name);
                    out.muted(alternative ? T.didYouMean(alternative) : T.seeHelp());
                }
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
        } else if (event.key === 'Tab' && !event.shiftKey && input.value && !interactive) {
            event.preventDefault();
            complete();
        } else if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection().toString()) {
            event.preventDefault();
            echoCommand(input.value + '^C');
            input.value = '';
            if (interactive) interactive.cancel(createOutput());
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

    /* Escribir con la terminal desenfocada la despierta (salvo dentro de otra ventana o del dock) */
    document.addEventListener('keydown', (event) => {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest('input, textarea, select, [contenteditable], .dock, .menubar')) return;
        if (event.target.closest('.window') && !event.target.closest('#terminal')) return;
        if (event.key.length !== 1 && event.key !== 'Enter') return;
        openTerminal();
        input.focus();
    });

    /* ---------- Iconos del escritorio ---------- */

    document.querySelectorAll('.icon[data-command]').forEach((icon) => {
        icon.addEventListener('click', () => {
            openTerminal();
            run(icon.dataset.command);
            if (!touchLike.matches) input.focus({ preventScroll: true });
        });
    });

    document.querySelectorAll('.icon[data-open]').forEach((icon) => {
        icon.addEventListener('click', () => {
            const win = windows.get(icon.dataset.open);
            if (!win) return;
            openWindow(win);
            if (win === terminalWindow && !touchLike.matches) input.focus({ preventScroll: true });
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

    syncThemeColor();
    focusWindow(terminalWindow, true);
    if (!touchLike.matches) input.focus({ preventScroll: true });

    /* Accesos directos de la app instalada: /?open=projects | contact | minesweeper */
    const launch = windows.get(new URLSearchParams(location.search).get('open') || '');
    if (launch && launch !== terminalWindow) openWindow(launch);

    /* PWA: service worker para instalar la web y usarla sin conexión */
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { /* sin service worker la web funciona igual */ });
        });
    }
})();
