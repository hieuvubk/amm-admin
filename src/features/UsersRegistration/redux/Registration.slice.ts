/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { IFilter, IUser, User } from 'src/features/UsersRegistration/constants/index';
import {
  getUserCurrencyApi,
  getUsersRegistrationApi,
  getUserTrationDetailApi,
  getUserWalletApi,
  updateUserStatusApi,
  updateUserTypeApi,
} from 'src/features/UsersRegistration/api/index';
const initialState = {
  list_user_registration: {
    data: [],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  result: { data: {} as IUser },
  user_admin: {},
  loading: false,
  currency: { data: [] },
  wallet: { data: [] },
  changetype: { data: [] },
  changestatus: { data: [] },
  error: '',
};
const registrationSlice = createSlice({
  name: 'users/getRegistration',
  initialState: initialState,
  reducers: {
    clearRegistrationDetail: (state) => {
      state.result = {
        data: {} as IUser,
      };
    },
  },
  extraReducers: {
    // get all user registration
    [`${getUsersRegistrationApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUsersRegistrationApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUsersRegistrationApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list_user_registration = action.payload;
    },
    // get detail
    [`${getUserTrationDetailApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserTrationDetailApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserTrationDetailApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.result = action.payload;
    },
    // get currency
    [`${getUserCurrencyApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserCurrencyApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserCurrencyApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.currency = action.payload;
    },
    // get wallet
    [`${getUserWalletApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserWalletApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserWalletApi.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.wallet = action.payload;
    },
    // update status
    [`${updateUserStatusApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserStatusApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${updateUserStatusApi.fulfilled}`]: (state, action) => {
      state.loading = false;
    },
    // update type
    [`${updateUserTypeApi.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserTypeApi.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${updateUserTypeApi.fulfilled}`]: (state, action) => {
      state.loading = false;
    },
  },
});
export const { clearRegistrationDetail } = registrationSlice.actions;
const { reducer: registrationReducer } = registrationSlice;
export default registrationReducer;
