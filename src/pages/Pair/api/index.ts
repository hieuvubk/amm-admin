import axiosInstance from 'src/services/config';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IFilter } from 'src/features/wallet/Constant';

const ACTION = {
  GET_PAIRS: 'pair/filter',
};
export const getPairsApi = createAsyncThunk(ACTION.GET_PAIRS, async (body?: IFilter) => {
  return await axiosInstance.get(`/pair/filter`, {
    params: body,
  });
});
