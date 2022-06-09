import { createSlice } from '@reduxjs/toolkit';
import { IUser } from 'src/features/Admin/interfaces';
import { getAdminDetail, getAdmins, updateAdminActivation } from './apis';

const adminSlice = createSlice({
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

    [`${getAdmins.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getAdmins.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getAdmins.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },

    [`${getAdminDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getAdminDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getAdminDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.current = action.payload;
    },
  },
});

export const { clearCurrentAdmin } = adminSlice.actions;

const { reducer: adminReducer } = adminSlice;

export default adminReducer;
