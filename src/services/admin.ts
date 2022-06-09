/* eslint-disable @typescript-eslint/no-explicit-any */
import { setSnackbarSuccess } from 'src/components/Snackbar';
import { FunctionCurrency, RegisterInfo } from 'src/interfaces/user';
import axiosInstance from './config';

export const register = async (user: RegisterInfo): Promise<any> => {
  const res = await axiosInstance
    .post('/admin', user)
    .catch((error) => error)
    .then((res) => res);
  return res;
};
export const getFunctionalCurrency = async (): Promise<Array<FunctionCurrency>> => {
  const res = await axiosInstance
    .get('/functional-currency')
    .catch((error) => error)
    .then((res) => res && res.data);
  return res;
};
export const checkValidEmail = async (email: string): Promise<any> => {
  const res = await axiosInstance
    .post('users/check-valid-email', { email: email })
    .catch((error) => error)
    .then((res) => res);
  return res;
};
export const getRegionCode = async (): Promise<string> => {
  const res = await axiosInstance
    .get('location/region-code')
    .catch((error) => error)
    .then((res) => res.data);
  return res;
};

export const changePasswordFirstLogin = async (body: {
  username: string;
  password: string;
  newPassword: string;
}): Promise<any> => {
  const res = await axiosInstance
    .post('/auth/admin/admin-change-password-first-login', body)
    .then((res) => {
      setSnackbarSuccess('Password has been changed successfully.');
      return res;
    })
    .catch((error) => {
      return error.response.data;
    });

  return res;
};
