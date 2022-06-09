import { Proxy } from 'src/constants/abi/Proxy';
import Web3 from 'web3';
import { getUserProxy } from './proxy';
import { bActionsAddress, bFactoryAddress, crpFactoryAddress } from '../constants/addresses';
import { BActions } from 'src/constants/abi/BActions';
import request, { gql } from 'graphql-request';

export interface CreateFixPoolParams {
  tokens: string[];
  balances: string[];
  weights: string[];
  swapFee: string;
  protocolFee: string;
  finalize: boolean;
  account: string;
}

export async function createFixPool(params: CreateFixPoolParams): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyAddress = await getUserProxy(params.account);
    const proxyInstance = new window.web3.eth.Contract(Proxy, proxyAddress);
    const createInterface = BActions.find((iface) => iface.name === 'create');
    const createParams = [
      bFactoryAddress,
      params.tokens,
      params.balances,
      params.weights,
      params.swapFee,
      params.protocolFee,
      params.finalize,
    ];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(createInterface, createParams);
    const poolAddress = await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).call({
      from: params.account,
    });
    const POOL = `0x${poolAddress.slice(-40)}`;
    await await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
    return POOL;
  }
  return '';
}

export interface CreateSmartPoolParams {
  poolParams: {
    poolTokenSymbol: string;
    poolTokenName: string;
    constituentTokens: string[];
    tokenBalances: string[];
    tokenWeights: string[];
    swapFee: string;
    protocolFee: string;
  };
  crpParams: {
    initialSupply: string;
    minimumWeightChangeBlockPeriod: number;
    addTokenTimeLockInBlocks: number;
  };
  rights: {
    canPauseSwapping: boolean;
    canChangeSwapFee: boolean;
    canChangeWeights: boolean;
    canAddRemoveTokens: boolean;
    canWhitelistLPs: boolean;
    canChangeCap: boolean;
    canChangeProtocolFee: boolean;
  };
  account: string;
}

export async function getSmartPoolAddress(controller: string): Promise<string> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
    query getPool {
      pools (where: {
        controller: "${controller}", 
      }) {
        id
      }
    }`;
  const result = await request(url, query);
  return result.pools[0].id;
}

export async function isPoolExist(poolAddress: string): Promise<boolean> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
    query getPool {
      pools (where: {
        id: "${poolAddress}", 
      }) {
        id
      }
    }`;
  const result = await request(url, query);
  return result.pools.length > 0 ? true : false;
}

export async function createSmartPool(params: CreateSmartPoolParams): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyAddress = await getUserProxy(params.account);
    const proxyInstance = new window.web3.eth.Contract(Proxy, proxyAddress);
    const createInterface = BActions.find((iface) => iface.name === 'createSmartPool');
    const createParams = [crpFactoryAddress, bFactoryAddress, params.poolParams, params.crpParams, params.rights];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(createInterface, createParams);
    const poolAddress = await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).call({
      from: params.account,
    });
    const controller = `0x${poolAddress.slice(-40)}`;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({ from: params.account });
    const POOL = await getSmartPoolAddress(controller);
    return POOL;
  }
  return '';
}
