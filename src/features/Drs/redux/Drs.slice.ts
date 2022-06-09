/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import {} from 'src/features/MarketOverview/api/index';
import { getDrsApi } from 'src/features/Drs/api/index';
const initialState = {
  drs: {
    data: [],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  loading: false,
  error: '',
};
const drsSlice = createSlice({
  name: 'dashboard/getDrs',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    // get all drs
    [`${getDrsApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getDrsApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getDrsApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.drs = action.payload;
    },
  },
});
const { reducer: drsReducer } = drsSlice;
export default drsReducer;
