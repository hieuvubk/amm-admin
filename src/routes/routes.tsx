/* eslint-disable max-len */
import Register from 'src/pages/Register';
import Dashboard from 'src/pages/Dashboard';
import SignIn2 from 'src/pages/SignIn2';
import ForgotPassword from 'src/pages/ForgotPassword';
import List from 'src/features/UserList';
import { routeConstants } from 'src/constants';
import PrivateRoute from './PrivateRoute';
import { Route } from 'react-router-dom';
import RegistrantionList from 'src/features/UsersRegistration/component/Registration';
import RegistrantionDetail from 'src/features/UsersRegistration/component/RegistrationDetail';
import WalletList from 'src/features/wallet/WalletList';
import DigitalCreditSettings from 'src/features/DigitalCreditSettings/components';
import TradingFeeSetting from 'src/features/TradingFee/components/TradingFeeSetting';
import Pair from 'src/pages/Pair/components/Pair';
import OpenOrder from 'src/features/Order/OpenOrder';
import FXCrossMatrix from 'src/features/FXCrossMatrix/components/FXCrossMatrix';
import MarketOverView from 'src/features/MarketOverview/component/MarketOverView';
import GeneralSettings from 'src/pages/Dashboard/GeneralSettings/components/GeneralSettings';

// liquidity pool
import PoolDashboard from 'src/features/Pools/component/PoolDashboard';
import CreatePoolRequest from 'src/pages/CreatePoolRequest';
import PoolDetail from 'src/features/Pools/component/PoolDetail';
import PoolRequestList from 'src/features/PoolRequest/components/PoolRequest';
import PoolRequestRejectDetail from 'src/features/PoolRequest/components/PoolRequestReject';
import PoolRequestPendingDetail from 'src/features/PoolRequest/components/PoolRequestPending';
import LiquidityProvidersSetting from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting';

// manage admin
import AdminDetail from 'src/features/Admin/components/AdminDetail';
import ManageAdmin from 'src/features/Admin/components/ManageAdmin';
import CreateAccount from 'src/features/Admin/components/CreateAccount';

// manage user
import Details from 'src/features/User/components/Details';
import UserDetail from 'src/features/User/components/UserDetail';
import AdminWhitelist from 'src/features/Admin/components/AdminWhitelist';
import HistoryLog from 'src/features/history-log/components/HistoryLog';
import { UserRole } from 'src/constants/user';

// 404 MAIN TAIN
import NotFound from 'src/pages/maintain-notfound/component/404';
import MainTain from 'src/pages/maintain-notfound/component/maintain';
const routers = {
  dashboard: {
    exact: true,
    path: routeConstants.DASHBOARD,
    component: Dashboard,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  fxCrossMatrix: {
    exact: true,
    path: routeConstants.FX_CROSS_MATRIX,
    component: FXCrossMatrix,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  // drs: {
  //   exact: true,
  //   path: routeConstants.DRS,
  //   component: DrsComponent,
  //   route: PrivateRoute,
  //   role: [UserRole.Admin, UserRole.SuperAdmin],
  // },
  marketOverView: {
    exact: true,
    path: routeConstants.MARKETOVERVIEW,
    component: MarketOverView,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  register: {
    exact: true,
    path: routeConstants.REGISTER,
    component: Register,
    route: Route,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  signIn: {
    exact: true,
    path: routeConstants.SIGN_IN,
    component: SignIn2,
    route: Route,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  forgotPassword: {
    exact: true,
    path: routeConstants.FORGOT_PASSWORD,
    component: ForgotPassword,
    route: Route,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  userlist: {
    exact: true,
    path: routeConstants.USERLIST,
    component: List,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  userRegistration: {
    exact: true,
    path: routeConstants.USERREGISTRATION,
    component: RegistrantionList,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  userRegistrationDetail: {
    exact: true,
    path: routeConstants.USERREGISTRATION_DETAIL,
    component: RegistrantionDetail,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  user_detail_details: {
    exact: true,
    path: routeConstants.USER_DETAIL_DETAILS,
    component: Details,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  userDetail: {
    exact: true,
    path: routeConstants.USER_DETAIL,
    component: UserDetail,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  walletlist: {
    exact: true,
    path: routeConstants.WALLETLIST,
    component: WalletList,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  tradingFeeAdmin: {
    exact: true,
    path: routeConstants.TRADING_FEE_SETTINGS,
    component: TradingFeeSetting,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  digitalCreditSettings: {
    exact: true,
    path: routeConstants.DIGITAL_CREDIT_SETTINGS,
    component: DigitalCreditSettings,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  pairsettings: {
    exact: true,
    path: routeConstants.PAIR_SETTINGS,
    component: Pair,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  openOrder: {
    exact: true,
    path: routeConstants.OPEN_ORDER,
    component: OpenOrder,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  dashboard_generalsettings: {
    exact: true,
    path: routeConstants.DASHBOARD_GENERALSETTINGS,
    component: GeneralSettings,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },

  // liquidity pool
  poolDashboard: {
    exact: true,
    path: routeConstants.POOL_DASHBOARD,
    component: PoolDashboard,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  createPoolRequest: {
    exact: true,
    path: routeConstants.NEW_POOL_REQUEST,
    component: CreatePoolRequest,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  poolDetail: {
    exact: true,
    path: routeConstants.POOL_DETAIL,
    component: PoolDetail,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  poolRequest: {
    exact: true,
    path: routeConstants.POOL_REQUEST,
    component: PoolRequestList,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  poolRequestReject: {
    exact: true,
    path: routeConstants.POOL_REQUEST_REJECT_DETAIL,
    component: PoolRequestRejectDetail,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  poolRequestPending: {
    exact: true,
    path: routeConstants.POOL_REQUEST_PENDING_DETAIL,
    component: PoolRequestPendingDetail,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  poolLPerSetting: {
    exact: true,
    path: routeConstants.POOL_LPER_SETTING,
    component: LiquidityProvidersSetting,
    route: PrivateRoute,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },

  // manage admin
  manageAdmin: {
    exact: true,
    path: routeConstants.ADMIN_LIST,
    component: ManageAdmin,
    route: PrivateRoute,
    role: [UserRole.SuperAdmin],
  },
  adminWhitelist: {
    exact: true,
    path: routeConstants.WHITELIST_ADDRESS,
    component: AdminWhitelist,
    route: PrivateRoute,
    role: [UserRole.SuperAdmin],
  },
  createAdmin: {
    exact: true,
    path: routeConstants.ADMIN_CREATE,
    component: CreateAccount,
    route: PrivateRoute,
    role: [UserRole.SuperAdmin],
  },
  adminDetail: {
    exact: true,
    path: routeConstants.ADMIN_DETAIL,
    component: AdminDetail,
    route: PrivateRoute,
    role: [UserRole.SuperAdmin],
  },
  history_log: {
    exact: true,
    path: routeConstants.HISTORY_LOG,
    component: HistoryLog,
    route: PrivateRoute,
    role: [UserRole.SuperAdmin],
  },
  notfound: {
    exact: true,
    path: routeConstants.NOT_FOUND,
    component: NotFound,
    route: Route,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
  maintain: {
    exact: true,
    path: routeConstants.MAIN_TAIN,
    component: MainTain,
    route: Route,
    role: [UserRole.Admin, UserRole.SuperAdmin],
  },
};

export default routers;
