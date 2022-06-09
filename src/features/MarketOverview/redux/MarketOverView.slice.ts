/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import {
  downloadCollectedFee,
  getCollectedFee,
  getLiquidityPoolApi,
  getOrderBooksApi,
} from 'src/features/MarketOverview/api/index';
import { DownloadCollectedFee, ICollectedFeeRes } from 'src/features/MarketOverview/constants/index';
const initialState = {
  orderbooks: {
    data: [],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  liquidity_pools: {
    data: [],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  chart: { data: [] as ICollectedFeeRes[] },
  downloadCollectedFee: {
    data: { collectedFees: [] as DownloadCollectedFee[], colums: [] as string[] },
  },
  loading: false,
  error: '',
};
const marketOverViewSlice = createSlice({
  name: 'users/getOrderBooks',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    // get all orderbooks
    [`${getOrderBooksApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getOrderBooksApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getOrderBooksApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.orderbooks = action.payload;
    },
    // get all liquidity pool
    [`${getLiquidityPoolApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getLiquidityPoolApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getLiquidityPoolApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.orderbooks = action.payload;
    },

    // get collected fee
    [`${getCollectedFee.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getCollectedFee.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getCollectedFee.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.chart = action.payload;
    },

    // download collected fee
    [`${downloadCollectedFee.pending}`]: (state) => {
      state.loading = true;
    },
    [`${downloadCollectedFee.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${downloadCollectedFee.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.downloadCollectedFee = action.payload;
    },
  },
});
const { reducer: marketOverViewReducer } = marketOverViewSlice;
export default marketOverViewReducer;
