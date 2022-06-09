import styles from 'src/features/FXCrossMatrix/components/CrossMatrixTable/styles/CrossMatrixTable.module.scss';
import classnames from 'classnames/bind';
import React from 'react'; // useEffect, useState
import BigNumber from 'bignumber.js';
import {
  CrossMatrixCurrenciesExchangeDetail,
  CrossMatrixExchangeRatesRatio,
  ExchangeRateVolatility,
} from 'src/features/FXCrossMatrix/components/FXCrossMatrix';

const cx = classnames.bind(styles);

interface CurrenciesExchangeRateProps {
  crossMatrixCurrenciesDetails: CrossMatrixCurrenciesExchangeDetail[];
  crossMatrixExchangeRatesRatio: CrossMatrixExchangeRatesRatio[][];
}

const CrossMatrixTable: React.FC<CurrenciesExchangeRateProps> = ({
  crossMatrixCurrenciesDetails,
  crossMatrixExchangeRatesRatio,
}) => {
  return (
    <div className={cx('cross-matrix-table-container')}>
      <table className={cx('theme-custom-table')}>
        <thead>
          <tr>
            <th></th>
            {crossMatrixCurrenciesDetails.map((currency) => {
              return (
                <th key={currency.code}>
                  <div className={cx('th-flag')}>
                    <img
                      className={cx('flag-img', 'flag-margin')}
                      src={`/currency-flags/${currency.code.toLowerCase()}.png`}
                    />
                    <span>{currency.code}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {crossMatrixCurrenciesDetails.map((currency, fromCurrencyIndex) => {
            return (
              <tr key={currency.code}>
                <td key={'flag-img'}>
                  <img className={cx('flag-img')} src={`/currency-flags/${currency.code.toLowerCase()}.png`} />
                </td>
                {crossMatrixCurrenciesDetails.map((currencyExchange, toCurrencyIndex) => {
                  const crossMatrixExchangeRateRatio =
                    fromCurrencyIndex === toCurrencyIndex
                      ? {
                          ratio: 1,
                          volatility: ExchangeRateVolatility.STILL,
                        }
                      : crossMatrixExchangeRatesRatio[fromCurrencyIndex][toCurrencyIndex];

                  const covertedAmount =
                    crossMatrixExchangeRateRatio.ratio !== -1
                      ? new BigNumber(crossMatrixExchangeRateRatio.ratio).decimalPlaces(6).toString()
                      : '-';

                  return (
                    <td
                      className={cx(
                        crossMatrixExchangeRateRatio.volatility === ExchangeRateVolatility.STILL
                          ? 'exr-still'
                          : crossMatrixExchangeRateRatio.volatility === ExchangeRateVolatility.UP
                          ? 'exr-up'
                          : 'exr-down',
                      )}
                      key={`${currency.code}-${currencyExchange.code}`}
                    >
                      {covertedAmount}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={cx('update-time-text')}>Data is updated daily at 00:00 UTC</div>
    </div>
  );
};

export default CrossMatrixTable;
