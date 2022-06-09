import { createAsyncThunk } from '@reduxjs/toolkit';
import { ICollectedFee, IDownloadCollectedFee } from 'src/features/MarketOverview/constants';
import { IFilter } from 'src/features/UsersRegistration/constants/index';
import axiosInstance from 'src/services/config';
const ACTION = {
  GET_ORDERBOOKS: 'users/getOrderBook',
  GET_LIQUDITYPOOL: 'users/getLiquidityPool',
  GET_COLLECTED_FEE: 'users/getCollectedFee',
  DOWNLOAD_COLLECTED_FEE: 'users/downloadCollectedFee',
};

// get order book
export const getOrderBooksApi = createAsyncThunk(ACTION.GET_ORDERBOOKS, async (body?: IFilter) => {
  const res = await axiosInstance.get('/admin/getorderbook', {
    params: body,
  });
  return res;
});
// get liquidity
export const getLiquidityPoolApi = createAsyncThunk(ACTION.GET_LIQUDITYPOOL, async (body?: IFilter) => {
  const res = await axiosInstance.get('/admin/getliquidity', {
    params: body,
  });
  return res;
});

export const getCollectedFee = createAsyncThunk(ACTION.GET_COLLECTED_FEE, async (body?: ICollectedFee) => {
  const res = await axiosInstance.get('/admin/collected-fee', {
    params: body,
  });

  return res;
});

export const downloadCollectedFee = createAsyncThunk(
  ACTION.DOWNLOAD_COLLECTED_FEE,
  async (body?: IDownloadCollectedFee) => {
    const res = await axiosInstance.get('/admin/download-collected-fee', { params: body });
    return res;
  },
);
