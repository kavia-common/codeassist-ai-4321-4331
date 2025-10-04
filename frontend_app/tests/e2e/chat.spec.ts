/**
 * End-to-end tests for the AI Copilot frontend, targeting the running dev servers:
 * - Frontend: http://localhost:3000 (override via E2E_BASE_URL)
 * - Backend:  http://localhost:3001 (override via BASE_BACKEND_URL)
 *
 * These tests assume both services are already running. We do NOT start servers here.
 *
 * The suite includes:
 *  - rendering the app header and initial state
 *  - main chat flow that sends a prompt and receives a response (requires backend running)
 *  - error handling when backend is down or returns failure
 *  - fallback network interception test (works even if backend is not running)
 */

import { test, expect } from '@playwright/test';

// Helper to construct backend URL used by the frontend, defaults to localhost:3001
function getBackendBase(): string {
  return (process.env.BASE_BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');
}

test.describe('AI Copilot E2E', () => {
  test('renders header and diagnostics control', async ({ page }) => {
    await page.goto('/');
    // Header landmark
    await expect(page.getByRole('banner', { name: /Application Header/i })).toBeVisible();
    // App title
    await expect(page.getByRole('heading', { name: /AI Copilot/i })).toBeVisible();
    // Diagnostics toggle present
    await expect(page.getByRole('button', { name: /Diagnostics/i })).toBeVisible();
  });

  test('chat flow: send prompt and receive assistant response (backend live)', async ({ page }) => {
    // This test expects a backend running and accessible from the browser.
    // If backend is not available, this test may fail; use the intercept test below in such environments.
    await page.goto('/');

    const textarea = page.getByLabel('Enter your message');
    const sendBtn = page.getByRole('button', { name: /Send/i });

    await expect(sendBtn).toBeDisabled();
    await textarea.fill('Write a hello world in JS');
    await expect(sendBtn).toBeEnabled();

    await sendBtn.click();

    // User message appears in the conversation
    await expect(page.getByRole('article', { name: /User message/i }).last()).toContainText('Write a hello world');

    // Typing indicator appears briefly
    await expect(page.getByLabel('Assistant is typing')).toBeVisible();

    // Assistant message appears
    await expect(page.getByRole('article', { name: /Assistant message/i }).last()).toBeVisible({
      timeout: 15000,
    });
  });

  test('handles backend down: shows error banner and assistant echo', async ({ page }) => {
    // Route the POSTs to backend to simulate connection failure
    const backend = getBackendBase();
    await page.route(`${backend}/generate`, async route => {
      await route.abort('failed'); // Simulate network failure
    });

    await page.goto('/');

    const textarea = page.getByLabel('Enter your message');
    const sendBtn = page.getByRole('button', { name: /Send/i });

    await textarea.fill('trigger error path');
    await sendBtn.click();

    // Error banner should surface
    await expect(page.getByRole('alert')).toBeVisible();
    // Assistant message should contain error echo
    await expect(page.getByRole('article', { name: /Assistant message/i }).last()).toContainText(/Sorry, I couldn't process|Unexpected error/i);
  });

  test('fallback: intercept backend requests and return mocked responses (no backend required)', async ({ page }) => {
    // Intercept all the backend endpoints the app might call
    const backend = getBackendBase();
    await page.route(`${backend}/`, async route => {
      // Health check
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Healthy (mock)' }),
      });
    });

    await page.route(`${backend}/generate`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: 'Hello from mocked backend', model: 'gpt-4o-mini' }),
      });
    });

    await page.route(`${backend}/explain`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: 'Explained (mock)', model: 'gpt-4o-mini' }),
      });
    });

    await page.route(`${backend}/debug`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: 'Debug steps (mock)', model: 'gpt-4o-mini' }),
      });
    });

    await page.goto('/');

    // Header should show connected/healthy state text within status meta (title tooltip may contain detailed text)
    await expect(page.getByRole('banner', { name: /Application Header/i })).toBeVisible();

    const textarea = page.getByLabel('Enter your message');
    await textarea.fill('Say hello');
    await page.getByRole('button', { name: /Send/i }).click();

    // Assistant message should include mocked content
    await expect(page.getByRole('article', { name: /Assistant message/i }).last()).toContainText('Hello from mocked backend');
  });
});
