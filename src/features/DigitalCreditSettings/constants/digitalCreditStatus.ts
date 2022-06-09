export enum STATUS {
  LOCKED,
  UNLOCKED,
}

const DIGITAL_CREDIT_STATUS = [
  { value: STATUS.UNLOCKED, label: 'Active' },
  { value: STATUS.LOCKED, label: 'Disabled' },
];
export const STELLAR = 'https://stellar.expert/explorer/public/asset';
export const STELLAR_DEV = 'https://stellar.expert/explorer/testnet/asset';
export const BSC = 'https://bscscan.com';
export const BSC_DEV = 'https://testnet.bscscan.com';
export default DIGITAL_CREDIT_STATUS;
