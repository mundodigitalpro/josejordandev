/*
 * Contenido de josejordan.dev.
 * Edita este fichero para actualizar textos, proyectos y enlaces
 * sin tocar la lógica de la terminal (script.js).
 */
const CONTENT = Object.freeze({
    name: 'Jose Jordan',
    user: 'jose',
    host: 'josejordan.dev',

    // Ruta o URL del CV en PDF (por ejemplo 'cv.pdf'). Déjalo vacío si no está publicado.
    cvUrl: '',

    links: {
        email: 'info@josejordan.dev',
        github: 'https://github.com/mundodigitalpro',
        linkedin: 'https://www.linkedin.com/in/josejordan1/',
        twitter: 'https://x.com/josejordandev',
        twitterHandle: '@josejordandev'
    },

    about: [
        'Soy Jose Jordan, desarrollador de software en Córdoba (España).',
        'Construyo aplicaciones Android y multiplataforma con Kotlin y Jetpack Compose, e integro modelos de lenguaje (OpenAI, Claude, Gemini, Mistral, Ollama) en apps y herramientas.',
        'Me gusta aprender construyendo: en GitHub tengo más de cien repositorios públicos con apps, juegos, experimentos y prototipos.'
    ],

    skills: [
        { area: 'Móvil', items: ['Kotlin', 'Android', 'Jetpack Compose', 'Kotlin Multiplatform y Kotlin/Native'] },
        { area: 'IA', items: ['APIs de OpenAI, Claude, Gemini y Mistral', 'Ollama', 'LangChain y Langchain4j', 'ML Kit'] },
        { area: 'Backend', items: ['Java y Spring Boot', 'Python (Flask)', 'Node.js', 'MongoDB'] },
        { area: 'Web', items: ['JavaScript y TypeScript', 'HTML y CSS', 'React y Expo'] },
        { area: 'Herramientas', items: ['Git y GitHub Actions', 'Gradle', 'Docker', 'Cloudflare'] }
    ],

    // Proyectos públicos de GitHub. El número de orden se usa en "open <n>".
    projects: [
        {
            name: 'KotlinNativeClaudeChat',
            url: 'https://github.com/mundodigitalpro/KotlinNativeClaudeChat',
            lang: 'Kotlin/Native',
            desc: 'Chat con la API de Claude en Kotlin Multiplataforma: integración de APIs externas, configuración con Okio y serialización JSON.'
        },
        {
            name: 'MLVisionKotlin',
            url: 'https://github.com/mundodigitalpro/MLVisionKotlin',
            lang: 'Kotlin',
            desc: 'Reconocimiento de texto en imágenes con ML Kit en Android.'
        },
        {
            name: 'LogoGenerator',
            url: 'https://github.com/mundodigitalpro/LogoGenerator',
            lang: 'Kotlin',
            desc: 'App Android que genera logotipos con inteligencia artificial.'
        },
        {
            name: 'compose-desktop-chatbot',
            url: 'https://github.com/mundodigitalpro/compose-desktop-chatbot',
            lang: 'Kotlin',
            desc: 'Chatbot de escritorio con Compose Desktop e integración con OpenAI.'
        },
        {
            name: 'langchain4j-kotlin-mistral',
            url: 'https://github.com/mundodigitalpro/langchain4j-kotlin-mistral',
            lang: 'Kotlin',
            desc: 'Chat interactivo con el modelo de Mistral a través de Langchain4j, con historial de conversación persistente.'
        },
        {
            name: 'chatfile',
            url: 'https://github.com/mundodigitalpro/chatfile',
            lang: 'Python',
            desc: 'Chatea con el contenido de tus propios ficheros de texto.'
        },
        {
            name: 'Minesweeper_final',
            url: 'https://github.com/mundodigitalpro/Minesweeper_final',
            lang: 'Kotlin',
            desc: 'Buscaminas clásico para Android con vista personalizada, temporizador, puntuación y récords guardados.'
        },
        {
            name: 'letsdoit_app',
            url: 'https://github.com/mundodigitalpro/letsdoit_app',
            lang: 'Kotlin',
            desc: 'App para registrar entrenamientos, fijar objetivos y seguir el progreso deportivo.'
        }
    ],

    jokes: [
        '¿Por qué los programadores prefieren el frío? Porque tienen un problema con el calor-sync.',
        '¿Cómo se llama un desarrollador que no sabe programar en C? De-C-sarrollador.',
        '¿Por qué los programadores siempre confunden Halloween con Navidad? Porque oct 31 == dec 25.',
        "Un programador va al supermercado. Su pareja le dice: 'Compra una barra de pan y si hay huevos, trae 6'. Vuelve con 6 barras de pan.",
        'Hay 10 tipos de personas: las que entienden binario y las que no.',
        'Mi código no tiene bugs. Tiene funcionalidades sin documentar.'
    ],

    quotes: [
        'El arte de programar consiste en organizar y dominar la complejidad. - Edsger W. Dijkstra',
        'La programación no es sobre tipear, es sobre pensar. - Rich Hickey',
        'El código es como el humor. Cuando tienes que explicarlo, es malo. - Cory House',
        'Medir el progreso del desarrollo de software por líneas de código es como medir el progreso de la construcción de un avión por su peso. - Bill Gates',
        'Cualquier tonto puede escribir código que un ordenador entienda. Los buenos programadores escriben código que los humanos pueden entender. - Martin Fowler',
        'Hablar es barato. Enséñame el código. - Linus Torvalds'
    ]
});
