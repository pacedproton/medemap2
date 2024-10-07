/**
 * @file medeMapSlice.ts
 * @description Redux slice for managing MeDeMAP data, including fetching, state management, and selection of options.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

/**
 * @typedef {Object} MedeMapData
 * @description Object containing arrays of data for each table in the MeDeMAP database.
 */

/**
 * @typedef {Object} ColumnOption
 * @property {string} value - The column name.
 * @property {string} label - The display label for the column.
 * @property {Object} thresholds - Threshold values for the column.
 * @property {number} thresholds.medium_low_threshold - The medium-low threshold value.
 * @property {number} thresholds.high_medium_threshold - The high-medium threshold value.
 * @property {number} thresholds.eu_average - The EU average value.
 * @property {number} thresholds.eu_standard_deviation - The EU standard deviation value.
 */

/**
 * @typedef {Object} MedeMapState
 * @property {MedeMapData} data - The fetched MeDeMAP data.
 * @property {Object.<string, ColumnOption[]>} columnOptions - Available column options for each table.
 * @property {Object.<string, ColumnOption[]>} selectedOptions - User-selected options for each table.
 * @property {boolean} loading - Indicates if data is being fetched.
 * @property {string|null} error - Error message if data fetch fails.
 */

/**
 * @type {MedeMapState}
 * @description Initial state for the MedeMap slice.
 */
const initialState: MedeMapState = {
  data: {},
  columnOptions: {},
  selectedOptions: {},
  loading: false,
  error: null,
};

/**
 * @function fetchMedeMapData
 * @description Async thunk for fetching MedeMap data from the API.
 * @returns {Promise<MedeMapData>} The fetched MedeMap data.
 */
export const fetchMedeMapData = createAsyncThunk(
  'medeMap/fetchData',
  async () => {
    console.log('Fetching MedeMap data');
    const response = await axios.get('/api/medemap');
    console.log('MedeMap data fetched:', response.data);
    return response.data;
  }
);

/**
 * @const medeMapSlice
 * @description Redux slice for MedeMap data management.
 */
const medeMapSlice = createSlice({
  name: 'medeMap',
  initialState,
  reducers: {
    /**
     * @function setSelectedOptions
     * @description Sets the selected options in the state.
     * @param {MedeMapState} state - The current state.
     * @param {PayloadAction<Object.<string, ColumnOption[]>>} action - The selected options.
     */
    setSelectedOptions: (state, action: PayloadAction<{ [key: string]: ColumnOption[] }>) => {
      console.log('Setting selected options:', action.payload);
      state.selectedOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedeMapData.pending, (state) => {
        console.log('MedeMap data fetch pending');
        state.loading = true;
      })
      .addCase(fetchMedeMapData.fulfilled, (state, action) => {
        console.log('MedeMap data fetch fulfilled');
        state.loading = false;
        state.data = action.payload;
        state.columnOptions = Object.entries(action.payload.columnOptions).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            acc[key] = value.map(column => ({
              value: column.value,
              label: column.label,
              thresholds: column.meta
            }));
          }
          return acc;
        }, {});
      })
      .addCase(fetchMedeMapData.rejected, (state, action) => {
        console.log('MedeMap data fetch rejected:', action.error);
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedOptions } = medeMapSlice.actions;

/**
 * @function selectMedeMapData
 * @description Selector to get the entire MedeMap state.
 * @param {RootState} state - The root Redux state.
 * @returns {MedeMapState} The MedeMap state.
 */
export const selectMedeMapData = (state: RootState) => state.medeMap;

/**
 * @function selectMedeMapLoading
 * @description Selector to get the loading state of MedeMap data.
 * @param {RootState} state - The root Redux state.
 * @returns {boolean} The loading state.
 */
export const selectMedeMapLoading = (state: RootState) => state.medeMap.loading;

/**
 * @function selectMedeMapError
 * @description Selector to get the error state of MedeMap data.
 * @param {RootState} state - The root Redux state.
 * @returns {string|null} The error message, if any.
 */
export const selectMedeMapError = (state: RootState) => state.medeMap.error;

export default medeMapSlice.reducer;