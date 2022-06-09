const DASHBOARD = '/';
const REGISTER = '/register';
const SIGN_IN = '/sign-in';
const FORGOT_PASSWORD = '/forgot-password';
const NOT_FOUND = '/not-found';
const MAIN_TAIN = '/maintain';

// dashboard
const DRS = '/dashboard/drs';
const MARKETOVERVIEW = '/dashboard/market-overview';
const DASHBOARD_GENERALSETTINGS = '/dashboard/general-settings';
const FX_CROSS_MATRIX = '/dashboard/fx-cross-matrix';

// order book
const TRADING_FEE_SETTINGS = '/orderbook/trading-fee-settings';
const DIGITAL_CREDIT_SETTINGS = '/orderbook/digital-credit-setting';
const PAIR_SETTINGS = '/orderbook/pair-setting';

// liquidity pool
const POOL_DASHBOARD = '/pools/dashboard';
const POOL_REQUEST = '/pools-request/list';
const POOL_REQUEST_REJECT_DETAIL = '/pools-request/rejected/:id';
const POOL_REQUEST_PENDING_DETAIL = '/pools-request/pending/:id';
const POOL_DETAIL = '/pools/:poolId';
const POOL_LPER_SETTING = '/pools/:poolId/liquidity-providers-setting';
const NEW_POOL_REQUEST = '/pools/new-request';

// manage user
const USERLIST = '/users/list';
const USER_DETAIL = '/users/:userId';
const USERREGISTRATION = '/users/user-registration';
const USERREGISTRATION_DETAIL = '/users/user-registration/:id';
const WALLETLIST = '/users/wallet/list';
const OPEN_ORDER = '/open-order';
const USER_DETAIL_DETAILS = '/users/:userId/details';

// manage admin
const ADMIN_LIST = '/admin/list';
const ADMIN_CREATE = '/admin/create';
const ADMIN_DETAIL = '/admin/:adminId';
const WHITELIST_ADDRESS = '/admin/whitelist';

const HISTORY_LOG = '/history-log';

export default {
  NOT_FOUND,
  MAIN_TAIN,
  DASHBOARD,
  MARKETOVERVIEW,
  REGISTER,
  SIGN_IN,
  FORGOT_PASSWORD,
  DRS,
  USERLIST,
  PAIR_SETTINGS,

  TRADING_FEE_SETTINGS,
  DIGITAL_CREDIT_SETTINGS,
  DASHBOARD_GENERALSETTINGS,
  FX_CROSS_MATRIX,

  // liquidity pool
  POOL_DASHBOARD,
  POOL_REQUEST,
  NEW_POOL_REQUEST,
  POOL_DETAIL,
  POOL_REQUEST_REJECT_DETAIL,
  POOL_REQUEST_PENDING_DETAIL,
  POOL_LPER_SETTING,

  // admin
  ADMIN_LIST,
  ADMIN_CREATE,
  ADMIN_DETAIL,

  // user
  USER_DETAIL,
  USERREGISTRATION,
  USERREGISTRATION_DETAIL,
  WALLETLIST,
  OPEN_ORDER,
  USER_DETAIL_DETAILS,

  // Whitelist address
  WHITELIST_ADDRESS,

  HISTORY_LOG,
};
