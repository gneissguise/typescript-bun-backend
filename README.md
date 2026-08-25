# typescript-bun-backend

A minimal TypeScript backend built with [Hono](https://hono.dev) and [Bun](https://bun.com).

## Quick Start

```bash
# Install dependencies
bun install

# Start the server (development mode)
bun run index.ts
```

The server starts on `http://localhost:3000` by default.

## Running Tests

```bash
# Run all tests
bun test

# Or via npm script
npm test
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{ "status": "ok", "timestamp": "2026-08-24T..." }
```

### Users

| Method | Endpoint       | Description     |
|--------|----------------|-----------------|
| GET    | `/api/users`   | List all users  |
| POST   | `/api/users`   | Create a user   |
| GET    | `/api/users/:id` | Get a user by ID |
| PUT    | `/api/users/:id` | Update a user   |

**Create a user:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'
```

**List all users:**

```bash
curl http://localhost:3000/api/users
```

**Get a user by ID:**

```bash
curl http://localhost:3000/api/users/<user-id>
```

**Update a user:**

```bash
curl -X PUT http://localhost:3000/api/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane.smith@example.com"}'
```

## Project Structure

```
index.ts          # Entry point — starts the Hono server
src/
  app.ts          # Hono app setup & route mounting
  routes/
    health.ts     # Health check endpoint
    users.ts      # User CRUD endpoints
  types/
    user.ts       # TypeScript types & Zod schemas
tests/
  health.test.ts  # Health endpoint tests
  users.test.ts   # User CRUD tests
package.json      # Dependencies & scripts
tsconfig.json     # TypeScript configuration
```

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Validation:** Zod
- **Language:** TypeScript (strict mode)
- **Testing:** bun:test
