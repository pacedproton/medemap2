import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ThreeDMeshView from './page';

// Mock the dynamic import of Plotly
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'Plot';
  return DynamicComponent;
});

// Mock the clientlogging functions
jest.mock('../../lib/clientlogging', () => ({
  log: jest.fn(),
  logVerbose: jest.fn(),
}));

// Mock the useAppSelector hook
jest.mock('../../lib/hooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockStore = configureStore([]);

describe('ThreeDMeshView', () => {
  it('renders no data message when plotData is empty', () => {
    const initialState = {
      medeMap: {
        data: {},
        selectedOptions: {},
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <ThreeDMeshView />
      </Provider>
    );

    expect(screen.getByText('No data to display. Please select some options.')).toBeInTheDocument();
  });

  it('renders Plot component when data is available', () => {
    const initialState = {
      medeMap: {
        data: {
          table1: [
            { country: 'Country1', value1: '10' },
            { country: 'Country2', value1: '20' },
          ],
        },
        selectedOptions: {
          table1: [{ label: 'Value 1', value: 'value1' }],
        },
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <ThreeDMeshView />
      </Provider>
    );

    expect(screen.getByDisplayValue('Plot')).toBeInTheDocument();
  });
});