import { createAsyncThunk } from '@reduxjs/toolkit';
import { setSnackbarError } from 'src/components/Snackbar';
import { IFilter } from 'src/features/PoolRequest/constants/index';
import axiosInstance from 'src/services/config';

const ACTION = {
  GET_POOLREQUEST: 'pool/getPoolRequest',
  GET_POOLREQUEST_DETAIL: 'pool/getPoolRequestDetail',
  UPDATE_POOLREQUEST_DETAIL: 'pool/updatePoolRequestDetail',
};

// get pool request
export const getPoolRequestsList = createAsyncThunk(ACTION.GET_POOLREQUEST, async (body?: IFilter) => {
  try {
    const res = await axiosInstance.get('/admin/pool-requests', {
      params: body,
    });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

// get detail
export const getPoolRequestDetail = createAsyncThunk(ACTION.GET_POOLREQUEST_DETAIL, async (id: number) => {
  try {
    const res = await axiosInstance.get(`/admin/pool-requests/${id}`);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const updatePoolRequestDetail = createAsyncThunk(
  ACTION.UPDATE_POOLREQUEST_DETAIL,
  async ({
    id,
    status,
    message,
    poolAddress,
    isChange,
  }: {
    id: number;
    status: number;
    message?: string;
    poolAddress?: string;
    isChange?: boolean;
  }) => {
    try {
      const res = await axiosInstance.patch(`/admin/pool-requests/${id}`, {
        status: status,
        message: message,
        poolAddress: poolAddress,
        isChange: isChange,
      });

      return res;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      throw err;
    }
  },
);
