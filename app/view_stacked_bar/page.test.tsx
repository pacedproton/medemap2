import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import StackedBarView from './page';

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

describe('StackedBarView', () => {
  it('renders no data message when plotData is null', () => {
    const initialState = {
      medeMap: {
        data: {},
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StackedBarView />
      </Provider>
    );

    expect(screen.getByText('No data to display. Please wait for data to load.')).toBeInTheDocument();
  });

  it('renders Plot component when data is available', () => {
    const initialState = {
      medeMap: {
        data: {
          some_table: [
            { country: 'Country1', value1: '10', value2: '20' },
            { country: 'Country2', value1: '20', value2: '30' },
          ],
        },
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StackedBarView />
      </Provider>
    );

    expect(screen.getByDisplayValue('Plot')).toBeInTheDocument();
  });

  it('renders reset button when data is available', () => {
    const initialState = {
      medeMap: {
        data: {
          some_table: [
            { country: 'Country1', value1: '10', value2: '20' },
            { country: 'Country2', value1: '20', value2: '30' },
          ],
        },
      },
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <StackedBarView />
      </Provider>
    );

    expect(screen.getByText('Reset Views')).toBeInTheDocument();
  });
});