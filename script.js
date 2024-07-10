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
        command.textContent += '\n';
        setTimeout(typeOutput, 500);
    }

    function typeOutput() {
        if (outputIndex < outputText.length) {
            output.textContent += outputText.charAt(outputIndex);
            outputIndex++;
            setTimeout(typeOutput, 100);
        }
    }

    setTimeout(typeCommand, 1000);
});
