export const renderAddressWallet = (address: string): string =>
  address ? address.slice(0, 5) + '...' + address.slice(-3) : '';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const renderCurrency = <T>(value: Array<T>) =>
  Array.length > 0 ? (Array.length - 1 ? value.join('').toUpperCase() : value.join(', ').toUpperCase()) : Array;
