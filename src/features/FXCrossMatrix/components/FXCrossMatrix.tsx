import classnames from 'classnames/bind';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CurrenciesExchangeRate from 'src/features/FXCrossMatrix/components/CurrenciesExchangeRate';
import CrossMatrixTable from 'src/features/FXCrossMatrix/components/CrossMatrixTable';
import styles from 'src/features/FXCrossMatrix/style/FXCrossMatrix.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { routeConstants } from 'src/constants';
import commonCurrency from 'src/constants/currencies-info/Common-Currency.json';
import { useAppSelector } from 'src/store/hooks';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { getExchangeRatesAtDate } from 'src/services/functionalCurrencies';

const cx = classnames.bind(styles);

export interface CrossMatrixCurrenciesExchangeDetail {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

export enum ExchangeRateVolatility {
  STILL,
  UP,
  DOWN,
}

export interface CrossMatrixExchangeRatesRatio {
  ratio: number;
  volatility: ExchangeRateVolatility;
}

const FXCrossMatrix: React.FC = () => {
  const history = useHistory();
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);

  const crossMatrixCurrencies: Array<keyof typeof commonCurrency> = ['USD', 'EUR', 'THB', 'CHF', 'SGD'];

  const crossMatrixCurrenciesDetails = crossMatrixCurrencies.map((currencyExchange: keyof typeof commonCurrency) => ({
    code: commonCurrency[currencyExchange].code,
    name: commonCurrency[currencyExchange].name,
    symbol: commonCurrency[currencyExchange].symbol_native,
    exchangeRate: exchangeRates.find((exr) => exr.coin === commonCurrency[currencyExchange].code)?.rate || -1,
  }));

  const [isShowCrossTable, setIsShowCrossTable] = useState<boolean>(false);

  const [crossMatrixExchangeRatesRatio, setCrossMatrixExchangeRatesRatio] = useState<CrossMatrixExchangeRatesRatio[][]>(
    crossMatrixCurrencies.map(() => []),
  );

  const getCrossMatrixCurrenciesRatio = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getUTCDate() - 1);

    const prevExchangeRates: ExchangeRate[] = await getExchangeRatesAtDate(yesterday.toISOString().slice(0, 10));

    const crossMatrixPrevExchangeRates = crossMatrixCurrencies.map(
      (currencyExchange) =>
        prevExchangeRates.find((exr) => exr.coin === commonCurrency[currencyExchange].code) || {
          coint: currencyExchange.toString(),
          rate: -1,
        },
    );

    setCrossMatrixExchangeRatesRatio(
      crossMatrixCurrencies.map((el, i) =>
        crossMatrixCurrencies.map((el, j) => {
          if (
            crossMatrixCurrenciesDetails[i].exchangeRate === -1 ||
            crossMatrixCurrenciesDetails[j].exchangeRate === -1 ||
            crossMatrixPrevExchangeRates[i].rate === -1 ||
            crossMatrixPrevExchangeRates[j].rate === -1
          )
            return {
              ratio: -1,
              volatility: ExchangeRateVolatility.STILL,
            };

          const curRatio = crossMatrixCurrenciesDetails[i].exchangeRate / crossMatrixCurrenciesDetails[j].exchangeRate;
          const prevRatio = crossMatrixPrevExchangeRates[i].rate / crossMatrixPrevExchangeRates[j].rate;

          return {
            ratio: curRatio,
            volatility:
              curRatio === prevRatio
                ? ExchangeRateVolatility.STILL
                : curRatio > prevRatio
                ? ExchangeRateVolatility.UP
                : ExchangeRateVolatility.DOWN,
          };
        }),
      ),
    );
  };

  useEffect(() => {
    const getCrossTableData = async () => {
      setIsShowCrossTable(false);
      await getCrossMatrixCurrenciesRatio();
      setIsShowCrossTable(true);
    };

    getCrossTableData();
  }, [exchangeRates]);

  return (
    <div className={cx('fx-cross-matrix')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Dashboard',
            onClick: (): void => history.push(routeConstants.FX_CROSS_MATRIX),
          },
          {
            content: 'FX cross matrix',
            onClick: (): void => history.push(routeConstants.FX_CROSS_MATRIX),
          },
        ]}
      />
      <CurrenciesExchangeRate crossMatrixCurrenciesDetails={crossMatrixCurrenciesDetails} />

      {isShowCrossTable && (
        <CrossMatrixTable
          crossMatrixCurrenciesDetails={crossMatrixCurrenciesDetails}
          crossMatrixExchangeRatesRatio={crossMatrixExchangeRatesRatio}
        />
      )}
    </div>
  );
};

export default FXCrossMatrix;
