import React, { useEffect, useRef } from 'react';
import styles from './RemoveDigitalCreditPopup.module.scss';
import classNames from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { FormControlLabel, makeStyles, Radio, RadioGroup } from '@material-ui/core';
import { Pool, PoolToken } from 'src/interfaces/pool';
import { CButton } from 'src/components/Base/Button';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  approve,
  calcPoolInGivenTokenRemove,
  checkApprove,
  denormalizeBalance,
  getCrpController,
  getLPBalance,
  getUserProxy,
  normalizeBalance,
  removeToken,
} from './helper/ultis';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import BigNumber from 'bignumber.js';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import WarningPopup from '../WarningPopup/WarningPopup';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { formatPoolPercent, formatTokenAmount } from 'src/features/Pools/helper/dataFormater';
import { settingHistoryLog } from '../helper/historyLog';
import { sleep } from 'src/helpers/share';
import { isPoolTokensUpdate } from 'src/features/Pools/component/PoolDetail/Settings/helper/ultis';

interface Props {
  pool: Pool;
  open: boolean;
  handleClose: () => void;
}

interface WalletStatus {
  state: WalletState;
  proxy: string;
  unapprovedToken: {
    address: string;
    symbol: string;
  };
}

enum WalletState {
  Unknown = 1,
  NotController = 2,
  MinPoolToken = 3,
  NeedApprove = 4,
  CanRemoveToken = 5,
}

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
  unapprovedToken: { address: '', symbol: '' },
};

const cx = classNames.bind(styles);
const styleRadio = makeStyles(() => ({
  icon: {
    boxSizing: 'border-box',
    borderRadius: '50%',
    width: 20,
    height: 20,
    backgroundColor: 'var(--bg-radio)',
    border: '1px solid var(--border-radio)',
  },
  checkedIcon: {
    border: '5px solid var(--border-radio)',
    background: 'var(--bg-checked-radio)',
  },
}));

