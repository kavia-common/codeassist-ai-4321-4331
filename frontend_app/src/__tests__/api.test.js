/**
 * Tests for src/api.js helper functions.
 */
import { getBaseUrl, getHealth, postGenerate, postExplain, postDebug } from '../api';

beforeEach(() => {
  delete process.env.REACT_APP_BACKEND_BASE_URL;
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('getBaseUrl returns default when env not set', () => {
  expect(getBaseUrl()).toBe('http://localhost:3001');
});

test('getHealth returns payload on 200', async () => {
  global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Healthy' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }));
  const data = await getHealth();
  expect(data.message).toBe('Healthy');
});

test('getHealth throws on non-2xx', async () => {
  global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'Nope' } }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  }));
  await expect(getHealth()).rejects.toThrow(/Nope|Health check failed/);
});

test('postGenerate validates input', async () => {
  await expect(postGenerate({})).rejects.toThrow(/Prompt is required/);
});

test('postExplain validates input', async () => {
  await expect(postExplain({})).rejects.toThrow(/Code is required/);
});

test('postDebug validates input', async () => {
  await expect(postDebug({})).rejects.toThrow(/Code is required/);
});

test('postGenerate returns JSON on success', async () => {
  global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ content: 'ok', model: 'm' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }));
  const r = await postGenerate({ prompt: 'x' });
  expect(r.content).toBe('ok');
  expect(r.model).toBe('m');
});

test('postGenerate throws on 4xx/5xx', async () => {
  global.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'Bad' } }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  }));
  await expect(postGenerate({ prompt: 'x' })).rejects.toThrow(/Bad|Request failed/);
});

test('mixed-content guard throws helpful error in https+http case', async () => {
  // Simulate HTTPS frontend and HTTP backend
  Object.defineProperty(window, 'location', { value: { protocol: 'https:' }, writable: true });
  process.env.REACT_APP_BACKEND_BASE_URL = 'http://insecure:3001';

  await expect(getHealth()).rejects.toThrow(/Frontend is served over HTTPS but backend base URL is HTTP/);
});
