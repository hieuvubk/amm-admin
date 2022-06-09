import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import { IUserInfo } from 'src/constants/user';
import axiosInstance from 'src/services/config';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';
import { LogInBody } from 'src/interfaces/auth';
import { setTokenCookie } from 'src/helpers/storage';

const setSnackbarSuccess = (message: string) => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.SUCCESS,
    }),
  );
};

const setSnackbarError = (message: string) => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.ERROR,
    }),
  );
};

export const getMe = createAsyncThunk('get-profile', async () => {
  return axiosInstance.get(`/users/me`);
});

export const postLogin = createAsyncThunk('admin/postLogin', async (body: LogInBody, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/auth/admin/login', body);

    return res;
  } catch (err) {
    if (err.response.data?.status_code === 403) {
      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_NOT_ACTIVE)
        setSnackbarError(`Your account is pending for approval by the Velo Lab’s Admin team. 
    An email will be sent to notify you once the approval process is complete.`);

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ACCOUNT_LOCKED)
        setSnackbarError('Your account have been locked!');

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_EMAIL)
        setSnackbarError('Wrong email or password!');

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_PASS)
        setSnackbarError(err.response.data?.message);
    }

    return rejectWithValue(err.response.data);
  }
});

export const forgotPassword = createAsyncThunk(
  'user/forgot-password',
  async (body: { email: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('users/forgot-password', body);
      setSnackbarSuccess('Reset password verification code has been sent to your email.');

      return res;
    } catch (err) {
      if (err.response.data?.status_code === 403) {
        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_EMAIL_NOT_VERIFIED)
          setSnackbarError('Please verify your account!');

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_NOT_ACTIVE) {
          setSnackbarError(`Your account is pending for approval by the Velo Lab’s Admin team. 
          An email will be sent to notify you once the approval process is complete.`);
        }

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ACCOUNT_LOCKED) {
          setSnackbarError(`Email does not exist!`);
        }
      }

      if (err.response.data?.status_code === 400) setSnackbarError(`Email does not exist!`);

      return rejectWithValue(err.response.data);
    }
  },
);

export const checkPassToken = createAsyncThunk(
  'user/check-password-token',
  async (body: { email: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('users/check-pass-token', body);
      setSnackbarSuccess('Your verification code is correct! Please reset your password.');

      return res;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
);

export const changePassword = createAsyncThunk(
  'user/reset-password',
  async (body: { email: string; token: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put('users/reset-password', body);
      setSnackbarSuccess('Password has been reset successfully.');

      return res;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: <IUserInfo>{},
    error: '',
    loading: false,
    access_token: '',
    tokenResetPassword: '',
  },
  reducers: {
    authLogout: (state, action) => {
      state.currentUser = action.payload;
    },
    setSelectedFunctionalCurrencyId: (state, action: PayloadAction<number>) => {
      state.currentUser.selectedFunctionalCurrencyId = action.payload;
    },
  },
  extraReducers: {
    // post login
    [`${postLogin.pending}`]: (state) => {
      state.loading = true;
    },
    [`${postLogin.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${postLogin.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.access_token = action.payload?.data.access_token;
      state.currentUser = {
        ...action.payload.data,
        selectedFunctionalCurrencyId: action.payload.data.listUserFunCurrencies[0].functional_currencies_id,
      };
      setTokenCookie(action.payload.data.access_token, action.payload.data.refresh_token);
    },

    [`${getMe.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getMe.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getMe.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.access_token = action.payload?.data.access_token;

      const currentSelectedFunctionalCurrencyId = state.currentUser.selectedFunctionalCurrencyId;
      state.currentUser = {
        ...action.payload.data,
        selectedFunctionalCurrencyId: currentSelectedFunctionalCurrencyId
          ? currentSelectedFunctionalCurrencyId
          : action.payload.data.listUserFunCurrencies[0].functional_currencies_id,
      };
      setTokenCookie(action.payload.data.access_token, action.payload.data.refresh_token);
    },
  },
});

export const { authLogout, setSelectedFunctionalCurrencyId } = authSlice.actions;

const { reducer: authReducer } = authSlice;

export default authReducer;
