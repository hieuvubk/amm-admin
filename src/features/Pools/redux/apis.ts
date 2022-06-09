import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ChartDataInterval,
  ChartDataTickcount,
  TimeFilterLabel,
  TimeFilterTabs,
  TransactionsPageSize,
} from 'src/features/Pools/constants';
import { IFilter } from 'src/features/Pools/interfaces';
import { Pool, TokenPrice } from 'src/interfaces/pool';
import { gql, request } from 'graphql-request';
import axiosInstance from 'src/services/config';
import { setSnackbarError } from 'src/components/Snackbar';

const url = `${process.env.REACT_APP_SUBGRAPH}`;

export const getPoolsList = createAsyncThunk('pool/getPoolsList', async (conditionFilter: IFilter) => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const timestamp24h = Math.floor(date.getTime() / 1000);
  const query = gql`
  {
    pools (orderBy: createTime, orderDirection: desc, where: {
      crp: ${conditionFilter.crp} 
      ${
        conditionFilter?.tokensList_contains
          ? `tokensList_contains: ${JSON.stringify(conditionFilter.tokensList_contains)}`
          : ''
      }
      ${conditionFilter?.id ? `id: "${conditionFilter.id}"` : ''}
    }) {
      id
      swapFee
      netFee
      tokens {
        id
        balance
        symbol
        denormWeight
      }
      totalShares
      liquidity
      swapFee
      tokensList
      totalShares
      totalSwapFee
      totalNetFee
      totalSwapVolume
      totalWeight
      joinsCount
      swaps (
        where: {
          timestamp_lte: ${timestamp24h}
        }
        orderBy: timestamp
        orderDirection: desc
        first: 1
      ){
        poolTotalSwapVolume
        poolTotalSwapFee
        poolTotalNetFee
      }
      shares(where: {balance_gt: 0}) {
        id
      }
    }
  }`;

  try {
    const result = await request(url, query);
    return result.pools as Pool[];
  } catch (err) {
    setSnackbarError(JSON.stringify(err.response.errors, null, 2));
    throw err;
  }
});

export const getTokensList = createAsyncThunk('pool/getTokensList', async () => {
  const query = gql`
    query getTokensList {
      tokenPrices {
        id
        symbol
        name
        price
      }
    }
  `;

  try {
    const response = await request(url, query);
    return response.tokenPrices as TokenPrice[];
  } catch (err) {
    setSnackbarError(JSON.stringify(err.response.errors, null, 2));
    throw err;
  }
});

export const getPoolDetail = createAsyncThunk('pool/getPoolDetail', async (poolId: string) => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const timestamp24h = Math.floor(date.getTime() / 1000);
  const query = gql`
  {
    pool (id: "${poolId}") {
      id
      name
      symbol
      crp
      controller
      tokens {
        id
        balance
        symbol
        denormWeight
        name
        address
      }
      totalShares
      liquidity
      tokensList
      totalShares
      totalSwapVolume
      totalWeight
      joinsCount
      swaps (
        where: {
          timestamp_lte: ${timestamp24h}
        }
        orderBy: timestamp
        orderDirection: desc
        first: 1
      ){
        poolTotalSwapVolume
        poolTotalSwapFee
        poolTotalNetFee
      }
      shares(where: {balance_gt: 0}) {
        id
      }
      publicSwap
      createTime
      swapFee
      totalSwapFee
      protocolFee
      netFee
      totalNetFee
      restricted
      unrestricted
      rights
    }
  }`;

  try {
    const res = await request(url, query);
    return res.pool;
  } catch (err) {
    setSnackbarError(JSON.stringify(err.response.errors, null, 2));
    throw err;
  }
});

export const getSwaps = createAsyncThunk(
  'pool/getSwaps',
  async ({ poolId, page }: { poolId: string; page: number }) => {
    const offset = page * TransactionsPageSize.Swaps;

    const query = gql`
    query getSwaps {
      pool (id: "${poolId}") {
        swapsCount
        swaps (
          skip: ${offset}
          first: ${TransactionsPageSize.Swaps}
          orderBy: timestamp, 
          orderDirection: desc
        ) {
          id
          tokenIn
          tokenInSym
          tokenAmountIn
          tokenOut
          tokenOutSym
          tokenAmountOut
          value
          feeValue
          timestamp
        }
      }
    }`;

    try {
      const res = await request(url, query);
      return [res.pool.swaps, res.pool.swapsCount];
    } catch (err) {
      setSnackbarError(JSON.stringify(err.response.errors, null, 2));
      throw err;
    }
  },
);

