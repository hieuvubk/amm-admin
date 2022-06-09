import { erc20Abi } from 'src/constants/abi/erc20Abi';
import { constants } from 'ethers';
import Web3 from 'web3';
import { AccessControl } from 'src/constants/abi/AccessControl';
import { aclAddress, zeroAddress } from '../constants/addresses';
import BigNumber from 'src/helpers/bignumber';
import axiosInstance from 'src/services/config';
import { getUserProxy } from './proxy';

export async function getUserBalance(publicKey: string, token: string): Promise<string> {
  window.web3 = new Web3(window.web3.currentProvider);
  const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
  return await tokenInstance.methods.balanceOf(publicKey).call();
}

export async function checkApprove(publicKey: string, proxy: string, token: string): Promise<boolean> {
  window.web3 = new Web3(window.web3.currentProvider);
  const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
  const allowance = await tokenInstance.methods.allowance(publicKey, proxy).call();
  if (new BigNumber(allowance).gt(new BigNumber(0))) return true;
  return false;
}

export async function approve(publicKey: string, proxy: string, token: string): Promise<void> {
  window.web3 = new Web3(window.web3.currentProvider);
  const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
  await tokenInstance.methods.approve(proxy, constants.MaxUint256).send({ from: publicKey });
}

export async function hasAdminRole(publicKey: string): Promise<boolean> {
  window.web3 = new Web3(window.web3.currentProvider);
  const aclInstance = await new window.web3.eth.Contract(AccessControl, aclAddress);
  return await aclInstance.methods.hasRole(Web3.utils.keccak256('ADMIN_ROLE'), publicKey).call();
}

export interface TokenBalance {
  [tokenAddress: string]: string;
}

export async function getTokenBalance(publicKey: string): Promise<TokenBalance> {
  window.web3 = new Web3(window.web3.currentProvider);
  const result = await axiosInstance.get('/coins/list');
  const balances: TokenBalance = {};
  Promise.all(
    result.data.map(async (token: { bsc_address: string }) => {
      const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token.bsc_address);
      const singleBalance = await tokenInstance.methods.balanceOf(publicKey).call();
      balances[token.bsc_address.toLowerCase()] = singleBalance;
    }),
  );
  return balances;
}

export interface TokenApprove {
  [tokenAddress: string]: boolean;
}

export async function getTokenApprove(publicKey: string): Promise<TokenApprove> {
  window.web3 = new Web3(window.web3.currentProvider);
  const result = await axiosInstance.get('/coins/list');
  const approved: TokenApprove = {};
  await Promise.all(
    result.data.map(async (token: { bsc_address: string }) => {
      const proxy = await getUserProxy(publicKey);
      if (proxy === zeroAddress) {
        approved[token.bsc_address.toLowerCase()] = false;
      } else {
        approved[token.bsc_address.toLowerCase()] = await checkApprove(
          publicKey,
          proxy,
          token.bsc_address.toLowerCase(),
        );
      }
    }),
  );
  return approved;
}
