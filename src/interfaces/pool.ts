export interface PoolToken {
  id: string;
  address: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: number;
  denormWeight: string;
  liquidity: string;
}

export interface Token {
  id: string;
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
  denormWeight: string;
}

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  price: string;
}

export interface Balance {
  digitalCredits: string;
  weight: string;
  poolBalance: string;
  myBalance: string;
  myAssetValue: string;
}

export interface Transaction {
  id: number;
  transaction: string;
  price: string;
  digitalCredit: string[][];
  pool: string;
  time: string;
}

export interface Pool {
  createTime: number;
  crp: boolean;
  crpController: string;
  controller: string;
  finalized: boolean;
  id: string;
  name: string;
  symbol: string;
  liquidity: string;
  publicSwap: boolean;
  rights: Array<string>;
  swapFee: string;
  protocolFee: string;
  swaps: Array<Swap>;
  tokens: Array<PoolToken>;
  tokensList: Array<string>;
  shares: Array<{ [key: string]: string }>;
  totalShares: string;
  totalSwapFee: string;
  totalProtocolFee: string;
  totalSwapVolume: string;
  totalWeight: string;
  netFee: string;
  totalNetFee: string;
  joinsCount: string;
  adds: Array<Add>;
  withdraws: Array<Withdraw>;
  restricted: boolean;
  unrestricted: boolean;
  myShareBalance?: string;
  myLiquidity?: string;
  myLPTokenSymbol?: string;
}

export interface Swap {
  id: string;
  caller: string;
  tokenIn: string;
  tokenInSym: string;
  tokenOut: string;
  tokenOutSym: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  poolAddress: string;
  userAddress: string;
  value: string;
  feeValue: string;
  poolTotalSwapVolume: string;
  poolTotalSwapFee: string;
  poolTotalNetFee: string;
  poolTotalProtocolFee: string;
  poolTotalGrossFee: string;
  poolLiquidity: string;
  timestamp: string;
}

export interface AddTokens {
  id: string;
  tokenAmountIn: string;
  tokenIn: string;
  tokenInSym: string;
}

export interface Add {
  id: string;
  tokens: Array<AddTokens>;
  timestamp: string;
  totalAmountIn: string;
  poolAddress: string;
}

export interface WithdrawTokens {
  id: string;
  tokenOut: string;
  tokenOutSym: string;
  tokenAmountOut: string;
}

export interface Withdraw {
  id: string;
  tokens: Array<WithdrawTokens>;
  timestamp: string;
  totalAmountOut: string;
  poolAddress: string;
}

export interface TransactionToken {
  address?: string;
  symbol: string;
  amount: string;
}

export interface PoolDashboardTable {
  id: string;
  poolAddress: string;
  tokensPercentage: number[];
  assets: string[];
  swapFee: string;
  totalLiquidity: string;
  myLiquidity: string;
  volume24: string;
  fees24: string;
  lifeTimeFees: string;
  numberOfLPer: number;
}

export interface PoolSwap {
  poolLiquidity: string;
  poolTotalSwapVolume: string;
  poolTotalSwapFee: string;
  poolTotalNetFee: string;
  timestamp: number;
  updatedAt: number;
}

export interface PoolAdd {
  poolTotalAddVolume: string;
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}

export interface PoolWithdrawal {
  poolTotalWithdrawVolume: string;
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}

export interface PoolVirtualSwap {
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}

export interface ChartDataSwap {
  [key: string]: PoolSwap[];
}

export interface ChartDataAdd {
  [key: string]: PoolAdd[];
}

export interface ChartDataRemove {
  [key: string]: PoolWithdrawal[];
}
export interface ChartDataPoolVirtualSwap {
  [key: string]: PoolVirtualSwap[];
}

export interface IPoolOverview {
  donutChartSeries: number[];
  donutChartLabel: string[];
  name: string;
  address: string;
  type: string;
  liquidity: string;
  volumeIn24h: string;
  swapFee: string;
  apy: string;
  lifeTimeFees: string;
  numberOfLPer: number;
}

export interface SwapPairData {
  pairLiquidity: string;
  pairSwapVolume: string;
  timestamp: number;
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export interface PoolShare {
  id: string;
  poolId: {
    id: string;
    symbol: string;
    name: string;
  };
  balance: string;
}
