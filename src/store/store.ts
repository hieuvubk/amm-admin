/* eslint-disable max-len */
import { configureStore } from '@reduxjs/toolkit';
import functionalCurrencyReducer from 'src/components/Navigation/redux/functionalCurrency.slice';
import adminWhitelistReducer from 'src/features/Admin/redux/admin-whitelist.slice';
import adminReducer from 'src/features/Admin/redux/admin.slice';
import userReducerFeature from 'src/features/User/redux/user.slice';
import userReducer from 'src/features/UserList/Users.slice';
import themeReducer from './theme/theme';
import registrantioReducer from 'src/features/UsersRegistration/redux/Registration.slice';
import walletsReducer from 'src/features/wallet/Wallets.slice';
import tradingFeeReducer from 'src/features/TradingFee/redux/tradingFee.slice';
import digitalCreditReducer from 'src/features/DigitalCreditSettings/redux/digitalCredit.slice';
import pairsReducer from 'src/pages/Pair/redux/Pair.slice';
import orderReducer from 'src/features/Order/openOrder.slice';
import marketOverViewReducer from 'src/features/MarketOverview/redux/MarketOverView.slice';
import poolReducer from 'src/features/Pools/redux/pool.slice';
import generalSettingReducer from 'src/pages/Dashboard/GeneralSettings/redux/GeneralSetting.slice';
import poolRequestReducer from 'src/features/PoolRequest/redux/PoolRequest.slice';
import authReducer from 'src/store/auth';
import snackbarReducer from 'src/store/snackbar';
import walletReducer from 'src/features/ConnectWallet/redux/wallet';
import transactionReducer from 'src/features/User/components/Transactions/Transactions.slice';
import historyLogReducer from 'src/features/history-log/redux/history.slice';
import allCoinReducer from 'src/helpers/coinHelper/coin.slice';
import drsReducer from 'src/features/Drs/redux/Drs.slice';
import accountDiabledSliceReducer from 'src/store/accountDisabled';
import notificationReducer from 'src/components/Navigation/components/Notification/redux/notification.slice';

const store = configureStore({
  reducer: {
    snackbar: snackbarReducer,
    theme: themeReducer,
    admin: adminReducer,
    adminWhitelist: adminWhitelistReducer,
    drs: drsReducer,
    digitalCredit: digitalCreditReducer,
    user: userReducerFeature,
    userList: userReducer,
    walletList: walletsReducer,
    registration: registrantioReducer,
    tradingFee: tradingFeeReducer,
    functionalCurrency: functionalCurrencyReducer,
    pair: pairsReducer,
    order: orderReducer,
    marketOverView: marketOverViewReducer,
    generalSetting: generalSettingReducer,
    pool: poolReducer,
    auth: authReducer,
    poolRequest: poolRequestReducer,
    wallet: walletReducer,
    transaction: transactionReducer,
    history: historyLogReducer,
    allCoins: allCoinReducer,
    accountDisabled: accountDiabledSliceReducer,
    notification: notificationReducer,
  },
  devTools: false,
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
//Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
