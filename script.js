document.addEventListener('DOMContentLoaded', function() {
    const command = document.getElementById('command');
    const output = document.getElementById('output');
    const commandText = "echo 'Hello World, I'm Jose Jordan'";
    const outputText = "Hello World, I'm Jose Jordan";
    let commandIndex = 0;
    let outputIndex = 0;

    function typeCommand() {
        if (commandIndex < commandText.length) {
            command.textContent += commandText.charAt(commandIndex);
            commandIndex++;
            setTimeout(typeCommand, 100);
        } else {
            setTimeout(executeCommand, 500);
        }
    }

    function executeCommand() {
        setTimeout(typeOutput, 500);
    }

    function typeOutput() {
        if (outputIndex < outputText.length) {
            output.textContent += outputText.charAt(outputIndex);
            outputIndex++;
            setTimeout(typeOutput, 100);
        }
    }

    typeCommand();
});
