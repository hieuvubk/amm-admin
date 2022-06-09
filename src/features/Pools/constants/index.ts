import { createMuiTheme } from '@material-ui/core/styles';

export const PoolDashboardPageSize = 10;

export enum FeeType {
  Gross = 1,
  Net = 2,
}

export enum TransactionsPageSize {
  Swaps = 10,
  Adds = 10,
  Withdraws = 10,
}

export const POOL_TYPE = {
  FIXED: {
    value: false,
    label: 'Fixed',
  },
  FLEXIBLE: {
    value: true,
    label: 'Flexible',
  },
};

export const POOL_TYPE_BTN = [POOL_TYPE.FIXED, POOL_TYPE.FLEXIBLE];

export const POOL_TYPE_RADIO = {
  FIXED: {
    value: POOL_TYPE.FIXED.value,
    label: POOL_TYPE.FIXED.label,
  },
  FLEXIBLE: {
    value: POOL_TYPE.FLEXIBLE.value,
    label: POOL_TYPE.FLEXIBLE.label,
  },
};

export const FEE_TYPE = [
  { value: FeeType.Gross, label: 'Gross fee' },
  { value: FeeType.Net, label: 'Net fee' },
];

export const DetailTabs = [
  {
    value: 0,
    label: 'Balances',
  },
  {
    value: 1,
    label: 'Transactions',
  },
  {
    value: 2,
    label: "Pool's info",
  },
  {
    value: 3,
    label: 'Settings',
  },
  {
    value: 4,
    label: 'Actions',
  },
];

export enum ChartTabsValue {
  Liquidity,
  Add,
  Remove,
  Volume,
  FeePercentage,
  FeeValue,
}

export const ChartTabs = [
  {
    value: ChartTabsValue.Liquidity,
    label: 'Liquidity',
  },
  {
    value: ChartTabsValue.Add,
    label: 'Add',
  },
  {
    value: ChartTabsValue.Remove,
    label: 'Remove',
  },
  {
    value: ChartTabsValue.Volume,
    label: 'Volume',
  },
  {
    value: ChartTabsValue.FeePercentage,
    label: 'Fee returns (percentage)',
  },
  {
    value: ChartTabsValue.FeeValue,
    label: 'Fee returns (value)',
  },
];

export enum TimeFilterLabel {
  Day = '1D',
  Week = '1W',
  Month = '1M',
  Custom = 'Custom',
}

export const TimeFilterTabs = [
  {
    label: TimeFilterLabel.Day,
    value: TimeFilterLabel.Day,
  },
  {
    label: TimeFilterLabel.Week,
    value: TimeFilterLabel.Week,
  },
  {
    label: TimeFilterLabel.Month,
    value: TimeFilterLabel.Month,
  },
  {
    label: TimeFilterLabel.Custom,
    value: TimeFilterLabel.Custom,
  },
];

export enum ChartDataInterval {
  Hour = 3600000,
  Day = 24 * Hour,
  Week = 7 * Day,
  Month = 31 * Day,
}

export enum ChartDataTickcount {
  Day = 31,
  Week = 12,
  Month = 13,
}

export const TRANSACTIONS_TYPE = {
  SWAP: {
    value: 0,
    label: 'Swap',
  },
  ADD: {
    value: 1,
    label: 'Add',
  },
  REMOVE: {
    value: 2,
    label: 'Remove',
  },
};

export const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

export const USER_TYPE = [
  { value: 0, label: 'All' },
  { value: 1, label: 'Restricted user' },
  { value: 2, label: 'Unrestricted user' },
];

export enum BULK_ACTION_TYPE {
  ADD_USER,
  REMOVE_USER,
}

export const BULK_ACTION_LPER_SETTING = [
  { value: BULK_ACTION_TYPE.ADD_USER, label: 'Add user' },
  { value: BULK_ACTION_TYPE.REMOVE_USER, label: 'Remove user' },
];

export const FLEXIBLE_POOL_RIGHTS: Record<string, string> = {
  canPauseSwapping: 'Can pause swapping',
  canChangeSwapFee: 'Can change swap fee',
  canChangeWeights: 'Can change weights',
  canAddRemoveTokens: 'Can change tokens ',
  canWhitelistLPs: 'Can limit Liquidity providers',
  canChangeCap: 'Can limit total FPT supply',
};

export enum LPerType {
  All = 0,
  Segregated = 1,
  Unknow = 2,
}

export const LPerSelection = [
  {
    value: LPerType.All,
    label: 'All',
  },
  {
    value: LPerType.Segregated,
    label: 'Segregated user',
  },
];
