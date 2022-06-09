import { qsStringify } from 'src/helpers/query-string';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { IApproveWallet, IFilter, TYPE } from 'src/features/wallet/Constant';
import { ACCESS_CONTROL_ABI } from 'src/constants/abi/access-controll-abi';
import { UserRegistrationStatus } from 'src/features/UserList/Constant';

const initialState = {
  wallets: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  loading: false,
};

const ACTION = {
  GET_WALLETS: 'wallet/list',
  APPROVE_WALLET: 'approve/wallet',
  REJECT_WALLET: 'reject/wallet',
};

export const getWalletsApi = createAsyncThunk(ACTION.GET_WALLETS, async (body?: IFilter) => {
  const res = await axiosInstance.get(
    `/admin/user-wallet${qsStringify({
      ...body,
      user_registration: UserRegistrationStatus.APPROVED,
    })}`,
  );
  return res;
});

export const approveWalletApi = createAsyncThunk(ACTION.APPROVE_WALLET, async (body?: IApproveWallet) => {
  return await axiosInstance.post(`/admin/approve-wallet`, body);
});

export const rejectWalletApi = createAsyncThunk(ACTION.APPROVE_WALLET, async (body?: IApproveWallet) => {
  return await axiosInstance.post(`/admin/reject-wallet`, body);
});

const walletsListSlice = createSlice({
  name: 'getWalletsList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getWalletsApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getWalletsApi.rejected.toString()]: (state) => {
      state.loading = false;
    },
    [getWalletsApi.fulfilled.toString()]: (state, action) => {
      state.loading = false;
      state.wallets = action.payload;
    },
  },
});

export const whiteListAddresses = async (roles: { [address: string]: number }): Promise<void> => {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = await window.web3.eth.getAccounts();
    const contract = new window.web3.eth.Contract(ACCESS_CONTROL_ABI, process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS);
    const UNRESTRICTED_ROLE = await contract.methods.UNRESTRICTED_ROLE().call();
    const RESTRICTED_ROLE = await contract.methods.RESTRICTED_ROLE().call();
    const ADMIN_ROLE = await contract.methods.ADMIN_ROLE().call();
    const dataWhiteList = [];
    for (const address in roles) {
      switch (roles[address]) {
        case TYPE.RESTRICTED_USER:
          dataWhiteList.push({ account: address, role: RESTRICTED_ROLE });
          break;
        case TYPE.UNRESTRICTED_USER:
          dataWhiteList.push({ account: address, role: UNRESTRICTED_ROLE });
          break;
        case TYPE.ADMIN:
          dataWhiteList.push({ account: address, role: ADMIN_ROLE });
          break;
      }
    }
    await contract.methods.grantRoles(dataWhiteList).send({ from: accounts[0] });
  } else {
    window.alert('Non-Ethereum browser detected!');
  }
};

export const revokedAddress = async (addresses: string[]): Promise<boolean> => {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = await window.web3.eth.getAccounts();
    const contract = new window.web3.eth.Contract(ACCESS_CONTROL_ABI, process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS);
    await contract.methods.blacklist(addresses).send({ from: accounts[0] });
    return true;
  } else {
    window.alert('Non-Ethereum browser detected!');
  }
  return false;
};

const { reducer: walletsReducer } = walletsListSlice;
export default walletsReducer;
