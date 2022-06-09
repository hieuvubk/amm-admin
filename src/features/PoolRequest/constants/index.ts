import { DEFAULT_PAGE, SORT } from 'src/helpers/const';

export interface PoolRequest {
  id: number;
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

export interface IFilter {
  limit?: number;
  page?: number;
  user_id?: number;
  user_type?: number;
  digital_credit?: number;
  type?: number;
  status?: number;
  create_at_sort?: string;
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export enum PoolTypeLabel {
  Fixed = 'Fixed pool',
  Flexible = 'Flexible pool',
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

export enum UserType {
  Restricted,
  Unrestricted,
}

export enum UserTypeLabel {
  Restricted = 'Restricted user',
  Unrestricted = 'Unrestricted user',
}

export const USER_TYPE = [
  { value: null, label: 'All' },
  { value: UserType.Restricted, label: UserTypeLabel.Restricted },
  { value: UserType.Unrestricted, label: UserTypeLabel.Unrestricted },
];

export const POOL_TYPE = [
  { value: null, label: 'All' },
  { value: PoolType.Fixed, label: PoolTypeLabel.Fixed },
  { value: PoolType.Flexible, label: PoolTypeLabel.Flexible },
];

export const POOL_STATUS = [
  { value: PoolStatus.Pending, label: PoolStatusLabel.Pending },
  { value: PoolStatus.Rejected, label: PoolStatusLabel.Rejected },
];

export const PAGINATION = {
  PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
  NUMBER_PAGE_SHOW: 5,
};

export enum PoolType {
  FIXED = 'Fixed',
  FLEXIBLE = 'Flexible',
}

export const DEFAULT_CONDITION_FILTER: IFilter = {
  ...DEFAULT_PAGE,
  status: PoolStatus.Pending,
  create_at_sort: SORT.DECREASE,
};
