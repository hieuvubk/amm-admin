import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import './Line.scss';

interface Props {
  series?: {
    name: string;
    data: number[][];
  }[];
  labels?: string[];
  colors?: string[];
  height?: string;
  width?: string;
  formatterYAxis?: (val: number) => string | string[];
  formatterXAxis?: (value: string, timestamp?: number | undefined) => string | string[];
  theme?: string;
}

const defaultSeries = [
  {
    name: 'High - 2013',
    data: [
      [1486684800000, 34],
      [1486771200000, 43],
      [1486857600000, 31],
      [1486944000000, 43],
      [1487030400000, 33],
      [1487116800000, 52],
    ],
  },
];

const [defaultHeight, defaultWidth] = ['350px', '100%'];

const Line: React.FC<Props> = ({
  series = defaultSeries,
  height = defaultHeight,
  width = defaultWidth,
  formatterYAxis,
  formatterXAxis,
  theme,
}) => {
  const options: ApexOptions = {
    chart: {
      height: height,
      width: width,
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
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
    },
    tooltip: {
      x: {
        show: false,
      },
      theme: theme,
    },
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
          day: 'dd MMM',
          hour: 'HH:mm',
        },
        formatter: formatterXAxis,
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
        formatter: formatterYAxis,
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="line" width={width} height={height} />;
};

export default React.memo(Line);
