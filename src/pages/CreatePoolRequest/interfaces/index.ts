import { WalletState } from 'src/pages/CreatePoolRequest/constants';

export interface Token {
  id?: number;
  address?: string;
  symbol?: string;
  name?: string;
  icon?: string;
}

export interface PoolRequestError {
  weight?: string;
  swapFee?: string;
  swapFeeRatio?: string;
  rights?: string;
}

export interface WalletStatus {
  state: WalletState;
  proxy: string;
  unapprovedToken: {
    address: string;
    symbol: string;
  };
}

export interface INewPool {
  type: boolean;
  amountLock: boolean;
  amounts: {
    [tokenAddress: string]: string;
  };
  weights: {
    [tokenAddress: string]: string;
  };
  totalWeight: string;
  swapFee: string;
  protocolFee: string;
  totalFee: string;
  tokens: string[];
  poolTokenSymbol?: string;
  poolTokenName?: string;
  rights: {
    [rightName: string]: boolean;
  };
  minimumWeightChangeBlockPeriod?: string;
  addTokenTimeLockInBlocks?: string;
  initialSupply?: string;
  activeToken?: number;
  message?: string;
}
