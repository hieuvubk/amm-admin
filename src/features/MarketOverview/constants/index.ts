export interface OrderBook {
  pair_id?: number;
  pair_name?: string;
  created_at?: string;
  side?: string;
  price?: number;
  filled?: string;
  fee?: number;
  total?: number;
  wallet: string;
  network: string;
  user_id?: number;
}
export interface LiquidityPool {
  pair_name?: string;
  created_at?: string;
  price?: string;
  digital_credit_amount?: number;
  wallet: string;
  user_id?: number;
  digital_amount?: string;
  // Add/Remove transaction type include
  add?: string;
  digital_credit_filter?: number;
  pool_address: string;
  detais?: string;
}
export interface IFilter {
  limit?: number;
  page?: number;
  status?: number;
  user_id?: string;
  address?: string;
  pair_id?: number;
  method?: number;
  start_date?: string;
  end_date?: string;
  digital_credit_amount?: number;
  created_at?: string;
}

export interface ICollectedFee {
  startTime?: number;
  endTime?: number;
  interval?: number;
  timestamps?: number[];
  poolAddress?: string;
  methods?: number[];
  pair?: number;
}

export interface IDownloadCollectedFee {
  methods?: number[];
  pair?: number;
  poolAddress?: string;
  startTime?: number;
  endTime?: number;
}

export interface DownloadCollectedFee {
  pairName: string;
  network: string;
  date: number;
  collectedFee: string;
}

export type ICollectedFeeTimeFilter = Omit<ICollectedFee, 'poolAddress' | 'method' | 'pair'>;

export interface ICollectedFeeRes {
  timestamp: number;
  value: string;
}

export const PAIR = [
  { value: 0, label: 'Stellar Order' },
  { value: 1, label: 'BSC Order Book' },
  { value: 2, label: 'BSC Order Liquidity' },
];
export const DIGITAL_CREDIT = [
  { value: 11, label: '22589 ETH' },
  { value: 12, label: '22590 ETH' },
];
export const OPTION_TRANSACTION_TYPE = [
  { value: 'Swap', label: 'Swap' },
  { value: 'Add', label: 'Add' },
  { value: 'Remove', label: 'Remove' },
];

export const PAGINATION = {
  PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
  NUMBER_PAGE_SHOW: 5,
};
export const ODER_BOOK_DATA = [
  {
    id: '1',
    pair: 'vVND/THB',
    date: '12/10/2014',
    side: 'Buy',
    price: 'Limit',
    filled: '50%',
    fee: 0.0001,
    total: 1.2345,
    wallet: '07xdaffh6x3',
    network: 'Stellar',
    user_id: 1,
  },
];
export const CUSTOMER_TITLE_ORDERBOOK_CSV = ['Pair name', 'Date', 'Trading method', 'Collected fees'];
export const BORDER_COLOR_TABS = { style: { backgroundColor: '#18a0fb' } };
export const TRANSACTION_OB_COLUM = [
  { id: 'pair_name', displayName: 'Pair name' },
  { id: 'date', displayName: 'Date' },
  { id: 'side', displayName: 'Side' },
  { id: 'price', displayName: 'Price' },
  { id: 'filled_amount', displayName: 'Filled amount' },
  { id: 'value_of_filled_amount', displayName: 'Value of filled amount' },
  { id: 'fee', displayName: 'Fee' },
  { id: 'total', displayName: 'Total' },
  { id: 'wallet', displayName: 'Wallet' },
  { id: 'network', displayName: 'Network' },
  { id: 'user_id', displayName: 'User ID' },
];
export const TRANSACTION_SWAP_COLUM = [
  { id: 'pair_name', displayName: 'Pair name' },
  { id: 'date', displayName: 'Date' },
  { id: 'price', displayName: 'Price' },
  { id: 'base_currency_amount', displayName: 'Base currency amount' },
  { id: 'value_of_dc', displayName: 'Value of DC' },
  { id: 'quote_currency_amount', displayName: 'Quote currency amount' },
  { id: 'value_of_dc', displayName: 'Value of DC' },
  { id: 'pool_address', displayName: 'Pool address' },
  { id: 'wallet', displayName: 'Wallet' },
  { id: 'user_id', displayName: 'User ID' },
];
export const TRANSACTION_ADD_REMOVE_COLUM = [
  { id: 'name', displayName: 'Name' },
  { id: 'date', displayName: 'Date' },
  { id: 'details', displayName: 'Details' },
  { id: 'value', displayName: 'Value' },
  { id: 'pool_address', displayName: 'Pool address' },
  { id: 'wallet', displayName: 'Wallet' },
  { id: 'user_id', displayName: 'User ID' },
];

export enum DownloadType {
  CollectedFee = 'CollectedFee',
  Transaction = 'Transaction',
  ConfidenceInterval = 'ConfidenceInterval',
  WalletBalances = 'WalletBalances',
  AddedLiquidity = 'AddedLiquidity',
  DigitalCreditLPTransfer = 'DigitalCreditLPTransfer',
}
