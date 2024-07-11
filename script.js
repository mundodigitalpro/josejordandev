document.addEventListener('DOMContentLoaded', function() {
    const terminalWindow = document.getElementById('terminal-window');
    let currentCommand = '';
    let currentPrompt;
    let currentCursor;

    const commands = {
        'help': 'Muestra esta lista de comandos',
        'about': 'Información sobre Jose Jordan',
        'skills': 'Muestra las habilidades técnicas',
        'projects': 'Lista de proyectos destacados',
        'contact': 'Información de contacto',
        'clear': 'Limpia la pantalla',
        'echo': 'Repite el texto que escribas'
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

    function createNewPrompt() {
        const promptLine = document.createElement('p');
        promptLine.className = 'input-line';
        promptLine.innerHTML = '<span class="prompt">$</span> <span class="command"></span><span class="cursor"></span>';
        terminalWindow.appendChild(promptLine);
        currentPrompt = promptLine.querySelector('.command');
        currentCursor = promptLine.querySelector('.cursor');
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function executeCommand(command) {
        const output = document.createElement('p');
        output.className = 'output';

        if (command.startsWith('echo ')) {
            output.textContent = command.slice(5);
        } else {
            switch(command.toLowerCase()) {
                case 'help':
                    output.innerHTML = 'Comandos disponibles:\n' + Object.entries(commands).map(([cmd, desc]) => `• <span class="highlight">${cmd}</span>: ${desc}`).join('\n');
                    break;
                case 'clear':
                    terminalWindow.innerHTML = '';
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
            const commandLine = currentPrompt.parentElement.cloneNode(true);
            commandLine.querySelector('.command').textContent = currentCommand;
            commandLine.querySelector('.cursor').remove();
            terminalWindow.insertBefore(commandLine, currentPrompt.parentElement);
            executeCommand(currentCommand);
            currentCommand = '';
            currentPrompt.textContent = '';
        } else if (e.key === 'Backspace') {
            currentCommand = currentCommand.slice(0, -1);
            currentPrompt.textContent = currentCommand;
        } else if (e.key.length === 1) {
            currentCommand += e.key;
            currentPrompt.textContent = currentCommand;
        }
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
        e.preventDefault();
    }

    document.addEventListener('keydown', handleInput);

    // Asegurarse de que la terminal tenga el foco al cargar la página
    window.addEventListener('load', function() {
        terminalWindow.click();
        createNewPrompt();
    });
});
