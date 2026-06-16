import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders home page by default', () => {
    render(<App />);
    expect(screen.getByText('Open20 Rulebook')).toBeInTheDocument();
  });
});
