import { qsStringify } from 'src/helpers/query-string';
import { IFilter as WalletFilter } from 'src/features/wallet/Constant';
import { ChangeStatusAdmin, IFilter } from 'src/features/UserList/Constant';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { IAdmin } from 'src/features/Admin/interfaces';
import axiosInstance from 'src/services/config';
import { IFilterHistoryLog } from 'src/features/history-log/interfaces/index';
import { setSnackbarError } from 'src/components/Snackbar';

export const updateAdminActivation = createAsyncThunk(
  'admin/updateAdminActivation',
  async (
    { usersId, is_locked, adminEmail }: { usersId: number[]; is_locked: number; adminEmail: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await axiosInstance.put('/admin/users/change-status-is-locked', {
        usersId: usersId,
        is_locked: is_locked,
        adminEmail: adminEmail,
      });
      return result;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      return rejectWithValue(err.response.data);
    }
  },
);

export const getAdmins = createAsyncThunk('admin/getAdmins', async (body?: IFilter) => {
  const res = await axiosInstance.get(
    `/admin/users${qsStringify({
      ...body,
      user_role: 1,
    })}`,
  );
  return res;
});

export const disableAdmin = createAsyncThunk('admin/disableAdmin', async (body: ChangeStatusAdmin) => {
  const result = await axiosInstance.get(`/admin/disable-admin/${qsStringify(body)}`);
  return result;
});

export const enableAdmin = createAsyncThunk('admin/enableAdmin', async (body: ChangeStatusAdmin) => {
  const result = await axiosInstance.get(`/admin/enable-admin/${qsStringify(body)}`);
  return result;
});

export const getAdminDetail = createAsyncThunk('admin/getAdminDetail', async (id: number) => {
  const result = await axiosInstance.get(`/admin/users/${id}`);

  return result;
});

export const createAdmin = createAsyncThunk('admin/createAdmin', async (body: IAdmin, { rejectWithValue }) => {
  try {
    const result = await axiosInstance.post('/admin/users/create-admin', body);
    return result;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    return rejectWithValue(err.response.data);
  }
});

export const getAdminWhitelistAddress = createAsyncThunk('admin/getAdminWhitelist', async (body?: WalletFilter) => {
  const result = await axiosInstance.get('/admin/whitelist-address', {
    params: body,
  });

  return result;
});

export const checkExistWalletAddress = createAsyncThunk('admin/checkExistWallet', async (address: string) => {
  const res = await axiosInstance.get(`admin/check-wallet-address/${address}`);
  return res;
});

export const getHistoryLog = createAsyncThunk('admin/history-log/get-all', async (body: IFilterHistoryLog) => {
  const res = await axiosInstance.get(`/admin/history-log${qsStringify(body)}`);
  return res;
});
