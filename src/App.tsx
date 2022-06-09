import '@fontsource/roboto';
import React, { useEffect } from 'react';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import { getExchangeRates } from 'src/components/Navigation/redux/functionalCurrency.slice';
import Sidebar from 'src/components/Sidebar/Sidebar';
import NavBar from './components/Navigation';
import routers from './routes/routes';
import { useAppDispatch, useAppSelector } from './store/hooks';
import './styles/_app.scss';
import { routeConstants } from 'src/constants';
import { checkAuthRoute, checkNotNavBar } from 'src/helpers/checkAuthRoute';
import CustomSnackbar from 'src/components/Snackbar';
import WhiteListWarningModal from 'src/features/ConnectWallet/components/WhiteListWarningModal';
import { setOpenWarningModal } from 'src/features/ConnectWallet/redux/wallet';
import ConnectWalletDialog from 'src/features/ConnectWallet/components/ConnectWalletDialog';
import AddressIsUsedWarning from 'src/features/ConnectWallet/components/AddressIsUsedWarning/AddressIsUsedWarining';
import { getAllPairs } from 'src/pages/Pair/redux/Pair.slice';
import { setTheme } from 'src/store/theme/theme';
import { THEME_MODE } from 'src/interfaces/theme';
import { getCookieStorage } from 'src/helpers/storage';
import { getMe } from 'src/store/auth';
import AccountDisabled from 'src/components/AccountDisabled';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import ExtensionInstallationRequestWarning from 'src/features/ConnectWallet/components/ExtensionInstallationRequestDialog';
import WrongNetworkWarning from 'src/features/ConnectWallet/components/WrongNetworkWarning';
import StellarAccountIsNotActiveWarning from 'src/features/ConnectWallet/components/StellarAccountIsNotActiveWarning';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const App: React.FC = () => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isOpenModal = useAppSelector((state) => state.wallet.isOpenWarningModal);
  const dispatch = useAppDispatch();

  const accountDisabled = useAppSelector((state) => state.accountDisabled.open);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!currentUser.id && getCookieStorage('access_token')) {
      dispatch(getMe());
    }
    dispatch(getAllPairs());
    dispatch(getCoinsApi());
    dispatch(getExchangeRates());
  }, []);

  useEffect(() => {
    if (!checkAuthRoute(location.pathname)) {
      dispatch(setTheme(THEME_MODE.LIGHT));
    }
  }, [location.pathname, dispatch]);

  const muiTheme = createMuiTheme({
    props: {
      MuiButtonBase: {
        // The properties to apply
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
    },
    transitions: {
      // So we have `transition: none;` everywhere
      create: () => 'none',
    },
    overrides: {
      // Name of the component ⚛️
      MuiCssBaseline: {
        // Name of the rule
        '@global': {
          '*, *::before, *::after': {
            transition: 'none !important',
            animation: 'none !important',
          },
        },
      },
    },
  });

  if (location.pathname === '/') {
    return <Redirect to={routeConstants.FX_CROSS_MATRIX} />;
  }
  return (
    <ThemeProvider theme={muiTheme}>
      <div className="App">
        <AccountDisabled open={accountDisabled} />
        <div className="Snackbar">
          <CustomSnackbar />
        </div>
        <div className="Navbar">{checkNotNavBar(location.pathname) ? <></> : <NavBar />}</div>
        <div className="Content">
          {checkAuthRoute(location.pathname) && <Sidebar />}
          <React.Suspense fallback={<div>....Loading</div>}>
            <Switch>
              {Object.values(routers)
                // .filter((item) => item.role.includes(currentUser.role))
                .map((route) => {
                  //@ts-ignore
                  return <route.route key={route.path} {...route} />;
                })}
            </Switch>

            {/* warning in connect wallet*/}
            <WhiteListWarningModal
              open={isOpenModal}
              onClose={() => {
                dispatch(setOpenWarningModal(false));
              }}
            />
            <ConnectWalletDialog />
            <AddressIsUsedWarning />
            <ExtensionInstallationRequestWarning />
            <WrongNetworkWarning />
            <StellarAccountIsNotActiveWarning />
          </React.Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
