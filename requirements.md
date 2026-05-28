# Requirements: Alderaan Operatives: LightSpeed Deck Builder

## 1. Project Overview
Convert a legacy single-file HTML/Apps Script project into a modern, full-stack Star Wars themed web application called **"Alderaan Operatives: LightSpeed Deck Builder"**. The application will leverage secure backend Node.js serverless functions to interact with the Google Drive API v3 using an API Key, fetching public XML deck text files, merging them, and delivering a clean client-side download.

The visual interface will be completely modernized to match a high-tech sci-fi "datapad" aesthetic.

## 2. Tech Stack
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Modern Flexbox/Grid, CSS Variables, Sci-Fi theme)
- **Backend Environment:** Node.js Serverless Functions (`/api` routing)
- **Build Tool:** Vite
- **Deployment Platform:** Vercel or Netlify

## 3. Architecture & Target File Structure
```text
├── .env.example
├── .env.local         # Holds GOOGLE_API_KEY
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── api/               # Serverless Backend Functions
│   ├── list-files.js  # Lists .txt files inside the folder ID
│   └── get-file.js    # Fetches text content of a specific file ID
└── src/               # Frontend Application
    ├── main.js        # Event listeners, state management, UI rendering
    ├── xmlMerger.js    # Core XML deck parsing and stitching logic
    └── style.css      # Custom Star Wars "Datapad" Theme Stylesheet