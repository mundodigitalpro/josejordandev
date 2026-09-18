/*
 * Buscaminas / Minesweeper para el escritorio de josejordan.dev.
 * Sin dependencias. Se monta con Minesweeper.mount(contenedor, idioma).
 */
(() => {
    'use strict';

    const LEVELS = {
        beginner: { cols: 9, rows: 9, mines: 10 },
        intermediate: { cols: 16, rows: 16, mines: 40 },
        expert: { cols: 30, rows: 16, mines: 99 }
    };

    const STRINGS = {
        es: {
            level: 'Nivel',
            levels: { beginner: 'Principiante (9×9, 10 minas)', intermediate: 'Intermedio (16×16, 40 minas)', expert: 'Experto (30×16, 99 minas)' },
            newGame: 'Nueva partida',
            flagMode: 'Modo bandera',
            minesLeft: 'Minas por marcar',
            seconds: 'Segundos',
            ready: 'Haz clic en una casilla para empezar. Clic derecho o pulsación larga para poner una bandera.',
            playing: 'Clic en un número con todas sus banderas puestas destapa las casillas de alrededor.',
            win: (s) => '¡Has ganado en ' + s + ' segundos!',
            newBest: ' Nuevo récord.',
            lose: 'Boom. Has pisado una mina. Pulsa la cara para jugar otra vez.',
            best: (s) => (s == null ? 'Sin récord todavía' : 'Récord: ' + s + ' s'),
            cell: (r, c) => 'Fila ' + r + ', columna ' + c,
            hidden: 'sin destapar',
            flagged: 'con bandera',
            mine: 'mina',
            empty: 'vacía',
            around: (n) => n + ' alrededor'
        },
        en: {
            level: 'Level',
            levels: { beginner: 'Beginner (9×9, 10 mines)', intermediate: 'Intermediate (16×16, 40 mines)', expert: 'Expert (30×16, 99 mines)' },
            newGame: 'New game',
            flagMode: 'Flag mode',
            minesLeft: 'Mines left to flag',
            seconds: 'Seconds',
            ready: 'Click a cell to start. Right-click or long-press to place a flag.',
            playing: 'Clicking a number with all its flags placed reveals the cells around it.',
            win: (s) => 'You won in ' + s + ' seconds!',
            newBest: ' New record.',
            lose: 'Boom. You stepped on a mine. Press the face to play again.',
            best: (s) => (s == null ? 'No record yet' : 'Best: ' + s + ' s'),
            cell: (r, c) => 'Row ' + r + ', column ' + c,
            hidden: 'hidden',
            flagged: 'flagged',
            mine: 'mine',
            empty: 'empty',
            around: (n) => n + ' around'
        }
    };

    function el(tag, className, content) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (content != null) node.append(content);
        return node;
    }

    function readBest(level) {
        try {
            const value = Number(localStorage.getItem('ms-best-' + level));
            return value > 0 ? value : null;
        } catch (error) { return null; }
    }

    function saveBest(level, seconds) {
        try { localStorage.setItem('ms-best-' + level, String(seconds)); } catch (error) { /* sin almacenamiento */ }
    }

    function mount(container, lang) {
        const t = STRINGS[lang === 'en' ? 'en' : 'es'];
        const state = { level: 'beginner', cfg: LEVELS.beginner, mines: [], adjacent: [], cells: [], revealed: 0, flags: 0, status: 'ready', seconds: 0, timer: null, flagMode: false, focusIndex: 0 };
        let buttons = [];

        /* ---------- Interfaz ---------- */

        const root = el('div', 'ms');
        const toolbar = el('div', 'ms-toolbar');
        const minesCounter = el('output', 'ms-counter', '010');
        minesCounter.setAttribute('aria-label', t.minesLeft);
        const face = el('button', 'ms-face');
        face.type = 'button';
        face.setAttribute('aria-label', t.newGame);
        face.title = t.newGame;
        const timeCounter = el('output', 'ms-counter', '000');
        timeCounter.setAttribute('aria-label', t.seconds);
        toolbar.append(minesCounter, face, timeCounter);

        const options = el('div', 'ms-options');
        const levelLabel = el('label', 'ms-level');
        levelLabel.append(t.level + ' ');
        const select = el('select', 'ms-select');
        Object.keys(LEVELS).forEach((key) => {
            const option = el('option', null, t.levels[key]);
            option.value = key;
            select.append(option);
        });
        levelLabel.append(select);
        const flagToggle = el('button', 'ms-toggle', t.flagMode);
        flagToggle.type = 'button';
        flagToggle.setAttribute('aria-pressed', 'false');
        options.append(levelLabel, flagToggle);

        const grid = el('div', 'ms-grid');
        grid.setAttribute('role', 'grid');
        grid.setAttribute('aria-label', 'Minesweeper');

        const status = el('p', 'ms-status', t.ready);
        status.setAttribute('aria-live', 'polite');
        const best = el('p', 'ms-best', t.best(readBest(state.level)));

        root.append(toolbar, options, grid, status, best);
        container.replaceChildren(root);

        /* ---------- Tablero ---------- */

        const index = (r, c) => r * state.cfg.cols + c;

        function neighbours(i) {
            const { cols, rows } = state.cfg;
            const r = Math.floor(i / cols);
            const c = i % cols;
            const list = [];
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (!dr && !dc) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) list.push(index(nr, nc));
                }
            }
            return list;
        }

        function build() {
            stopTimer();
            state.cfg = LEVELS[state.level];
            const total = state.cfg.cols * state.cfg.rows;
            state.mines = new Array(total).fill(false);
            state.adjacent = new Array(total).fill(0);
            state.cells = new Array(total).fill('hidden');
            state.revealed = 0;
            state.flags = 0;
            state.status = 'ready';
            state.seconds = 0;
            state.focusIndex = 0;
            grid.style.setProperty('--ms-cols', state.cfg.cols);
            grid.replaceChildren();
            buttons = [];
            for (let i = 0; i < total; i++) {
                const cell = el('button', 'ms-cell');
                cell.type = 'button';
                cell.dataset.index = i;
                cell.tabIndex = i === 0 ? 0 : -1;
                cell.setAttribute('role', 'gridcell');
                grid.append(cell);
                buttons.push(cell);
                describe(i);
            }
            setFace('ready');
            status.textContent = t.ready;
            best.textContent = t.best(readBest(state.level));
            updateCounters();
        }

        function placeMines(safeIndex) {
            const total = state.cfg.cols * state.cfg.rows;
            const forbidden = new Set([safeIndex, ...neighbours(safeIndex)]);
            const candidates = [];
            for (let i = 0; i < total; i++) if (!forbidden.has(i)) candidates.push(i);
            for (let placed = 0; placed < state.cfg.mines && candidates.length; placed++) {
                const pick = Math.floor(Math.random() * candidates.length);
                state.mines[candidates[pick]] = true;
                candidates.splice(pick, 1);
            }
            for (let i = 0; i < total; i++) {
                state.adjacent[i] = neighbours(i).filter((n) => state.mines[n]).length;
            }
        }

        function describe(i) {
            const cell = buttons[i];
            const r = Math.floor(i / state.cfg.cols) + 1;
            const c = (i % state.cfg.cols) + 1;
            let detail = t.hidden;
            if (state.cells[i] === 'flagged') detail = t.flagged;
            else if (state.cells[i] === 'revealed') detail = state.mines[i] ? t.mine : (state.adjacent[i] ? t.around(state.adjacent[i]) : t.empty);
            cell.setAttribute('aria-label', t.cell(r, c) + ', ' + detail);
        }

        function paint(i) {
            const cell = buttons[i];
            const value = state.cells[i];
            cell.className = 'ms-cell';
            cell.textContent = '';
            if (value === 'flagged') {
                cell.classList.add('is-flagged');
            } else if (value === 'revealed') {
                cell.classList.add('is-revealed');
                if (state.mines[i]) {
                    cell.classList.add('is-mine');
                } else if (state.adjacent[i]) {
                    cell.classList.add('n' + state.adjacent[i]);
                    cell.textContent = String(state.adjacent[i]);
                }
            }
            describe(i);
        }

        function setFace(mood) {
            face.className = 'ms-face' + (mood === 'won' ? ' is-won' : mood === 'lost' ? ' is-lost' : '');
            face.dataset.mood = mood;
        }

        function updateCounters() {
            const left = Math.max(-99, state.cfg.mines - state.flags);
            minesCounter.value = (left < 0 ? '-' : '') + String(Math.abs(left)).padStart(left < 0 ? 2 : 3, '0');
            timeCounter.value = String(Math.min(state.seconds, 999)).padStart(3, '0');
        }

        function startTimer() {
            stopTimer();
            state.timer = setInterval(() => {
                state.seconds = Math.min(state.seconds + 1, 999);
                updateCounters();
            }, 1000);
        }

        function stopTimer() {
            if (state.timer) clearInterval(state.timer);
            state.timer = null;
        }

        /* ---------- Jugadas ---------- */

        function reveal(i) {
            if (state.status === 'won' || state.status === 'lost') return;
            if (state.cells[i] === 'flagged') return;
            if (state.cells[i] === 'revealed') return chord(i);
            if (state.status === 'ready') {
                placeMines(i);
                state.status = 'playing';
                status.textContent = t.playing;
                startTimer();
            }
            if (state.mines[i]) return lose(i);
            floodReveal(i);
            checkWin();
        }

        function floodReveal(start) {
            const queue = [start];
            while (queue.length) {
                const i = queue.pop();
                if (state.cells[i] !== 'hidden') continue;
                state.cells[i] = 'revealed';
                state.revealed++;
                paint(i);
                if (state.adjacent[i] === 0) {
                    neighbours(i).forEach((n) => { if (state.cells[n] === 'hidden') queue.push(n); });
                }
            }
        }

        function chord(i) {
            if (!state.adjacent[i]) return;
            const around = neighbours(i);
            const flagged = around.filter((n) => state.cells[n] === 'flagged').length;
            if (flagged !== state.adjacent[i]) return;
            for (const n of around) {
                if (state.cells[n] !== 'hidden') continue;
                if (state.mines[n]) return lose(n);
                floodReveal(n);
            }
            checkWin();
        }

        function toggleFlag(i) {
            if (state.status === 'won' || state.status === 'lost') return;
            if (state.cells[i] === 'revealed') return;
            if (state.cells[i] === 'flagged') {
                state.cells[i] = 'hidden';
                state.flags--;
            } else {
                state.cells[i] = 'flagged';
                state.flags++;
            }
            paint(i);
            updateCounters();
        }

        function checkWin() {
            const total = state.cfg.cols * state.cfg.rows;
            if (state.revealed !== total - state.cfg.mines) return;
            state.status = 'won';
            stopTimer();
            setFace('won');
            for (let i = 0; i < total; i++) {
                if (state.mines[i] && state.cells[i] !== 'flagged') {
                    state.cells[i] = 'flagged';
                    state.flags++;
                    paint(i);
                }
            }
            updateCounters();
            const previous = readBest(state.level);
            const record = previous == null || state.seconds < previous;
            if (record) saveBest(state.level, state.seconds);
            status.textContent = t.win(state.seconds) + (record ? t.newBest : '');
            best.textContent = t.best(readBest(state.level));
        }

        function lose(exploded) {
            state.status = 'lost';
            stopTimer();
            setFace('lost');
            const total = state.cfg.cols * state.cfg.rows;
            for (let i = 0; i < total; i++) {
                if (state.mines[i] && state.cells[i] === 'hidden') {
                    state.cells[i] = 'revealed';
                    paint(i);
                } else if (!state.mines[i] && state.cells[i] === 'flagged') {
                    paint(i);
                    buttons[i].classList.add('is-wrong');
                }
            }
            buttons[exploded].classList.add('is-exploded');
            status.textContent = t.lose;
        }

        /* ---------- Entrada ---------- */

        let longPress = null;
        let suppressClick = false;

        const cellIndex = (target) => {
            const cell = target && target.closest ? target.closest('.ms-cell') : null;
            return cell ? Number(cell.dataset.index) : -1;
        };

        grid.addEventListener('click', (event) => {
            const i = cellIndex(event.target);
            if (i < 0) return;
            if (suppressClick) {
                suppressClick = false;
                return;
            }
            if (state.flagMode) toggleFlag(i); else reveal(i);
            focusCell(i);
        });

        grid.addEventListener('contextmenu', (event) => {
            const i = cellIndex(event.target);
            if (i < 0) return;
            event.preventDefault();
            toggleFlag(i);
        });

        grid.addEventListener('pointerdown', (event) => {
            const i = cellIndex(event.target);
            if (i < 0 || event.pointerType === 'mouse') return;
            clearTimeout(longPress);
            longPress = setTimeout(() => {
                suppressClick = true;
                toggleFlag(i);
            }, 450);
        });

        ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => grid.addEventListener(type, () => clearTimeout(longPress)));
        grid.addEventListener('pointermove', (event) => { if (event.pointerType !== 'mouse') clearTimeout(longPress); });

        function focusCell(i) {
            if (i < 0 || i >= buttons.length) return;
            buttons[state.focusIndex].tabIndex = -1;
            state.focusIndex = i;
            buttons[i].tabIndex = 0;
            buttons[i].focus({ preventScroll: true });
        }

        grid.addEventListener('keydown', (event) => {
            const i = cellIndex(event.target);
            if (i < 0) return;
            const { cols, rows } = state.cfg;
            const r = Math.floor(i / cols);
            const c = i % cols;
            const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
            if (moves[event.key]) {
                event.preventDefault();
                const nr = Math.min(Math.max(r + moves[event.key][0], 0), rows - 1);
                const nc = Math.min(Math.max(c + moves[event.key][1], 0), cols - 1);
                focusCell(index(nr, nc));
            } else if (event.key === 'f' || event.key === 'F') {
                event.preventDefault();
                toggleFlag(i);
            }
        });

        face.addEventListener('click', build);
        select.addEventListener('change', () => {
            state.level = select.value;
            build();
        });
        flagToggle.addEventListener('click', () => {
            state.flagMode = !state.flagMode;
            flagToggle.setAttribute('aria-pressed', String(state.flagMode));
        });

        build();

        const api = {
            reset: build,
            pause: stopTimer,
            state: () => ({ level: state.level, status: state.status, seconds: state.seconds, cols: state.cfg.cols, rows: state.cfg.rows, mines: state.mines.map((m, i) => (m ? i : -1)).filter((i) => i >= 0), revealed: state.revealed, flags: state.flags })
        };
        Minesweeper.last = api;
        return api;
    }

    const Minesweeper = { mount, LEVELS, last: null };
    window.Minesweeper = Minesweeper;
})();
