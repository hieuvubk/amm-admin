import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import Web3 from 'web3';
import { gql, request } from 'graphql-request';
import { Crp } from 'src/constants/abi/Crp';
import { BActions } from 'src/constants/abi/BActions';
import { Proxy } from 'src/constants/abi/Proxy';
import { normalizeBalance } from 'src/pages/CreatePoolRequest/helpers/utils';
import BigNumber from 'src/helpers/bignumber';
import { BPool } from 'src/constants/abi/BPool';
import axiosInstance from 'src/services/config';

const proxyRegistryAddress = process.env.REACT_APP_PROXY_REGISTRY_ADDRESS || '';
export const zeroAddress = '0x0000000000000000000000000000000000000000';
export const bActionsAddress = process.env.REACT_APP_BACTIONS_ADDRESS || '';
export const crpAddress = process.env.REACT_APP_CRP_ADDRESS || '';

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

export interface Rights {
  0: boolean;
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
  canAddRemoveTokens: boolean;
  canChangeCap: boolean;
  canChangeProtocolFee: boolean;
  canChangeSwapFee: boolean;
  canChangeWeights: boolean;
  canPauseSwapping: boolean;
  canWhitelistLPs: boolean;
}

export async function getRights(controller: string): Promise<Rights | undefined> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.rights().call();
  }
  return undefined;
}

export async function getAddTokenName(address: string): Promise<string> {
  const token = await axiosInstance.get('/coins/list');
  const tokenSymbol = token.data.find(
    (coin: { bsc_address: string }) => coin.bsc_address.toLowerCase() === address.toLowerCase(),
  )?.symbol;
  return tokenSymbol;
}

export interface SetFeeParams {
  poolAddress: string;
  newFee: string;
  account: string;
}

export async function newSwapFee(params: SetFeeParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const swapFeeInterface = BActions.find((iface) => iface.name === 'setSwapFee');
    const swapFeeParams = [params.poolAddress, params.newFee];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(swapFeeInterface, swapFeeParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export async function newProtocolFee(params: SetFeeParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const protocolFeeInterface = BActions.find((iface) => iface.name === 'setProtocolFee');
    const protocolFeeParams = [params.poolAddress, params.newFee];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(protocolFeeInterface, protocolFeeParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface SetRolesParams {
  poolAddress: string;
  restricted: boolean;
  unrestricted: boolean;
  account: string;
}

export async function setRoles(params: SetRolesParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const ADMIN_ROLE = Web3.utils.keccak256('ADMIN_ROLE');
    const RESTRICTED_ROLE = Web3.utils.keccak256('RESTRICTED_ROLE');
    const UNRESTRICTED_ROLE = Web3.utils.keccak256('UNRESTRICTED_ROLE');

    const roles = [ADMIN_ROLE];
    if (params.restricted) {
      roles.push(RESTRICTED_ROLE);
    }
    if (params.unrestricted) {
      roles.push(UNRESTRICTED_ROLE);
    }

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const setRolesInterface = BActions.find((iface) => iface.name === 'setRoles');
    const setRolesParams = [params.poolAddress, roles];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(setRolesInterface, setRolesParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export async function getPoolCap(controller: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    const cap = await CrpInstance.methods.bspCap().call();
    return normalizeBalance(new BigNumber(cap), 18).toString();
  }
  return '';
}

export interface Roles {
  restricted: boolean;
  unrestricted: boolean;
}

export async function poolRoles(poolAddress: string): Promise<Roles | undefined> {
  const RESTRICTED_ROLE = Web3.utils.keccak256('RESTRICTED_ROLE');
  const UNRESTRICTED_ROLE = Web3.utils.keccak256('UNRESTRICTED_ROLE');
  if (window.ethereum) {
    await window.ethereum.enable();
  }
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const poolInstance = new window.web3.eth.Contract(BPool, poolAddress);
    const roles = await poolInstance.methods.getRoles().call();
    const restricted = roles.includes(RESTRICTED_ROLE);
    const unrestricted = roles.includes(UNRESTRICTED_ROLE);
    return {
      restricted: restricted,
      unrestricted: unrestricted,
    };
  }
  return undefined;
}

export interface ChangeCapParams {
  poolAddress: string;
  newCap: string;
  account: string;
}

export async function changeCap(params: ChangeCapParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const changeCapInterface = BActions.find((iface) => iface.name === 'setCap');
    const changeCapParams = [params.poolAddress, params.newCap];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(changeCapInterface, changeCapParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export async function isPoolTokensUpdate(poolAddress: string, newPoolTokensLength: number): Promise<boolean> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
          query getPool {
              pools (where: {
              id: "${poolAddress}", 
              }) {
              tokensList
              }
          }`;
  const result = await request(url, query);
  const tokensList = result.pools[0].tokensList;
  return tokensList.length === newPoolTokensLength;
}

export interface NewWeightParams {
  [token: string]: string;
}

export async function isWeightsUpdate(poolAddress: string, newWeight: NewWeightParams): Promise<boolean> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
          query getPool {
              pools (where: {
                id: "${poolAddress}", 
              }) {
                tokens {
                  id
                  denormWeight
                }
              }
          }`;
  const result = await request(url, query);
  const tokens = result.pools[0].tokens;
  let check = true;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!new BigNumber(token.denormWeight).eq(new BigNumber(newWeight[token.id]))) {
      check = false;
      break;
    }
  }
  return check;
}
