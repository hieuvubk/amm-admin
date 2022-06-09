import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INotification } from 'src/components/Navigation/interfaces';
import { countNotificationNotRead, getListNotificationsPopup, initListNotificationsPopup } from './apis';

interface Metadata {
  timestamp: string;
  totalItem: number;
  totalPage: number;
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    countNotRead: -1,
    curPageNotiPopup: 1,
    listNotificationsPopup: { data: [] as INotification[], metadata: {} as Metadata },
    loading: false,
    error: '',
  },
  reducers: {
    setCurPageNotiPopup: (state, action: PayloadAction<number>) => {
      state.curPageNotiPopup = action.payload;
    },
  },
  extraReducers: {
    // init list notifications popup
    [`${initListNotificationsPopup.pending}`]: (state) => {
      state.loading = true;
    },
    [`${initListNotificationsPopup.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${initListNotificationsPopup.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotificationsPopup = action.payload;
      state.curPageNotiPopup = 1;
    },

    // list notifications popup
    [`${getListNotificationsPopup.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListNotificationsPopup.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getListNotificationsPopup.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotificationsPopup = action.payload.data
        ? {
            ...action.payload,
            data: [...state.listNotificationsPopup.data, ...action.payload.data],
          }
        : action.payload;
    },

    // count not read
    [`${countNotificationNotRead.pending}`]: (state) => {
      state.loading = true;
    },
    [`${countNotificationNotRead.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${countNotificationNotRead.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.countNotRead = action.payload.data;
    },
  },
});

export const { setCurPageNotiPopup } = notificationSlice.actions;

const { reducer: notificationReducer } = notificationSlice;

export default notificationReducer;
