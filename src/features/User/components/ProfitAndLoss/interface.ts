export interface IDate {
  startDate: Date;
  endDate: Date;
  key?: string;
}

export enum PnlType {
  Trading = 'trading',
  LiquidityPool = 'pool',
}
export interface ISelectedDate {
  from: number;
  to: number;
}
export interface IPnlResponse {
  balance: string;
  created_at: string;
  date: string;
  rate: string;
  symbol: string;
  trade_amount: string;
  transfer_amount: string;
  updated_at: string;
  user_id: number;
  wallet: string;
}
export interface IPnlsLiquidityResponse {
  balance: string;
  created_at: string;
  date: string;
  pool_id: string;
  price: string;
  symbol: string;
  transfer_amount: string;
  updated_at: string;
  user_id: number;
  wallet: string;
}

export interface IPnlsReduceAmount {
  date: string;
  wallet: string;

  balance_value: number;
  trade_value: number;
  transfer_value: number;
}
export interface IPnl {
  date: string;
  balance_value: number; // balance of token * rate
  trade_value: number; // trade_amount of token * rate
  transfer_value: number; // transfer_amount of token * rate
  // transfer_value_average: number; // transfer_amount of token * rate

  // pnlCommulativePersent: number;
  pnlDaily: number;
  pnlCommulativeAmount: number;
  // totalTranferAmountToDay: number;
}

export interface IPnlConstant {
  yesterday: number;
  rateChangePnlYesterday: number;
  thirtyDaysAgo: number;
  rateChangePnl30DayAgo: number;
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
