document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('terminal');
    const terminalHeader = document.getElementById('terminal-header');
    const terminalWindow = document.getElementById('terminal-window');
    const closeButton = document.getElementById('close-button');
    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    let currentCommand = '';
    let currentPrompt;

    // Funcionalidad de arrastrar y soltar
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    terminalHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === terminalHeader) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, terminal);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

    // Funcionalidad de los botones
    closeButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cerrar la terminal?')) {
            terminal.style.display = 'none';
        }
    });

    minimizeButton.addEventListener('click', function() {
        terminal.classList.toggle('minimized');
    });

    maximizeButton.addEventListener('click', function() {
        terminal.classList.toggle('maximized');
        if (terminal.classList.contains('maximized')) {
            terminal.style.transform = "none";
        } else {
            setTranslate(xOffset, yOffset, terminal);
        }
    });

    const commands = {
        'help': 'Muestra esta lista de comandos',
        'about': 'Información sobre Jose Jordan',
        'skills': 'Muestra las habilidades técnicas',
        'projects': 'Lista de proyectos destacados',
        'contact': 'Información de contacto',
        'clear': 'Limpia la pantalla',
        'echo': 'Repite el texto que escribas con un toque especial',
        'date': 'Muestra la fecha y hora actual',
        'joke': 'Cuenta un chiste de programación',
        'quote': 'Muestra una cita inspiradora sobre programación'
    };

    const commandResponses = {
        'about': `Jose Jordan es un apasionado desarrollador de aplicaciones con experiencia en diversas tecnologías y frameworks modernos. 
Su enfoque se centra en crear soluciones eficientes y escalables para problemas complejos.`,
        'skills': `Habilidades técnicas de Jose Jordan:
• Lenguajes: JavaScript, Python, Java
• Front-end: React, Vue.js, HTML5, CSS3
• Back-end: Node.js, Express, Django
• Bases de datos: MongoDB, PostgreSQL
• DevOps: Docker, Git, CI/CD
• Cloud: AWS, Google Cloud Platform`,
        'projects': `Proyectos destacados:
1. App de gestión de tareas (React Native + Firebase)
2. Sistema de reservas para restaurantes (Vue.js + Node.js)
3. API RESTful para una plataforma de e-learning (Django + PostgreSQL)
4. Chatbot para atención al cliente (Python + NLP)`,
        'contact': `Puedes contactar a Jose Jordan a través de:
• Email: info@josejordan.dev
• LinkedIn: https://www.linkedin.com/in/josejordan1/
• GitHub: github.com/mundodigitalpro
• Twitter: @josejordandev`
    };

    const jokes = [
        "¿Por qué los programadores prefieren el frío? Porque tienen un problema con el calor-sync.",
        "¿Cómo se llama un desarrollador que no sabe programar en C? De-C-sarrollador.",
        "¿Por qué los programadores siempre confunden Halloween con Navidad? Porque oct 31 == dec 25.",
        "Un programador va al supermercado. Su esposa le dice: 'Compra una barra de pan y si hay huevos, trae 6'. Vuelve con 6 barras de pan."
    ];

    const quotes = [
        "El arte de programar consiste en organizar y dominar la complejidad. - Edsger W. Dijkstra",
        "La programación no es sobre tipear, es sobre pensar. - Rich Hickey",
        "El código es como el humor. Cuando tienes que explicarlo, es malo. - Cory House",
        "Medir el progreso del desarrollo de software por líneas de código es como medir el progreso de la construcción de un avión por su peso. - Bill Gates"
    ];

    function createNewPrompt() {
        if (currentPrompt) {
            currentPrompt.querySelector('.cursor').remove();
        }
        const promptLine = document.createElement('p');
        promptLine.className = 'input-line';
        promptLine.innerHTML = '<span class="prompt">$</span> <span class="command"></span><span class="cursor">|</span>';
        terminalWindow.appendChild(promptLine);
        currentPrompt = promptLine;
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function executeCommand(command) {
        const output = document.createElement('p');
        output.className = 'output';

        if (command.startsWith('echo ')) {
            const text = command.slice(5);
            output.innerHTML = `<span style="color: #ff79c6;">${text}</span> (eco... eco... eco...)`;
        } else {
            switch(command.toLowerCase()) {
                case 'help':
                    output.innerHTML = 'Comandos disponibles:<br>' + 
                        Object.entries(commands)
                            .map(([cmd, desc]) => `• <span class="highlight">${cmd}</span>: ${desc}`)
                            .join('<br>');
                    break;
                case 'clear':
                    terminalWindow.innerHTML = '';
                    break;
                case 'date':
                    output.textContent = new Date().toLocaleString();
                    break;
                case 'joke':
                    output.textContent = jokes[Math.floor(Math.random() * jokes.length)];
                    break;
                case 'quote':
                    output.textContent = quotes[Math.floor(Math.random() * quotes.length)];
                    break;
                default:
                    if (commandResponses[command]) {
                        output.textContent = commandResponses[command];
                    } else {
                        output.textContent = `Comando no reconocido: ${command}. Escribe 'help' para ver los comandos disponibles.`;
                    }
            }
        }

        if (command.toLowerCase() !== 'clear') {
            terminalWindow.appendChild(output);
        }
        createNewPrompt();
    }

    function handleInput(e) {
        if (e.key === 'Enter') {
            const commandLine = currentPrompt.cloneNode(true);
            commandLine.querySelector('.cursor').remove();
            terminalWindow.replaceChild(commandLine, currentPrompt);
            executeCommand(currentCommand);
            currentCommand = '';
        } else if (e.key === 'Backspace') {
            currentCommand = currentCommand.slice(0, -1);
        } else if (e.key.length === 1) {
            currentCommand += e.key;
        } else {
            return;
        }
        currentPrompt.querySelector('.command').textContent = currentCommand;
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
        e.preventDefault();
    }

    document.addEventListener('keydown', handleInput);

    // Funcionalidad para los iconos del escritorio
    const desktopIcons = document.querySelectorAll('.icon');
    
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const iconName = this.querySelector('span').textContent;
            switch(iconName) {
                case 'Proyectos':
                    executeCommand('projects');
                    break;
                case 'CV.pdf':
                    alert('Abriendo CV.pdf...');
                    // Aquí podrías añadir código para abrir realmente un PDF
                    break;
                case 'Contacto':
                    executeCommand('contact');
                    break;
            }
        });
    });

    window.addEventListener('load', function() {
        terminalWindow.click();
        createNewPrompt();
    });
});
