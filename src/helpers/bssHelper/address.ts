import Web3 from 'web3';

export const isBscAddress = async (address: string): Promise<boolean> => {
  if (!address || address === 'all' || !address.includes('0x')) return false;
  try {
    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      return (await web3.eth.getCode(address)) === '0x';
    } else return false;
  } catch (error) {
    throw error;
  }
};
