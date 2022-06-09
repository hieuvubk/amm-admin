import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { IFilter } from 'src/components/Navigation/interfaces';
import { setSnackbarError } from 'src/components/Snackbar';
import store from 'src/store/store';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';

export const getListNotificationsPopup = createAsyncThunk('get-list-notification-popup', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get(`/notification`, { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const initListNotificationsPopup = createAsyncThunk('init-list-notification-popup', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get(`/notification`, { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const readNotification = createAsyncThunk('read-notification', async (body: { ids: number[] }) => {
  try {
    const res = await axiosInstance.put('/notification/read', body);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const readAllNotifications = createAsyncThunk('read-all-notification', async () => {
  try {
    const res = await axiosInstance.put('/notification/read');
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const countNotificationNotRead = createAsyncThunk('count-notification-not-read', async () => {
  try {
    const res = await axiosInstance.get(`/notification/count-not-read`);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const updateFunCurrencies = createAsyncThunk(
  'update-list-fun-currencies',
  async (body: { functional_currencies: number[] }) => {
    try {
      const res: { code: number; data: string; metadata: { timestamp: string } } = await axiosInstance.post(
        `/admin/update-list-fun-currencies`,
        body,
      );
      if (res?.code === 0) {
        store.dispatch(
          openSnackbar({
            message: 'Functional currency has been updated successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }
      return res;
    } catch (err) {
      throw err;
    }
  },
);
