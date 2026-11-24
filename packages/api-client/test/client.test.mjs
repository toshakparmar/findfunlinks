import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, ApiError } from '../dist/index.js';

describe('ApiClient Unit Tests', () => {
  test('initializes with baseUrl', () => {
    const client = new ApiClient({ baseUrl: 'https://api.finallinks.com/' });
    assert.ok(client);
    assert.ok(client.auth);
    assert.ok(client.public);
    assert.ok(client.owner);
  });

  test('ApiError exposes status, code, details and requestId', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', [{ field: 'email' }], 'req-123');
    assert.equal(error.status, 400);
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.equal(error.message, 'Validation failed');
    assert.equal(error.requestId, 'req-123');
  });
});

