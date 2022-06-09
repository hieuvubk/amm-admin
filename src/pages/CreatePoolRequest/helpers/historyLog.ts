// import axiosInstance from 'src/services/config';
import { setSnackbarError } from 'src/components/Snackbar';
import axiosInstance from 'src/services/config';

interface ApprovePoolParams {
  pool_id: string;
  wallet: string;
  status: number;
}

export async function createPoolHistoryLog(body: ApprovePoolParams): Promise<void> {
  try {
    await axiosInstance.post('/admin/history-log/create-pool', body);
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
}
