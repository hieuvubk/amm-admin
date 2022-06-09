/* eslint-disable max-len */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  IDigitalCredit,
  IFilter,
  //IFilterSearch,
} from 'src/features/DigitalCreditSettings/interfaces/index';
import axiosInstance from 'src/services/config';

interface IResponse {
  data: IDigitalCredit;
  metadata: {
    totalItem: number;
    totalPage: number;
  };
}

export const getDigitalCredit = createAsyncThunk('digitalCredit/getDigitalCredit', async (body?: IFilter) => {
  const result: IResponse = await axiosInstance.get('/admin/get-digital-credit-settings', {
    params: body,
  });

  const list = {
    data: result.data,
    metadata: {
      totalItem: result.metadata.totalItem,
      totalPage: result.metadata.totalPage,
    },
  };

  return list;
});

// export const getAllDigitalCreditName = createAsyncThunk(
//   'digitalCredit/getDigitalCredit',
//   async (body?: IFilterSearch) => {
//     const result = await axiosInstance.get(
//       `${process.env.REACT_APP_BASE_URL_LOCAL}#########}`,
//       {
//         params: body,
//       },
//     );

//     return result;
//   },
// );
