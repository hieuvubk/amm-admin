import { createSlice } from '@reduxjs/toolkit';
import { getFirstDayOfMonth, getLastDayOfMonth } from 'src/helpers/date';
import { getHistoryLog } from 'src/features/Admin/redux/apis';
import { SORT } from 'src/helpers/const';

const initialState = {
  history: { data: [], metadata: { totalItem: 0, totalPage: 0 } },
};
export const DEFAULT_FILTER = {
  page: 1,
  size: 50,
  from: new Date(getFirstDayOfMonth(new Date())).toISOString(),
  to: new Date(getLastDayOfMonth(new Date())).toISOString(),
  create_at: SORT.DECREASE,
};

const historyLogSlice = createSlice({
  name: 'historyLog',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getHistoryLog.pending.toString()]: () => {},
    [getHistoryLog.rejected.toString()]: () => {},
    [getHistoryLog.fulfilled.toString()]: (state, action) => {
      state.history = action.payload;
    },
  },
});

const { reducer: historyLogReducer } = historyLogSlice;
export default historyLogReducer;
