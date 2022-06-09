/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { getGeneralApi } from 'src/pages/Dashboard/GeneralSettings/api/index';
import {
  File,
  General,
  ONE_MINUTE,
  PERCENT_NUMBER_REGEX,
  UpdateInterval,
} from 'src/pages/Dashboard/GeneralSettings/constants';
const initialState = {
  generals: {
    data: [] as General[],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  loading: false,
  error: '',
};
const getGeneralSlice = createSlice({
  name: 'dashboard/getGeneral',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    // get all general
    [`${getGeneralApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getGeneralApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getGeneralApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.generals = action.payload;
    },
  },
});
const { reducer: generalSettingReducer } = getGeneralSlice;
export default generalSettingReducer;
