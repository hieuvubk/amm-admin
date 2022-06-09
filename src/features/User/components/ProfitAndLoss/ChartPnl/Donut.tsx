import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

export const COLOR_CHART = {
  color1: '#FD2254',
  color2: '#00B7FE',
  color3: '#F178B6',
  color4: '#7879F1',
  color5: '#F2994A',
  color6: '#0000ff',
  color7: '#2a6fdb',
  color8: '#48d6d2',
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
