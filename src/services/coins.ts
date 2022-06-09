import axiosInstance from 'src/services/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCoins = async (): Promise<Array<any>> => {
  return axiosInstance
    .get('coins/list')
    .then((r) => r.data)
    .catch((e) => e);
};

export default { getCoins };
