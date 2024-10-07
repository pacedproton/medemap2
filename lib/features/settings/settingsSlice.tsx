import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface SettingsState {
        showDataLabels: boolean;
        dataLabelFontSize: number;
}

const initialState: SettingsState = {
        showDataLabels: false,
        dataLabelFontSize: 14,
};

const settingsSlice = createSlice({
        name: 'settings',
        initialState,
        reducers: {
                setShowDataLabels: (state, action: PayloadAction<boolean>) => {
                        state.showDataLabels = action.payload;
                },
                setDataLabelFontSize: (state, action: PayloadAction<number>) => {
                        state.dataLabelFontSize = action.payload;
                },
        },
});


export const { setShowDataLabels, setDataLabelFontSize } =
  settingsSlice.actions;

export const selectShowDataLabels = (state: RootState) =>
  state.settings.showDataLabels;
export const selectDataLabelFontSize = (state: RootState) =>
  state.settings.dataLabelFontSize;

export default settingsSlice.reducer;