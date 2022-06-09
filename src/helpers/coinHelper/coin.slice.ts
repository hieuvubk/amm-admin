/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';

export interface Coin {
  id: number;
  name: string;
  symbol: string;
  stellar_issuer: string;
  bsc_address: string;
  decimal: number;
  type: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const initialState = {
  coins: { data: [] as Coin[] },
};

export const getCoinsApi = createAsyncThunk('order/getCoins', async () => {
  return await axiosInstance.get(`/coins/list`);
});

const coinListSlice = createSlice({
  name: 'getCoinList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getCoinsApi.fulfilled.toString()]: (state, action) => {
      state.coins = action.payload;
    },
  },
});

const { actions, reducer: allCoinReducer } = coinListSlice;
export default allCoinReducer;
