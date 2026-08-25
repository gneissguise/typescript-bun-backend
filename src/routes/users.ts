import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { User, CreateUserInput } from '../types/user';

const userInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

// In-memory store (replace with a database in production)
export const users: User[] = [];

const getUserById = (id: string) => users.find((user) => user.id === id);
const getUserIndexById = (id: string) => users.findIndex((user) => user.id === id);
const notFoundResponse = () => ({ error: 'User not found' });

const app = new Hono()
  // GET /api/users - List all users
  .get('/', (c) => c.json(users))

  // POST /api/users - Create a new user
  .post('/', zValidator('json', userInputSchema), (c) => {
    const input = c.req.valid('json') as CreateUserInput;
    const user: User = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    
    users.push(user);
    return c.json(user, 201);
  })

  // GET /api/users/:id - Get a user by ID
  .get('/:id', (c) => {
    const user = getUserById(c.req.param('id'));

    if (!user) {
      return c.json(notFoundResponse(), 404);
    }

    return c.json(user);
  })

  // PUT /api/users/:id - Update a user
  .put('/:id', zValidator('json', userInputSchema), (c) => {
    const id = c.req.param('id');
    const input = c.req.valid('json') as CreateUserInput;
    const index = getUserIndexById(id);

    if (index === -1) {
      return c.json(notFoundResponse(), 404);
    }

    const existingUser = users[index];

    if (!existingUser) {
      return c.json(notFoundResponse(), 404);
    }

    const updatedUser: User = {
      ...existingUser,
      ...input,
      id: existingUser.id,
      createdAt: existingUser.createdAt,
    };

    users[index] = updatedUser;
    return c.json(updatedUser);
  })

  // DELETE /api/users/:id - Delete a user
  .delete('/:id', (c) => {
    const id = c.req.param('id');
    const index = getUserIndexById(id);

    if (index === -1) {
      return c.json(notFoundResponse(), 404);
    }

    users.splice(index, 1);
    return c.body(null, 204);
  });

export default app;
