document.addEventListener('DOMContentLoaded', function() {
    const message = document.getElementById('message');
    const text = "Hello World, I'm Jose Jordan";
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            message.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    setTimeout(typeWriter, 1000);
});
