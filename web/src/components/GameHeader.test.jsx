import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GameHeader from './GameHeader.jsx';

describe('GameHeader', () => {
  it('shows the difficulty and attempt counter as text', () => {
    render(<GameHeader difficultyName="Medium" attemptNumber={3} maxAttempts={8} />);

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Attempt 3 of 8')).toBeInTheDocument();
  });

  it('exposes the attempts left as an accessible progressbar', () => {
    render(<GameHeader difficultyName="Medium" attemptNumber={3} maxAttempts={8} />);

    const bar = screen.getByRole('progressbar', { name: 'Attempts remaining' });
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '8');
    expect(bar).toHaveAttribute('aria-valuetext', '5 of 8 left');
  });
});
