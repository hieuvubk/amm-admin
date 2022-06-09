import { setSnackbarError } from 'src/components/Snackbar';
import axiosInstance from 'src/services/config';

export interface GraduallyStatus {
  pool_address: string;
  start_block: number;
  end_block: number;
  old_weights: string;
  new_weights: string;
}

export async function getGraduallyStatus(poolAddress: string): Promise<GraduallyStatus> {
  try {
    const response = await axiosInstance.get(`/admin/gradually/${poolAddress}`);
    const result = response.data;
    return result;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
}

export async function postGraduallyStatus(body: GraduallyStatus): Promise<void> {
  try {
    const response = await axiosInstance.post('/admin/gradually', body);
    return response.data;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
}

export async function deleteGraduallyStatus(poolAddress: string): Promise<void> {
  try {
    const response = await axiosInstance.delete(`/admin/gradually/${poolAddress}`);
    return response.data;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
}
