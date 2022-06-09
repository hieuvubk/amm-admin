import React from 'react';
import classNames from 'classnames/bind';
import styles from './PoolOverview.module.scss';
import Donut from 'src/components/Chart/Donut';
import { Pool, IPoolOverview } from 'src/interfaces/pool';
import { formatPoolAddress, processPoolOverview } from 'src/helpers/pool';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { currencySelector } from 'src/helpers/functional-currency';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';
import { FeeType } from 'src/features/Pools/constants';
import copyIcon from 'src/assets/icon/copy.svg';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { getTokenDonutColor } from 'src/components/Chart/constant';

const cx = classNames.bind(styles);

const PoolOverview: React.FC<{ pool: Pool; showPoolInfo?: boolean; feeType?: number }> = ({
  pool,
  showPoolInfo = true,
  feeType = FeeType.Gross,
}) => {
  const dispatch = useAppDispatch();
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency: FunctionCurrency = useAppSelector(currencySelector);
  const [currentPoolOverview, setCurrentPoolOverview] = React.useState<IPoolOverview>(
    processPoolOverview(pool, feeType, exchangeRates, selectedCurrency),
  );

  React.useEffect(() => {
    setCurrentPoolOverview(processPoolOverview(pool, feeType, exchangeRates, selectedCurrency));
  }, [exchangeRates, selectedCurrency, feeType, pool]);

  return (
    <>
      <div className={cx('donut-chart')}>
        <Donut
          series={currentPoolOverview.donutChartSeries}
          labels={currentPoolOverview.donutChartLabel}
          colors={currentPoolOverview.donutChartLabel.map((tokenName) => getTokenDonutColor(tokenName))}
          enableTooltip
          size="md"
        />
      </div>

      <div className={cx('pool-name')}>
        <div>{currentPoolOverview.name || 'FCX Pool Token'}</div>
        <div>
          <span>{formatPoolAddress(currentPoolOverview.address)}</span>

          <img
            src={copyIcon}
            onClick={() => {
              navigator.clipboard.writeText(currentPoolOverview.address);
              dispatch(
                openSnackbar({
                  message: 'Copied!',
                  variant: SnackbarVariant.SUCCESS,
                }),
              );
            }}
          ></img>
        </div>
      </div>

      <div className={cx('pool-type')}>{currentPoolOverview.type}</div>

      {showPoolInfo && (
        <div className={cx('pool-info')}>
          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.liquidity}</div>
            <div className={cx('label')}>Liquidity</div>
          </div>

          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.volumeIn24h}</div>
            <div className={cx('label')}>Volume (24h)</div>
          </div>

          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.swapFee}</div>
            <div className={cx('label')}>Swap fee</div>
          </div>

          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.apy}</div>
            <div className={cx('label')}>APY</div>
          </div>

          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.lifeTimeFees}</div>
            <div className={cx('label')}>Lifetime fees</div>
          </div>

          <div className={cx('pair')}>
            <div className={cx('value')}>{currentPoolOverview.numberOfLPer}</div>
            <div className={cx('label')}>Number of LPer</div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoolOverview;
