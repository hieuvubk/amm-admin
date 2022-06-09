import { Tooltip } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { getVeloValuePerUsd } from 'src/components/Navigation/redux/functionalCurrency.slice';
import { TITLE_TOOLTIP } from 'src/features/User/components/ProfitAndLoss/constants';
import { isBscAddress } from 'src/helpers/bssHelper/address';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { isStellarPublicKey } from 'src/helpers/stellarHelper/address';
import { IResponseService } from 'src/interfaces/response';
import axiosInstance from 'src/services/config';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  convertValueToUSD,
  convertValueUSDToCurSelector,
  currentCurrenciesSelected,
  getBalancesInPools,
  reduceTotalAmountToken,
  renderDonutChartBalances,
  totalBalances,
} from '../../helpers/helper';
import { AllCoin, BalancesInOrderRes, SeriesChartBalances } from '../../interfaces';
import styles from './Balances.module.scss';
import Donut from './Donut';
import { CHART_NO_DATA, optionChartDonutDashboardOverview } from './donut-chart';
const cx = classnames.bind(styles);

interface Props {
  wallet: string;
  userId: string;
  screen?: 'balances' | 'pnl';
}
const PieChartBalance: React.FC<Props> = ({ wallet = '', userId = '', screen = 'balances' }) => {
  const dispatch = useAppDispatch();
  const rootState = useAppSelector((state) => state);
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const [balancesAllInfo, setBalancesAllInfo] = useState<SeriesChartBalances[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const currenciesCurrentUser = useAppSelector(currentCurrenciesSelected);
  const veloValuePerUsd = rootState.functionalCurrency.veloValuePerUsd;

  const renderToolTip = (title: string) => (
    <Tooltip title={title}>
      <span className={cx('chart-element__info--tooltip')}>
        <HelpOutline fontSize={'inherit'} className={cx('tooltip-icon', 'text-normal')} />
      </span>
    </Tooltip>
  );

  useEffect(() => {
    dispatch(getVeloValuePerUsd());
  }, []);

  // Effect filter balances
  useEffect(() => {
    let isMounted = true;
    if (isMounted && wallet) {
      const initBalances: SeriesChartBalances[] = [];
      (async () => {
        try {
          // In Order
          const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(`/admin/balances-in-order`, {
            params: { wallet: wallet, user_id: userId },
          });
          if (resOrder.data?.length) {
            const resOrderMap = resOrder.data.map((item) => ({
              value: convertValueToUSD(new BigNumber(item.value).toNumber(), item.symbol, rootState),
              symbol: item.symbol,
            }));
            initBalances.push(...reduceTotalAmountToken(resOrderMap));
          }

          // Available Stellar => available = balances - selling_liabilities
          if (await isStellarPublicKey(wallet)) {
            const availableStellar = await getAllBalanceInStellar(wallet);
            const availableStellarMap = availableStellar.map((item) => ({
              value: convertValueToUSD(
                new BigNumber(item.balance).minus(new BigNumber(item.selling_liabilities)).toNumber(),
                item.asset_code,
                rootState,
              ),
              symbol: item.asset_code,
            }));
            initBalances.push(...reduceTotalAmountToken(availableStellarMap));
          }

          // Available BSC
          if (await isBscAddress(wallet)) {
            await Promise.all(
              allCoins.map((item: AllCoin) => getBalanceInBsc(wallet, item.bsc_address, item.decimal)),
            ).then((values) => {
              const availableBSCMap = values.map((v, i) => ({
                symbol: allCoins[i]?.symbol,
                value: convertValueToUSD(new BigNumber(v).toNumber(), allCoins[i]?.symbol, rootState),
              }));
              initBalances.push(...reduceTotalAmountToken(availableBSCMap));
            });

            // In Pools only BSC
            const balancesPools = await getBalancesInPools(
              wallet,
              allCoins.map((i) => i.symbol),
            );

            initBalances.push(...reduceTotalAmountToken(balancesPools.lpToken));
          }
        } catch (error) {
          throw error;
        } finally {
          setBalancesAllInfo(
            reduceTotalAmountToken(initBalances).map((i) => ({
              ...i,
              value: convertValueUSDToCurSelector(i.value, rootState),
            })),
          );
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [wallet, userId, currenciesCurrentUser.id]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 20,
          flexDirection: screen === 'balances' ? 'row' : 'column',
        }}
      ></div>
      <div className={cx('info')}>
        {screen === 'balances' && (
          <div className={cx('title')}>
            <h3>Balances</h3>
            <div className={cx('estimated-value')}>
              <div>Estimated value</div>
              <div className={cx('value')}>
                {loading ? (
                  <span style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--color-title-active)' }}>
                    loading...
                  </span>
                ) : (
                  `${currenciesCurrentUser.symbol} ${new BigNumber(totalBalances(balancesAllInfo)).toFormat()}`
                )}
              </div>
            </div>
            <div className={cx('acount')}>
              <div className={cx('acount-blance')}>Acount balances </div>
              <div className={cx('cost')}>
                {loading ? (
                  <span style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--color-title-active)' }}>
                    loading...
                  </span>
                ) : (
                  `${new BigNumber(
                    new BigNumber(totalBalances(balancesAllInfo)).div(new BigNumber(veloValuePerUsd)).toFixed(4),
                  ).toFormat()}`
                )}{' '}
                in VELO terms
              </div>
            </div>
          </div>
        )}

        {screen === 'pnl' && (
          <div className={cx('chart-element__info')}>
            <div className={cx('chart-element__info--sub-value')}>
              Asset Allocation
              {renderToolTip(TITLE_TOOLTIP.assetAllocation)}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className={cx('chart')}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Donut
              widthChart={!balancesAllInfo.length ? 260 : 360}
              options={{
                ...optionChartDonutDashboardOverview,
                colors: !balancesAllInfo.length ? ['#848E9C'] : optionChartDonutDashboardOverview.colors,
                legend: {
                  ...optionChartDonutDashboardOverview.legend,
                  show: !balancesAllInfo.length ? false : true,
                },
                tooltip: {
                  ...optionChartDonutDashboardOverview.tooltip,
                  enabled: !balancesAllInfo.length ? false : true,
                  y: {
                    formatter: (v: number) => `${new BigNumber(v).times(new BigNumber(100)).toFixed(2)}%`,
                  },
                },
                labels: !balancesAllInfo.length
                  ? CHART_NO_DATA.Label
                  : renderDonutChartBalances(balancesAllInfo).map((item) => item.symbol),
              }}
              series={
                !balancesAllInfo.length
                  ? CHART_NO_DATA.Value
                  : renderDonutChartBalances(balancesAllInfo).map((item) => item.value)
              }
            />
          )}
        </div>
        <div className={cx('select-form')}></div>
      </div>
    </div>
  );
};
export default PieChartBalance;
