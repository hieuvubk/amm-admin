import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DefaultFilter, IFilter } from 'src/features/Pools/interfaces';
import {
  Add,
  ChartDataAdd,
  ChartDataPoolVirtualSwap,
  ChartDataRemove,
  ChartDataSwap,
  Pool,
  PoolVirtualSwap,
  Swap,
  TokenPrice,
  Withdraw,
} from 'src/interfaces/pool';
import {
  getAdds,
  getPoolDetail,
  getPoolsList,
  getSwaps,
  getChartData,
  getTokensList,
  getWithdraws,
  getPoolVirtualSwaps,
} from './apis';

const initialState = {
  current: {
    data: {} as Pool,
    chart: {
      swaps: {} as ChartDataSwap,
      adds: {} as ChartDataAdd,
      withdraws: {} as ChartDataRemove,
      virtualSwaps: {} as ChartDataPoolVirtualSwap,
    },
    transactions: {
      data: [] as Swap[] | Add[] | Withdraw[] | PoolVirtualSwap[],
      totalItems: 0,
    },
    loadingData: false,
    loadingChart: false,
    loadingTransactions: false,
  },
  list: {
    data: [] as Pool[],
    conditionFilter: DefaultFilter,
    loading: false,
  },
  tokens: {
    data: [] as TokenPrice[],
    loading: false,
  },
  error: '',
};

const poolSlice = createSlice({
  name: 'pool',
  initialState: initialState,
  reducers: {
    clearPoolsList: (state) => {
      state.list = initialState.list;
    },

    clearPoolsDetail: (state) => {
      state.current = initialState.current;
    },

    setConditionFilter: (state, action: PayloadAction<IFilter>) => {
      state.list.conditionFilter = action.payload;
    },
  },
  extraReducers: {
    [`${getPoolsList.pending}`]: (state) => {
      state.list.loading = true;
    },
    [`${getPoolsList.rejected}`]: (state, action) => {
      state.list.loading = false;
      state.error = action.error;
    },
    [`${getPoolsList.fulfilled}`]: (state, action) => {
      state.list.data = action.payload;
      state.list.loading = false;
    },

    [`${getTokensList.pending}`]: (state) => {
      state.tokens.loading = true;
    },
    [`${getTokensList.rejected}`]: (state, action) => {
      state.tokens.loading = false;
      state.error = action.error;
    },
    [`${getTokensList.fulfilled}`]: (state, action: PayloadAction<TokenPrice[]>) => {
      state.tokens.loading = false;
      state.tokens.data = action.payload;
    },

    [`${getPoolDetail.pending}`]: (state) => {
      state.current.loadingData = true;
    },
    [`${getPoolDetail.rejected}`]: (state, action) => {
      state.current.loadingData = false;
      state.error = action.error;
    },
    [`${getPoolDetail.fulfilled}`]: (state, action) => {
      state.current.loadingData = false;
      state.current.data = action.payload;
    },

    [`${getSwaps.pending}`]: (state) => {
      state.current.loadingTransactions = true;
      state.current.transactions.data = [];
    },
    [`${getSwaps.rejected}`]: (state, action) => {
      state.current.loadingTransactions = false;
      state.error = action.error;
    },
    [`${getSwaps.fulfilled}`]: (state, action) => {
      state.current.loadingTransactions = false;
      [state.current.transactions.data, state.current.transactions.totalItems] = action.payload;
    },

    [`${getAdds.pending}`]: (state) => {
      state.current.loadingTransactions = true;
      state.current.transactions.data = [];
    },
    [`${getAdds.rejected}`]: (state, action) => {
      state.current.loadingTransactions = false;
      state.error = action.error;
    },
    [`${getAdds.fulfilled}`]: (state, action) => {
      state.current.loadingTransactions = false;
      [state.current.transactions.data, state.current.transactions.totalItems] = action.payload;
    },

    [`${getWithdraws.pending}`]: (state) => {
      state.current.loadingTransactions = true;
      state.current.transactions.data = [];
    },
    [`${getWithdraws.rejected}`]: (state, action) => {
      state.current.loadingTransactions = false;
      state.error = action.error;
    },
    [`${getWithdraws.fulfilled}`]: (state, action) => {
      state.current.loadingTransactions = false;
      [state.current.transactions.data, state.current.transactions.totalItems] = action.payload;
    },

    [`${getPoolVirtualSwaps.pending}`]: (state) => {
      state.current.loadingTransactions = true;
      state.current.transactions.data = [];
    },
    [`${getPoolVirtualSwaps.rejected}`]: (state, action) => {
      state.current.loadingTransactions = false;
      state.error = action.error;
    },
    [`${getPoolVirtualSwaps.fulfilled}`]: (state, action) => {
      state.current.loadingTransactions = false;
      [state.current.transactions.data, state.current.transactions.totalItems] = action.payload;
    },

    [`${getChartData.pending}`]: (state) => {
      state.current.loadingChart = true;
    },
    [`${getChartData.rejected}`]: (state, action) => {
      state.current.loadingChart = false;
      state.error = action.error;
    },
    [`${getChartData.fulfilled}`]: (state, action) => {
      state.current.loadingChart = false;
      state.current.chart = action.payload;
    },
  },
});

export const { clearPoolsList, setConditionFilter, clearPoolsDetail } = poolSlice.actions;

const { reducer: poolReducer } = poolSlice;

export default poolReducer;
