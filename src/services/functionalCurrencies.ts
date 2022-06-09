import axiosInstance from './config';

export interface ExchangeRate {
  coin: string;
  rate: number;
}

export const getExchangeRatesAtDate = async (date: string): Promise<ExchangeRate[]> => {
  const res = await axiosInstance.get(`/misc/exchange-rates?date=${date}`);
  return res.data;
};
