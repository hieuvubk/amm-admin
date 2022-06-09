import { ApexOptions } from 'apexcharts';
const [defaultHeight, defaultWidth] = ['350px', '100%'];
export const defaultSeries = [
  {
    name: 'High - 2013',
    data: [28, 29, 33, 36, 32, 32, 33],
  },
  {
    name: 'Low - 2013',
    data: [12, 11, 14, 18, 17, 13, 13],
  },
];

export const defaultOptions: ApexOptions = {
  chart: {
    height: defaultHeight,
    width: defaultWidth,
    type: 'line',
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  colors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  grid: {
    borderColor: 'var(--divider-line-graph)',
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
  markers: {
    size: 4,
    colors: ['#fff'],
    strokeColors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
  },
  tooltip: {},
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      style: {
        colors: 'var(--label-line-graph)',
        fontSize: '12px',
        fontWeight: 'normal',
      },
      datetimeFormatter: {
        year: 'yyyy',
        month: "MMM 'yy",
        day: 'dd',
        hour: 'HH:mm',
      },
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        colors: 'var(--label-line-graph)',
        fontSize: '12px',
        fontWeight: 'normal',
      },
    },
  },
};

/* eslint-disable max-len */
export const TITLE_TOOLTIP = {
  profitAndLoss: 'The data maintenance time is 0am - 2am (UTC+0) every day. During this time, PNL is not displayed.',
  commulativePNLPersent:
    'Cumulative PNL(%) = Cumulative PNL / (asset in spot account from day 1 + average net transfer and deposit from day 1 to day N).',
  dailyPNL: 'Daily PNL = Daily final asset in spot account - Initial asset at 00:00:00 UTC - Net transfer and deposit',
  profit: "Profits = The sum of each day's profit and loss from day 1 to day N",
  assetAllocation:
    "Asset Allocation = The display of each asset in spot account (sorted by each asset's latest market value)",
  assetNetWorth: 'Asset Net Worth = The total net value of all the assets in spot account from day 1 to day N',
};
