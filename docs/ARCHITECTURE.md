## QueueFlow Architecture

### System Overview
```
Browser (HTML/JS/CSS)
        │
        │ HTTP Fetch API
        ▼
Express.js Server (Node.js)
        │
        │ Mongoose ODM
        ▼
MongoDB (Local Instance)
```

### Module Breakdown
- `server.js` — Main Express application, all routes
- `database/` — Mongoose schema definitions
- `src/` — Frontend JavaScript per-page logic
- `styles/` — CSS and design tokens
- `config/` — Environment and database config
