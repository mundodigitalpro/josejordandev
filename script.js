document.addEventListener('DOMContentLoaded', function() {
    const command = document.getElementById('command');
    const output = document.getElementById('output');
    const debug = document.getElementById('debug');
    
    debug.textContent = "JavaScript is running";

    function writeText(element, text) {
        let index = 0;
        function addChar() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(addChar, 100);
            }
        }
        addChar();
    }

    writeText(command, "echo 'Hello World, I'm Jose Jordan'");
    
    setTimeout(() => {
        writeText(output, "Hello World, I'm Jose Jordan");
    }, 3000);

    console.log("JavaScript execution completed");
});

// Log any errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error: ", message, "at", source, ":", lineno);
    document.getElementById('debug').textContent += "\nError: " + message;
    return true;
};
