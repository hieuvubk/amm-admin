export interface IWallet {
  id?: number;
  checked?: boolean;
  address: string;
  created_at: Date;
  user_id: number;
  user_email: string;
  user_type: number;
  network: number;
  status: number;
  velo_account: string;
}

export interface IFilter {
  network?: number;
  limit?: number;
  page?: number;
  user_type?: number;
  status?: number;
  user_id?: number;
  create_at_sort?: string;
  role?: number;
}

export interface IApproveWallet {
  walletAddress?: string[];
  adminWallet?: string;
  walletIds?: (number | undefined)[];
  managerAdmin?: boolean;
  walletStatus?: number;
}

export interface BulkAction {
  action?: number;
  status: boolean;
  ids: (number | undefined)[];
  addresses: string[];
  roles: {
    [address: string]: number;
  };
}
export const NETWORK = [
  { value: 1, label: 'Stellar' },
  { value: 2, label: 'BSC' },
];

export const NETWORK_VALUE = {
  stellar: 1,
  BSC: 2,
};

export const USER_TYPE = [
  { value: null, label: 'All' },
  { value: 0, label: 'Restricted user' },
  { value: 1, label: 'Unrestricted user' },
];

export const WALLET_STATUS = [
  { value: 2, label: 'Pending' },
  { value: 4, label: 'Reject' },
];
export const STATUS = {
  APPROVED: 1,
  PENDING: 2,
  SUBMIT: 3,
  BLOCK: 4,
};

export const TYPE = {
  RESTRICTED_USER: 0,
  UNRESTRICTED_USER: 1,
  ADMIN: 2,
};
export const BULK_ACTION = {
  APPROVE_USER: 'Approve address',
  REJECT_USER: 'Reject address',
};

export const SELECT_OPTION = [
  { value: BULK_ACTION.APPROVE_USER, label: BULK_ACTION.APPROVE_USER },
  { value: BULK_ACTION.REJECT_USER, label: BULK_ACTION.REJECT_USER },
];
export const renderNetWork = (network: number): string | undefined => {
  switch (network) {
    case NETWORK[0].value:
      return 'Stellar';
    case NETWORK[1].value:
      return 'BSC';
    default:
      return '-';
  }
};
export const APPROVE = 1;
export const REJECT = 4;

export const STELLAR_TYPE = new Map([
  [1, 'native'],
  [2, 'credit_alphanum4'],
  [3, 'credit_alphanum12'],
]);
