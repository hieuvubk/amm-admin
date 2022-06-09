/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { TFilter } from 'src/features/User/components/Transactions/Constant';

const initialState = {
  openOrders: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  orderHistory: { data: [], metadata: { totalSize: 0, dataSize: 0, totalPage: 1 } },
  pairs: { data: [] },
  wallets: { data: [] },
  tradesOB: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  tradesLiq: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  lastData: [],
  downloadTradesOB: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  downloadTradesLiq: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  coins: { data: [] },
  loading: false,
  messageError: null,
  transactions: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  downloadTransactions: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
};

const ACTION = {
  GET_OPEN_ORDERS: 'order/getOpenOrders',
  GET_ORDER_HISTORY: 'order/getOrderHistory',
  GET_WALLETS: 'order/getWallets',
  CANCEL_ORDER: 'order/cancelOrder',
  GET_TRADES: 'trade/getTrades',
  GET_COINS: 'coin/getCoins',
  GET_TRADES_OB: 'trade/getTradesOB',
  GET_TRADES_LIQ: 'trade/getTradesLIQ',
  GET_TRANSACTION_LIQ: 'getTransactionLiq',
  DOWNLOAD_TRADES_OB: 'trade/getDownloadTradesOB',
  DOWNLOAD_TRADES_LIQ: 'trade/getDownloadTradesLIQ',
  DOWNLOAD_TRANSACTION_LIQ: 'trade/getDownloadTransactionLiq',
  INIT_TRADES_LIQ: 'trade/initTradesLIQ',
  INIT_TRANSACTIONS_LIQ: 'trade/initTransactionsLiq',
};

export const getTransactionsApi = createAsyncThunk(ACTION.GET_TRANSACTION_LIQ, async (body: TFilter) => {
  return axiosInstance.post('/admin/getTransactionLiq', body);
});

export const initTransactionsApi = createAsyncThunk(ACTION.INIT_TRANSACTIONS_LIQ, async (body: TFilter) => {
  return axiosInstance.post('/admin/getTransactionLiq', body);
});

// Download transaction
export const getDownloadTransactionsApi = createAsyncThunk(ACTION.DOWNLOAD_TRANSACTION_LIQ, async (body: TFilter) => {
  return axiosInstance.post('/admin/getTransactionLiq', body);
});

export const getDownloadTradesOBApi = createAsyncThunk(ACTION.DOWNLOAD_TRADES_OB, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/trades/list`, {
    params: body,
  });
});

export const getDowloadTradesLiqApi = createAsyncThunk(ACTION.DOWNLOAD_TRADES_LIQ, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/trades/list`, {
    params: body,
  });
});

export const getOpenOrdersApi = createAsyncThunk(ACTION.GET_OPEN_ORDERS, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/orders/list`, {
    params: body,
  });
});

export const getOrderHistoryApi = createAsyncThunk(ACTION.GET_ORDER_HISTORY, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/orders/list`, {
    params: body,
  });
});

export const getPairsApi = createAsyncThunk('order/getPairs', async () => {
  return await axiosInstance.get(`/pair/list`);
});

export const getCoinsApi = createAsyncThunk('order/getCoins', async () => {
  return await axiosInstance.get(`/coins/list`);
});

export const getTradesOBApi = createAsyncThunk(ACTION.GET_TRADES_OB, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/trades/list`, {
    params: body,
  });
});

export const getTradesLiqApi = createAsyncThunk(ACTION.GET_TRADES_LIQ, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/trades/list`, {
    params: body,
  });
});

export const initTradesLiqApi = createAsyncThunk(ACTION.INIT_TRADES_LIQ, async (body?: TFilter) => {
  return await axiosInstance.get(`/admin/trades/list`, {
    params: body,
  });
});

export const cancelOrderApi = createAsyncThunk(ACTION.CANCEL_ORDER, async (orderId: number) => {
  return await axiosInstance.put(`/order/${orderId}/cancel`);
});

const orderListSlice = createSlice({
  name: 'getOrderList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getOpenOrdersApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getOpenOrdersApi.rejected.toString()]: (state) => {
      state.loading = false;
    },
    [getOpenOrdersApi.fulfilled.toString()]: (state, action) => {
      state.loading = false;
      state.openOrders = action.payload;
    },
    [getOrderHistoryApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getOrderHistoryApi.rejected.toString()]: (state) => {
      state.loading = false;
    },
    [getOrderHistoryApi.fulfilled.toString()]: (state, action) => {
      state.loading = false;
      state.orderHistory = action.payload;
    },
    [getPairsApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getPairsApi.rejected.toString()]: (state) => {
      state.loading = true;
    },
    [getPairsApi.fulfilled.toString()]: (state, action) => {
      state.pairs = action.payload;
    },
    [cancelOrderApi.rejected.toString()]: (state, action) => {},
    [cancelOrderApi.fulfilled.toString()]: (state, action) => {
      alert('Order is canceled');
    },
    [getTradesOBApi.fulfilled.toString()]: (state, action) => {
      state.tradesOB = action.payload;
    },
    [initTradesLiqApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.tradesLiq = action.payload;
    },
    [getTradesLiqApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.tradesLiq = action.payload.data
        ? {
            ...action.payload,
            data: Array.from(new Set([...state.tradesLiq.data, ...action.payload.data])).sort(
              (a, b) => b.trade_id - a.trade_id,
            ),
          }
        : action.payload;
    },
    [initTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.transactions = action.payload;
    },
    [getTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.transactions = action.payload.data
        ? {
            ...action.payload,
            data: [...state.transactions.data, ...action.payload.data],
          }
        : action.payload;
    },
    [getCoinsApi.fulfilled.toString()]: (state, action) => {
      state.coins = action.payload;
    },
    [getDownloadTradesOBApi.fulfilled.toString()]: (state, action) => {
      state.downloadTradesOB = action.payload;
    },
    [getDowloadTradesLiqApi.fulfilled.toString()]: (state, action) => {
      state.downloadTradesLiq = action.payload;
    },
    [getDownloadTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.downloadTransactions = action.payload;
    },
  },
});

const { actions, reducer: transactionReducer } = orderListSlice;
export default transactionReducer;
