/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import IconLibraryBooks from '@material-ui/icons/LibraryBooks';
import { ReactComponent as DashboardIcon } from 'src/assets/icon/sidebar/dashboard.svg';
import { ReactComponent as OrderBookIcon } from 'src/assets/icon/sidebar/orderbook.svg';
import { ReactComponent as LiquidityPoolIcon } from 'src/assets/icon/sidebar/liquidity-pool.svg';
import { ReactComponent as ManageUserIcon } from 'src/assets/icon/sidebar/users.svg';
import { ReactComponent as ManageAdminIcon } from 'src/assets/icon/sidebar/admin.svg';
import { ReactComponent as HistoryLogIcon } from 'src/assets/icon/sidebar/history-log.svg';
import AdminWhitelist from 'src/features/Admin/components/AdminWhitelist';
import ManageAdmin from 'src/features/Admin/components/ManageAdmin';
import DigitalCreditSettings from 'src/features/DigitalCreditSettings/components';
import HistoryLog from 'src/features/history-log/components/HistoryLog';
import MarketOverView from 'src/features/MarketOverview/component/MarketOverView';
import PoolRequestList from 'src/features/PoolRequest/components/PoolRequest';
// liquidity pool
import PoolDashboard from 'src/features/Pools/component/PoolDashboard';
import TradingFeeSetting from 'src/features/TradingFee/components/TradingFeeSetting';
import RegistrantionList from 'src/features/UsersRegistration/component/Registration';
import WalletList from 'src/features/wallet/WalletList';
import GeneralSettings from 'src/pages/Dashboard/GeneralSettings/components/GeneralSettings';
import Pair from 'src/pages/Pair/components/Pair';
import { routeConstants } from '../../constants';
import UserList from '../../features/UserList';
import { UserRole } from 'src/constants/user';
import FXCrossMatrix from 'src/features/FXCrossMatrix/components/FXCrossMatrix';

interface IRoute {
  name: string;
  path: string;
  component?: any;
  icon?: any;
  children?: IRoute[];
  role?: number[];
}

export const ROUTE_SIDEBAR_ACCOUNT = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: MarketOverView,
    icon: DashboardIcon,
    role: [UserRole.Admin, UserRole.SuperAdmin],
    children: [
      // {
      //   name: 'DRS',
      //   path: routeConstants.DRS,
      //   component: MarketOverView,
      //   icon: IconLibraryBooks,
      //   role: [UserRole.Admin, UserRole.SuperAdmin],
      // },
      {
        name: 'FX cross matrix',
        path: routeConstants.FX_CROSS_MATRIX,
        component: FXCrossMatrix,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'Market overview',
        path: routeConstants.MARKETOVERVIEW,
        component: MarketOverView,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'General settings',
        path: routeConstants.DASHBOARD_GENERALSETTINGS,
        component: GeneralSettings,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
    ],
  },
  {
    name: 'Order book',
    path: '/orderbook',
    component: TradingFeeSetting,
    icon: OrderBookIcon,
    role: [UserRole.Admin, UserRole.SuperAdmin],
    children: [
      {
        name: 'Trading fee settings',
        path: routeConstants.TRADING_FEE_SETTINGS,
        component: TradingFeeSetting,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'Digital credit settings',
        path: routeConstants.DIGITAL_CREDIT_SETTINGS,
        component: DigitalCreditSettings,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'Pair settings',
        path: routeConstants.PAIR_SETTINGS,
        component: Pair,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
    ],
  },
  {
    name: 'Liquidity pool',
    path: '/pools',
    component: PoolDashboard,
    icon: LiquidityPoolIcon,
    role: [UserRole.Admin, UserRole.SuperAdmin],
    children: [
      {
        name: 'Pool dashboard',
        path: routeConstants.POOL_DASHBOARD,
        component: PoolDashboard,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'Pool request',
        path: routeConstants.POOL_REQUEST,
        component: PoolRequestList,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
    ],
  },
  {
    name: 'Manage user',
    path: '/users',
    component: PoolDashboard,
    icon: ManageUserIcon,
    role: [UserRole.Admin, UserRole.SuperAdmin],
    children: [
      {
        name: 'User list',
        path: routeConstants.USERLIST,
        component: UserList,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'User registration',
        path: routeConstants.USERREGISTRATION,
        component: RegistrantionList,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
      {
        name: 'Whitelist address',
        path: routeConstants.WALLETLIST,
        component: WalletList,
        icon: IconLibraryBooks,
        role: [UserRole.Admin, UserRole.SuperAdmin],
      },
    ],
  },
  {
    name: 'Manage admin',
    path: '/admin',
    component: PoolDashboard,
    icon: ManageAdminIcon,
    role: [UserRole.SuperAdmin],
    children: [
      {
        name: 'Admin list',
        path: routeConstants.ADMIN_LIST,
        component: ManageAdmin,
        icon: IconLibraryBooks,
        role: [UserRole.SuperAdmin],
      },
      {
        name: 'Whitelist address',
        path: routeConstants.WHITELIST_ADDRESS,
        component: AdminWhitelist,
        icon: IconLibraryBooks,
        role: [UserRole.SuperAdmin],
      },
    ],
  },
  {
    name: 'History log',
    path: routeConstants.HISTORY_LOG,
    component: HistoryLog,
    icon: HistoryLogIcon,
    role: [UserRole.SuperAdmin],
    children: [],
  },
];

// const OTHER_ROUTE_SIDEBAR = [
//   {
//     name: 'Notification Detail',
//     path: ROUTE_SIDEBAR.account_notification_detail,
//     component: NotificationDetail,
//     icon: IconLibraryBooks,
//   },
// ];

const convertRoute = ({ name, path }: IRoute) => ({ exact: true, name, path });

export const FLATTEN_SIDEBAR_ROUTE = [...ROUTE_SIDEBAR_ACCOUNT].reduce((total: any[], route: IRoute) => {
  const arr: any[] = [];
  !!route.children ? route.children.map((item: IRoute) => arr.push(convertRoute(item))) : convertRoute(route);
  return [...total, ...arr];
}, []);
