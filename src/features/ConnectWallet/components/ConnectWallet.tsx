/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import {
  checkConnectedWalletAfterReload,
  connectMetaMask,
  getCurrentChainId,
  isConnected,
  isCorrectNetworkBsc,
} from 'src/features/ConnectWallet/helpers/connectWallet';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  setAddressIsUsedWarning,
  setBsc,
  setInstallationRequestWarning,
  setOpenAlreadyWhitelistDialog,
  setOpenConnectDialog,
  setOpenWarningModal,
  setWalletAddressForWhiteListing,
} from 'src/features/ConnectWallet/redux/wallet';
import { checkWhitelistBSC, createUserWallet } from 'src/features/ConnectWallet/service';
import { ButtonBase } from '@material-ui/core';
import ArrowDown from 'src/assets/icon/ArrowDown';
import StellarSVG from 'src/assets/icon/StellarSVG';
import BscSVG from 'src/assets/icon/BscSVG';
import AddContainedSVG from 'src/assets/icon/AddContainedSVG';
import { THEME_MODE } from 'src/interfaces/theme';
import classnames from 'classnames/bind';
import styles from 'src/features/ConnectWallet/styles/ConnectWallet.module.scss';
import PrimaryButton from 'src/components/PrimaryButton';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';
import useClickOutside from 'src/hooks/useClickOutside';
import { DialogData } from 'src/features/ConnectWallet/interfaces/WalletData';
import {
  MISSING_EXTENSION_ERROR,
  SoftwareWalletType,
} from 'src/features/ConnectWallet/constants/uninstallExtensionException';

const cx = classnames.bind(styles);

