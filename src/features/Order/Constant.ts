export type TFilter = {
  pair?: number;
  method?: number[];
  type?: number;
  tradeMethodTab?: number[];
  status?: number;
  page: number;
  limit: number;
};
export const HISTORY_TYPE = [
  { value: 1, label: 'Open order' },
  { value: 2, label: 'Trade History' },
  { value: 3, label: 'Order History' },
];

export interface IOrder {
  id: number;
  checked?: boolean;
  address: string;
  created_at: Date;
  user_id: number;
  user_email: string;
  user_type: number;
  status: number;
  amount: string;
  average: boolean;
  base_name: string;
  filled_amount: string;
  maker_amounts: string;
  method: number;
  pair_id: number;
  pool: string;
  price: string;
  quote_name: string;
  side: number;
  stellar_id: string;
  taker_amounts: string;
  type: number;
}
export const Market = 2;
