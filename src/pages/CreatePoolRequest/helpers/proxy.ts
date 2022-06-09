import Web3 from 'web3';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import { proxyRegistryAddress, zeroAddress } from '../constants/addresses';

export async function isProxyExist(publicKey: string): Promise<boolean> {
  window.web3 = new Web3(window.web3.currentProvider);
  const proxyInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
  const currentProxy = await proxyInstance.methods.proxies(publicKey).call();
  if (currentProxy === zeroAddress) return false;
  return true;
}

export async function buildProxy(publicKey: string): Promise<string> {
  window.web3 = new Web3(window.web3.currentProvider);
  const proxyRegistryInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
  await proxyRegistryInstance.methods.build().send({ from: publicKey });
  return await proxyRegistryInstance.methods.proxies(publicKey).call();
}

export async function getUserProxy(publicKey: string): Promise<string> {
  window.web3 = new Web3(window.web3.currentProvider);
  const proxyRegistryInstance = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
  return await proxyRegistryInstance.methods.proxies(publicKey).call();
}
