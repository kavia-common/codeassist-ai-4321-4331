import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (typeof url === 'string' && url.endsWith('/')) {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Healthy' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return Promise.resolve(new Response(JSON.stringify({ content: 'OK', model: 'm' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('Header shows diagnostics panel toggle and status dot', async () => {
  render(<Header />);
  // Status area with dot and message
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
  const button = await screen.findByRole('button', { name: /Diagnostics/i });
  fireEvent.click(button);
  expect(await screen.findByText(/Run end-to-end tests/)).toBeInTheDocument();
});

test('MessageBubble renders code fence correctly', () => {
  render(<MessageBubble role="assistant" content={"Here:\\n```js\\nconsole.log(1)\\n```"} />);
  const pre = screen.getByText(/console\.log/).closest('pre');
  expect(pre).toHaveClass('code-block');
  const article = screen.getByRole('article', { name: /Assistant message/ });
  expect(article).toBeInTheDocument();
});

test('InputBar calls onSubmit with mode and text', () => {
  const onSubmit = jest.fn();
  render(<InputBar onSubmit={onSubmit} defaultMode="debug" />);
  const textarea = screen.getByLabelText(/Enter your message/);
  const button = screen.getByRole('button', { name: /Send/i });
  fireEvent.change(textarea, { target: { value: 'hello' } });
  fireEvent.click(button);
  expect(onSubmit).toHaveBeenCalledWith({ mode: 'debug', text: 'hello' });
});

test('InputBar disabled state prevents submit', () => {
  const onSubmit = jest.fn();
  render(<InputBar onSubmit={onSubmit} disabled />);
  const textarea = screen.getByLabelText(/Enter your message/);
  const button = screen.getByRole('button', { name: /Sending.../i });
  expect(button).toBeDisabled();
  fireEvent.change(textarea, { target: { value: 'x' } });
  fireEvent.click(button);
  expect(onSubmit).not.toHaveBeenCalled();
});
