/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPoolRequestDetail, getPoolRequestsList, updatePoolRequestDetail } from 'src/features/PoolRequest/api/index';
import { IFilter, PoolRequest } from 'src/features/PoolRequest/constants/index';
import { DEFAULT_PAGE } from 'src/helpers/const';

const initialState = {
  list: {
    data: [] as PoolRequest[],
    metadata: { totalItem: 0, totalPage: 0 },
  },
  current: {
    data: {} as PoolRequest,
  },
  conditionFilter: { ...DEFAULT_PAGE } as IFilter,
  loading: false,
  error: '',
};

const getPoolRequestSlice = createSlice({
  name: 'pool/getPoolRequest',
  initialState: initialState,
  reducers: {
    saveConditionFilter: (state, action: PayloadAction<IFilter>) => {
      state.conditionFilter = action.payload;
    },

    clearPoolRequestList: (state) => {
      state.list = initialState.list;
    },

    clearPoolRequestDetail: (state) => {
      state.current = initialState.current;
    },
  },
  extraReducers: {
    // getlist
    [`${getPoolRequestsList.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getPoolRequestsList.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getPoolRequestsList.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    // get detail
    [`${getPoolRequestDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getPoolRequestDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getPoolRequestDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.current = action.payload;
    },

    [`${updatePoolRequestDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updatePoolRequestDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${updatePoolRequestDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { saveConditionFilter, clearPoolRequestList, clearPoolRequestDetail } = getPoolRequestSlice.actions;
const { reducer: poolRequestReducer } = getPoolRequestSlice;
export default poolRequestReducer;
