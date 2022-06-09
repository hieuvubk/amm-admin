export interface IUser {
  checked?: boolean;
  company: string;
  created_at: Date;
  email: string;
  expire: null;
  fullname: string;
  id: number;
  is_locked: number;
  password: string;
  phone: string;
  refresh_token: null;
  role: number;
  status: number;
  title: string;
  token_reset_password: null;
  updated_at: string;
  user_type: number;
  velo_account: string;
  position?: string;
  address: string;
}

export interface IFilter {
  limit?: number;
  page?: number;
  user_type?: number;
  is_locked?: number;
  user_id?: string;
  email?: string;
  user_registration?: number;
  create_at_sort?: string;
  user_role?: number;
  created_at?: string;
}
export interface User {
  usersId?: Array<string | number>;
  status?: number;
  user_type?: number;
  adminEmail?: string;
  adminId?: number;
  writeLog?: boolean;
  userType?: number;
}

export const BULK_ACTION = {
  DEFAULT: 'Bulk Action',
  APPROVE: 'Approve user',
  REJECT: 'Reject user',
};
export const USER_REGISTER_STATUS = [
  { value: 2, label: 'Pending' },
  { value: 0, label: 'Rejected' },
];
export const USER_TYPE = [
  { value: 0, label: 'Restricted user' },
  { value: 1, label: 'Unrestricted user' },
];
export const OPTIONS_ACTION = [
  { value: BULK_ACTION.APPROVE, label: BULK_ACTION.APPROVE },
  { value: BULK_ACTION.REJECT, label: BULK_ACTION.REJECT },
];

export const PAGINATION = {
  PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
  NUMBER_PAGE_SHOW: 5,
};
export const VALUE_STATUS = {
  REJECT: 0,
  SUBMIT: 1,
  PENDING: 2,
  APPROVE: 3,
};
export const VALUE_TYPE = {
  UNREJECT: 1,
  REJECT: 0,
};
export const TITLE =
  'Users need whitelisted addresses to trade on FCX. Make sure you whitelist users’ addresses on Whitelist address page after approve their registrations.';
