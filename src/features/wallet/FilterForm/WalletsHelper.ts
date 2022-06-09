import { AccessControl } from 'src/constants/abi/AccessControl';
import { STATUS, TYPE } from 'src/features/wallet/Constant';
import { aclAddress } from 'src/pages/CreatePoolRequest/constants/addresses';
import Web3 from 'web3';

export const formatUserType = (userType: number): string | undefined => {
  if (userType === TYPE.RESTRICTED_USER) {
    return 'Restricted user';
  }
  if (userType === TYPE.UNRESTRICTED_USER) {
    return 'Unrestricted user';
  }
};
export const formatWalletStatus = (status: number): string | undefined => {
  if (status === STATUS.APPROVED) {
    return 'Approved';
  }
  if (status === STATUS.PENDING) {
    return 'Pending';
  }
  if (status === STATUS.SUBMIT) {
    return 'Submit';
  }
  if (status === STATUS.BLOCK) {
    return 'Reject';
  }
};

export async function checkAdmin(publicKey: string): Promise<boolean> {
  window.web3 = new Web3(window.web3.currentProvider);
  const aclInstance = await new window.web3.eth.Contract(AccessControl, aclAddress);
  const hasAdminRole = await aclInstance.methods.hasRole(Web3.utils.keccak256('ADMIN_ROLE'), publicKey).call();
  const hasSuperAdminRole = await aclInstance.methods
    .hasRole(Web3.utils.keccak256('SUPER_ADMIN_ROLE'), publicKey)
    .call();
  return hasAdminRole || hasSuperAdminRole;
}

export async function checkSuperAdmin(publicKey: string): Promise<boolean> {
  window.web3 = new Web3(window.web3.currentProvider);
  const aclInstance = await new window.web3.eth.Contract(AccessControl, aclAddress);
  const hasSuperAdminRole = await aclInstance.methods
    .hasRole(Web3.utils.keccak256('SUPER_ADMIN_ROLE'), publicKey)
    .call();
  return hasSuperAdminRole;
}
