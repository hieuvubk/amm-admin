import { createSlice } from '@reduxjs/toolkit';
import { IFunctionalCurrency, IUser, IUserWallet } from 'src/features/User/interfaces';
import {
  getUserDetail,
  updateUserActivation,
  getUserCurrencies,
  getUserConnectedWallets,
  updateUserType,
  updateUserWalletStatus,
} from './apis';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    current: {
      data: {} as IUser,
      metadata: {},
    },
    currencies: {
      data: [] as IFunctionalCurrency[],
      metadata: {},
    },
    wallets: {
      data: [] as IUserWallet[],
      metadata: { totalPage: 0 },
    },
    loading: false,
    error: '',
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.current = { data: {} as IUser, metadata: {} };
      state.currencies = { data: [] as IFunctionalCurrency[], metadata: {} };
      state.wallets = { data: [] as IUserWallet[], metadata: { totalPage: 0 } };
    },
  },
  extraReducers: {
    [`${updateUserActivation.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserActivation.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [`${updateUserActivation.fulfilled}`]: (state) => {
      state.loading = false;
    },

    [`${updateUserType.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserType.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [`${updateUserType.fulfilled}`]: (state) => {
      state.loading = false;
    },

    [`${updateUserWalletStatus.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserWalletStatus.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [`${updateUserWalletStatus.fulfilled}`]: (state) => {
      state.loading = false;
    },

    [`${getUserDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.current = action.payload;
    },

    [`${getUserCurrencies.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserCurrencies.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserCurrencies.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.currencies = action.payload;
    },

    [`${getUserConnectedWallets.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserConnectedWallets.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserConnectedWallets.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.wallets = action.payload;
    },
  },
});

export const { clearCurrentUser } = userSlice.actions;

const { reducer: userReducer } = userSlice;

export default userReducer;
