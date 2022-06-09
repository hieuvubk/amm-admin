import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './PoolInfo.module.scss';
import { Pool } from 'src/interfaces/pool';
import { FLEXIBLE_POOL_RIGHTS, POOL_TYPE } from 'src/features/Pools/constants';
import moment from 'moment';
import { calculatePriceMatrix, formatPoolAddress } from 'src/helpers/pool';
import externalIcon from 'src/assets/icon/external.svg';
import { formatCurrencyAmount, formatFeePercent, formatPoolNumber } from 'src/features/Pools/helper/dataFormater';
import { useAppSelector } from 'src/store/hooks';
import { currencySelector } from 'src/helpers/functional-currency';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';
import {
  createStyles,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  withStyles,
} from '@material-ui/core';
import { getCrpController, getRights } from 'src/features/Pools/component/PoolDetail/Settings/helper/ultis';

const cx = classNames.bind(styles);

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      borderRadius: '5px !important',
      marginTop: '8px',
    },
    text: {
      fontSize: '12px',
      color: 'var(--title-active)',
      fontWeight: 500,
      borderBottom: '1px solid var(--color-line) !important',
    },
    table: {
      backgroundColor: 'var(--bg-matrix-price)',
    },
  }),
);

const CustomTableRow = withStyles(() => ({
  root: {
    lineHeight: '0.5em',
    backgroundColor: 'var(--bg-matrix-price)',
  },
}))(TableRow);

const PoolInfo: React.FC<{ pool: Pool; totalSupply: string }> = ({ pool, totalSupply }) => {
  const classes = useStyles();
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency: FunctionCurrency = useAppSelector(currencySelector);
  const [poolRights, setPoolRights] = React.useState<string[]>([]);

  const getPoolRights = async () => {
    const crp = await getCrpController(pool.id, 'controller');
    const rights = await getRights(crp);
    if (rights) {
      const poolRights: Array<string> = [];
      for (const [key, value] of Object.entries(rights)) {
        if (value && FLEXIBLE_POOL_RIGHTS[key]) {
          poolRights.push(FLEXIBLE_POOL_RIGHTS[key]);
        }
      }
      setPoolRights(poolRights);
    }
  };

  const getLPTokenAddress = () => {
    return pool.crp ? pool.controller : pool.id;
  };

  useEffect(() => {
    if (pool.id) {
      (async () => {
        await Promise.allSettled([getPoolRights()]);
      })();
    }
  }, [pool.id]);

  return (
    <div className={cx('pool-info')}>
      <div className={cx('detail-first-col')}>
        <div className={cx('pair')}>
          <div>Pool type</div>
          <div>{pool.crp === POOL_TYPE.FIXED.value ? POOL_TYPE.FIXED.label : POOL_TYPE.FLEXIBLE.label + ' pool'}</div>
        </div>

        <div className={cx('pair')}>
          <div>Creation date</div>
          <div>{moment.unix(pool.createTime).format('DD/MM/YYYY HH:mm:ss')}</div>
        </div>

        <div className={cx('pair')}>
          <div>Public swap</div>
          <div>{pool.publicSwap ? 'Enabled' : 'Disabled'}</div>
        </div>

        <div className={cx('pair')}>
          <div>Total swap volume</div>
          <div>{formatCurrencyAmount(pool.totalSwapVolume, selectedCurrency, exchangeRates, '-')}</div>
        </div>

        <div className={cx('pair')}>
          <div>Total swap fee</div>
          <div>{formatCurrencyAmount(pool.totalSwapFee, selectedCurrency, exchangeRates, '-')}</div>
        </div>

        <div className={cx('pair')}>
          <div>FPT asset</div>
          <div style={{ flexFlow: 'row', alignItems: 'center' }}>
            {formatPoolAddress(pool.id)}
            <img
              src={externalIcon}
              onClick={() => window.open(`${process.env.REACT_APP_ETHERSCAN}/token/${getLPTokenAddress()}`, '_blank')}
            />
          </div>
        </div>
      </div>

      <div className={cx('detail-second-col')}>
        <div className={cx('pair')}>
          <div>FPT total supply</div>
          <div>{formatPoolNumber(totalSupply, 1, '-')}</div>
        </div>

        <div className={cx('pair')}>
          <div>Swap fee</div>
          <div>{formatFeePercent(pool.swapFee)}%</div>
        </div>

        <div className={cx('pair')}>
          <div>Swap fee ratio</div>
          <table>
            <tbody>
              <tr>
                <th>Velo admin</th>
                <td>{formatFeePercent(pool.protocolFee)}%</td>
              </tr>

              <tr>
                <th>Liquidity providers</th>
                <td>{formatFeePercent(pool.netFee)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {pool.crp && (
          <div className={cx('pair')}>
            <div>Rights</div>
            <div>
              {poolRights.map((right, index) => (
                <div key={index}>{right}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={cx('detail-third-col')}>
        <div>Price matrix</div>

        <TableContainer className={classes.container} component={Paper}>
          <Table className={classes.table}>
            <TableBody>
              <CustomTableRow>
                <TableCell className={classes.text} align="left">
                  Asset 2\ Asset 1
                </TableCell>
                {pool.tokens.map((token, index) => (
                  <TableCell key={index} className={classes.text} align="center">
                    {token.symbol}
                  </TableCell>
                ))}
              </CustomTableRow>

              {pool.tokens.map((token, index) => (
                <CustomTableRow key={index}>
                  <TableCell className={classes.text} align="left">
                    {token.symbol}
                  </TableCell>
                  {pool.tokens.map((rowToken, index) => (
                    <TableCell key={index} className={classes.text} align="center">
                      {calculatePriceMatrix(token, rowToken)}
                    </TableCell>
                  ))}
                </CustomTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default PoolInfo;
