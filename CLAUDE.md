# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Jose Jordan, an application developer. The project simulates a desktop environment with an interactive terminal that serves as a personal portfolio and resume interface.

## Architecture

The project consists of a simple static website with three main components:

### Core Files
- **index.html**: Main page with desktop interface and draggable terminal window
- **script.js**: Interactive terminal functionality with command system
- **styles.css**: CSS styling for desktop environment and terminal interface
- **privacy.html**: Privacy policy page

### Key Components

#### Desktop Environment (`index.html`)
- Simulates a desktop with clickable icons (Projects, CV.pdf, Contact)
- Features a draggable, resizable terminal window with Mac-style controls
- Terminal window can be minimized, maximized, and closed

#### Terminal System (`script.js`)
- Interactive command-line interface with the following commands:
  - `help`: Shows available commands
  - `about`: Personal information about Jose Jordan
  - `skills`: Technical skills listing
  - `projects`: Portfolio projects
  - `contact`: Contact information
  - `clear`: Clears terminal screen
  - `echo`: Repeats text with special formatting
  - `date`: Current date/time
  - `joke`: Programming jokes
  - `quote`: Programming quotes

- Terminal features:
  - Drag and drop functionality for window positioning
  - Blinking cursor animation
  - Command history and execution
  - Desktop icon integration (clicking icons executes commands)

#### Styling (`styles.css`)
- Dark theme with terminal-style interface
- Responsive design with desktop simulation
- Mac-style window controls (red/yellow/green buttons)
- Smooth animations and transitions

## Development Commands

This is a static website project. No build tools, package managers, or development servers are configured.

### Running the Project
Since this is a static HTML/CSS/JavaScript project:
- Open `index.html` directly in a web browser
- Or serve via any static file server (e.g., Python's `python -m http.server`)

### File Structure
```
/
├── index.html          # Main portfolio page
├── script.js           # Terminal functionality
├── styles.css          # Styling
├── privacy.html        # Privacy policy
└── CLAUDE.md          # This file
```

## Contact Information
- **Developer**: Jose Jordan
- **Email**: info@josejordan.dev
- **LinkedIn**: https://www.linkedin.com/in/josejordan1/
- **GitHub**: github.com/mundodigitalpro
- **Twitter**: @josejordandev

## Notes
- The project is entirely in Spanish
- No external dependencies beyond Font Awesome icons (loaded via CDN)
- No build process or compilation required
- All functionality is client-side JavaScript