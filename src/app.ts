import { Hono } from 'hono';
import healthRoutes from './routes/health';
import userRoutes from './routes/users';

const app = new Hono()
  .basePath('/api')
  .get('/', (c) => c.json({ message: 'API is running' }))
  .route('/health', healthRoutes)
  .route('/users', userRoutes);

export default app;
