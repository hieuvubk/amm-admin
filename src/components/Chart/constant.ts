export const COLOR_CHART: { [key: string]: string } = {
  vSGD: '#F84960',
  vEUR: '#6E7191',
  vUSD: '#40A92E',
  USDT: '#26a17b',
  vTHB: '#5664DE',
  vCHF: '#3A9CD7',
  FPT: '#1A88C9',
};

export const getTokenDonutColor = (tokenSymbol: string): string => {
  return COLOR_CHART[tokenSymbol] || '#000000';
};
