import { ApexOptions } from 'apexcharts';

export { default as ColumnPnl } from './Column';
export { default as LinePnl } from './Line';

export const defaultOptionPNLLine: ApexOptions = {
  chart: {
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
  tooltip: {},
  grid: {
    borderColor: 'var(--divider-line-graph)',
  },
  markers: {
    size: 3,
    colors: ['#fff'],
    strokeColors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    labels: {
      show: true,
      style: {
        colors: 'var(--label-line-graph)',
        fontSize: '12px',
        fontWeight: 'normal',
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
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    floating: true,
    labels: {
      colors: 'var(--label-line-graph)',
    },
  },
};

export const defaultOptionsPNLColumn: ApexOptions = {
  chart: {
    type: 'bar',
    height: 500,
    width: '100%',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: 'var(--divider-line-graph)',
  },
  colors: ['#5048E5'],
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    labels: {
      show: true,
      style: {
        colors: 'var(--label-line-graph)',
        fontSize: '12px',
        fontWeight: 'normal',
      },
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
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val}`,
    },
  },
};
