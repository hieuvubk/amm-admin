/* eslint-disable max-len */
import { IDigitalCredit } from 'src/features/DigitalCreditSettings/interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { getDigitalCredit } from 'src/features/DigitalCreditSettings/redux/apis';

const initialState = {
  current: {
    data: {} as IDigitalCredit,
    metadata: {},
  },
  dataCreditNameList: [],
  list: {
    data: [],
    metadata: {
      totalItem: 0,
      totalPage: 0,
    },
  },
  loading: false,
  error: '',
};

const digitalCreditSlice = createSlice({
  name: 'digitalCredit',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [`${getDigitalCredit.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getDigitalCredit.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getDigitalCredit.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    }, //,
    // [`${getAllDigitalCreditName.pending}`]: (state) => {
    //   state.loading = true;
    // },
    // [`${getAllDigitalCreditName.rejected}`]: (state, action) => {
    //   state.loading = false;
    //   state.error = action.error;
    // },
    // [`${getAllDigitalCreditName.fulfilled}`]: (state, action) => {
    //   state.loading = false;
    //   state.dataCreditNameList = action.payload;
    // },
  },
});

const { reducer: digitalCreditReducer } = digitalCreditSlice;

export default digitalCreditReducer;
