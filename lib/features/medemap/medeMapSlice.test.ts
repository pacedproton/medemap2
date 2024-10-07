import medemapDataReducer, { fetchGlobeData } from '../lib/features/globeData/medemapDataSlice';

describe('medemapDataSlice', () => {
  const initialState = {
    data: [],
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(medemapDataReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchGlobeData.pending', () => {
    const action = { type: fetchGlobeData.pending.type };
    const state = medemapDataReducer(initialState, action);
    expect(state.loading).toBe(true);
  });

  it('should handle fetchGlobeData.fulfilled', () => {
    const payload = [{ country: 'Test', eu_abbr: 'TE' }];
    const action = { type: fetchGlobeData.fulfilled.type, payload };
    const state = medemapDataReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.data).toEqual(payload);
  });
});