/*
 * Contenido de josejordan.dev en español e inglés.
 * Edita este fichero para actualizar textos, proyectos y enlaces
 * sin tocar la lógica de la terminal (script.js).
 *
 * Content of josejordan.dev in Spanish and English. Edit this file to
 * update texts, projects and links without touching the terminal logic.
 */
const CONTENT = Object.freeze({
    name: 'Jose Jordan',
    user: 'jose',
    host: 'josejordan.dev',

    // CV en PDF. cvUrlEn es opcional: si está vacío, la versión inglesa abre el CV en español.
    cvUrl: 'cv-jose-jordan.pdf',
    cvUrlEn: '',

    links: {
        email: 'info@josejordan.dev',
        github: 'https://github.com/mundodigitalpro',
        linkedin: 'https://www.linkedin.com/in/josejordan1/',
        twitter: 'https://x.com/josejordandev',
        twitterHandle: '@josejordandev'
    },

    // Proyectos públicos de GitHub. El número de orden se usa en "open <n>".
    projects: [
        {
            name: 'KotlinNativeClaudeChat',
            url: 'https://github.com/mundodigitalpro/KotlinNativeClaudeChat',
            lang: 'Kotlin/Native',
            desc: {
                es: 'Chat con la API de Claude en Kotlin Multiplataforma: integración de APIs externas, configuración con Okio y serialización JSON.',
                en: 'Chat with the Claude API in Kotlin Multiplatform: external API integration, configuration with Okio and JSON serialization.'
            }
        },
        {
            name: 'MLVisionKotlin',
            url: 'https://github.com/mundodigitalpro/MLVisionKotlin',
            lang: 'Kotlin',
            desc: {
                es: 'Reconocimiento de texto en imágenes con ML Kit en Android.',
                en: 'Text recognition in images with ML Kit on Android.'
            }
        },
        {
            name: 'LogoGenerator',
            url: 'https://github.com/mundodigitalpro/LogoGenerator',
            lang: 'Kotlin',
            desc: {
                es: 'App Android que genera logotipos con inteligencia artificial.',
                en: 'Android app that generates logos with artificial intelligence.'
            }
        },
        {
            name: 'compose-desktop-chatbot',
            url: 'https://github.com/mundodigitalpro/compose-desktop-chatbot',
            lang: 'Kotlin',
            desc: {
                es: 'Chatbot de escritorio con Compose Desktop e integración con OpenAI.',
                en: 'Desktop chatbot built with Compose Desktop and OpenAI integration.'
            }
        },
        {
            name: 'langchain4j-kotlin-mistral',
            url: 'https://github.com/mundodigitalpro/langchain4j-kotlin-mistral',
            lang: 'Kotlin',
            desc: {
                es: 'Chat interactivo con el modelo de Mistral a través de Langchain4j, con historial de conversación persistente.',
                en: 'Interactive chat with the Mistral model through Langchain4j, with persistent conversation history.'
            }
        },
        {
            name: 'chatfile',
            url: 'https://github.com/mundodigitalpro/chatfile',
            lang: 'Python',
            desc: {
                es: 'Chatea con el contenido de tus propios ficheros de texto.',
                en: 'Chat with the contents of your own text files.'
            }
        },
        {
            name: 'Minesweeper_final',
            url: 'https://github.com/mundodigitalpro/Minesweeper_final',
            lang: 'Kotlin',
            desc: {
                es: 'Buscaminas clásico para Android con vista personalizada, temporizador, puntuación y récords guardados.',
                en: 'Classic Minesweeper for Android with a custom view, timer, score tracking and saved high scores.'
            }
        },
        {
            name: 'letsdoit_app',
            url: 'https://github.com/mundodigitalpro/letsdoit_app',
            lang: 'Kotlin',
            desc: {
                es: 'App para registrar entrenamientos, fijar objetivos y seguir el progreso deportivo.',
                en: 'App to log workouts, set goals and track sports progress.'
            }
        }
    ],

    text: {
        es: {
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
            experience: [
                { period: '2025 – actualidad', role: 'Desarrollador full stack', place: 'Humansyde', desc: 'Procesos ETL en Python, integración de APIs, diseño de bases de datos SQL y componentes en Vue.js conectados a los flujos de datos.' },
                { period: '2024 – actualidad', role: 'Docente y formador en IA y ciencia de datos', place: '', desc: 'Diseño e impartición de cursos de IA, machine learning y ciencia de datos, con proyectos prácticos aplicados a distintos sectores.' },
                { period: '2021 – 2024', role: 'Desarrollador Android', place: 'Freelance', desc: 'Aplicaciones móviles en Kotlin, Jetpack Compose y Firebase, con integración de soluciones de IA.' },
                { period: '2019 – 2021', role: 'Desarrollador Java', place: 'Freelance', desc: 'Sistemas de gestión empresarial en Java con back-end escalable, rendimiento y seguridad.' },
                { period: '2000 – 2019', role: 'Dirección y gestión tecnológica', place: 'eCommerce e IT', desc: 'Dirección de una empresa tecnológica especializada en eCommerce, soporte IT y plataformas online.' },
                { period: '2012 – 2015', role: 'Especialista en eCommerce', place: 'Freelance', desc: 'Tiendas online con Shopify, Prestashop y WordPress, pasarelas de pago y SEO.' }
            ],
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
        },

        en: {
            about: [
                "I'm Jose Jordan, a full-stack developer based in Córdoba, Spain.",
                'Today I build ETL processes in Python, integrate APIs, design SQL databases and create interfaces with Vue.js. Before that I built Android apps with Kotlin and Jetpack Compose, and business management systems in Java.',
                'I also teach artificial intelligence and data science, and I keep learning by building: my GitHub has more than a hundred public repositories with apps, experiments and prototypes.'
            ],
            skills: [
                { area: 'Data', items: ['ETL with Python (Pandas, APIs)', 'Database design and SQL', 'Data pipeline automation'] },
                { area: 'Backend', items: ['Python (Flask, Django, REST APIs)', 'Java and Spring Boot'] },
                { area: 'Frontend', items: ['Vue.js', 'JavaScript and TypeScript', 'HTML and CSS'] },
                { area: 'Mobile', items: ['Kotlin', 'Android', 'Jetpack Compose', 'Firebase'] },
                { area: 'AI', items: ['Machine learning', 'OpenAI, Claude, Gemini and Mistral APIs', 'Ollama', 'LangChain and Langchain4j'] },
                { area: 'Other', items: ['Git and GitHub Actions', 'Docker', 'Cloudflare', 'Teaching AI and data science'] }
            ],
            experience: [
                { period: '2025 – present', role: 'Full-stack developer', place: 'Humansyde', desc: 'ETL processes in Python, API integration, SQL database design and Vue.js components connected to the data flows.' },
                { period: '2024 – present', role: 'AI and data science teacher and trainer', place: '', desc: 'Design and delivery of courses on AI, machine learning and data science, with hands-on projects applied to different sectors.' },
                { period: '2021 – 2024', role: 'Android developer', place: 'Freelance', desc: 'Mobile apps in Kotlin, Jetpack Compose and Firebase, including AI integrations.' },
                { period: '2019 – 2021', role: 'Java developer', place: 'Freelance', desc: 'Business management systems in Java with scalable back ends, performance and security.' },
                { period: '2000 – 2019', role: 'Technology direction and management', place: 'eCommerce and IT', desc: 'Ran a technology company specialising in eCommerce, IT support and online platforms.' },
                { period: '2012 – 2015', role: 'eCommerce specialist', place: 'Freelance', desc: 'Online stores with Shopify, Prestashop and WordPress, payment gateways and SEO.' }
            ],
            education: [
                'Professional Teaching Certificate (2025)',
                'Higher Technician in Multiplatform Application Development (2019)',
                'English B1, EOI Córdoba (2018)'
            ],
            certifications: [
                'AI Applied to Process Management (2025)',
                'Advanced Backend: Python, Flask and Django (2025)',
                'AI Fundamentals, IBM (2024)',
                'Big Data IFCT128PO, ADAMS (2020)',
                'Java SE 8, Oracle (2022)'
            ],
            jokes: [
                'Why do programmers prefer dark mode? Because light attracts bugs.',
                "There are 10 kinds of people: those who understand binary and those who don't.",
                'Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25.',
                "A programmer's partner says: 'Go to the store and buy a loaf of bread. If they have eggs, get six.' The programmer comes back with six loaves of bread.",
                "My code doesn't have bugs. It has undocumented features.",
                "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'"
            ],
            quotes: [
                'The art of programming is the art of organizing complexity. - Edsger W. Dijkstra',
                "Programming is not about typing, it's about thinking. - Rich Hickey",
                "Code is like humor. When you have to explain it, it's bad. - Cory House",
                'Measuring programming progress by lines of code is like measuring aircraft building progress by weight. - Bill Gates',
                'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. - Martin Fowler',
                'Talk is cheap. Show me the code. - Linus Torvalds'
            ]
        }
    }
});
