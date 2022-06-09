import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { IFilterUserWallet } from 'src/features/User/components/UserDetail/Constant';
import { qsStringify } from 'src/helpers/query-string';
import { setSnackbarError } from 'src/components/Snackbar';

export const updateUserActivation = createAsyncThunk(
  'user/updateUserActivation',
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

export const updateUserType = createAsyncThunk(
  'user/updateUserType',
  async ({ usersId, user_type }: { usersId: number[]; user_type: number }, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.put('/admin/users/change-status-user-type', {
        usersId: usersId,
        user_type: user_type,
      });
      return result;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      return rejectWithValue(err.response.data);
    }
  },
);

export const updateUserWalletStatus = createAsyncThunk(
  'user/updateUserWalletStatus',
  async ({ ids, status }: { ids: number[]; status: number }, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.put('/admin/user-wallet/change-status', {
        ids: ids,
        status: status,
      });
      return result;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      return rejectWithValue(err.response.data);
    }
  },
);

export const getUserDetail = createAsyncThunk('user/getUserDetail', async (id: number, { rejectWithValue }) => {
  try {
    const result = await axiosInstance.get(`/admin/users/${id}`);
    return result;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const getUserCurrencies = createAsyncThunk('user/getUserCurrencies', async (userId: number) => {
  const result = await axiosInstance.get(`/admin/functional-currencies?userId=${userId}`);

  return result;
});

export const getUserConnectedWallets = createAsyncThunk(
  'user/getUserConnectedWallets',
  async (body: IFilterUserWallet) => {
    const result = await axiosInstance.get(
      `/admin/user-wallet${qsStringify({
        ...body,
      })}`,
    );

    return result;
  },
);
