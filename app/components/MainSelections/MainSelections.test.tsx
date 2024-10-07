import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MainSelections from '../app/components/MainSelections/MainSelections';

const mockStore = configureStore([]);

describe('MainSelections', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      medeMap: {
        data: {},
        loading: false,
        error: null,
      },
    });
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <MainSelections />
      </Provider>
    );
    expect(screen.getByText('Data Selection')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    store = mockStore({
      medeMap: {
        data: {},
        loading: true,
        error: null,
      },
    });
    render(
      <Provider store={store}>
        <MainSelections />
      </Provider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});