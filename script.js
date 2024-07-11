document.addEventListener('DOMContentLoaded', function() {
    const terminalWindow = document.getElementById('terminal-window');
    let currentCommand = '';
    let currentPrompt;

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
• Email: jose.jordan@email.com
• LinkedIn: linkedin.com/in/josejordan
• GitHub: github.com/josejordan
• Twitter: @josejordan_dev`
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

    window.addEventListener('load', function() {
        terminalWindow.click();
        createNewPrompt();
    });
});
