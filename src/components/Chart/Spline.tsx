import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { renderDate } from 'src/helpers/date';

interface Props {
  series?: {
    name: string;
    data: Array<{ x: string | number; y: string | number }>;
  }[];
  labels?: string[];
  colors?: string[];
  width?: string;
  height?: string;
  formatterYAxis?: (val: number) => string | string[];
  formatterXAxis?: (value: string, timestamp?: number | undefined) => string | string[];
  theme?: string;
  animationsEnable?: boolean;
}

const defaultSeries = [
  {
    name: 'series1',
    data: [
      { x: 1, y: 34 },
      { x: 2, y: 35 },
      { x: 3, y: 31 },
      { x: 4, y: 38 },
      { x: 5, y: 36 },
    ],
  },
];

const [defaultHeight, defaultWidth] = ['350px', '100%'];

const Spline: React.FC<Props> = ({
  series = defaultSeries,
  height = defaultHeight,
  width = defaultWidth,
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  formatterXAxis,
  formatterYAxis,
  theme,
  animationsEnable = false,
}) => {
  const options: ApexOptions = {
    chart: {
      height: height,
      width: width,
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: animationsEnable,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 1,
        gradientToColors: ['rgba(174, 136, 255, 0) 99.9%'],
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 4,
    },
    grid: {
      show: false,
    },

    tooltip: {
      x: {
        show: false,
        formatter: (v) => `${renderDate(new Date(Number(labels[v - 1])), 'year')}`,
      },
      theme: theme,
    },
    xaxis: {
      type: 'category',
      labels: {
        show: true,
        rotate: 0,
        style: {
          colors: 'var(--color-body)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        formatter: formatterXAxis,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      opposite: true,
      labels: {
        show: true,
        style: {
          colors: 'var(--color-body)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        formatter: formatterYAxis,
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="area" width={width} height={height} />;
};

export default React.memo(Spline);
