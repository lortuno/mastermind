import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GuessHistory from './GuessHistory.jsx';

const HISTORY = [
  { attempt: 1, combination: 'RRGG', black: 0, white: 1 },
  { attempt: 2, combination: 'BBYY', black: 1, white: 0 },
  { attempt: 3, combination: 'PPRG', black: 2, white: 1 },
];

function renderedAttemptNumbers() {
  return within(screen.getByRole('list', { name: 'Submitted guesses' }))
    .getAllByRole('listitem')
    .map((row) => within(row).getByText(/^#\d+$/).textContent);
}

describe('GuessHistory', () => {
  it('lists attempts newest first while keeping the server attempt numbers', () => {
    render(<GuessHistory history={HISTORY} />);

    expect(renderedAttemptNumbers()).toEqual(['#3', '#2', '#1']);
  });

  it('marks only the newest attempt as latest', () => {
    render(<GuessHistory history={HISTORY} />);

    const [newest, ...older] = screen.getAllByRole('listitem');
    expect(within(newest).getByText('Latest')).toBeInTheDocument();
    older.forEach((row) => expect(within(row).queryByText('Latest')).toBeNull());
    expect(screen.getAllByText('Latest')).toHaveLength(1);
  });

  it('does not reorder the history array it receives', () => {
    const history = [...HISTORY];

    render(<GuessHistory history={history} />);

    expect(history.map((entry) => entry.attempt)).toEqual([1, 2, 3]);
  });

  it('shows both feedback counts as text for every attempt', () => {
    render(<GuessHistory history={HISTORY} />);

    const newest = screen.getAllByRole('listitem')[0];
    expect(within(newest).getByText('1 right position')).toBeInTheDocument();
    expect(within(newest).getByText('2 right color, wrong position')).toBeInTheDocument();
  });

  it('shows an empty state before the first guess', () => {
    render(<GuessHistory history={[]} />);

    expect(screen.getByText('No guesses submitted yet.')).toBeInTheDocument();
  });

  it('moves a newly added attempt to the top on re-render', () => {
    const { rerender } = render(<GuessHistory history={HISTORY.slice(0, 2)} />);
    expect(renderedAttemptNumbers()).toEqual(['#2', '#1']);

    rerender(<GuessHistory history={HISTORY} />);

    expect(renderedAttemptNumbers()).toEqual(['#3', '#2', '#1']);
    expect(within(screen.getAllByRole('listitem')[0]).getByText('Latest')).toBeInTheDocument();
  });
});
