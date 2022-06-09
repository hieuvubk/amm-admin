import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const COLOR_CHART = {
  red: '#fa8080',
  green: '#57eba1',
  blue: '#9dbff9',
  orange: '#fccc75',
  teal: '#a9eff2',
  yellow: '#fded72',
  purple: '#d8abfc',
};

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  series?: number[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  loading?: boolean;
}

const defaultSeries = [42, 47, 52, 58, 65];
const defaultOptions: ApexOptions = {
  colors: Object.values(COLOR_CHART),
  chart: {
    type: 'donut',
    sparkline: {
      enabled: true,
    },
  },
  legend: {
    show: false,
  },
  stroke: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '50%',
      },
    },
  },
  tooltip: {
    enabled: false,
  },
  states: {
    hover: {
      filter: {
        type: 'none',
      },
    },
    active: {
      filter: {
        type: 'none',
      },
    },
  },
};
const Donut: React.FC<Props> = ({ series = defaultSeries, options = defaultOptions, widthChart = 380 }) => {
  return <ReactApexChart type="donut" options={options} series={series} width={widthChart} height={widthChart} />;
};

export default React.memo(Donut);
