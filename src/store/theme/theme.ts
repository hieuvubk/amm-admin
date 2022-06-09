import { getCookieStorage, setOneCookieStorage } from './../../helpers/storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// @ts-ignore
import { ThemeState, THEME_MODE } from 'src/interfaces/theme';
import { RootState } from '../store';

const initialState: ThemeState = {
  themeMode: (getCookieStorage('theme') as THEME_MODE) || THEME_MODE.LIGHT,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<THEME_MODE>) => {
      setOneCookieStorage('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
      state.themeMode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState): THEME_MODE => state.theme.themeMode;

export default themeSlice.reducer;
