/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUser {
  id: number;
  title: string;
  email: string;
  company: string;
  fullname: string;
  role: number;
  user_type: number;
  phone: string;
  velo_account: string;
  password: string;
  token_reset_password?: null;
  expire?: null;
  is_locked: number;
  refresh_token?: null;
  status: number;
  position: string;
  created_at: string;
  updated_at: string;
}

export interface IFunctionalCurrency {
  fc_currency: string;
  fc_symbol: string;
  fc_iso_code: string;
  fc_digital_credits: string;
  fc_fractional_unit: string;
  fc_number_basic: number;
  id: number;
  currency_id: number;
  user_id: number;
  is_active: number;
  created_at: string;
}

export interface IUserWallet {
  id: number;
  address: string;
  status: number;
  created_at: string;
  user_id?: number;
  user_email?: string;
  user_type?: number;
  user_status?: number;
  user_network?: string;
  network: number;
}

export {};

export interface Pair {
  pairs_id: number;
  price_precision: string;
  amount_precision: string;
  minimum_amount: string;
  minimum_total: string;
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

export interface IOrdersInBalances {
  address: string;
  amount: string | number;
  average: unknown;
  base_name: string;
  created_at: string;
  filled_amount: string | number;
  id: number;
  maker_amounts: any;
  method: number;
  pair_id: number;
  pool: any;
  price: number | string;
  quote_name: string;
  side: number;
  status: number;
  stellar_id: string | number;
  taker_amounts: any;
  type: number;
  user_id: number;
}
export interface BalancesInOrderRes {
  value: number;
  symbol: string;
  address: string;
}

export interface ObjectAny {
  [key: string]: any;
}

export enum OrderSide {
  Buy = 1,
  Sell = 2,
}
export interface SeriesChartBalances {
  value: number;
  symbol: string;
}
export interface IListBalancesInfo {
  amount: number;
  symbol: string;
  address: string;
  type: string;
}

export interface BalancesPools {
  digitalCredits: string;
  myAssetValue: string;
  myBalance: string;
  // [key: string]: string;
}

export type TypeFilterBalances = 'all' | 'available' | 'pool' | 'order' | 'lp_token';
export enum EnumFilterType {
  All = 'all',
  Available = 'available',
  Pool = 'pool',
  Order = 'order',
  LpToken = 'lp_token',
}
export enum EnumFilterWallet {
  All = 'all',
}

export const renderWallet = (string: string): string => string.slice(0, 5) + '...' + string.slice(-5);

export interface AllCoin {
  id: number;
  name: string;
  symbol: string;
  stellar_issuer: string;
  bsc_address: string;
  decimal: number;
  type: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Wallets {
  address: string;
  created_at: string;
  id: number;
  network: number;
  status: number;
  user_email: string;
  user_id: number;
  user_type: number;
}
