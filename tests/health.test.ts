import { describe, it, expect, beforeEach } from 'bun:test';
import healthRoutes from '../src/routes/health';

interface HealthResponse {
  status: string;
  timestamp: string;
}

describe('Health Check Endpoints', () => {
  beforeEach(() => {
    // Reset any state before each test if needed
  });

  describe('GET /api/health', () => {
    it('should return 200 status with ok status and timestamp', async () => {
      const res = await healthRoutes.request('/');

      expect(res.status).toBe(200);

      const body = (await res.json()) as HealthResponse;
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('timestamp');
      expect(typeof body.timestamp).toBe('string');

      // Validate timestamp is a valid ISO date string
      const date = new Date(body.timestamp);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should return consistent response structure', async () => {
      const res1 = await healthRoutes.request('/');
      const res2 = await healthRoutes.request('/');

      const body1 = (await res1.json()) as HealthResponse;
      const body2 = (await res2.json()) as HealthResponse;

      expect(body1.status).toBe(body2.status);
      expect(typeof body1.timestamp).toBe(typeof body2.timestamp);
    });
  });
});
