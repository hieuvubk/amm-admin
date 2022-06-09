export interface Pair {
  pairs_id: number;
  price_precision: string;
  amount_precision: string;
  group_count: number;
  // base coin
  base_name: string;
  base_symbol: string;
  base_stellar_issuer: string;
  base_bsc_address: string;
  base_type: number;
  base_decimal: number;
  // quote coin
  quote_name: string;
  quote_symbol: string;
  quote_stellar_issuer: string;
  quote_bsc_address: string;
  quote_type: number;
  quote_decimal: number;
}
