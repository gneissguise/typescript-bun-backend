import { describe, it, expect, beforeEach } from 'bun:test';
import app from '../src/routes/users';
import { users } from '../src/routes/users';
import type { User } from '../src/types/user';

const readJson = async <T>(response: Response): Promise<T> => (await response.json()) as T;

const createUser = async (payload: { name: string; email: string }) => {
  const res = await app.request('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  expect(res.status).toBe(201);
  return readJson<User>(res);
};

describe('Users API', () => {
  beforeEach(() => {
    // Reset users array before each test
    users.length = 0;
  });

  describe('GET /api/users', () => {
    it('should return empty array when no users exist', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);
      const data = await readJson<User[]>(res);
      expect(data).toEqual([]);
    });

    it('should return all users', async () => {
      // Create a user first
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      });
      expect(createRes.status).toBe(201);

      // List users
      const res = await app.request('/');
      expect(res.status).toBe(200);
      const data = await readJson<User[]>(res);
      expect(data).toHaveLength(1);

      expect(data[0]!.name).toBe('John Doe');
      expect(data[0]!.email).toBe('john@example.com');
      expect(data[0]!).toHaveProperty('id');
      expect(data[0]!).toHaveProperty('createdAt');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const data = await createUser({ name: 'Jane Doe', email: 'jane@example.com' });

      expect(data.name).toBe('Jane Doe');
      expect(data.email).toBe('jane@example.com');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('createdAt');

      expect(users).toHaveLength(1);
      const createdUser = users[0]!;
      expect(createdUser.name).toBe('Jane Doe');
    });

    it('should return 400 for invalid payloads', async () => {
      const invalidPayloads = [
        { name: 'Invalid', email: 'not-an-email' },
        { email: 'test@example.com' },
        { name: 'Test User' },
      ];

      for (const payload of invalidPayloads) {
        const res = await app.request('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        expect(res.status).toBe(400);
      }
    });

    it('should generate unique IDs for each user', async () => {
      const user1 = await createUser({ name: 'User 1', email: 'user1@example.com' });
      const user2 = await createUser({ name: 'User 2', email: 'user2@example.com' });

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      const user = await createUser({ name: 'Bob Smith', email: 'bob@example.com' });

      const res = await app.request(`/${user.id}`);
      expect(res.status).toBe(200);
      const data = await readJson<User>(res);
      expect(data.id).toBe(user.id);
      expect(data.name).toBe('Bob Smith');
      expect(data.email).toBe('bob@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.request('/non-existent-id');
      expect(res.status).toBe(404);
      const data = await readJson<{ error: string }>(res);
      expect(data.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', async () => {
      const user = await createUser({ name: 'Original Name', email: 'original@example.com' });

      const res = await app.request(`/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name', email: 'updated@example.com' }),
      });

      expect(res.status).toBe(200);
      const data = await readJson<User>(res);
      expect(data.name).toBe('Updated Name');
      expect(data.email).toBe('updated@example.com');
      expect(data.id).toBe(user.id);
    });

    it('should return 404 for updating non-existent user', async () => {
      const res = await app.request('/non-existent-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', email: 'updated@example.com' }),
      });

      expect(res.status).toBe(404);
      const data = await readJson<{ error: string }>(res);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 for invalid email on update', async () => {
      const user = await createUser({ name: 'Original', email: 'original@example.com' });

      const res = await app.request(`/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', email: 'invalid-email' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const user = await createUser({ name: 'ToDelete', email: 'delete@example.com' });

      const res = await app.request(`/${user.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);

      const getRes = await app.request(`/${user.id}`);
      expect(getRes.status).toBe(404);
      expect(users).toHaveLength(0);
    });

    it('should return 404 for deleting non-existent user', async () => {
      const res = await app.request('/non-existent-id', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const data = await readJson<{ error: string }>(res);
      expect(data.error).toBe('User not found');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full CRUD lifecycle', async () => {
      const user = await createUser({ name: 'Alice', email: 'alice@example.com' });

      const getRes = await app.request(`/${user.id}`);
      expect(getRes.status).toBe(200);
      const retrieved = await readJson<User>(getRes);
      expect(retrieved.name).toBe('Alice');

      const updateRes = await app.request(`/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Alice Updated', email: 'alice.new@example.com' }),
      });
      expect(updateRes.status).toBe(200);
      const updated = await readJson<User>(updateRes);
      expect(updated.name).toBe('Alice Updated');

      const deleteRes = await app.request(`/${user.id}`, {
        method: 'DELETE',
      });
      expect(deleteRes.status).toBe(204);

      const finalGetRes = await app.request(`/${user.id}`);
      expect(finalGetRes.status).toBe(404);
    });

    it('should list users in creation order', async () => {
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'First', email: 'first@example.com' }),
      });

      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Second', email: 'second@example.com' }),
      });

      const res = await app.request('/');
      expect(res.status).toBe(200);
      const data = await readJson<User[]>(res);
      expect(data).toHaveLength(2);

      const [firstUser, secondUser] = data;
      expect(firstUser!.name).toBe('First');
      expect(secondUser!.name).toBe('Second');
    });
  });
});
