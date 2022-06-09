export interface IDigitalCredit {
  name: string;
  symbol: string;
  stellar_issuer?: string;
  bsc_address?: string;
  is_active: number;
}

export interface IFilter {
  limit?: number;
  page?: number;
  digital_credit?: string;
  status?: number;
}

export const DEFAULT_PAGINATION: IFilter = {
  limit: 10,
  page: 1,
  status: 1,
};
