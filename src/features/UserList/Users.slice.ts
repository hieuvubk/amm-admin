/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { qsStringify } from 'src/helpers/query-string';
import axiosInstance from 'src/services/config';
import { IFilter } from 'src/features/UserList/Constant';
import { UserRegistrationStatus, UserRole } from 'src/features/UserList/Constant';
const initialState = {
  users: { data: [], metadata: { totalItem: 0, totalPage: 0 } },
  user_admin: {},
};

const ACTION = {
  GET_USERS: 'users/getUses',
  CHANGE_USER_TYPE: 'user/changeType',
  CHANGE_USER_STATUS: 'user/changeStatus',
};

export const getUsersApi = createAsyncThunk(ACTION.GET_USERS, async (body?: IFilter) => {
  const res = await axiosInstance.get(
    `/admin/users${qsStringify({
      ...body,
      user_role: UserRole.USER,
      user_registration: UserRegistrationStatus.APPROVED,
    })}`,
  );
  return res;
});

export const getUserWallets = async (userId: number): Promise<string[]> => {
  const response = await axiosInstance.get('/admin/user-wallet', {
    params: {
      network: 2,
      status: 1,
      user_id: userId,
    },
  });
  const data = response.data;
  const addresses = data.map((wallet: { address: string }) => {
    return wallet.address;
  });
  return addresses;
};

export const changeUserType = createAsyncThunk(
  ACTION.CHANGE_USER_TYPE,
  async (body: { usersId: number[]; user_type: number; adminEmail: string }) => {
    const res = await axiosInstance.put(`/admin/users/change-status-user-type`, body);
    return res;
  },
);

export const changeUserStatus = createAsyncThunk(
  ACTION.CHANGE_USER_STATUS,
  async (body: { usersId: number[]; is_locked: number }) => {
    const res = await axiosInstance.put(`/admin/users/change-status-is-locked`, body);
    return res;
  },
);

const userListSlice = createSlice({
  name: 'getUserList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getUsersApi.pending.toString()]: (state) => {},
    [getUsersApi.rejected.toString()]: (state) => {},
    [getUsersApi.fulfilled.toString()]: (state, action) => {
      state.users = action.payload;
    },
  },
});

const { actions, reducer: userReducer } = userListSlice;
export default userReducer;
