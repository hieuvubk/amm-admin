export interface IUser {
  id: number;
  title: string;
  email: string;
  company: string;
  fullname: string;
  role: number;
  user_type: number;
  phone: string;
  velo_account: string;
  password: string;
  token_reset_password?: null;
  expire?: null;
  is_locked: number;
  refresh_token?: null;
  status: number;
  position: string;
  created_at: string;
  updated_at: string;
}

export interface IAdminWhitelist {
  id: number;
  checked: boolean;
  user_id: number;
  user_email: string;
  role: number;
  user_type: number;
  is_locked: number;
  status: number;
  created_at: string;
  updated_at: string;
  address: string;
  network: number;
}

export interface IAdmin {
  title: string;
  email: string;
  company: string;
  fullname: string;
  phone?: string;
  user_type: number;
  wallets: string[];
  functional_currencies: number[];
}

export interface IFilter {
  limit?: number;
  page?: number;
  user_type?: number;
  status?: number;
  user_id?: number;
  email?: string;
  user_role?: number;
  created_at?: string;
}

export const DEFAULT_PAGINATION: IFilter = {
  limit: 10,
  page: 1,
  user_role: 1,
};

export interface AccountInfo {
  company: string;
  email: string;
  fullname: string;
  functional_currencies: number[];
  position: string;
  title: string;
  user_type: number;
  wallets: string[];
}
