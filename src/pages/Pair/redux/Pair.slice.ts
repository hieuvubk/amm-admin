/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getPairsApi } from 'src/pages/Pair/api';
import { Pair } from 'src/pages/Pair/interfaces/pairs';
import axiosInstance from 'src/services/config';

interface InitialState {
  pair: any;
  selectedPair?: Pair;
  pairs?: Array<Pair>;
}

export const getAllPairs = createAsyncThunk('pair/list', async () => {
  const response = await axiosInstance.get('/pair/list').catch((error) => error);
  const pairsData = response.data;
  return {
    pairsData,
  };
});

const initialState: InitialState = {
  pair: { data: [], metadata: { totalItem: 0, totalPage: 0 } },
  pairs: undefined,
  selectedPair: undefined,
};

const pairsListSlice = createSlice({
  name: 'getPairsList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getPairsApi.pending.toString()]: () => {},
    [getPairsApi.rejected.toString()]: () => {},
    [getPairsApi.fulfilled.toString()]: (state, action) => {
      state.pair = action.payload;
    },
    [getAllPairs.pending.toString()]: () => {},
    [getAllPairs.rejected.toString()]: () => {},
    [getAllPairs.fulfilled.toString()]: (state, action) => {
      state.pairs = action.payload.pairsData;
      if (action.payload.pairsData) {
        state.selectedPair = action.payload.pairsData[0];
      }
    },
  },
});

const { reducer: pairsReducer } = pairsListSlice;
export default pairsReducer;
