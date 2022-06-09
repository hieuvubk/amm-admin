import { ICollectedFeeTimeFilter } from 'src/features/MarketOverview/constants';
import { ChartDataInterval, ChartDataTickcount, TimeFilterLabel } from 'src/features/Pools/constants';

export const renderAddressWallet = (address: string): string =>
  address ? address.slice(0, 5) + '...' + address.slice(-3) : '';

export const calcTimestamp = (
  timeFilter: { label: string; value: string },
  customRange?: { startDate: Date; endDate: Date },
): ICollectedFeeTimeFilter => {
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

      return {
        startTime: roundedCurrentTime - (tickcount - 1) * interval,
        // startTime: roundedCurrentTime - interval - (tickcount - 1) * interval,
        endTime: roundedCurrentTime + interval,
        // endTime: roundedCurrentTime,
        interval: interval,
        timestamps: undefined,
      };

    case TimeFilterLabel.Week:
      interval = ChartDataInterval.Week;
      tickcount = ChartDataTickcount.Week;
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1, 0, 0, 0);

      return {
        startTime: date.getTime() - (tickcount - 1) * interval,
        endTime: date.getTime() + interval,
        interval: interval,
        timestamps: undefined,
      };

    case TimeFilterLabel.Month:
      tickcount = ChartDataTickcount.Month;
      date = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      date.setMonth(date.getMonth() - tickcount + 1);
      for (let i = 0; i <= tickcount; i++) {
        times.push(date.getTime());
        date.setMonth(date.getMonth() + 1);
      }

      return { startTime: undefined, endTime: undefined, interval: undefined, timestamps: times };

    default:
      interval = ChartDataInterval.Day;
      tickcount = ChartDataTickcount.Day;
      if (customRange) {
        [startTime, endTime] = [
          customRange.startDate.getTime() + 7 * ChartDataInterval.Hour,
          customRange.endDate.getTime() + 7 * ChartDataInterval.Hour,
        ];
      }

      return {
        startTime: startTime,
        endTime: endTime,
        interval: interval,
        timestamps: undefined,
      };
  }
};
