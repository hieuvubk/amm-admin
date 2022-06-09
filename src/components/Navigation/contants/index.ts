import { INotification } from '../interfaces';
import DashboardDarkIcon from 'src/assets/icon/dashboard-dark.svg';
import DashboardLightIcon from 'src/assets/icon/dashboard-light.svg';
import TradeHistoryDarkIcon from 'src/assets/icon/trade-history-dark.svg';
import TradeHistoryLightIcon from 'src/assets/icon/trade-history-light.svg';
import ProfileDarkIcon from 'src/assets/icon/profile-dark.svg';
import ProfileLightIcon from 'src/assets/icon/profile-light.svg';
import SignoutDarkIcon from 'src/assets/icon/signout-dark.svg';
import SignoutLightIcon from 'src/assets/icon/signout-light.svg';
export const mockData: Array<INotification> = [];

export const ROUTE_SIDEBAR = {
  account_dashboard_overview: '/user/dashboard/over-view',
  account_dashboard_balances: '/user/dashboard/balances',
  account_dashboard_profit_and_loss: '/user/dashboard/profit-and-loss',
  account_trade_history_open_orders: '/user/trade-history/open-orders',
  account_trade_history_order_history: '/user/trade-history/order-history',
  account_trade_history_trade_history: '/user/trade-history/trade-history',
  account_notification: '/user/account/notification',
  account_notification_detail: '/user/account/notification/:id',
  account_setting: '/user/account/setting',
};

export const accountOptions = [
  {
    darkIcon: '',
    lightIcon: '',
    text: 'email',
    url: '',
  },
  {
    darkIcon: DashboardDarkIcon,
    lightIcon: DashboardLightIcon,
    text: 'Dashboard',
    url: ROUTE_SIDEBAR.account_dashboard_balances,
  },
  {
    darkIcon: TradeHistoryDarkIcon,
    lightIcon: TradeHistoryLightIcon,
    text: 'Trade History',
    url: ROUTE_SIDEBAR.account_trade_history_open_orders,
  },
  {
    darkIcon: ProfileDarkIcon,
    lightIcon: ProfileLightIcon,
    text: 'Account',
    url: ROUTE_SIDEBAR.account_notification,
  },
  {
    darkIcon: SignoutDarkIcon,
    lightIcon: SignoutLightIcon,
    text: 'Sign out',
    url: '/sign-in',
  },
];
