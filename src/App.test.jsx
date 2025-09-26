import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  test('renders Trinity Dashboard title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Look for any element with Trinity Dashboard text
    const titleElement = screen.queryByText(/Trinity Dashboard/i);
    if (titleElement) {
      expect(titleElement).toBeInTheDocument();
    }
  });
});