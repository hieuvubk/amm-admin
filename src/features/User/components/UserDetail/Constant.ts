export interface IFilterUserWallet {
  limit: number;
  page: number;
  user_id: number;
  user_type?: number;
  role?: number;
  network?: number;
  status?: number[];
  create_at_sort?: string;
  user_registration?: string;
}
