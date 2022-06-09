import { createAsyncThunk } from '@reduxjs/toolkit';
import { UpdateInterval } from 'src/pages/Dashboard/GeneralSettings/constants';
import { IFilter } from 'src/pages/Dashboard/GeneralSettings/constants/index';
import axiosInstance from 'src/services/config';

const ACTION = {
  GET_GENERAL: 'users/getGeneral',
  UPDATE_GENERAL: 'users/updateGeneral',
};

// get general setting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getGeneralApi = createAsyncThunk(ACTION.GET_GENERAL, async (body?: IFilter) => {
  const res = await axiosInstance.get('/users/get-general', { params: body });
  return res;
});
// update general
export const updateGeneralSetting = createAsyncThunk(ACTION.UPDATE_GENERAL, async (body?: UpdateInterval) => {
  const res = await axiosInstance.put(`/admin/update-general-setting`, body);
  return res.data;
});
