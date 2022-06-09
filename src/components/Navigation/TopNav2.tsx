import React, { useEffect, useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@material-ui/core';
import '@fontsource/oswald';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import classNames from 'classnames/bind';
import styles from './TopNav.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setTheme } from 'src/store/theme/theme';
import { THEME_MODE } from 'src/interfaces/theme';
import logoLight from 'src/assets/img/logo-light.svg';
import logoDark from 'src/assets/img/logo-dark.svg';
import userLight from 'src/assets/icon/user-light.svg';
import userDark from 'src/assets/icon/user-dark.svg';
import notificationLight from 'src/assets/icon/notification-light.svg';
import notificationDark from 'src/assets/icon/notification-dark.svg';
import themeLight from 'src/assets/icon/theme-light.svg';
import themeDark from 'src/assets/icon/theme-dark.svg';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import { checkAuthRoute } from 'src/helpers/checkAuthRoute';
import useReturnUrl from 'src/hooks/useReturnUrl';
import { SelectItem } from 'src/interfaces/user';
import ConnectWallet from 'src/features/ConnectWallet/components/ConnectWallet';
import { UserRole } from 'src/constants/user';
import Dropdown from 'src/components/Base/Dropdown';
import Notification from './components/Notification';
import { Account, Currencies } from 'src/components/Navigation/renderComponents';
import { getFunctionalCurrencies } from 'src/components/Navigation/redux/functionalCurrency.slice';
import { setCurPageNotiPopup } from 'src/components/Navigation/components/Notification/redux/notification.slice';
import {
  countNotificationNotRead,
  getListNotificationsPopup,
  initListNotificationsPopup,
} from 'src/components/Navigation/components/Notification/redux/apis';
import { getCookieStorage } from 'src/helpers/storage';
import { ReadStatus } from 'src/components/Navigation/components/Notification/constant';
import store from 'src/store/store';

const cx = classNames.bind(styles);
const urlRedirectPage = useReturnUrl();

export const renderFowardUrl = (
  element: JSX.Element,
  { url = urlRedirectPage, path, key }: { url?: string; path: string; key?: string },
): JSX.Element => {
  return (
    <a key={key} href={url + path} style={{ textDecoration: 'none' }}>
      {element}
    </a>
  );
};

export const initFetchListNotiPopup = async (): Promise<void> => {
  store.dispatch(initListNotificationsPopup({ page: 1, size: 20, is_read: ReadStatus.Unread }));
  store.dispatch(countNotificationNotRead());
};

const TopNav2: React.FunctionComponent = () => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const curPageNoti = useAppSelector((state) => state.notification.curPageNotiPopup);
  const dispatch = useAppDispatch();
  const [currencyRef, setCurrencyRef] = useState<HTMLButtonElement | null>(null);
  const [notiRef, setNotiRef] = useState<HTMLButtonElement | null>(null);
  const [accountRef, setAccountRef] = useState<HTMLButtonElement | null>(null);
  const [convertedFunctionalCurrencies, setConvertedFuncitionCurrencies] = useState<Array<SelectItem<number | string>>>(
    [],
  );
  const listNotificationsPopup = useAppSelector((state) => state.notification.listNotificationsPopup);
  const countNotiNotRead = useAppSelector((state) => state.notification.countNotRead);
  const onSwitchTheme = () => {
    const newTheme = theme === THEME_MODE.LIGHT ? THEME_MODE.DARK : THEME_MODE.LIGHT;
    dispatch(setTheme(newTheme));
  };
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const functionalCurrencies = useAppSelector((state) => state.auth.currentUser?.listUserFunCurrencies);
  const selectedFunctionalCurrencyId = useAppSelector((state) => state.auth.currentUser.selectedFunctionalCurrencyId);

  const history = useHistory();

  useEffect(() => {
    dispatch(getFunctionalCurrencies());
  }, [dispatch]);

  useEffect(() => {
    if (!!functionalCurrencies?.length)
      setConvertedFuncitionCurrencies(
        functionalCurrencies.map((item) => ({
          key: item.functional_currencies_id,
          value: item.functional_currencies_id,
          text: `${item.functional_currencies_currency}-${item.functional_currencies_symbol}`,
        })),
      );
  }, [functionalCurrencies]);

  const fetchListNotiPopup = () => {
    if (getCookieStorage('access_token')) {
      dispatch(getListNotificationsPopup({ page: curPageNoti + 1, size: 20, is_read: ReadStatus.Unread }));
      dispatch(setCurPageNotiPopup(curPageNoti + 1));
    }
  };

  useEffect(() => {
    if (getCookieStorage('access_token')) {
      initFetchListNotiPopup();
    }
  }, [currentUser?.id]);

  return (
    <>
      {checkAuthRoute(location.pathname) ? (
        <AppBar position={'static'} className={cx('nav-bar')}>
          <Toolbar>
            <Box flexGrow={1} className={cx('logo')}>
              <Link to={routeConstants.DASHBOARD}>
                <img src={theme === THEME_MODE.LIGHT ? logoLight : logoDark} />
              </Link>
            </Box>
            <Box flexGrow={11}>
              {renderFowardUrl(
                <Button className={cx('button')}>
                  <Typography className={cx('font-weight-bold', 'text-color')}>Trade</Typography>
                </Button>,
                { path: '/' },
              )}

              {renderFowardUrl(
                <Button className={cx('button')}>
                  <Typography className={cx('font-weight-bold', 'text-color')}>Pool</Typography>
                </Button>,
                { path: '/pools' },
              )}
              {[UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role) && (
                <Button className={cx('button')} onClick={() => history.push(routeConstants.DASHBOARD)}>
                  <Typography className={cx('font-weight-bold', 'text-color')}>Admin</Typography>
                </Button>
              )}
            </Box>

            <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement>) => setAccountRef(event.currentTarget)}>
              <img src={theme === THEME_MODE.LIGHT ? userLight : userDark} />
            </IconButton>
            <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement>) => setNotiRef(event.currentTarget)}>
              {countNotiNotRead <= 0 ? (
                <img src={theme === THEME_MODE.LIGHT ? notificationLight : notificationDark} />
              ) : (
                <div className={cx('notification')}>
                  <img src={theme === THEME_MODE.LIGHT ? notificationLight : notificationDark} />
                  <div>{countNotiNotRead > 9 ? '9+' : countNotiNotRead}</div>
                </div>
              )}
            </IconButton>

            {!!functionalCurrencies?.length && selectedFunctionalCurrencyId && (
              <Button
                endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                className={cx('button')}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => setCurrencyRef(event.currentTarget)}
              >
                <Typography className={cx('font-weight-bold', 'text-color')}>
                  {functionalCurrencies
                    ?.find((currency) => currency.functional_currencies_id === selectedFunctionalCurrencyId)
                    ?.functional_currencies_currency?.toString()
                    .toUpperCase()}
                </Typography>
              </Button>
            )}
            <ConnectWallet />

            <IconButton onClick={() => onSwitchTheme()}>
              <img src={theme === THEME_MODE.LIGHT ? themeLight : themeDark} />
            </IconButton>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar position={'static'} className={cx('nav-bar')}>
          <Toolbar>
            <Box flexGrow={1} className={cx('logo')}>
              <img src={theme === THEME_MODE.LIGHT ? logoLight : logoDark} />
            </Box>
          </Toolbar>
        </AppBar>
      )}
      <Dropdown
        open={Boolean(currencyRef)}
        refElm={currencyRef}
        handleClose={() => setCurrencyRef(null)}
        items={Currencies(convertedFunctionalCurrencies)}
        className={cx('dropdown-currency')}
      />
      <Dropdown
        open={Boolean(accountRef)}
        refElm={accountRef}
        handleClose={() => setAccountRef(null)}
        items={Account(theme)}
      />
      <Notification
        open={Boolean(notiRef)}
        refElm={notiRef}
        handleClose={() => setNotiRef(null)}
        notifications={listNotificationsPopup.data}
        initFetchListNotiPopup={initFetchListNotiPopup}
        fetchListNotiPopup={fetchListNotiPopup}
        hasMore={curPageNoti < listNotificationsPopup?.metadata?.totalPage}
        theme={theme}
      />
    </>
  );
};

export default TopNav2;