const ConnectWallet: React.FC = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const theme = useAppSelector((state) => state.theme.themeMode);
  // const [toggleErrorIconBsc, setToggleErrorIconBsc] = useState<boolean>(!isCorrectNetworkBsc(getCurrentChainId()));
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const ref = useRef<any>();
  const dispatch = useAppDispatch();

  // Drop down
  const handleOpenDropdown = () => {
    setOpenDropdown(true);
  };
  const handleCloseDropdown = () => {
    setOpenDropdown(false);
  };
  useClickOutside(ref, handleCloseDropdown);

  // connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // already whitelist dialog
  const handleOpenAlreadyWhitelistDialog = () => {
    dispatch(setOpenAlreadyWhitelistDialog(true));
  };

  // warning address is used
  const handleOpenAddressIsUsedWarning = (dialogData: DialogData) => {
    dispatch(setAddressIsUsedWarning(dialogData));
  };

  // get short address
  const getShortAddress = (address: string) => {
    return address.slice(0, 2) + '...' + address.slice(-4);
  };
  const getShortAddressFromPrivateKey = (secret: string) => {
    const publicKey = getPublicKeyFromPrivateKey(secret);
    return publicKey.slice(0, 2) + '...' + publicKey.slice(-4);
  };

  const fetchDataIfConnected = async () => {
    // auto connect if : already connect and correct chainId
    if ((await checkConnectedWalletAfterReload()) && isCorrectNetworkBsc(getCurrentChainId())) {
      try {
        const publicKey = await connectMetaMask();
        const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
        if (createUserWalletResponse === 1) {
          if (await checkWhitelistBSC(publicKey)) {
            dispatch(setBsc(publicKey));
            // dispatch(setWalletAddressForWhiteListing(publicKey));
          } else {
            dispatch(setWalletAddressForWhiteListing(publicKey));
            dispatch(setOpenWarningModal(true));
          }
        }
      } catch (e) {
        if (e.message === MISSING_EXTENSION_ERROR) {
          dispatch(setInstallationRequestWarning({ open: true, walletType: SoftwareWalletType.METAMASK }));
        }
      }
    }
  };
  // handle change and disconnect account in MetaMask
  const handleAccountChange = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: any) => {
        const publicKey = accounts[0];
        if (accounts.length !== 0) {
          const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
          if (!!(publicKey && createUserWalletResponse === 1)) {
            if (await checkWhitelistBSC(publicKey)) {
              if (currentUser.id) {
                dispatch(setBsc(publicKey));
              }
            } else {
              dispatch(setWalletAddressForWhiteListing(publicKey));
              dispatch(setBsc(''));
              dispatch(setOpenWarningModal(true));
            }
          } else if (createUserWalletResponse === 2) {
            dispatch(setBsc(''));
            dispatch(setWalletAddressForWhiteListing(publicKey));
            handleOpenAlreadyWhitelistDialog();
          } else {
            dispatch(setBsc(''));
            handleOpenAddressIsUsedWarning({
              open: true,
              address: publicKey,
            });
          }
        } else {
          dispatch(setBsc(''));
        }
      });
    }
  };
  // const handleChainChange = () => {
  //   if (window.ethereum) {
  //     window.ethereum.on('chainChanged', (chainId: string) => {
  //       dispatch(setOpenWrongNetworkWarning(!isCorrectNetworkBsc(chainId)));
  //       setToggleErrorIconBsc(!isCorrectNetworkBsc(getCurrentChainId()));
  //     });
  //   }
  // };

  useEffect(() => {
    handleAccountChange();
    // handleChainChange();
  }, [currentUser.id]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchDataIfConnected();
    }
  }, [currentUser.id]);

  // useEffect(() => {
  //   setToggleErrorIconBsc(!isCorrectNetworkBsc(getCurrentChainId()));
  // }, [window.ethereum?.chainId]);

  useEffect(() => {
    handleCloseDropdown();
  }, [wallet]);

  return (
    <>
      {isConnected(wallet) ? (
        <>
          <div className={cx('button')} onClick={handleOpenDropdown}>
            Connected wallet <ArrowDown size={'md'} />
            <div className={cx('select', !openDropdown && 'close')} ref={ref}>
              {wallet.freighter ? (
                <a href={`${process.env.REACT_APP_FCX_PAGE}/user/dashboard/balances`} className={cx('stellar-account')}>
                  <StellarSVG size={'md'} />
                  {getShortAddress(wallet.freighter)}
                </a>
              ) : null}
              {wallet.trezor.publicKey ? (
                <a href={`${process.env.REACT_APP_FCX_PAGE}/user/dashboard/balances`} className={cx('stellar-account')}>
                  <StellarSVG size={'md'} />
                  {getShortAddress(wallet.trezor.publicKey)}
                </a>
              ) : null}
              {wallet.ledger.publicKey ? (
                <a href={`${process.env.REACT_APP_FCX_PAGE}/user/dashboard/balances`} className={cx('stellar-account')}>
                  <StellarSVG size={'md'} />
                  {getShortAddress(wallet.ledger.publicKey)}
                </a>
              ) : null}
              {wallet.privateKey ? (
                <a href={`${process.env.REACT_APP_FCX_PAGE}/user/dashboard/balances`} className={cx('stellar-account')}>
                  <StellarSVG size={'md'} />
                  {/* get stellar public key from private key*/}
                  {getShortAddressFromPrivateKey(wallet.privateKey)}
                </a>
              ) : null}
              {wallet.bsc ? (
                <a href={`${process.env.REACT_APP_FCX_PAGE}/user/dashboard/balances`} className={cx('bsc-account')}>
                  <div>
                    <BscSVG size={'md'} />
                    {getShortAddress(wallet.bsc)}
                  </div>
                  {/*{toggleErrorIconBsc && <ErrorIconSVG />}*/}
                </a>
              ) : null}

              <ButtonBase onClick={handleOpenConnectDialog} className={cx('add-wallet')} disableRipple={true}>
                <AddContainedSVG theme={theme === THEME_MODE.LIGHT ? 'light' : 'dark'} size={'md'} />
                Add wallet
              </ButtonBase>
            </div>
            {openDropdown && <div className={cx('overlay')} />}
          </div>
        </>
      ) : (
        <PrimaryButton onClick={handleOpenConnectDialog}>Connect wallet</PrimaryButton>
      )}
    </>
  );
};

export default ConnectWallet;
