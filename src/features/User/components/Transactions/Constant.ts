import { bscIcon, coinvSGD, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';
import { coinUSDT, coinvCHF, coinvEUR, coinvTHB, coinvUSD } from 'src/assets/icon';
import { TradingMethod } from 'src/constants/dashboard';
import { setTimeUTC } from 'src/features/User/components/ProfitAndLoss/helper';
import { dateBeforeMonth } from 'src/helpers/date';
import { subTimeJS } from 'src/helpers/date';
export const HISTORY_TYPE = {
  OPEN_ORDER: 'Open Orders',
  ORDER_HISTORY: 'Order History',
  TRADE_HISTORY: 'Trade History',
};

export const DEFAULT_PAGE = 1;

export enum HIS_TYPE_ID {
  OPEN_ORDER,
  ORDER_HISTORY,
  TRADE_HISTORY,
}

export const HISTORY_TYPES = [
  { value: HIS_TYPE_ID.OPEN_ORDER, label: HISTORY_TYPE.OPEN_ORDER },
  { value: HIS_TYPE_ID.ORDER_HISTORY, label: HISTORY_TYPE.ORDER_HISTORY },
  { value: HIS_TYPE_ID.TRADE_HISTORY, label: HISTORY_TYPE.TRADE_HISTORY },
];

export const PAIR_OPTION = [
  { value: 'pair 1', label: 'pair 1' },
  { value: 'pair 2', label: 'pair 2' },
  { value: 'pair 3', label: 'pair 3' },
  { value: 'pair 4', label: 'pair 4' },
];

export const NETWORK_LABEL = {
  STELLAR_OB: 'Stellar Order Book',
  BSC_OB: 'BSC Order Book',
  BSC_LIQ: 'Liquidity Pool ',
};

export const METHOD_FILTER = [
  {
    value: TradingMethod.StellarOrderbook,
    label: 'Order Book (OB)',
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCOrderbook,
    label: 'Order Book (OB)',
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCPool,
    label: 'FCX Liquidity Pool',
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    symbol: 'LP',
  },
  {
    value: TradingMethod.PancakeswapPool,
    label: 'Pancakeswap Liquidity Pool',
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    symbol: 'Pancake',
  },
];

export const MESSAGE_TABLE = {
  NO_RECORD: 'No record',
  NOT_FOUND: 'Not found',
};

export const TYPE_FILTER = [
  { value: 0, label: 'Market' },
  { value: 1, label: 'Limit' },
];

export enum ModeDisplay {
  dashboard,
  user,
  admin,
}

export type TOrder = {
  id: number;
  maker_token: string;
  taker_token: string;
  maker_amounts: number;
  taker_amounts: number;
  sender: string;
  maker: number;
  taker: string;
  taker_token_fee_amounts: number;
  fee_recipient: number;
  pool: string;
  expiry: Date;
  salt: string;
  type: number;
  user_id: number;
  signature: JSON;
  filled_amount: number;
  status: number;
  pair_id: number;
  price: number;
  side: number;
  address: string;
  created_at: Date;
  updated_at: Date;
};

export type TTrade = {
  id: number;
  pair_id: number;
  price: number;
  filled: number;
  sell_fee: number;
  buy_fee: number;
  buy_address: string;
  sell_address: string;
  network: number;
  updated_at: Date;
  sell_amount: number;
  buy_amount: number;
  quote_name: string;
  base_name: string;
  user_id?: number;
  buy_user_id: number;
  sell_user_id: number;
  filled_amount: string;
  created_at: number;
  pool_id: string;
};

export type LqTrade = {
  caller: string;
  id: string;
  poolAddress: {
    id: string;
  };
  timestamp: number;
  tokens: [
    {
      addAddress: {
        id: string;
      };
      id: string;
      tokenAmountIn: string;
      tokenAmountOut: string;
      tokenOut: string;
      tokenIn: string;
      tokenInSym: string;
      tokenOutSym: string;
      withdrawAddress: {
        id: string;
      };
    },
  ];
  userAddress: {
    id: string;
  };
  user_id: number;
};

export type TPair = {
  amount_precision: string;
  base_bsc_address: string;
  base_decimal: number;
  base_name: string;
  base_stellar_issuer: string;
  base_symbol: string;
  base_type: number;
  group_count: number;
  pairs_id: number;
  price_precision: string;
  quote_bsc_address: string;
  quote_decimal: number;
  quote_name: string;
  quote_stellar_issuer: string;
  quote_symbol: string;
  quote_type: number;
};

export type TWallet = {
  wallet_id: number;
  wallet_address: string;
};

export type TFilter = {
  pair?: number;
  method?: number[];
  wallet?: number;
  type?: number;
  orderId?: string;
  tradeMethodTab?: number[];
  status?: number[];
  coinId?: number;
  pool?: string;
  page?: number;
  limit?: number;
  transactionType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  adminEmail?: string;
};

export type TTransactionFilterDownload = {
  pair?: number;
  method?: number[];
  wallet?: number;
  type?: number;
  orderId?: string;
  tradeMethodTab?: number[];
  status?: number[];
  coinId?: number;
  pool?: string;
  transactionType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  adminEmail?: string;
};

export type TTokenLiq = {
  id: string;
  addAddress: { id: string };
  tokenAmountIn?: string;
  tokenIn?: string;
  tokenInSym?: string;
  tokenAmountOut?: string;
  tokenOut?: string;
  tokenOutSym?: string;
};

export const COIN = [
  { symbol: 'USDT', icon: coinUSDT },
  { symbol: 'vEUR', icon: coinvEUR },
  { symbol: 'vUSD', icon: coinvUSD },
  { symbol: 'vTHB', icon: coinvTHB },
  { symbol: 'vCHF', icon: coinvCHF },
  { symbol: 'vSGD', icon: coinvSGD },
];

export enum EORDER_TYPE {
  Market = 2,
  Limit = 1,
}

export const ORDER_TYPE = {
  MARKET: 'Market',
  LIMIT: 'Limit',
};

export enum EORDER_SIDE {
  Buy = 1,
  Sell = 2,
}

export const ORDER_SIDE = {
  BUY: 'Buy',
  SELL: 'Sell',
};

export enum OrderStatus {
  Pending = 0, // Pending order waiting for lock balance
  Canceled = -1, // Cancel order
  Fillable = 1, // Order waiting for exchange
  Filling = 2, // Order in exchange processing with another order
  Fulfill = 3, // Order is done}
  PartiallyFilled = 4,
}

export const ORDER_STATUS = {
  FILLED: 'Filled',
  PARTIALLY: 'Filled partially',
  CANCELED: 'Canceled',
};

export const FORMAT_DATE = 'DD-MM HH:mm:ss';
export const DATE_YESTERDAY = subTimeJS(new Date(), 1, 'day');
export const DATE_BEFORE_YESTERDAY = subTimeJS(new Date(), 2, 'day');
export const DEFAULT_START_DATE = dateBeforeMonth(new Date(), 1);
export const DEFAULT_END_DATE =
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours()
    ? DATE_YESTERDAY
    : DATE_BEFORE_YESTERDAY;
export const MIN_DATE = subTimeJS(
  subTimeJS(new Date(), 1, 'year'),
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours() ? 1 : 2,
  'day',
);
export const MAX_DATE = DEFAULT_END_DATE;
export const DATE_NOW = new Date();
export const LIMIT_RECORD = 8;

export const DELAY_TIME = 1000;
export const CUSTOMER_TITLE_BALANCES_CSV = [
  'Digital Credit',
  'Total',
  'Availbale',
  'In order',
  'In poll',
  'Value',
  'Sources',
];

export const BALANCES_DATA: {
  address: string[];
  amount: number;
  available: number;
  order: number;
  pool: number;
  symbol: string;
  value: number;
}[] = [
  {
    address: ['0xf29162ed5ed4da23656c5190aae71e61bb074aec'],
    amount: 581410134.767249,
    available: 581409023.907249,
    order: 0,
    pool: 1110.86,
    symbol: 'USDT',
    value: 581411245.627249,
  },
  {
    address: ['0xf29162ed5ed4da23656c5190aae71e61bb074aec'],
    amount: 987902760.76,
    available: 987894990.1,
    order: 0,
    pool: 7770.66,
    symbol: 'vCHF',
    value: 1076605041.2936618,
  },
  {
    address: ['0xf29162ed5ed4da23656c5190aae71e61bb074aec'],
    amount: 987898967.0643512,
    available: 987898967.0643512,
    order: 0,
    pool: 0,
    symbol: 'vSGD',
    value: 725115443.9911418,
  },
];
export const DATA_RADIO = [
  {
    id: 1,
    name: 'Wallet balances',
    value: 'wallet',
  },
  {
    id: 2,
    name: 'Added liquidity',
    value: 'liquidity',
  },
  {
    id: 3,
    name: 'DC and LP transfer in/out',
    value: 'transfer',
  },
];

export const TO_FIX_2 = '0.01';
export const TO_FIX_5 = '0.00001';
