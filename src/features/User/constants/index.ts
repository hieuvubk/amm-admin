export enum LOCKED_STATUS {
  LOCKED,
  UNLOCKED,
}

export const USER_STATUS = [
  { value: null, label: 'All' },
  { value: LOCKED_STATUS.UNLOCKED, label: 'Active' },
  { value: LOCKED_STATUS.LOCKED, label: 'Disabled' },
];

export enum WHITELIST_STATUS {
  NONE,
  WHITELISTED,
  PENDING,
  SUBMIT,
  REJECTED,
}

export const WALLET_STATUS = [
  { value: WHITELIST_STATUS.WHITELISTED, label: 'Whitelisted' },
  { value: WHITELIST_STATUS.PENDING, label: 'Pending' },
  { value: WHITELIST_STATUS.REJECTED, label: 'Rejected' },
  { value: WHITELIST_STATUS.SUBMIT, label: 'Submit' },
];

export enum RESTRICT_STATUS {
  RESTRICTED,
  UNRESTRICTED,
}

export const USER_TYPE = [
  { value: RESTRICT_STATUS.RESTRICTED, label: 'Restricted user' },
  { value: RESTRICT_STATUS.UNRESTRICTED, label: 'Unrestricted user' },
];

export enum WalletStatus {
  Whitelisted = 1,
  Pending = 2,
  Submit = 3,
  Blocked = 4,
}

// Export CSV

export const HEADER_EXPORT_USER_BALANCES = [
  { id: 'user_id', displayName: 'User ID' },
  { id: 'date', displayName: 'Date' },
  { id: 'wallet', displayName: 'Wallet address' },
  { id: 'symbol', displayName: 'Digital credit name' },
  { id: 'amount', displayName: "Digital credit's amount" },
  { id: 'value', displayName: "Digital credit's value in functional currencies" },
];
export const HEADER_EXPORT_DC_POOL = [
  { id: 'user_id', displayName: 'User ID' },
  { id: 'date', displayName: 'Date' },
  { id: 'wallet', displayName: 'Wallet address' },
  { id: 'symbol', displayName: 'Digital credit name' },
  { id: 'amount', displayName: "Digital credit's amount" },
  { id: 'value', displayName: "Digital credit's value" },
  { id: 'pool_address', displayName: 'Pool address' },
];
export const HEADER_EXPORT_TRANSFER = [
  { id: 'user_id', displayName: 'User ID' },
  { id: 'date', displayName: 'Date' },
  { id: 'wallet', displayName: 'Wallet address' },
  { id: 'symbol', displayName: 'Digital credit name/ LP token address' },
  { id: 'amount_in', displayName: 'Amount in' },
  { id: 'value_amount_in', displayName: 'Value of amount in' },
  { id: 'amount_out', displayName: 'Amount out' },
  { id: 'value_amount_out', displayName: 'Value of amount out' },
];
