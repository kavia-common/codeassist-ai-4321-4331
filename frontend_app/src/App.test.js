import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';

// Mock network fetches in all tests; default healthy and /generate response.
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (typeof url === 'string' && url.endsWith('/')) {
      // GET health
      return Promise.resolve(new Response(JSON.stringify({ message: 'Healthy' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (typeof url === 'string' && url.endsWith('/generate')) {
      return Promise.resolve(new Response(JSON.stringify({ content: 'Mocked assistant response', model: 'gpt-4o-mini' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (typeof url === 'string' && url.endsWith('/explain')) {
      return Promise.resolve(new Response(JSON.stringify({ content: 'Explained code', model: 'gpt-4o-mini' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (typeof url === 'string' && url.endsWith('/debug')) {
      return Promise.resolve(new Response(JSON.stringify({ content: 'Debug steps', model: 'gpt-4o-mini' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return Promise.resolve(new Response('{}', { status: 404 }));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders header and initial assistant message', async () => {
  render(<App />);
  expect(await screen.findByRole('banner', { name: /Application Header/i })).toBeInTheDocument();
  // Initial assistant greeting exists
  expect(screen.getByText(/I’m your AI Copilot/i)).toBeInTheDocument();
});

test('chat flow: user sends generate request and sees assistant response', async () => {
  render(<App />);

  // Input field available and button disabled until text
  const textarea = screen.getByLabelText(/Enter your message/i);
  const button = screen.getByRole('button', { name: /Send/i });
  expect(button).toBeDisabled();

  // Type message and submit
  fireEvent.change(textarea, { target: { value: 'Build a hello world' } });
  expect(button).not.toBeDisabled();
  fireEvent.click(button);

  // User message appears
  expect(await screen.findByRole('article', { name: /User message/i })).toHaveTextContent('Build a hello world');

  // While sending, typing indicator shows
  expect(screen.getByLabelText(/Assistant is typing/i)).toBeInTheDocument();

  // Assistant message appears after fetch
  await waitFor(async () => {
    const items = await screen.findAllByRole('article', { name: /Assistant message/i });
    expect(items[items.length - 1]).toHaveTextContent('Mocked assistant response');
  });
});

test('renders code blocks in assistant messages', async () => {
  // Make /generate return a fenced code block
  global.fetch = jest.fn((url, options) => {
    if (typeof url === 'string' && url.endsWith('/')) {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Healthy' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return Promise.resolve(new Response(JSON.stringify({ content: 'Here is code:\\n```js\\nconsole.log(42);\\n```', model: 'gpt-4o-mini' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  });

  render(<App />);
  const textarea = screen.getByLabelText(/Enter your message/i);
  const button = screen.getByRole('button', { name: /Send/i });
  fireEvent.change(textarea, { target: { value: 'Show code' } });
  fireEvent.click(button);

  // Look for code block rendered
  await waitFor(() => {
    const blocks = screen.getAllByRole('article', { name: /Assistant message/i });
    expect(blocks[blocks.length - 1].querySelector('.code-block')).toBeTruthy();
  });
});

test('shows error banner and assistant error echo on network failure', async () => {
  // Fail generate call
  global.fetch = jest.fn((url, options) => {
    if (typeof url === 'string' && url.endsWith('/')) {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Healthy' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return Promise.reject(new Error('Network down'));
  });

  render(<App />);
  const textarea = screen.getByLabelText(/Enter your message/i);
  const button = screen.getByRole('button', { name: /Send/i });

  fireEvent.change(textarea, { target: { value: 'trigger error' } });
  fireEvent.click(button);

  // Error banner appears
  expect(await screen.findByRole('alert')).toHaveTextContent(/Network down/i);
  // Assistant message echoes error as code block
  const assistants = await screen.findAllByRole('article', { name: /Assistant message/i });
  expect(assistants[assistants.length - 1]).toHaveTextContent('Network down');
});
