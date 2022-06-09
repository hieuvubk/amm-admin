import BigNumber from 'bignumber.js';

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function denormalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(amount, tokenDecimals);
}

export function normalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(new BigNumber(amount), -tokenDecimals);
}
