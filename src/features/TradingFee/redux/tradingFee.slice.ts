import { createSlice } from '@reduxjs/toolkit';
import { ITradingFee } from 'src/features/TradingFee/interfaces';
import { getTradingFee, updateTradingFee } from './apis';

const tradingFeeSlice = createSlice({
  name: 'tradingFee',
  initialState: {
    current: {} as ITradingFee,
    list: [] as ITradingFee[],
    loading: false,
    error: '',
  },
  reducers: {
    updateTradingFee: (state, action) => {
      const { name, info, value } = action.payload;
      return {
        ...state,
        list: state.list.map((element) => {
          return element.name === name ? { ...element, [info]: value } : element;
        }),
      };
    },
  },
  extraReducers: {
    [`${getTradingFee.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getTradingFee.rejected}`]: (state) => {
      state.loading = false;
    },
    [`${getTradingFee.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },

    [`${updateTradingFee.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateTradingFee.rejected}`]: (state) => {
      state.loading = false;
    },
    [`${updateTradingFee.fulfilled}`]: (state) => {
      state.loading = false;
    },
  },
});

// export const { updateTradingFee } = tradingFeeSlice.actions;

const { reducer: tradingFeeReducer } = tradingFeeSlice;

export default tradingFeeReducer;
