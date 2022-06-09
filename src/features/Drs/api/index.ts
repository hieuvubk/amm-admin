import { createAsyncThunk } from '@reduxjs/toolkit';
import { IFilter } from 'src/features/UsersRegistration/constants/index';
import axiosInstance from 'src/services/config';
import { Drs } from '../interfaces';
const ACTION = {
  GET_DRS: 'dahsboard/getDrs',
};

// get drs
export const getDrsApi = createAsyncThunk(ACTION.GET_DRS, async (body?: IFilter) => {
  const res: Array<Drs> = await axiosInstance.get('/admin/get-drs', {
    params: body,
  });
  return res;
});
