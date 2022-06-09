import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { TFilter } from './Constant';

const initialState = {
  order: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
};

const ACTION = {
  GET_OPENORDERS: 'order/list',
};

export const getOrdersApi = createAsyncThunk(ACTION.GET_OPENORDERS, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/order/list`, {
    params: body,
  });
});

const ordersListSlice = createSlice({
  name: 'getOrdersList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getOrdersApi.pending.toString()]: () => {},
    [getOrdersApi.rejected.toString()]: () => {},
    [getOrdersApi.fulfilled.toString()]: (state, action) => {
      state.order = action.payload;
    },
  },
});

const { reducer: orderReducer } = ordersListSlice;
export default orderReducer;
