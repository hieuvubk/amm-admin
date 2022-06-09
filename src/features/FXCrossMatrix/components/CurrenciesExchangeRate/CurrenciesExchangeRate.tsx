/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import styleSCSS from './styles/CurrenciesExchangeRate.module.scss';
import classnames from 'classnames/bind';
import BigNumber from 'bignumber.js';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import ReverseIcon from 'src/assets/icon/ReverseIcon';
import { Button } from '@material-ui/core';
import { CrossMatrixCurrenciesExchangeDetail } from 'src/features/FXCrossMatrix/components/FXCrossMatrix';

const cx = classnames.bind(styleSCSS);

interface CurrenciesExchangeRateProps {
  crossMatrixCurrenciesDetails: CrossMatrixCurrenciesExchangeDetail[];
}

const CurrenciesExchangeRate: React.FC<CurrenciesExchangeRateProps> = ({ crossMatrixCurrenciesDetails }) => {
  const [fromCurrencyIndex, setFromCurrencyIndex] = useState<number>(0);
  const [toCurrencyIndex, setToCurrencyIndex] = useState<number>(1);

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(1));
  const [amountError, setAmountError] = useState<string>('');

  const [convertAction, setConvertAction] = useState<boolean>(false);

  const functionalCurrenciesIconOptions = crossMatrixCurrenciesDetails.map((currencyExchange) => ({
    icon: `/currency-flags/${currencyExchange.code.toLowerCase()}.png`,
    label: currencyExchange.code,
    value: currencyExchange.code,
  }));

  return (
    <div>
      <div className={cx('filter-bar-container')}>
        <div className={cx('filter-bar-wrap')}>
          <div className={cx('filter-bar')}>
            <div className={cx('label')}>From</div>
            <CSelect
              valueSet={fromCurrencyIndex}
              className={cx('select-currency')}
              options={functionalCurrenciesIconOptions}
              defaultValue={functionalCurrenciesIconOptions[fromCurrencyIndex]}
              showSearchBar={true}
              onChange={(value: string): void => {
                setConvertAction(false);
                setFromCurrencyIndex(crossMatrixCurrenciesDetails.findIndex((currency) => currency.code === value));
              }}
              hideSearchBarSearchIcon={true}
            />

            <ReverseIcon
              className={cx('switch-icon')}
              onClick={() => {
                setFromCurrencyIndex(toCurrencyIndex);
                setToCurrencyIndex(fromCurrencyIndex);
              }}
            />

            <div className={cx('label')}>To</div>
            <CSelect
              valueSet={toCurrencyIndex}
              className={cx('select-currency')}
              options={functionalCurrenciesIconOptions}
              defaultValue={functionalCurrenciesIconOptions[toCurrencyIndex]}
              showSearchBar={true}
              onChange={(value: string): void => {
                setConvertAction(false);
                setToCurrencyIndex(crossMatrixCurrenciesDetails.findIndex((currency) => currency.code === value));
              }}
              hideSearchBarSearchIcon={true}
            />

            <div className={cx('label')}>Amount</div>
            <div className={cx('amount-input-container')}>
              <CInput
                size="sm"
                textBefore={crossMatrixCurrenciesDetails[fromCurrencyIndex].symbol}
                validateBigNumber={true}
                floatNumberLimitDigitAfterComma={6}
                defaultValue={'1.00'}
                onChange={(value: BigNumber) => {
                  setAmountError('');
                  setConvertAction(false);
                  setAmount(value);
                }}
                isError={true}
                defaultValueAutoSet={true}
                preventSpecialChar={true}
                autoFixNumber={convertAction}
                ConvertAction
              />
              {amountError && <div className={cx('amount-invalid-error')}>{amountError}</div>}
            </div>
          </div>

          {convertAction && (
            <div className={cx('exchange-content')}>
              <div className={cx('small-text', 'small-text-1')}>
                {amount.toFixed(2).toString()} {crossMatrixCurrenciesDetails[fromCurrencyIndex].name} =
              </div>
              <div className={cx('big-text')}>
                {amount
                  .multipliedBy(
                    crossMatrixCurrenciesDetails[toCurrencyIndex].exchangeRate /
                      crossMatrixCurrenciesDetails[fromCurrencyIndex].exchangeRate,
                  )
                  .toFixed(6)}{' '}
                {crossMatrixCurrenciesDetails[toCurrencyIndex].name}
              </div>
              <div className={cx('small-text', 'small-text-2')}>
                1 {crossMatrixCurrenciesDetails[toCurrencyIndex].code} ={' '}
                {(
                  crossMatrixCurrenciesDetails[fromCurrencyIndex].exchangeRate /
                  crossMatrixCurrenciesDetails[toCurrencyIndex].exchangeRate
                ).toFixed(6)}{' '}
                {crossMatrixCurrenciesDetails[fromCurrencyIndex].code}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="contained"
          color="primary"
          className={cx('convert-btn')}
          onClick={() => {
            if (amount.lte(0) || amount.gte(1000000000000000)) {
              setAmountError('Please input amount between 0 and 1.000.000.000.000.000');
              return;
            }
            setConvertAction(true);
          }}
        >
          Convert
        </Button>
      </div>
    </div>
  );
};

export default CurrenciesExchangeRate;
