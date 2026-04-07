## QueueFlow API Documentation

### Base URL
`http://localhost:3000`

---

### Queue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/queue/stats` | Get live queue metrics |
| POST | `/api/queue/token` | Generate a new token |
| GET | `/api/queue/pending` | Get pending approval tokens |
| PATCH | `/api/queue/approve/:tokenId` | Approve a pending token |
| PATCH | `/api/queue/call` | Call next token |
| GET | `/api/queue/history` | Get completed token history |
| GET | `/api/queue/breakdown` | Per-service token breakdown |
| POST | `/api/queue/reset` | Reset entire queue |

---

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login existing user |

---

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all registered users |
| GET | `/api/services` | List all services |

---

### Token Status Flow
```
pending -> waiting -> serving -> completed
```