const RemoveDigitalCreditPopup: React.FC<Props> = ({ pool, open, handleClose }) => {
  const wallet = useAppSelector((state) => state.wallet);
  const [pendingRemove, setPendingRemove] = React.useState<PoolToken>();
  const [walletStatus, setWalletStatus] = React.useState<WalletStatus>(defaultWalletState);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [, setStep] = React.useState<boolean>(false);
  const [poolAmountIn, setPoolAmountIn] = React.useState<string>('');
  const [selectedToken, setSelectedToken] = React.useState<string>('');
  const [openWarningPopup, setOpenWarningPopup] = React.useState(false);
  const [openWarningBanner, setOpenWarningBanner] = React.useState(true);
  const [myLPTokenBalance, setMyLPTokenBalance] = React.useState<string>('');
  const [warningMessage, setWarningMessage] = React.useState<string>('');
  const classesRadio = styleRadio();
  const pendingRemoveRef = useRef<PoolToken>();
  const poolAmountInRef = useRef<string>('');
  const totalShare = pool.totalShares;

  pendingRemoveRef.current = pendingRemove;
  poolAmountInRef.current = poolAmountIn;

  const handleCloseDialog = () => {
    if (!isSubmitting && !isUnlocking) {
      setOpenWarningBanner(true);
      handleClose();
      setSelectedToken('');
    }
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const updateWalletStatus = async () => {
    if (!wallet.bsc) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.Unknown });
      return;
    }

    const proxy = await getUserProxy(wallet.bsc);
    const crpController = await getCrpController(pool.id, 'crpController');
    if (crpController !== proxy.toLowerCase()) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NotController, proxy });
      return;
    }

    const crp = await getCrpController(pool.id, 'controller');
    const tokensLength = pool.tokens.length;
    if (tokensLength === 2) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.MinPoolToken, proxy });
      return;
    }

    const allowance = await checkApprove(wallet.bsc, proxy, crp);
    if (!allowance) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NeedApprove, proxy });
      return;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanRemoveToken, proxy });
  };

  const getUserLPBalance = async () => {
    const crp = await getCrpController(pool.id, 'controller');
    const myBalance = await getLPBalance(wallet.bsc, crp);
    setMyLPTokenBalance(normalizeBalance(new BigNumber(myBalance), 18).toString());
  };

  const approveToken = async () => {
    setIsUnlocking(true);
    try {
      const LPTokenAddress = await getCrpController(pool.id, 'controller');
      await approve(wallet.bsc, walletStatus.proxy, LPTokenAddress);
      await updateWalletStatus();
      setIsUnlocking(false);
    } catch (e) {
      setIsUnlocking(false);
      throw e;
    }
  };

  useEffect(() => {
    if (wallet.bsc && pool.id) {
      getUserLPBalance().then();
      updateWalletStatus().then();
    }
  }, [wallet.bsc, pool.id]);

  useEffect(() => {
    // poolAmountInRef && poolAmountInRef.current = poolAmountIn;
  }, []);

  const getPoolAmountIn = () => {
    if (pendingRemoveRef.current) {
      const poolAmountIn = calcPoolInGivenTokenRemove(
        new BigNumber(pool.totalWeight).times('1e18'),
        denormalizeBalance(new BigNumber(totalShare), 18),
        new BigNumber(pendingRemoveRef.current.denormWeight).times('1e18'),
      );
      poolAmountInRef.current = poolAmountIn.toString();
      setPoolAmountIn(poolAmountIn.toString());
      return poolAmountIn;
    }
    return new BigNumber(0);
  };

  const changeTokenSelected = (token: PoolToken | undefined) => {
    pendingRemoveRef.current = token;
    setPendingRemove(token);
    getPoolAmountIn();
    setStep(true);
  };

  const handleSubmit = async () => {
    if (pendingRemove) {
      setIsSubmitting(true);
      try {
        const tokenAddress = pendingRemove.id.split('-')[1];
        const controller = await getCrpController(pool.id, 'controller');
        const poolAmountIn = await getPoolAmountIn();
        const params = {
          poolAddress: controller,
          token: tokenAddress,
          poolAmountIn: poolAmountIn.toString(),
          account: wallet.bsc,
        };
        await removeToken(params);
        await settingHistoryLog({
          pool_setting_name: 'Digital credits - Remove digital credit',
          pool_id: pool.id,
          wallet: wallet.bsc,
        });
        let checkSubgraphData = await isPoolTokensUpdate(pool.id, pool.tokensList.length - 1);
        while (!checkSubgraphData) {
          await sleep(3000);
          checkSubgraphData = await isPoolTokensUpdate(pool.id, pool.tokensList.length - 1);
        }
        await dispatch(getPoolDetail(pool.id));
        setIsSubmitting(false);
        handleCloseDialog();
        dispatch(
          openSnackbar({
            message: 'Remove digital credits successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
        setSelectedToken('');
      } catch (e) {
        setIsSubmitting(false);
        if (e.code == 4001) {
          dispatch(
            openSnackbar({
              message: 'Transaction rejected',
              variant: SnackbarVariant.ERROR,
            }),
          );
        }
      }
    }
  };

  return (
    <Dialog fullWidth maxWidth="md" className={cx('dialog-root')} open={open} onClose={handleCloseDialog}>
      <div className={cx('dialog-header')}>
        <div></div>

        <div>Remove digital credit</div>

        <CloseIcon onClick={handleCloseDialog} />
      </div>

      <WarningPopup
        open={openWarningPopup}
        handleClose={() => setOpenWarningPopup(!openWarningPopup)}
        message={warningMessage}
      />

      <div className={cx('dialog-body')}>
        <div className={cx('header')}>
          <div className={cx('digital-credits-header')}>Digital credits</div>
          <div className={cx('weights-header')}>Weights</div>
          <div className={cx('percent-header')}>Percent</div>
          <div className={cx('amount-header')}>Amount</div>
          <div className={cx('radio-header')}></div>
        </div>
        <RadioGroup
          value={selectedToken}
          onChange={(event) => {
            setSelectedToken(event.target.value);
            changeTokenSelected(pool.tokens.find((token) => token.id === event.target.value));
            setOpenWarningBanner(true);
          }}
        >
          {pool.tokens.map((token, index) => {
            return (
              <div key={index} className={cx('row')}>
                <div className={cx('digital-credits-row')}>
                  <TokenIcon name={token.symbol} size="25" />
                  <div>{token.symbol}</div>
                </div>
                <div className={cx('weights-row')}>{token.denormWeight}</div>
                <div className={cx('percent-row')}>{`${formatPoolPercent(
                  new BigNumber(token.denormWeight).div(pool.totalWeight).toString(),
                )}%`}</div>
                <div className={cx('amount-row')}>{formatTokenAmount(token.balance)}</div>
                <div className={cx('radio-row')}>
                  <FormControlLabel
                    label=""
                    value={token.id}
                    control={
                      <Radio
                        disableRipple
                        icon={<span className={classesRadio.icon} />}
                        checkedIcon={<span className={cx(classesRadio.icon, classesRadio.checkedIcon)} />}
                      />
                    }
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {isConnected(wallet) && walletStatus.state === WalletState.NeedApprove && (
        <>
          <div className={cx('unlock-lp-token')}>
            <span>Unlock FPT to continue.</span>
            <CButton size="xs" type="secondary" content="Unlock" isLoading={isUnlocking} onClick={approveToken} />
          </div>
        </>
      )}

      {selectedToken && (
        <div className={cx('warning', !openWarningBanner && 'warning-hidden')}>
          <WarningIcon />
          <div>{`Remove digital credit will withdraw ${
            pendingRemoveRef.current && new BigNumber(pendingRemoveRef.current.balance).toFixed(2).toString()
          } ${pendingRemoveRef.current?.symbol} and burn ${normalizeBalance(new BigNumber(poolAmountInRef.current), 18)
            .toFixed(2)
            .toString()} FPT`}</div>
          <CloseIcon onClick={() => setOpenWarningBanner(false)} />
        </div>
      )}

      <div className={cx('dialog-actions')}>
        <CButton
          onClick={handleCloseDialog}
          size="md"
          type="secondary"
          isDisabled={isUnlocking || isSubmitting}
          content="Cancel"
        ></CButton>
        {!isConnected(wallet) && (
          <CButton onClick={handleOpenConnectDialog} size="md" type="success" content={'Connect wallet'}></CButton>
        )}
        {isConnected(wallet) && (
          <CButton
            onClick={() => {
              if (walletStatus.state === WalletState.NotController) {
                setWarningMessage('Please connect to the pool controller address to change pool settings');
                setOpenWarningPopup(!openWarningPopup);
                return;
              }
              if (walletStatus.state === WalletState.NeedApprove) {
                setWarningMessage('Please unlock FPT first');
                setOpenWarningPopup(!openWarningPopup);
                return;
              }
              if (new BigNumber(myLPTokenBalance).lt(normalizeBalance(new BigNumber(poolAmountInRef.current), 18))) {
                const message = `Sorry, you do not have enough LP token to remove ${pendingRemoveRef.current?.symbol}!`;
                dispatch(
                  openSnackbar({
                    message: message,
                    variant: SnackbarVariant.ERROR,
                  }),
                );
                return;
              }
              handleSubmit();
            }}
            isDisabled={isUnlocking}
            isLoading={isSubmitting}
            size="md"
            type="error"
            content={'Remove digital credit'}
          ></CButton>
        )}
      </div>
    </Dialog>
  );
};

export default RemoveDigitalCreditPopup;
