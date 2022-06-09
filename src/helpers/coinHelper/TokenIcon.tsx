import React from 'react';
import {
  coinDAI,
  coinKINE,
  coinUSDC,
  coinUSDT,
  coinvCHF,
  coinvEUR,
  coinvSGD,
  coinvTHB,
  coinvUSD,
} from 'src/assets/icon';

const TokenIconSet: Record<string, string> = {
  DAI: coinDAI,
  KINE: coinKINE,
  USDC: coinUSDC,
  USDT: coinUSDT,
  vCHF: coinvCHF,
  vEUR: coinvEUR,
  vSGD: coinvSGD,
  vTHB: coinvTHB,
  vUSD: coinvUSD,
  vGBP: coinvUSD,
};

interface Props {
  name: keyof typeof TokenIconSet;
  size?: number | string;
}

const TokenIcon: React.FC<Props> = ({ name, size = 20 }) => {
  return <img src={TokenIconSet[name]} width={`${size}px`} height={`${size}px`} />;
};

export default TokenIcon;
