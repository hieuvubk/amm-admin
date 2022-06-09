import { createAsyncThunk } from '@reduxjs/toolkit';
// import { IFilter, IAdmin } from 'src/features/Admin/interfaces';
import axiosInstance from 'src/services/config';

export const updateTradingFee = createAsyncThunk(
  'orderbook/updateTradingFee',
  async ({
    id,
    key,
    value,
    userId,
    email,
    orderBookName,
  }: {
    id: number;
    key: string;
    value: number | undefined;
    userId: number | undefined;
    email: string | undefined;
    orderBookName: string | undefined;
  }) => {
    return axiosInstance.put(`/admin/trading-fee/${id}`, {
      [key]: value,
      userId: userId,
      email: email,
      orderBookName: orderBookName,
    });
  },
);

export const getTradingFee = createAsyncThunk('orderbook/trading-fee', async () => {
  const result = await axiosInstance.get('/trading-fee');
  return result.data;
});
