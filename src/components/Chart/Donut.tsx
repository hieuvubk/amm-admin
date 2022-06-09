import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { COLOR_CHART } from 'src/components/Chart/constant';

interface Props {
  series?: unknown[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  enableTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeType = {
  sm: {
    width: '32px',
    height: '65px',
  },
  md: {
    width: '120px',
    height: '120px',
  },
  lg: {
    width: '380px',
    height: '100%',
  },
};

const defaultSeries = [42, 47, 52, 58, 65];
const defaultLabels = ['A', 'B', 'C', 'D', 'E'];

const Donut: React.FC<Props> = ({
  series = defaultSeries,
  labels = defaultLabels,
  colors = Object.values(COLOR_CHART),
  size = 'lg',
  enableTooltip = false,
}) => {
  const options: ApexOptions = {
    colors: colors,
    stroke: {
      show: false,
    },
    labels: labels,
    legend: {
      show: false,
      position: 'bottom',
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '40%',
        },
      },
    },
    tooltip: {
      enabled: enableTooltip || false,
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="donut" {...sizeType[`${size}` as keyof typeof sizeType]} />
  );
};

export default React.memo(Donut);
