import { BActions } from 'src/constants/abi/BActions';
import { Crp } from 'src/constants/abi/Crp';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import {
  bActionsAddress,
  proxyRegistryAddress,
  whitelistAddress,
} from 'src/pages/CreatePoolRequest/constants/addresses';
import axiosInstance from 'src/services/config';
import Web3 from 'web3';
import { Proxy } from 'src/constants/abi/Proxy';
import { whitelistABI } from 'src/constants/abi/whitelistABI';
import _, { Dictionary } from 'lodash';
import { setSnackbarError } from 'src/components/Snackbar';

export interface WalletInfor {
  id: number;
  address: string;
  network: number;
  status: number;
  created_at: string;
  user_id: number;
  user_email: string;
  user_type: number;
  user_status: number;
}

export interface Metadata {
  page: number;
  limit: number;
  totalItem: number;
  totalPage: number;
}

export interface WalletParams {
  page?: number;
  user_type?: number;
  limit?: number;
  network?: number;
  status?: number;
  user_registration?: number;
}

export const getBSCWalletsData = async ({
  page = 1,
  limit = 100,
  network = 2,
  status = 1,
  user_registration = 3,
  user_type,
}: WalletParams): Promise<{ data: WalletInfor[]; metadata: Metadata }> => {
  try {
    const response = await axiosInstance.get('/admin/user-wallet', {
      params: {
        page: page,
        limit: limit,
        network: network,
        status: status,
        user_registration: user_registration,
        user_type: user_type,
      },
    });

    return response as unknown as { data: WalletInfor[]; metadata: Metadata };
  } catch (error) {
    setSnackbarError(error.response.data.message);
    throw error;
  }
};

export async function getBSCWallets(user_type?: number): Promise<Dictionary<WalletInfor[]>> {
  let page = 1;
  let totalPage = 1;
  let data = [] as Array<WalletInfor>;

  while (page <= totalPage) {
    const response = await getBSCWalletsData({ page: page, user_type: user_type });
    data = [...data, ...response.data];
    totalPage = response.metadata.totalPage;
    page++;
  }

  const result = _.groupBy(data, function (data) {
    return data.user_id;
  });

  return result;
}

export async function canProvideLiquidity(publicKey: string, controller: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.canProvideLiquidity(publicKey).call();
  }
  return false;
}

export async function hasRestrictedRole(publicKey: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const fcxInstance = new window.web3.eth.Contract(whitelistABI, whitelistAddress);
    return await fcxInstance.methods.hasRole(Web3.utils.keccak256('RESTRICTED_ROLE'), publicKey).call();
  }
  return false;
}

export async function hasUnrestrictedRole(publicKey: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const fcxInstance = new window.web3.eth.Contract(whitelistABI, whitelistAddress);
    return await fcxInstance.methods.hasRole(Web3.utils.keccak256('UNRESTRICTED_ROLE'), publicKey).call();
  }
  return false;
}

export interface WhitelistParams {
  crpAddress: string;
  provider: string[];
  account: string;
}

export async function whitelistLiquidityProvider(params: WhitelistParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const whitelistInterface = BActions.find((iface) => iface.name === 'whitelistLiquidityProvider');
    const whitelistParams = [params.crpAddress, params.provider];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(whitelistInterface, whitelistParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export async function removeWhitelistedLiquidityProvider(params: WhitelistParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const removeInterface = BActions.find((iface) => iface.name === 'removeWhitelistedLiquidityProvider');
    const removeParams = [params.crpAddress, params.provider];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(removeInterface, removeParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface WhitelistAllParams {
  crp: string;
  isLimit: boolean;
  account: string;
}

export async function switchSetting(params: WhitelistAllParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const whitelistInterface = BActions.find((iface) => iface.name === 'setCanWhitelistLPs');
    const whitelistParams = [params.crp, params.isLimit];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(whitelistInterface, whitelistParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}
