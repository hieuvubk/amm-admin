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
  role: 2;
  status: 2;
  title: string;
  token_reset_password: null;
  updated_at: string;
  user_type: 1;
  velo_account: string;
}

export interface IFilter {
  limit?: number;
  page: number;
  user_type?: number;
  status?: number;
  user_id?: string;
  email?: string;
  create_at_sort?: string;
  user_role?: number;
  created_at?: string;
}

export interface ChangeStatusAdmin {
  id?: number;
}

export const USER_TYPE = [
  { value: null, label: 'All' },
  { value: 0, label: 'Restricted user' },
  { value: 1, label: 'Unrestricted user' },
];

export const USER_STATUS_SEARCH = [
  { value: '', label: 'All' },
  { value: 1, label: 'Active' },
  { value: 0, label: 'Disabled' },
];
export const USER_STATUS = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Disabled' },
];

export enum UserStatus {
  disabled,
  active,
}

export const UserRegistrationStatus = {
  PENDING: 2,
  APPROVED: 3,
};

export const UserRole = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};
export enum UserType {
  restricted,
  unRestricted,
}

export const OPTION_TYPE = [
  { value: UserType.restricted, label: 'Restricted user' },
  { value: UserType.unRestricted, label: 'Unrestricted user' },
];

export const BULK_ACTION = {
  DEFAULT: 'Bulk Action',
  CHANGE_TYPE: 'Change user type',
  CHANGE_STATUS: 'Change user status',
};

export const OPTIONS_ACTION = [
  { value: BULK_ACTION.CHANGE_TYPE, label: BULK_ACTION.CHANGE_TYPE },
  { value: BULK_ACTION.CHANGE_STATUS, label: BULK_ACTION.CHANGE_STATUS },
];

export const PAGINATION = {
  PAGE_SIZE: 10,
  DEFAULT_CURRENT_PAGE: 1,
  NUMBER_PAGE_SHOW: 5,
};
