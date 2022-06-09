import BigNumber from 'bignumber.js';
import { BActions } from 'src/constants/abi/BActions';
import { Proxy } from 'src/constants/abi/Proxy';
import { Crp } from 'src/constants/abi/Crp';
import { constants } from 'ethers';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import { gql, request } from 'graphql-request';
import Web3 from 'web3';
import { erc20Abi } from 'src/constants/abi/erc20Abi';

const proxyRegistryAddress = process.env.REACT_APP_PROXY_REGISTRY_ADDRESS || '';
const bActionsAddress = process.env.REACT_APP_BACTIONS_ADDRESS || '';
export const zeroAddress = '0x0000000000000000000000000000000000000000';
const AVG_BLOCK_TIMES = 3;
const BONE = new BigNumber(10).pow(18);

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

export async function getCurrentBlock(): Promise<number> {
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider);
    return await web3.eth.getBlockNumber();
  }
  return 0;
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

export async function approve(publicKey: string, proxy: string, token: string): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    await tokenInstance.methods.approve(proxy, constants.MaxUint256).send({ from: publicKey });
  }
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

export function blockNumberToTimestamp(currentTime: string, currentBlockNumber: string, blockNumber: string): number {
  const avgBlockTime = AVG_BLOCK_TIMES;
  return Number(currentTime) + avgBlockTime * 1000 * (Number(blockNumber) - Number(currentBlockNumber));
}

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

export function toWei(val: string | BigNumber): BigNumber {
  return scale(new BigNumber(val.toString()), 18).integerValue();
}

export function calcSingleInGivenWeightIncrease(
  tokenBalance: BigNumber,
  tokenWeight: BigNumber,
  tokenWeightNew: BigNumber,
): BigNumber {
  const deltaWeight = tokenWeightNew.minus(tokenWeight);
  const tokenBalanceIn = tokenBalance.times(deltaWeight.div(tokenWeight));
  return tokenBalanceIn;
}

export function calcPoolInGivenWeightDecrease(
  totalWeight: BigNumber,
  tokenWeight: BigNumber,
  tokenWeightNew: BigNumber,
  poolSupply: BigNumber,
): BigNumber {
  const deltaWeight = tokenWeight.minus(tokenWeightNew);
  const poolAmountIn = bmul(poolSupply, bdiv(deltaWeight, totalWeight));
  return poolAmountIn;
}

export interface GraduallyParams {
  poolAddress: string;
  newWeights: string[];
  startBlock: number;
  endBlock: number;
  account: string;
}

export async function updateWeightsGradually(params: GraduallyParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const joinPoolInterface = BActions.find((iface) => iface.name === 'updateWeightsGradually');
    const updateParams = [params.poolAddress, params.newWeights, params.startBlock, params.endBlock];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(joinPoolInterface, updateParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface IncreaseWeightParams {
  poolAddress: string;
  token: string;
  newWeight: string;
  tokenAmountIn: string;
  account: string;
}
export async function increaseWeight(params: IncreaseWeightParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);
    const joinPoolInterface = BActions.find((iface) => iface.name === 'increaseWeight');
    const updateParams = [params.poolAddress, params.token, params.newWeight, params.tokenAmountIn];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(joinPoolInterface, updateParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface DecreaseWeightParams {
  poolAddress: string;
  token: string;
  newWeight: string;
  poolAmountIn: string;
  account: string;
}
export async function decreaseWeight(params: DecreaseWeightParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);
    const joinPoolInterface = BActions.find((iface) => iface.name === 'decreaseWeight');
    const updateParams = [params.poolAddress, params.token, params.newWeight, params.poolAmountIn];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(joinPoolInterface, updateParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface GradualUpdateParams {
  startBlock: number;
  endBlock: number;
}

export async function getGradualUpdateStatus(controller: string): Promise<GradualUpdateParams> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.gradualUpdate().call();
  }
  return {
    startBlock: 0,
    endBlock: 0,
  };
}

export async function pokeWeights(controller: string, publicKey: string): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.pokeWeights().send({ from: publicKey });
  }
}
