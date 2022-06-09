import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

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

const Column: React.FC<Props> = ({
  series = defaultSeries,
  height = defaultHeight,
  width = defaultWidth,
  formatterXAxis,
  formatterYAxis,
  theme,
  animationsEnable = false,
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: height,
      width: width,
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
      colors: ['var(--color-primary)'],
    },
    dataLabels: {
      enabled: false,
    },

    grid: {
      show: false,
    },

    tooltip: {
      x: {
        show: false,
      },
      onDatasetHover: {
        highlightDataSeries: false,
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
    plotOptions: {
      bar: {
        columnWidth: '96%',
      },
    },
    states: {
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" width={width} height={height} />;
};

export default React.memo(Column);
