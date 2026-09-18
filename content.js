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
    cvUrl: 'cv-jose-jordan.pdf',

    links: {
        email: 'info@josejordan.dev',
        github: 'https://github.com/mundodigitalpro',
        linkedin: 'https://www.linkedin.com/in/josejordan1/',
        twitter: 'https://x.com/josejordandev',
        twitterHandle: '@josejordandev'
    },

    about: [
        'Soy Jose Jordan, desarrollador full stack en Córdoba (España).',
        'Hoy desarrollo procesos ETL en Python, integro APIs, diseño bases de datos SQL y construyo interfaces en Vue.js. Antes he creado apps Android con Kotlin y Jetpack Compose y sistemas de gestión empresarial en Java.',
        'También doy formación en inteligencia artificial y ciencia de datos, y sigo aprendiendo construyendo: en GitHub tengo más de cien repositorios públicos con apps, experimentos y prototipos.'
    ],

    skills: [
        { area: 'Datos', items: ['ETL con Python (Pandas, APIs)', 'Diseño de bases de datos y SQL', 'Automatización de flujos de información'] },
        { area: 'Backend', items: ['Python (Flask, Django, APIs REST)', 'Java y Spring Boot'] },
        { area: 'Frontend', items: ['Vue.js', 'JavaScript y TypeScript', 'HTML y CSS'] },
        { area: 'Móvil', items: ['Kotlin', 'Android', 'Jetpack Compose', 'Firebase'] },
        { area: 'IA', items: ['Machine learning', 'APIs de OpenAI, Claude, Gemini y Mistral', 'Ollama', 'LangChain y Langchain4j'] },
        { area: 'Otros', items: ['Git y GitHub Actions', 'Docker', 'Cloudflare', 'Docencia en IA y ciencia de datos'] }
    ],

    // Experiencia profesional (resumen del CV). Se muestra con el comando "experience".
    experience: [
        { period: '2025 – actualidad', role: 'Desarrollador full stack', place: 'Humansyde', desc: 'Procesos ETL en Python, integración de APIs, diseño de bases de datos SQL y componentes en Vue.js conectados a los flujos de datos.' },
        { period: '2024 – actualidad', role: 'Docente y formador en IA y ciencia de datos', place: '', desc: 'Diseño e impartición de cursos de IA, machine learning y ciencia de datos, con proyectos prácticos aplicados a distintos sectores.' },
        { period: '2021 – 2024', role: 'Desarrollador Android', place: 'Freelance', desc: 'Aplicaciones móviles en Kotlin, Jetpack Compose y Firebase, con integración de soluciones de IA.' },
        { period: '2019 – 2021', role: 'Desarrollador Java', place: 'Freelance', desc: 'Sistemas de gestión empresarial en Java con back-end escalable, rendimiento y seguridad.' },
        { period: '2000 – 2019', role: 'Dirección y gestión tecnológica', place: 'eCommerce e IT', desc: 'Dirección de una empresa tecnológica especializada en eCommerce, soporte IT y plataformas online.' },
        { period: '2012 – 2015', role: 'Especialista en eCommerce', place: 'Freelance', desc: 'Tiendas online con Shopify, Prestashop y WordPress, pasarelas de pago y SEO.' }
    ],

    // Formación y certificaciones. Se muestran con el comando "education".
    education: [
        'Certificación Profesional en Docencia (2025)',
        'Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (2019)',
        'Inglés B1, EOI Córdoba (2018)'
    ],
    certifications: [
        'IA Aplicada a Gestión de Procesos (2025)',
        'Backend Avanzado: Python, Flask y Django (2025)',
        'AI Fundamentals, IBM (2024)',
        'Big Data IFCT128PO, ADAMS (2020)',
        'Java SE 8, Oracle (2022)'
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
