import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('title poc worflow is rendered', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/POC WORKFLOW DEMO FRONT/i);
  expect(linkElement).toBeInTheDocument();
});
