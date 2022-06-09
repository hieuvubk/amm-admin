/* eslint-disable @typescript-eslint/no-explicit-any */
import { setSnackbarError, setSnackbarSuccess } from 'src/components/Snackbar';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import axiosInstance from './config';

export const forgotPassword = async (body: { email: string }): Promise<any> => {
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

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_EMAIL)
        setSnackbarError(`Email does not exist!`);

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD) {
        setSnackbarError(`Please use email and password provided by super admin to sign in.`);
      }
    }

    return err.response.data;
  }
};

export const checkPassToken = async (body: { email: string; token: string }): Promise<any> => {
  try {
    const res = await axiosInstance.post('users/check-pass-token', body);
    setSnackbarSuccess('Your verification code is correct! Please reset your password.');

    return res;
  } catch (err) {
    return err.response.data;
  }
};

export const changePassword = async (body: { email: string; token: string; password: string }): Promise<any> => {
  try {
    const res = await axiosInstance.put('users/reset-password', body);
    setSnackbarSuccess('Password has been reset successfully.');

    return res;
  } catch (err) {
    return err.response.data;
  }
};
