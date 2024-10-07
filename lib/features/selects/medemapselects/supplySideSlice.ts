// lib/features/supplySideSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSupplySide = createAsyncThunk('supplySide/fetchData', async () => {
  const response = await axios.get('/api/medemap');
  return response.data.supply_side;
});

const supplySideSlice = createSlice({
  name: 'supplySide',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplySide.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSupplySide.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSupplySide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default supplySideSlice.reducer;
