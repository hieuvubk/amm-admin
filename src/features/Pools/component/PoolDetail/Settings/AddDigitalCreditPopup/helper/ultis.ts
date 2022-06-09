import { BActions } from 'src/constants/abi/BActions';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import { bActionsAddress, proxyRegistryAddress } from 'src/pages/CreatePoolRequest/constants/addresses';
import { Proxy } from 'src/constants/abi/Proxy';
import Web3 from 'web3';
import { Crp } from 'src/constants/abi/Crp';

export interface NewTokenParam {
  addr: string;
  isCommitted: boolean;
  commitBlock: string;
  denorm: string;
  balance: string;
}

export async function getNewToken(controller: string): Promise<NewTokenParam | undefined> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    const newToken = await CrpInstance.methods.newToken().call();
    return {
      addr: newToken.addr,
      isCommitted: newToken.isCommitted,
      commitBlock: newToken.commitBlock,
      denorm: newToken.denorm,
      balance: newToken.balance,
    };
  }
  return undefined;
}

export interface CommitParams {
  crpAddress: string;
  tokenAddress: string;
  balance: string;
  weight: string;
  account: string;
}

export async function commitAddToken(params: CommitParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const commitInterface = BActions.find((iface) => iface.name === 'commitAddToken');
    const commitParams = [params.crpAddress, params.tokenAddress, params.balance, params.weight];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(commitInterface, commitParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}

export interface ApplyParams {
  crpAddress: string;
  tokenAddress: string;
  tokenAmountIn: string;
  account: string;
}

export async function applyAddToken(params: ApplyParams): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(params.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const applyInterface = BActions.find((iface) => iface.name === 'applyAddToken');
    const applyParams = [params.crpAddress, params.tokenAddress, params.tokenAmountIn];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(applyInterface, applyParams);
    window.web3.eth.handleRevert = true;
    await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: params.account,
    });
  }
}
