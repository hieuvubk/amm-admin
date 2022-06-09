export interface IPair {
  checked?: boolean;
  pairs_id: number;
  pairs_price_precision: string;
  pairs_group_count: number;
  pairs_amount_precision: string;
  pairs_minimum_total: string;
  pairs_minimum_amount: string;
  pairs_is_active: number;
  network: string[];
  // base coin
  base_id: number;
  base_name: string;
  base_symbol: string;
  base_stellar_issuer: string;
  base_coin_bsc_address: string;
  base_type: number;
  // target coin
  quote_id: number;
  quote_name: string;
  quote_symbol: string;
  quote_stellar_issuer: string;
  quote_coin_bsc_address: string;
  quote_type: number;
}
export const STATUS = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Disabled' },
];
export interface IFilter {
  limit: number;
  page?: number;
  status?: number;
  base_coin_symbol?: string;
}
