import BigNumber from 'src/helpers/bignumber';
import { denormalizeBalance } from 'src/pages/CreatePoolRequest/helpers/utils';

export const DEFAULT_WEIGHT_CHANGE_DURATION = 1;
export const DEFAULT_ADD_TOKEN_TIMELOCK = 1;
export const DEFAULT_INITIAL_SUPPLY = 100;
export const MIN_DECIMAL = 5;

export const MIN_FEE = denormalizeBalance(new BigNumber(1), 12); // MIN_FEE = 10**18 / 10**6
export const MAX_FEE = denormalizeBalance(new BigNumber(1), 18); // MAX_FEE = 10**18 / 10
export const MAX_WEIGHT = new BigNumber(50).times(denormalizeBalance(new BigNumber(1), 18)); // MAX_WEIGHT = 50 * 10**18
export const MIN_WEIGHT = denormalizeBalance(new BigNumber(1), 18); // MIN_WEIGHT = 10**18
export const MIN_BALANCE = denormalizeBalance(new BigNumber(1), 4); // MIN_BALANCE =  10**18 / 10**14
export const MAX_BALANCE = denormalizeBalance(new BigNumber(1), 30); // MAX_BALNCE = 10**18 * 10**12
export const MAX_PERCENTAGE = 96;
export const MIN_PERCENTAGE = 4;

export enum WalletState {
  Unknown = 1,
  NeedAdminRole = 2,
  NeedProxy = 3,
  CanCreatePool = 4,
}

export const maxDigitsAfterDecimalRegex = (numDigits = 2): RegExp =>
  new RegExp(String.raw`^$|^\d+(\.\d{0,${numDigits}})?$`); //;
export const floatNumberRegex = /^$|^\d+(\.\d*)?$/;
export const numberRegex = /^$|^\d+$/;
export const tokensAddressRegex = /0[xX][0-9a-fA-F]+/;

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  MAX_DIGITS_AFTER_DECIMAL: 'Only 2 number digits after the period',
  FEE_SUM_ERROR: 'The total of Velo admin’s fee and Liquidity provider’s fee must be equal to Swap fee',
  WEIGHT_SMALLER_THAN_1: 'Weight can’t be smaller than 1',
  AMOUNT_NOT_0_ERROR: 'Amount of the digital credit can not be 0',
  TOTAL_LP_TOKEN_NOT_0_ERROR: 'Total LP token supply can not be 0',
  AMOUNT_INVALID: 'Amount must be between 0.1 and 1.000.000.000.000',
  FEE_NOT_0_ERROR: 'This fee can not be 0',
  MESSAGE_LENGTH_ERROR: 'Your input can not be shorter than 10 characters or longer than 500 characters',
  EXCEED_BALANCE: 'Your balance is not enough',
  TOTAL_WEIGHT_INVALID: 'Total weight must be between 1 and 50',
  PERCENTAGE_INVALID: 'Sorry, the weight range is limited from 4% to 96%',
  FEE_INVALID: 'Swap fee has to be bigger than 0.01% and smaller than 100%',
};

export const AMOUNT_TOOLTIP = {
  LOCK: 'Calculate digital credit amount using market value.',
  UNLOCK: 'Enter digital credit amount manually',
};
