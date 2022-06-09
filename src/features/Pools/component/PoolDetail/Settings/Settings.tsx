import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Settings.module.scss';
import { ReactComponent as EditIcon } from 'src/assets/icon/edit-light.svg';
import { ReactComponent as ExternalIcon } from 'src/assets/icon/external.svg';
import { Pool } from 'src/interfaces/pool';
import { CSelect } from 'src/components/Base/Select';
import { CButton } from 'src/components/Base/Button';
import { calcTokenPercentage } from 'src/helpers/pool';
import WeightChangePopup from 'src/features/Pools/component/PoolDetail/Settings/WeightChangePopup';
import RemoveDigitalCreditPopup from 'src/features/Pools/component/PoolDetail/Settings/RemoveDigitalCreditPopup';
import { useHistory } from 'react-router-dom';
import {
  changeCap,
  getCrpController,
  getPoolCap,
  getRights,
  getUserProxy,
  newProtocolFee,
  newSwapFee,
  poolRoles,
  setRoles,
  zeroAddress,
} from './helper/ultis';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { denormalizeBalance } from 'src/pages/CreatePoolRequest/helpers/utils';
import BigNumber from 'bignumber.js';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import AddDigitalCreditPopup from 'src/features/Pools/component/PoolDetail/Settings/AddDigitalCreditPopup';
import { createChangeFeeNotification, getPoolDetail } from 'src/features/Pools/redux/apis';
import { formatFeePercent, formatPoolNumber } from 'src/features/Pools/helper/dataFormater';
import WarningPopup from './WarningPopup';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { FastField, Form, Formik } from 'formik';
import InputFieldPool from 'src/features/Pools/component/InputFieldPool';
import stylesInput from 'src/pages/CreatePoolRequest/styles';
import * as yup from 'yup';
import { ERROR_MESSAGES, MAX_FEE, MIN_FEE } from 'src/pages/CreatePoolRequest/constants';
import { settingHistoryLog } from './helper/historyLog';
import { sleep } from 'src/helpers/share';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';
import CLoading from 'src/components/Loading';

const cx = classNames.bind(styles);
interface WalletStatus {
  state: WalletState;
  proxy: string;
}

enum WalletState {
  Unknown = 1,
  NotController = 2,
  CanChange = 3,
}

enum Rights {
  CanPauseSwapping,
  CanChangeSwapFee,
  CanChangeWeights,
  CanAddRemoveTokens,
  CanWhitelistLPs,
  CanChangeCap,
  CanChangeProtocolFee,
}

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
};

interface Props {
  pool: Pool;
  updateGraduallyStatus: () => void;
  isGradual: boolean;
  updateAddToken: () => void;
  isCommitted: boolean;
}

const SwappingType = [
  { value: true, label: 'Enable' },
  { value: false, label: 'Disable' },
];

