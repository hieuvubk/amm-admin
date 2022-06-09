export interface IHistoryLog {
  id?: number;
  activity_type?: string;
  admin_id?: number;
  wallet?: string;
  activities?: string;
  created_at?: string;
  updated_at?: string;
  page?: number;
  size?: number;
  from?: string;
  to?: string;
}
export interface IFilterHistoryLog {
  activity_type?: string;
  from?: string;
  to?: string;
  admin_id?: string;
  page?: number;
  size?: number;
  created_at?: string;
}
export interface DateRange {
  endDate: Date;
  key?: string;
  startDate: Date;
}
