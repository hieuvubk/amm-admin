/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { forwardRef, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { searchIcon } from 'src/assets/icon';
import { MESSAGE } from 'src/constants/message.message';
import './input.scss';

export interface Props {
  [key: string]: any;
  label?: string;
  isBefore?: boolean;
  before?: React.ReactNode;
  after?: React.ReactNode;
  isDisabled?: boolean;
  isOk?: boolean;
  isError?: boolean;
  isWarning?: boolean;
  message?: string;
  isReadOnly?: boolean;
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  size?: 'lg' | 'sm';
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  defaultValueAutoSet?: boolean;
  onChange?: (v: any) => void;
  classNamePrefix?: string;
  onKeyPress?: (e: any) => void;
  invalid?: boolean;
  isRequired?: boolean;
  iconBefore?: string;
  textBefore?: string;
  isSearch?: boolean;
  isDisable?: boolean;
  field?: any;
  validateFloatNumber?: boolean;
  validateBigNumber?: boolean;
  floatNumberLimitDigitAfterComma?: number;
  preventSave?: (flag: boolean) => void;
  validateNumber?: boolean;
  closeIcon?: boolean;
  numberMaxValue?: number;
  onBlur?: (e: any) => void;
  preventSpecialChar?: boolean;
  autoFixNumber?: boolean;
}

const CInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label = '',
      name = 'input',
      isSearch = false,
      isBefore = false,
      iconBefore,
      textBefore,
      isOk = false,
      isDisable = false,
      isError = false,
      isWarning = false,
      message = '',
      isReadOnly = false,
      type = 'text',
      size = 'lg',
      placeholder = 'Enter...',
      defaultValue = '',
      defaultValueAutoSet = false,
      onChange = () => {},
      classNamePrefix = '',
      onKeyPress = () => {},
      isRequired = false,
      field,
      validateFloatNumber = false,
      validateBigNumber = false,
      preventSave = () => {},
      validateNumber = false,
      closeIcon = true,
      floatNumberLimitDigitAfterComma = undefined,
      numberMaxValue = undefined,
      onBlur = () => {},
      preventSpecialChar = false,
      autoFixNumber = false,
    },
    ref,
  ) => {
    const [value, setValue] = useState<string>(defaultValue || '');
    const [cType, setCType] = useState<string>(type);
    const [ok, setOk] = useState<boolean>(isOk);
    const [errMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
      isOk && setOk(true);
    }, [isOk]);

    useEffect(() => {
      setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
      let idTimeout: any;
      if (ok) {
        idTimeout = setTimeout(() => {
          setOk(false);
        }, 2000);
      }
      return () => clearTimeout(idTimeout);
    }, [ok]);

    useEffect(() => {
      if (autoFixNumber) {
        if (validateBigNumber) {
          if (value[value.length - 1] === '.') setValue((prev) => prev.substr(0, prev.length - 1));
        }
      }
    }, [autoFixNumber]);

    const [prev, setprev] = useState('');
    const [prev2, setprev2] = useState('');
    const [validNumber, setValidNumber] = useState('');

    const validateInput = (value: string) => {
      let response = '';
      if (!value) {
        if (preventSpecialChar) {
          setprev(response);
          setprev2(response);
        }

        return value;
      }

      const reg = /^[0-9.]+$/;
      if (reg.test(value) && value[0] != '.') {
        response = value;
        setprev(response);
      } else {
        response = prev;
      }

      if (response.length > 0 && response.includes('.')) {
        const first = response.split('.')[0];
        const last = response.split('.')[1];
        if (floatNumberLimitDigitAfterComma && last.length > floatNumberLimitDigitAfterComma) {
          response = prev2;
        } else {
          response = `${first}.${last}`;
          setprev2(response);
        }
      }
      return response;
    };

    const validateNumberFunc = (value: string): string => {
      let response = '';

      const regex = new RegExp('^[0-9]*$');
      if (regex.test(value)) {
        response = value;
        setValidNumber(response);
      } else {
        response = validNumber;
      }
      return response;
    };

    useEffect(() => {}, [value.length]);

    return (
      <div className=" text-gray-600 focus-within:text-gray-400">
        {!!label && (
          <label className="text-medium" htmlFor={name}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {isSearch && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 span-input">
              <img src={searchIcon} className={`icon-${size}`} alt="" />
            </span>
          )}

          {isBefore && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <img src={iconBefore} className={`icon-${size}`} alt="" />
            </span>
          )}

          {textBefore && <div className="absolute text-before">{textBefore}</div>}

          <input
            id={name}
            ref={ref}
            type={cType}
            value={value}
            name={name}
            className={`theme-input rounded-md ${isSearch || isBefore ? 'pl-12 theme-input-search' : 'pl-input-16'} ${
              textBefore ? 'input-text-before' : ''
            } pr-12 theme-input-${size} ${classNamePrefix} ${errMessage ? 'value-error' : ''} ${ok && 'value-ok'} ${
              isWarning && 'value-warning'
            }`}
            placeholder={placeholder}
            disabled={isDisable}
            readOnly={isReadOnly}
            // autoComplete={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
            autoComplete={'off'}
            onBlur={() => {
              if (defaultValueAutoSet && !value) {
                setValue(defaultValue);
                onChange(
                  validateFloatNumber
                    ? Number(defaultValue)
                    : validateBigNumber
                    ? new BigNumber(defaultValue)
                    : defaultValue,
                );
              }
              onBlur(value);
            }}
            onChange={(e) => {
              let response = e.target.value;

              if (!validateFloatNumber && !validateBigNumber) {
                setValue(e.target.value);
                onChange(e.target.value);
              }

              if (validateBigNumber) {
                const customizeValue = validateInput(e.target.value);

                const valueBigumber = new BigNumber(customizeValue);
                if (valueBigumber) {
                  setValue(customizeValue);
                  onChange(valueBigumber);
                }
              }

              if (validateFloatNumber) {
                const customizeValue = validateInput(e.target.value);

                if (!isNaN(Number(customizeValue))) {
                  setValue(customizeValue);
                  onChange(Number(customizeValue));
                }
                response = customizeValue;

                if (response.length === 0 && !defaultValueAutoSet) {
                  setErrorMessage(MESSAGE.REQUIRED);
                  preventSave(true);
                } else if (numberMaxValue && Number(response) >= numberMaxValue) {
                  setErrorMessage(MESSAGE.SMALLER_THAN_100);
                  preventSave(true);
                } else {
                  setErrorMessage('');
                  preventSave(false);
                }
              }

              if (validateNumber) {
                setValue(validateNumberFunc(response));
                onChange(validateNumberFunc(response));
              }

              return response;
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onKeyPress(value);
              }
            }}
            {...field}
          />

          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
            {type === 'password' && !!defaultValue.length && (
              <span className="focus:outline-none focus:shadow-outline cursor-pointer">
                {cType === 'password' ? (
                  <img src={'viewSvg'} className={`icon-${size}`} alt="" onClick={() => setCType('text')} />
                ) : (
                  <img src={'hideSvg'} className={`icon-${size}`} alt="" onClick={() => setCType('password')} />
                )}
              </span>
            )}

            {!!defaultValue.length && closeIcon && isSearch && (
              <button
                type="submit"
                className="focus:outline-none focus:shadow-outline"
                onClick={() => {
                  setValue('');
                  onChange('');
                }}
              >
                <img src={'closeIcon'} className={`icon-${size}`} alt="" />
              </button>
            )}
          </span>
        </div>

        <div className={`text-left ${isError ? 'h-5 mb-1' : ''}`}>
          {isError && <span className="text-red-600 text-xs ">{errMessage}</span>}
          {ok && <span className="text-green-600 text-xs ">{message}</span>}
          {isWarning && <span className="text-yellow-600 text-xs ">{message}</span>}
        </div>
      </div>
    );
  },
);

export default CInput;
