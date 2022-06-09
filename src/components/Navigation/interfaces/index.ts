import { Token } from 'src/interfaces/pool';

export interface INotification {
  id: number;
  data: string;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  is_trash: number;
  created_at: string;
}

export interface IFilter {
  size: number;
  page: number;
  is_read?: number;
}

export const DEFAULT_PAGINATION: IFilter = {
  size: 10,
  page: 1,
};

export interface PoolRequest {
  id: number;
  pool_address: string;
  user_id: number;
  type: number;
  swap_fee: string;
  fee_ratio_velo: string;
  fee_ratio_lp: string;
  status: number;
  flex_right_config?: {
    canChangeCap?: boolean;
    canWhitelistLPs?: boolean;
    canChangeSwapFee?: boolean;
    canChangeWeights?: boolean;
    canPauseSwapping?: boolean;
    canAddRemoveTokens?: boolean;
    canChangeProtocolFee?: boolean;
  };
  created_at: string;
  update_at: string;
  pool_coins: Array<{
    coin_id: number;
    weight: string;
  }>;
  user: {
    email: string;
    user_type: number;
  };
  message?: string;
}

export interface PoolCreate {
  crp: boolean;
  id: string;
  rights: Array<string>;
  swapFee: string;
  protocolFee: string;
  tokens: Array<Token>;
  tokensList: Array<string>;
  totalWeight: string;
  netFee: string;
}
