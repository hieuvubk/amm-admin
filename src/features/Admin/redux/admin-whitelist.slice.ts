import { createSlice } from '@reduxjs/toolkit';
import { IUser } from 'src/features/Admin/interfaces';
import { updateAdminActivation, getAdminWhitelistAddress } from './apis';

const adminWhitelistSlice = createSlice({
  name: 'admin',
  initialState: {
    current: {
      data: {} as IUser,
      metadata: {},
    },
    list: {
      data: [],
      metadata: {
        totalItem: 0,
        totalPage: 0,
      },
    },
    loading: false,
    error: '',
  },
  reducers: {
    clearCurrentAdmin: (state) => {
      state.current = { data: {} as IUser, metadata: {} };
    },
  },
  extraReducers: {
    [`${updateAdminActivation.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateAdminActivation.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
    },
    [`${updateAdminActivation.fulfilled}`]: (state) => {
      state.loading = false;
    },

    [`${getAdminWhitelistAddress.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getAdminWhitelistAddress.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getAdminWhitelistAddress.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
  },
});

const { reducer: adminWhitelistReducer } = adminWhitelistSlice;

export default adminWhitelistReducer;
