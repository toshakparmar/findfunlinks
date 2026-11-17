import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return liveness status', () => {
    const res = controller.getLiveness();
    expect(res.status).toBe('ok');
    expect(res.timestamp).toBeDefined();
    expect(typeof res.uptime).toBe('number');
  });

  it('should return readiness status', () => {
    const res = controller.getReadiness();
    expect(res.status).toBe('ready');
    expect(res.timestamp).toBeDefined();
  });
});
