import { bscIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';

export enum NotificationType {
  OrderBookTradingFee = 'OrderBookTradingFee',
  PoolSwapFee = 'PoolSwapFee',
  PoolRequest = 'PoolRequest',
  Wallet = 'Wallet',
  Confidence = 'Confidence',
}

export enum PoolStatus {
  Pending = 1,
  Rejected = 2,
  Created = 3,
}

export enum PoolStatusLabel {
  Pending = 'Pending',
  Rejected = 'Rejected',
  Created = 'Created',
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export const PoolTypeCreated = {
  Fixed: false,
  Flexible: true,
};

export enum ReadStatus {
  Unread = 0,
  Read = 1,
}

export interface TradingMethodItem {
  darkIcon: string;
  lightIcon: string;
  symbol: string;
  text: string;
  key: number;
}

export const tradingMethodOptions: Array<TradingMethodItem> = [
  {
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
    text: 'Order Book (OB)',
    symbol: 'OB',
    key: 1,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Order Book (OB)',
    symbol: 'OB',
    key: 2,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Liquidity Pool (LP)',
    symbol: 'LP',
    key: 4,
  },
];
