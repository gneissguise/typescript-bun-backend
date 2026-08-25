import app from './src/app';

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`Server running on http://localhost:${port}`);

Bun.serve({
  port,
  fetch(request) {
    return app.fetch(request);
  },
});