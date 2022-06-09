import Web3 from 'web3';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import { erc20Abi } from 'src/constants/abi/erc20Abi';
import BigNumber from 'bignumber.js';
import { gql, request } from 'graphql-request';
import { Crp } from 'src/constants/abi/Crp';
import { BActions } from 'src/constants/abi/BActions';
import { constants } from 'ethers';
import { Proxy } from 'src/constants/abi/Proxy';

const ADD_REMOVE_TOKENS = 3;
const BONE = new BigNumber(10).pow(18);
const proxyRegistryAddress = process.env.REACT_APP_PROXY_REGISTRY_ADDRESS || '';
export const zeroAddress = '0x0000000000000000000000000000000000000000';
export const bActionsAddress = process.env.REACT_APP_BACTIONS_ADDRESS || '';
export const crpAddress = process.env.REACT_APP_CRP_ADDRESS || '';

export function bmul(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(b);
  const c1 = c0.plus(BONE.div(new BigNumber(2)));
  const c2 = c1.idiv(BONE);
  return c2;
}

export function bdiv(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(BONE);
  const c1 = c0.plus(b.div(new BigNumber(2)));
  const c2 = c1.idiv(b);
  return c2;
}

export async function isProxyExist(publicKey: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const currentProxy = await proxyInstance.methods.proxies(publicKey).call();
    if (currentProxy === zeroAddress) return false;
    return true;
  }
  return false;
}

export async function buildProxy(publicKey: string): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyRegistryInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    await proxyRegistryInstance.methods.build().send({ from: publicKey });
    return await proxyRegistryInstance.methods.proxies(publicKey).call();
  }
}

export async function getUserProxy(publicKey: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyRegistryInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    return await proxyRegistryInstance.methods.proxies(publicKey).call();
  }
  return '';
}

export async function checkApprove(publicKey: string, proxy: string, token: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    const allowance = await tokenInstance.methods.allowance(publicKey, proxy).call();
    return new BigNumber(allowance).gt(0);
  }
  return false;
}

export async function getCrpController(poolAddress: string, callData: string): Promise<string> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
        query getPool {
            pools (where: {
            id: "${poolAddress}", 
            }) {
            crpController
            controller
            }
        }`;
  const result = await request(url, query);
  if (callData === 'crpController') return result.pools[0].crpController;
  else if (callData === 'controller') return result.pools[0].controller;
  else return '';
}

export async function getTotalShares(controller: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.totalSupply().call();
  }
  return '';
}

export async function canChangeToken(controller: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.hasPermission(ADD_REMOVE_TOKENS).call();
  }
  return false;
}

export function calcPoolInGivenTokenRemove(
  totalWeight: BigNumber,
  tokenWeight: BigNumber,
  poolSupply: BigNumber,
): BigNumber {
  const poolAmountIn = bdiv(bmul(poolSupply, tokenWeight), totalWeight);
  return poolAmountIn;
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function denormalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(new BigNumber(amount), tokenDecimals);
}

export function normalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(new BigNumber(amount), -tokenDecimals);
}

export interface RemoveTokenParams {
  poolAddress: string;
  token: string;
  poolAmountIn: string;
  account: string;
}

export async function removeToken(params: RemoveTokenParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const removeTokenInterface = BActions.find((iface) => iface.name === 'removeToken');
    const removeParams = [params.poolAddress, params.token, params.poolAmountIn];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(removeTokenInterface, removeParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export async function approve(publicKey: string, proxy: string, token: string): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    await tokenInstance.methods.approve(proxy, constants.MaxUint256).send({ from: publicKey });
  }
}

export async function getLPBalance(publicKey: string, controller: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, controller);
    const balance = await tokenInstance.methods.balanceOf(publicKey).call();
    return balance;
  }
  return '';
}
