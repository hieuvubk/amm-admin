import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserRole } from 'src/features/UserList/Constant';
import { IFilter, User } from 'src/features/UsersRegistration/constants/index';
import { qsStringify } from 'src/helpers/query-string';
import axiosInstance from 'src/services/config';
const ACTION = {
  GET_USERS: 'users/getUserTration',
  GET_DETAIL_USERS: 'users/getDetail',
  UPDATE_STATUS: 'users/updateStatus',
  GET_CURRENCY: 'users/getCurrency',
  GET_WALLET: 'users/getWallet',
  UPDATE_TYPE: 'users/updateType',
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getListCurrency = async (id: number): Promise<Array<any>> => {
  const res = await axiosInstance
    .get(`/admin/functional-currencies?userId=${id}`)
    .catch((error) => error)
    .then((res) => res && res);
  return res;
};
// get all
export const getUsersRegistrationApi = createAsyncThunk(ACTION.GET_USERS, async (body?: IFilter) => {
  const res = await axiosInstance.get(
    `/admin/users${qsStringify({
      ...body,
      user_role: UserRole.USER,
    })}`,
  );
  return res;
});
// get detail
export const getUserTrationDetailApi = createAsyncThunk(ACTION.GET_DETAIL_USERS, async (id?: number) => {
  const res = await axiosInstance.get(`/admin/users/${id}`);
  return res;
});
// get currency
export const getUserCurrencyApi = createAsyncThunk(ACTION.GET_CURRENCY, async (id?: number) => {
  const res = await axiosInstance.get(`/admin/functional-currencies?userId=${id}`);
  return res;
});
// get wallet
export const getUserWalletApi = createAsyncThunk(ACTION.GET_WALLET, async (id?: number) => {
  const res = await axiosInstance.get(`/admin/user-wallet?page=1&limit=20&user_id=${id}`);

  return res;
});
// update status
export const updateUserStatusApi = createAsyncThunk(ACTION.UPDATE_STATUS, async (body?: User) => {
  const res = await axiosInstance.put(`/admin/users/change-status-user-registration`, body);
  return res.data;
});
// update type
export const updateUserTypeApi = createAsyncThunk(ACTION.UPDATE_TYPE, async (body?: User) => {
  const res = await axiosInstance.put(`/admin/users/change-status-user-type`, body);
  return res;
});