export const getAdds = createAsyncThunk('pool/getAdds', async ({ poolId, page }: { poolId: string; page: number }) => {
  const offset = page * TransactionsPageSize.Adds;

  const query = gql`
    query getAdds {
      pool (id: "${poolId}") {
        joinsCount
        adds (
          skip: ${offset}
          first: ${TransactionsPageSize.Adds}
          orderBy: timestamp,
          orderDirection: desc) 
          {
            id
            timestamp
            tokens {
              id
              tokenIn
              tokenInSym
              tokenAmountIn
          }
        }
      }
    }`;

  try {
    const res = await request(url, query);
    return [res.pool.adds, res.pool.joinsCount];
  } catch (err) {
    setSnackbarError(JSON.stringify(err.response.errors, null, 2));
    throw err;
  }
});

export const getWithdraws = createAsyncThunk(
  'pool/getWithdraws',
  async ({ poolId, page }: { poolId: string; page: number }) => {
    const offset = page * TransactionsPageSize.Withdraws;

    const query = gql`
      query getWithdraws {
        pool (id: "${poolId}") {
          exitsCount
          withdraws (
            skip: ${offset}
            first: ${TransactionsPageSize.Withdraws}
            orderBy: timestamp,
            orderDirection: desc)
            {
              id
              timestamp
              tokens {
                id
                tokenOut
                tokenOutSym
                tokenAmountOut
              }
          }
        }
      }`;

    try {
      const res = await request(url, query);
      return [res.pool.withdraws, res.pool.exitsCount];
    } catch (err) {
      setSnackbarError(JSON.stringify(err.response.errors, null, 2));
      throw err;
    }
  },
);

export const getPoolVirtualSwaps = createAsyncThunk(
  'pool/getVirtual',
  async ({ poolId, page }: { poolId: string; page: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const offset = page * TransactionsPageSize.Withdraws;

    const query = gql`
      query getVirtual {
        virtualSwaps(
          skip: 10
          first: 10
          where: { poolAddress: "${poolId}" }
          orderBy: timestamp
          orderDirection: desc
        ) {
          poolLiquidity
          timestamp
          timestampLogIndex
        }
      }
    `;

    try {
      const res = await request(url, query);
      return [res.pool.virtualSwaps, res.pool.exitsCount];
    } catch (err) {
      setSnackbarError(JSON.stringify(err.response.errors, null, 2));
      throw err;
    }
  },
);

const metricsQuery = (
  poolId: string,
  type: 'swaps' | 'adds' | 'withdraws' | 'virtualSwaps',
  timestamp: number,
  timestamp_gte: number,
  timestamp_lt: number,
) => {
  return `
    metrics_${timestamp}:
      ${type}
        (first: 1, orderBy: timestamp, orderDirection: desc,
          where: {
            poolAddress: "${poolId}",
            timestamp_gte: ${timestamp_gte},
            timestamp_lt: ${timestamp_lt}
          }
        )
      ${
        type === 'swaps'
          ? `{
        poolTotalSwapVolume
        poolTotalSwapFee
        poolTotalNetFee
        poolLiquidity
        timestamp
      }`
          : type === 'adds'
          ? `{
        poolTotalAddVolume
        poolLiquidity
        timestamp
      }`
          : type === 'withdraws'
          ? `{
        poolTotalWithdrawVolume
        poolLiquidity
        timestamp
      }`
          : `{
        poolLiquidity
        timestamp
      }`
      }`;
};

const calcMetricsTimestamp = (timeFilter: { label: string; value: string }, customRange?: [Date?, Date?]): number[] => {
  const now = new Date();
  const times = [] as number[];
  let interval: number, tickcount: number;
  let date: Date;
  let startTime = 0,
    endTime = 0;

  switch (timeFilter.label) {
    case TimeFilterLabel.Day:
      const currentTime = Date.now();
      interval = ChartDataInterval.Day;
      tickcount = ChartDataTickcount.Day;
      const roundedCurrentTime = currentTime - (currentTime % interval);
      startTime = roundedCurrentTime - (tickcount - 1) * interval;
      endTime = roundedCurrentTime + interval;

      for (let time = startTime; time <= endTime; time += interval) {
        times.push(time);
      }
      return times;

    case TimeFilterLabel.Week:
      interval = ChartDataInterval.Week;
      tickcount = ChartDataTickcount.Week;
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1, 0, 0, 0);
      startTime = date.getTime() - (tickcount - 1) * interval;
      endTime = date.getTime() + interval;
      for (let time = startTime; time <= endTime; time += interval) {
        times.push(time);
      }

      return times;

    case TimeFilterLabel.Month:
      tickcount = ChartDataTickcount.Month;
      date = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      date.setMonth(date.getMonth() - tickcount + 1);
      for (let i = 0; i <= tickcount; i++) {
        times.push(date.getTime());
        date.setMonth(date.getMonth() + 1);
      }

      return times;

    default:
      interval = ChartDataInterval.Day;
      tickcount = ChartDataTickcount.Day;
      if (customRange && customRange[0] && customRange[1]) {
        if (customRange[0].getDate() === customRange[1].getDate()) {
          times.push(customRange[0].getTime());
          times.push(customRange[1].getTime() + interval);
          return times;
        } else {
          [startTime, endTime] = [customRange[0].getTime(), customRange[1].getTime()];
        }
      }
      for (let time = startTime; time <= endTime; time += interval) {
        times.push(time);
      }
      times.push(endTime + interval);

      return times;
  }
};

