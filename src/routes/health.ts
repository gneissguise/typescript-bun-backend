import { Hono } from 'hono';

const app = new Hono()
  .get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
