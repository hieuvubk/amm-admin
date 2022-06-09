export interface IResponseService<T> {
  code: number;
  data: T;
  metadata: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}
