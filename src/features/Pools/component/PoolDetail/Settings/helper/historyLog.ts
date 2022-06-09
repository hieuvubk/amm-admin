import axiosInstance from 'src/services/config';

export interface SettingHistoryLog {
  pool_setting_name: string;
  pool_id: string;
  wallet: string;
}
export async function settingHistoryLog(body: SettingHistoryLog): Promise<void> {
  try {
    const response = await axiosInstance.post('/admin/history-log/pool-setting', body);
    return response.data;
  } catch (err) {
    throw err;
  }
}