const Settings: React.FC<Props> = ({ pool, updateGraduallyStatus, isGradual, updateAddToken, isCommitted }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet);
  const [loadingSetting, setLoadingSetting] = React.useState(false);

  const tokensPercentage = calcTokenPercentage(pool.tokens);
  const [isSubmittingSwap, setIsSubmittingSwap] = React.useState<boolean>(false);
  const [editSwapping, setEditSwapping] = React.useState(false);
  const [editFees, setEditFees] = React.useState(false);
  const [editTotalLPToken, setEditTotalLPToken] = React.useState(false);

  const [walletStatus, setWalletStatus] = React.useState<WalletStatus>(defaultWalletState);
  const [restricted, setRestricted] = React.useState<boolean>(pool.restricted);
  const [unrestricted, setUnrestricted] = React.useState<boolean>(pool.unrestricted);
  const [swappingState, setSwappingState] = React.useState({
    restricted: pool.restricted,
    unrestricted: pool.unrestricted,
  });

  const [poolRights, setPoolRights] = React.useState<Rights[]>([]);
  const [cap, setCap] = React.useState<string>('');
  const [poolCap, setPooCap] = React.useState<string>('');
  const [openWarningPopup, setOpenWarningPopup] = React.useState(false);

  const initialStateEditDigitalCredits = {
    changeGradualWeight: false,
    changeWeight: false,
    addDigitalCredits: false,
    removeDigitalCredit: false,
  };

  const [editDigitalCredits, setEditDigitalCredits] = React.useState(initialStateEditDigitalCredits);

  const handleCloseChangeDialog = () => {
    setEditDigitalCredits(initialStateEditDigitalCredits);
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const getCap = async () => {
    const controller = await getCrpController(pool.id, 'controller');
    const cap = await getPoolCap(controller);
    setCap(formatPoolNumber(cap, 1));
    setPooCap(formatPoolNumber(cap, 1));
  };

  const getPoolRoles = async () => {
    const roles = await poolRoles(pool.id);
    if (roles) {
      setRestricted(roles.restricted);
      setUnrestricted(roles.unrestricted);
      setSwappingState(roles);
    }
  };

  const getPoolRights = async () => {
    const crp = await getCrpController(pool.id, 'controller');
    const rights = await getRights(crp);
    if (rights) {
      const poolRight: Array<Rights> = [];
      if (rights.canChangeProtocolFee) {
        poolRight.push(Rights.CanChangeProtocolFee);
      }
      if (rights.canChangeSwapFee) {
        poolRight.push(Rights.CanChangeSwapFee);
      }
      if (rights.canAddRemoveTokens) {
        poolRight.push(Rights.CanAddRemoveTokens);
      }
      if (rights.canChangeCap) {
        poolRight.push(Rights.CanChangeCap);
      }
      if (rights.canChangeWeights) {
        poolRight.push(Rights.CanChangeWeights);
      }
      if (rights.canWhitelistLPs) {
        poolRight.push(Rights.CanWhitelistLPs);
      }
      setPoolRights(poolRight);
    }
  };

  const updateWalletStatus = async () => {
    if (!wallet.bsc) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.Unknown });
      return;
    }

    const proxy = await getUserProxy(wallet.bsc);
    const crpController = await getCrpController(pool.id, 'crpController');
    if (pool.crp && (crpController !== proxy.toLowerCase() || proxy === zeroAddress)) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NotController });
      return;
    }

    if (!pool.crp && (pool.controller !== proxy.toLowerCase() || proxy === zeroAddress)) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NotController });
      return;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanChange, proxy });
  };

  const handleRestricted = (value: boolean) => {
    setRestricted(value);
  };

  const handleUnrestricted = (value: boolean) => {
    setUnrestricted(value);
  };

  useEffect(() => {
    if (wallet.bsc && pool.id) {
      updateWalletStatus().then();
    }
  }, [wallet.bsc, pool.id]);

  useEffect(() => {
    if (pool.id) {
      (async () => {
        await setLoadingSetting(true);
        await Promise.allSettled([getPoolRights(), getCap(), getPoolRoles()]);
        await setLoadingSetting(false);
      })();
    }
  }, [pool.id]);

  const handleSubmitSwapping = async () => {
    if (walletStatus.state === WalletState.NotController) {
      setOpenWarningPopup(!openWarningPopup);
    } else {
      setIsSubmittingSwap(true);
      try {
        const controller = await getCrpController(pool.id, 'controller');
        const params = {
          poolAddress: pool.crp ? controller : pool.id,
          restricted: restricted,
          unrestricted: unrestricted,
          account: wallet.bsc,
        };
        await setRoles(params);
        await settingHistoryLog({
          pool_setting_name: 'Swapping',
          pool_id: pool.id,
          wallet: wallet.bsc,
        });
        await sleep(1000);
        await dispatch(getPoolDetail(pool.id));
        await getPoolRoles();
        setIsSubmittingSwap(false);
        setEditSwapping(!editSwapping);
      } catch (err) {
        setIsSubmittingSwap(false);
      }
    }
  };

  const handleSubmitFee = async (
    values: {
      swapFee: string;
      netFee: string;
      protocolFee: string;
    },
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    if (walletStatus.state === WalletState.NotController) {
      setOpenWarningPopup(!openWarningPopup);
    } else {
      setSubmitting(true);
      try {
        const controller = await getCrpController(pool.id, 'controller');
        const newFee = new BigNumber(values.protocolFee).plus(new BigNumber(values.netFee)).toString();
        const swapFeeParams = {
          poolAddress: controller,
          newFee: denormalizeBalance(new BigNumber(newFee).div(100), 18).toString(),
          account: wallet.bsc,
        };
        await newSwapFee(swapFeeParams);

        const protocolFeeParams = {
          poolAddress: controller,
          newFee: denormalizeBalance(new BigNumber(values.protocolFee).div(100), 18).toString(),
          account: wallet.bsc,
        };
        await newProtocolFee(protocolFeeParams);
        await settingHistoryLog({
          pool_setting_name: 'Fees',
          pool_id: pool.id,
          wallet: wallet.bsc,
        });
        await dispatch(
          createChangeFeeNotification({
            oldValue: `${formatFeePercent(pool.swapFee, 2)}%`,
            newValue: `${new BigNumber(values.swapFee).toFixed(2)}%`,
            poolId: pool.id,
          }),
        );
        await initFetchListNotiPopup();
        await sleep(1000);
        await dispatch(getPoolDetail(pool.id));
        setSubmitting(false);
        setEditFees(!editFees);
      } catch (e) {
        setIsSubmittingSwap(false);
      }
    }
  };

  const handleSubmitCap = async (
    values: {
      poolCap: string;
    },
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    if (walletStatus.state === WalletState.NotController) {
      setOpenWarningPopup(!openWarningPopup);
    } else {
      setSubmitting(true);
      try {
        const controller = await getCrpController(pool.id, 'controller');
        const params = {
          poolAddress: controller,
          newCap: denormalizeBalance(new BigNumber(values.poolCap), 18).toString(),
          account: wallet.bsc,
        };
        await changeCap(params);
        await settingHistoryLog({
          pool_setting_name: 'Limit Total LP token supply',
          pool_id: pool.id,
          wallet: wallet.bsc,
        });
        setEditTotalLPToken(!editTotalLPToken);
        setSubmitting(false);
        await sleep(1000);
        await dispatch(getPoolDetail(pool.id));
        await getCap();
      } catch (err) {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className={cx('settings', loadingSetting ? 'loading' : null)}>
      {loadingSetting ? (
        <CLoading type="spin" size="md" />
      ) : (
        <>
          <WarningPopup
            open={openWarningPopup}
            handleClose={() => setOpenWarningPopup(!openWarningPopup)}
            message={'Please connect to the pool controller address to change pool settings'}
          />
          <div className={cx('setting-detail')}>
            <div className={cx('title')}>
              Swapping
              {!editSwapping && <EditIcon onClick={() => setEditSwapping(!editSwapping)} />}
            </div>

            <div className={cx('swapping-setting')}>
              {!editSwapping ? (
                <div>
                  <div>
                    <div>Unrestricted user:</div>
                    <div>{unrestricted ? 'Enabled' : 'Disabled'}</div>
                  </div>

                  <div>
                    <div>Restricted user:</div>
                    <div>{restricted ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div>
                      <div>Unrestricted user:</div>
                      <CSelect
                        isDisabled={isSubmittingSwap}
                        value={unrestricted ? SwappingType[0] : SwappingType[1]}
                        options={SwappingType}
                        onChange={(value: boolean): void => handleUnrestricted(value)}
                      />
                    </div>

                    <div>
                      <div>Restricted user:</div>
                      <CSelect
                        isDisabled={isSubmittingSwap}
                        value={restricted ? SwappingType[0] : SwappingType[1]}
                        options={SwappingType}
                        onChange={(value: boolean): void => handleRestricted(value)}
                      />
                    </div>
                  </div>

                  <div className={cx('action-buttons')}>
                    <CButton
                      size="sm"
                      type="secondary"
                      content="Cancel"
                      isDisabled={isSubmittingSwap}
                      onClick={() => {
                        setEditSwapping(!editSwapping);
                        setRestricted(swappingState.restricted);
                        setUnrestricted(swappingState.unrestricted);
                      }}
                    />

                    {!isConnected(wallet) && (
                      <CButton size="sm" type="primary" content="Connect Wallet" onClick={handleOpenConnectDialog} />
                    )}
                    {isConnected(wallet) && (
                      <CButton
                        size="sm"
                        type="primary"
                        content="Save changes"
                        onClick={handleSubmitSwapping}
                        isLoading={isSubmittingSwap}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {pool.crp && (
            <>
              <div className={cx('setting-detail')}>
                <div className={cx('title')}>Digital credits</div>

                <div className={cx('digital-credits-setting')}>
                  <div className={cx('tokens-list')}>
                    {pool.tokens.map((token, index) => (
                      <div key={index}>
                        <div>{token.symbol}</div>
                        <div>{`${tokensPercentage[index]}%`}</div>
                      </div>
                    ))}
                  </div>

                  <div className={cx('edit-buttons')}>
                    {poolRights.includes(Rights.CanChangeWeights) && (
                      <>
                        <CButton
                          size="sm"
                          type="primary"
                          content="Change weight gradually"
                          onClick={() =>
                            setEditDigitalCredits((currentState) => ({ ...currentState, changeGradualWeight: true }))
                          }
                          isDisabled={isGradual || isCommitted}
                        />
                        <WeightChangePopup
                          pool={pool}
                          gradual
                          open={editDigitalCredits.changeGradualWeight}
                          handleClose={handleCloseChangeDialog}
                          setGraduallyTime={updateGraduallyStatus}
                          poolCap={poolCap}
                        />

                        <CButton
                          size="sm"
                          type="primary"
                          content="Change weight"
                          onClick={() =>
                            setEditDigitalCredits((currentState) => ({ ...currentState, changeWeight: true }))
                          }
                          isDisabled={isGradual || isCommitted}
                        />
                        <WeightChangePopup
                          pool={pool}
                          open={editDigitalCredits.changeWeight}
                          handleClose={handleCloseChangeDialog}
                          setGraduallyTime={updateGraduallyStatus}
                          poolCap={poolCap}
                        />
                      </>
                    )}

                    {poolRights.includes(Rights.CanAddRemoveTokens) && (
                      <>
                        <CButton
                          size="sm"
                          type="primary"
                          content="Remove digital credit"
                          onClick={() => {
                            if (pool.tokens.length == 2) {
                              dispatch(
                                openSnackbar({
                                  message: 'A pool must contain a minimum of 2 digital credits!',
                                  variant: SnackbarVariant.ERROR,
                                }),
                              );

                              return;
                            }
                            setEditDigitalCredits((currentState) => ({ ...currentState, removeDigitalCredit: true }));
                          }}
                          isDisabled={isGradual || isCommitted}
                        />
                        <RemoveDigitalCreditPopup
                          pool={pool}
                          open={editDigitalCredits.removeDigitalCredit}
                          handleClose={handleCloseChangeDialog}
                        />

                        <CButton
                          size="sm"
                          type="primary"
                          content="Add digital credit"
                          onClick={() => {
                            if (pool.tokens.length == 8) {
                              dispatch(
                                openSnackbar({
                                  message: 'A pool can only contain a maximum of 8 digital credits!',
                                  variant: SnackbarVariant.ERROR,
                                }),
                              );

                              return;
                            }
                            setEditDigitalCredits((currentState) => ({ ...currentState, addDigitalCredits: true }));
                          }}
                          isDisabled={isGradual || isCommitted}
                        />
                        <AddDigitalCreditPopup
                          pool={pool}
                          open={editDigitalCredits.addDigitalCredits}
                          handleClose={handleCloseChangeDialog}
                          poolCap={poolCap}
                          updateAddToken={updateAddToken}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {poolRights.includes(Rights.CanChangeSwapFee) && (
                <>
                  <div className={cx('setting-detail')}>
                    <div className={cx('title')}>
                      Fees
                      {!editFees && <EditIcon onClick={() => setEditFees(!editFees)} />}
                    </div>

                    <div className={cx('fees-setting')}>
                      {!editFees ? (
                        <>
                          <div className={cx('fee-input')}>
                            <div>Swap fee:</div>
                            <div>{formatFeePercent(pool.swapFee) + '%'}</div>
                          </div>

                          <div className={cx('fee-input')}>
                            <div>Liquidity providers:</div>
                            <div>{formatFeePercent(pool.netFee) + '%'}</div>
                          </div>

                          <div className={cx('fee-input')}>
                            <div>Velo admin:</div>
                            <div>{formatFeePercent(pool.protocolFee) + '%'}</div>
                          </div>
                        </>
                      ) : (
                        <Formik
                          key="fees"
                          initialValues={{
                            swapFee: formatFeePercent(pool.swapFee),
                            netFee: formatFeePercent(pool.netFee),
                            protocolFee: formatFeePercent(pool.protocolFee),
                          }}
                          validationSchema={yup.object({
                            swapFee: yup
                              .string()
                              .required(ERROR_MESSAGES.REQUIRED)
                              .test('checkFeeValid', ERROR_MESSAGES.FEE_INVALID, function (value) {
                                const swapFee = denormalizeBalance(new BigNumber(String(value)).div(100), 18);
                                return swapFee.gte(MIN_FEE) && swapFee.lte(MAX_FEE);
                              }),
                            netFee: yup
                              .string()
                              .required(ERROR_MESSAGES.REQUIRED)
                              .test('checkTotalFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
                                return BigNumber.sum(String(value), this.parent.protocolFee).isEqualTo(
                                  this.parent.swapFee,
                                );
                              }),
                            protocolFee: yup
                              .string()
                              .required(ERROR_MESSAGES.REQUIRED)
                              .test('checkTotalFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
                                return BigNumber.sum(String(value), this.parent.netFee).isEqualTo(this.parent.swapFee);
                              }),
                          })}
                          onSubmit={async (values, { setSubmitting }) => {
                            await handleSubmitFee(values, setSubmitting);
                          }}
                        >
                          {({ setFieldValue, isSubmitting }) => (
                            <Form className={stylesInput().form}>
                              <div className={cx('fee-input')}>
                                <div>Swap fee:</div>
                                <FastField
                                  name="swapFee"
                                  component={InputFieldPool}
                                  disabled={isSubmitting}
                                  limitDigitAfterPeriod={2}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue('swapFee', event.target.value);
                                  }}
                                />
                              </div>

                              <div className={cx('fee-input')}>
                                <div>Liquidity providers:</div>
                                <FastField
                                  name="netFee"
                                  component={InputFieldPool}
                                  disabled={isSubmitting}
                                  limitDigitAfterPeriod={2}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue('netFee', event.target.value);
                                  }}
                                />
                              </div>

                              <div className={cx('fee-input')}>
                                <div>Velo admin:</div>
                                <FastField
                                  name="protocolFee"
                                  component={InputFieldPool}
                                  disabled={isSubmitting}
                                  limitDigitAfterPeriod={2}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue('protocolFee', event.target.value);
                                  }}
                                />
                              </div>

                              <div className={cx('action-buttons')}>
                                <CButton
                                  size="sm"
                                  type="secondary"
                                  content="Cancel"
                                  isDisabled={isSubmitting}
                                  onClick={() => setEditFees(!editFees)}
                                />
                                {!isConnected(wallet) && (
                                  <CButton
                                    size="sm"
                                    type="primary"
                                    content="Connect Wallet"
                                    onClick={handleOpenConnectDialog}
                                  />
                                )}
                                {isConnected(wallet) && (
                                  <CButton
                                    size="sm"
                                    type="primary"
                                    content="Save change"
                                    actionType="submit"
                                    isLoading={isSubmitting}
                                  />
                                )}
                              </div>
                            </Form>
                          )}
                        </Formik>
                      )}
                    </div>
                  </div>
                </>
              )}

              {poolRights.includes(Rights.CanChangeCap) && (
                <>
                  <div className={cx('setting-detail')}>
                    <div className={cx('title')}>
                      Total FPT supply
                      {!editTotalLPToken && <EditIcon onClick={() => setEditTotalLPToken(!editTotalLPToken)} />}
                    </div>

                    <div className={cx('total-lp-token-setting')}>
                      {!editTotalLPToken ? (
                        <div>{cap}</div>
                      ) : (
                        <Formik
                          key="lp-token"
                          initialValues={{ poolCap: poolCap }}
                          validationSchema={yup.object({
                            poolCap: yup
                              .string()
                              .required(ERROR_MESSAGES.REQUIRED)
                              .test('notZero', ERROR_MESSAGES.TOTAL_LP_TOKEN_NOT_0_ERROR, function (value) {
                                return !new BigNumber(String(value)).isZero();
                              }),
                          })}
                          onSubmit={async (values, { setSubmitting }) => {
                            await handleSubmitCap(values, setSubmitting);
                          }}
                        >
                          {({ setFieldValue, isSubmitting }) => (
                            <Form className={stylesInput().form}>
                              <div>
                                <FastField
                                  name="poolCap"
                                  component={InputFieldPool}
                                  disabled={isSubmitting}
                                  limitDigitAfterPeriod={1}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue('poolCap', event.target.value);
                                  }}
                                />
                              </div>

                              <div className={cx('action-buttons')}>
                                <CButton
                                  size="sm"
                                  type="secondary"
                                  content="Cancel"
                                  isDisabled={isSubmitting}
                                  onClick={() => {
                                    setEditTotalLPToken(!editTotalLPToken);
                                    setCap(poolCap);
                                  }}
                                />
                                {!isConnected(wallet) && (
                                  <CButton
                                    size="sm"
                                    type="primary"
                                    content="Connect Wallet"
                                    onClick={handleOpenConnectDialog}
                                  />
                                )}
                                {isConnected(wallet) && (
                                  <CButton
                                    size="sm"
                                    type="primary"
                                    content="Save changes"
                                    actionType="submit"
                                    isLoading={isSubmitting}
                                  />
                                )}
                              </div>
                            </Form>
                          )}
                        </Formik>
                      )}
                    </div>
                  </div>
                </>
              )}

              {pool.crp && (
                <>
                  <div className={cx('setting-detail')}>
                    <div className={cx('title')}>
                      Liquidity providers
                      <ExternalIcon
                        onClick={() => {
                          if (walletStatus.state === WalletState.NotController) {
                            setOpenWarningPopup(!openWarningPopup);
                            return;
                          }
                          history.push(history.location.pathname + '/liquidity-providers-setting');
                        }}
                      />
                    </div>

                    <div className={cx('lp-setting')}>
                      {poolRights.includes(Rights.CanWhitelistLPs) ? <div>Segregated</div> : <div>All</div>}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
