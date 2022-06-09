import classNames from 'classnames/bind';
import React from 'react';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as FullScreenIcon } from 'src/assets/icon/fullscreen_bold.svg';
import Column from 'src/components/Chart/Column';
import Spline from 'src/components/Chart/Spline';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import TabsSwitch from 'src/features/Pools/component/TabsSwitch';
import { ChartTabs, ChartTabsValue, TimeFilterTabs } from 'src/features/Pools/constants';
import { formatCurrencyAmount, setDataPrecision } from 'src/features/Pools/helper/dataFormater';
import { getChartData } from 'src/features/Pools/redux/apis';
import { subTimeJS } from 'src/helpers/date';
import { currencySelector } from 'src/helpers/functional-currency';
import { processChartData } from 'src/helpers/pool';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { Pool } from 'src/interfaces/pool';
import { DateRange, FunctionCurrency } from 'src/interfaces/user';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from './PoolGraph.module.scss';
import { convertTimeSubmit } from 'src/features/User/components/ProfitAndLoss/helper';
import CLoading from 'src/components/Loading';

const cx = classNames.bind(styles);

const PoolGraph: React.FC<{ pool: Pool; feeType: number; isFullScreen: boolean; onChangeFullScreen: () => void }> = ({
  pool,
  feeType,
  isFullScreen,
  onChangeFullScreen,
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.themeMode);
  const chartData = useAppSelector((state) => state.pool.current.chart);
  const loading = useAppSelector((state) => state.pool.current.loadingChart);
  const [lineSeries, setLineSeries] = React.useState<{
    series: {
      name: string;
      data: Array<{ x: string | number; y: string | number }>;
    }[];
    labels: string[];
  }>({ series: [], labels: [] });
  const [timeFilterTab, setTimeFilterTab] = React.useState(TimeFilterTabs[0]);
  const [chartTab, setChartTab] = React.useState(ChartTabs[0]);
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency: FunctionCurrency = useAppSelector(currencySelector);

  React.useEffect(() => {
    timeFilterTab.label !== 'Custom' && dispatch(getChartData({ poolId: pool.id, timeFilter: timeFilterTab }));
  }, [dispatch, pool.id, timeFilterTab]);

  React.useEffect(() => {
    chartData &&
      Object.keys(chartData).length !== 0 &&
      setLineSeries(processChartData(chartData, chartTab, feeType, timeFilterTab));
  }, [chartData, chartTab]);

  const handleChangeDate = (date: DateRange) => {
    const dateRange: [Date, Date] = [convertTimeSubmit(date.startDate), convertTimeSubmit(date.endDate)];
    setTimeFilterTab(TimeFilterTabs[3]);
    dispatch(getChartData({ poolId: pool.id, timeFilter: TimeFilterTabs[3], customRange: dateRange }));
  };

  const formatterYAxis = (value: number) => {
    if (ChartTabsValue.FeePercentage !== chartTab.value)
      return formatCurrencyAmount(value, selectedCurrency, exchangeRates, '0');
    else return `${setDataPrecision(value, 2)}%`;
  };

  return (
    <>
      <div className={cx('filter-bar')}>
        <div className={cx('time-filter')}>
          <span>Time</span>

          <TabsSwitch
            type="chart"
            options={TimeFilterTabs.slice(0, 3)}
            defaultOption={timeFilterTab}
            onSelect={(selection) => setTimeFilterTab(selection as typeof TimeFilterTabs[0])}
          />

          <CustomDateRangePicker
            onChange={(date: DateRange) => handleChangeDate(date)}
            classNameProps={'fix-style-date-range'}
            maxDate={new Date()}
            minDate={subTimeJS(new Date(), 1, 'year')}
            inChart
          />
        </div>

        <div className={cx('tabs')}>
          <TabsSwitch type="chart" options={ChartTabs} defaultOption={chartTab} onSelect={setChartTab} />

          {!isFullScreen ? (
            <FullScreenIcon width="12px" height="12px" fill="var(--placeholder)" onClick={onChangeFullScreen} />
          ) : (
            <CloseIcon width="12px" height="12px" fill="var(--placeholder)" onClick={onChangeFullScreen} />
          )}
        </div>
      </div>

      {loading && (
        <div className={cx('loading')}>
          <CLoading type="spin" size="md" />
        </div>
      )}

      {chartTab.value === ChartTabsValue.Add ||
      chartTab.value === ChartTabsValue.Remove ||
      chartTab.value === ChartTabsValue.Volume ? (
        <Column
          series={lineSeries.series}
          height={isFullScreen ? `${window.innerHeight - 62}px` : '350px'}
          formatterYAxis={formatterYAxis}
          theme={theme}
          animationsEnable
        />
      ) : (
        <Spline
          {...lineSeries}
          height={isFullScreen ? `${window.innerHeight - 62}px` : '350px'}
          formatterYAxis={formatterYAxis}
          theme={theme}
          animationsEnable
        />
      )}
    </>
  );
};

export default PoolGraph;