export const getChartData = createAsyncThunk(
  'pool/getChartData',
  async ({
    poolId,
    timeFilter = TimeFilterTabs[2],
    customRange,
  }: {
    poolId: string;
    timeFilter: { label: string; value: string };
    customRange?: [Date?, Date?];
  }) => {
    const timestampArray = calcMetricsTimestamp(timeFilter, customRange);

    let tempSwapsQuery = '';
    let tempAddsQuery = '';
    let tempWithdrawsQuery = '';
    let tempVirtualQuery = '';

    for (let i = 0; i < timestampArray.length - 1; i++) {
      tempSwapsQuery += metricsQuery(
        poolId,
        'swaps',
        timestampArray[i],
        timestampArray[i] / 1000,
        timestampArray[i + 1] / 1000,
      );
      tempAddsQuery += metricsQuery(
        poolId,
        'adds',
        timestampArray[i],
        timestampArray[i] / 1000,
        timestampArray[i + 1] / 1000,
      );
      tempWithdrawsQuery += metricsQuery(
        poolId,
        'withdraws',
        timestampArray[i],
        timestampArray[i] / 1000,
        timestampArray[i + 1] / 1000,
      );
      tempVirtualQuery += metricsQuery(
        poolId,
        'virtualSwaps',
        timestampArray[i],
        timestampArray[i] / 1000,
        timestampArray[i + 1] / 1000,
      );
    }

    const swapsQuery = gql`
    {
      ${tempSwapsQuery}
    }`;

    const addsQuery = gql`
    {
      ${tempAddsQuery}
    }`;

    const withdrawsQuery = gql`
    {
      ${tempWithdrawsQuery}
    }`;

    const virtualQuery = gql`
    {
      ${tempVirtualQuery}
    }`;

    try {
      const result = await Promise.all([
        request(url, swapsQuery),
        request(url, addsQuery),
        request(url, withdrawsQuery),
        request(url, virtualQuery),
      ]);
      return { swaps: result[0], adds: result[1], withdraws: result[2], virtualSwaps: result[3] };
    } catch (err) {
      setSnackbarError(JSON.stringify(err.response.errors, null, 2));
      throw err;
    }
  },
);

export const createChangeFeeNotification = createAsyncThunk(
  'pool/createNoti',
  async (body: { oldValue: string; newValue: string; poolId?: string }) => {
    try {
      const res = await axiosInstance.post('/admin/pool-swap', body);
      return res;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      throw err;
    }
  },
);
