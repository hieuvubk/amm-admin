import classnames from 'classnames/bind';
import _ from 'lodash';
import React from 'react';
import { useHistory } from 'react-router';
import { accountOptions } from 'src/components/Navigation/contants';
import { renderFowardUrl } from 'src/components/Navigation/TopNav2';
import { routeConstants } from 'src/constants';
import { disconnectAll } from 'src/features/ConnectWallet/redux/wallet';
import { removeAllCookieStorage } from 'src/helpers/storage';
import { THEME_MODE } from 'src/interfaces/theme';
import { SelectItem } from 'src/interfaces/user';
// eslint-disable-next-line max-len
import { getMe, setSelectedFunctionalCurrencyId } from 'src/store/auth';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setTheme } from 'src/store/theme/theme';
import { updateFunCurrencies } from './components/Notification/redux/apis';
import styles from './TopNav.module.scss';
const cx = classnames.bind(styles);

interface IAccountOption {
  darkIcon: string;
  lightIcon: string;
  text: string;
  url: string;
}
const sortFuntionalCurrencies = (
  functionalCurrencies: Array<SelectItem<string | number>>,
  selectedCurrency: SelectItem<string | number>,
): number[] => {
  const listFunCurSorted = _.cloneDeep(functionalCurrencies);
  const idxDeleted = functionalCurrencies.findIndex((e) => e.value === selectedCurrency.value);
  if (idxDeleted >= 0) {
    listFunCurSorted.splice(idxDeleted, 1);
    listFunCurSorted.unshift(selectedCurrency);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listFunCurSorted.map((item: any) => item.value);
};
export const Currencies = (functionalCurrencies: Array<SelectItem<string | number>>): Array<JSX.Element> => {
  const dispatch = useAppDispatch();

  return functionalCurrencies.map((currency: SelectItem<string | number>) => (
    <div
      key={currency.key}
      className={cx('dropdown-item')}
      onClick={async () => {
        dispatch(setSelectedFunctionalCurrencyId(+currency.key));
        await dispatch(
          updateFunCurrencies({ functional_currencies: sortFuntionalCurrencies(functionalCurrencies, currency) }),
        );
        await dispatch(getMe());
      }}
    >
      {currency.text}
    </div>
  ));
};

export const formatEmail = (str: string): string => {
  if (str) {
    const arrStr = str.split('@');
    if (arrStr[0] && arrStr[1] && arrStr[0].length > 2) {
      return arrStr[0].substr(0, 2) + '***' + '@' + arrStr[1];
    }
  }
  return str;
};

export const Account = (theme: string): Array<JSX.Element> => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const userLogin = useAppSelector((state) => state.auth.currentUser);

  return accountOptions.map((item: IAccountOption, index: number) => (
    <>
      {item.text === 'email' && (
        <div key={index} className={cx('dropdown-item', 'disable')}>
          <div>{formatEmail(userLogin.email)}</div>
        </div>
      )}
      {item.url === routeConstants.SIGN_IN && item.text !== 'email' && (
        <div
          key={index}
          className={cx('dropdown-item')}
          onClick={() => {
            removeAllCookieStorage(['access_token', 'refresh_token']);
            dispatch(setTheme(THEME_MODE.LIGHT));
            dispatch(disconnectAll());
            history.push(item.url);
          }}
        >
          <div className={cx('icon')}>
            <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
          </div>
          <div>{item.text}</div>
        </div>
      )}
      {item.url !== routeConstants.SIGN_IN &&
        item.text !== 'email' &&
        renderFowardUrl(
          <div key={index} className={cx('dropdown-item')}>
            <div className={cx('icon')}>
              <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
            </div>
            <div>{item.text}</div>
          </div>,
          { path: item.url },
        )}
    </>
  ));
};
