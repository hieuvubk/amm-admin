/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect } from 'react';
import styles from './WeightChangePopup.module.scss';
import classNames from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as QuestionIcon } from 'src/assets/icon/question.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { ReactComponent as RedWarningIcon } from 'src/assets/icon/red-warning.svg';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { FormControlLabel, makeStyles, Radio, RadioGroup, Tooltip } from '@material-ui/core';
import { Pool } from 'src/interfaces/pool';
import { FastField, Field, Form, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import PopupStyles from 'src/features/Pools/component/PoolDetail/Settings/PopupStyles';
import { CButton } from 'src/components/Base/Button';
import {
  approve,
  bdiv,
  bmul,
  checkApprove,
  decreaseWeight,
  denormalizeBalance,
  getCrpController,
  getCurrentBlock,
  getUserProxy,
  increaseWeight,
  normalizeBalance,
  updateWeightsGradually,
} from './helper/utils';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import { formatPoolPercent, tokenDecimals } from 'src/features/Pools/helper/dataFormater';
import InputFieldPool from 'src/features/Pools/component/InputFieldPool';
import {
  ERROR_MESSAGES,
  MAX_PERCENTAGE,
  MAX_WEIGHT,
  MIN_PERCENTAGE,
  MIN_WEIGHT,
} from 'src/pages/CreatePoolRequest/constants';
import WarningPopup from '../WarningPopup/WarningPopup';
import moment from 'moment';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { getLPBalance } from '../RemoveDigitalCreditPopup/helper/ultis';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import BigNumber from 'bignumber.js';
import { postGraduallyStatus } from '../../Actions/helper';
import { settingHistoryLog } from '../helper/historyLog';
import { sleep } from 'src/helpers/share';
import { isWeightsUpdate } from 'src/features/Pools/component/PoolDetail/Settings/helper/ultis';

interface Props {
  pool: Pool;
  open: boolean;
  gradual?: boolean;
  handleClose: () => void;
  setGraduallyTime: () => void;
  poolCap: string;
}

interface ChangeWeight {
  tokens: string[];
  weights: {
    [k: string]: string;
  };
  totalWeight: string;
  startBlock: string;
  endBlock: string;
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
  NeedApprove = 3,
  CanChangeWeight = 4,
}

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
  unapprovedToken: { address: '', symbol: '' },
};

const FPT_DECIMALS = 18;

interface ChangeAmount {
  token: string;
  LPToken: string;
}

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
  label: {
    marginBottom: '0px !important',
  },
}));

const WeightChangePopup: React.FC<Props> = ({
  pool,
  open,
  gradual = false,
  handleClose,
  setGraduallyTime,
  poolCap,
}) => {
  const classes = PopupStyles();
  const classesRadio = styleRadio();
  const refFormik = React.useRef<FormikProps<typeof initialValues>>(null);

  const wallet = useAppSelector((state) => state.wallet);
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [walletStatus, setWalletStatus] = React.useState<WalletStatus>(defaultWalletState);
  const [tokenIndex, setTokenIndex] = React.useState<number>(0);
  const [currentBlock, setCurrentBlock] = React.useState<string>('');
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [openWarningPopup, setOpenWarningPopup] = React.useState(false);
  const [changeAmount, setChangeAmount] = React.useState<ChangeAmount>({ token: '', LPToken: '' });
  const totalSupply = denormalizeBalance(new BigNumber(pool.totalShares), FPT_DECIMALS).toString();
  const [isIncrease, setIsIncrease] = React.useState<boolean>();
  const [myLPTokenBalance, setMyLPTokenBalance] = React.useState<string>('');
  const [weightWarning, setWeightWarning] = React.useState<boolean>(false);
  const [percentageWarning, setPercentageWarning] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState('');
  const dispatch = useAppDispatch();
  const tokenDecimal = useAppSelector(tokenDecimals);

  const handleCloseDialog = () => {
    if (!isSubmitting && !isUnlocking) {
      setWeightWarning(false);
      setPercentageWarning(false);
      setIsIncrease(undefined);
      handleClose();
    }
  };

  const explanationGradual =
    'Gradual weight change will change the weight and the price of the digital credits in the pool gradually from the start block to the end block that users set';
  const explanation =
    'Weight change will change the weight without changing the price of the digital credits in the pool.';

  const fetchCurrentBlock = async () => {
    const block = await getCurrentBlock();
    const currentTimestamp = new Date().getTime();
    setCurrentBlock(block.toString());
    setCurrentTime(currentTimestamp);
  };

  const getUserLPBalance = async () => {
    const crp = await getCrpController(pool.id, 'controller');
    const myBalance = await getLPBalance(wallet.bsc, crp);
    setMyLPTokenBalance(myBalance);
  };

  const initialValues = {
    gradual: gradual,
    tokens: pool.tokens.map((token) => token.id),
    weights: Object.fromEntries(pool.tokens.map((token) => [token.id, token.denormWeight])),
    currentToken: pool.tokens[0].id,
    totalWeight: pool.tokens
      .reduce((acc, token) => {
        return acc + Number(token.denormWeight);
      }, 0)
      .toString(),
    startBlock: currentBlock,
    endBlock: currentBlock,
  };

  const validationSchema = yup.object({
    weights: yup.object(
      Object.fromEntries(
        pool.tokens.map((token) => [
          token.id,
          yup.number().required(ERROR_MESSAGES.REQUIRED).min(1, ERROR_MESSAGES.WEIGHT_SMALLER_THAN_1),
        ]),
      ),
    ),
    gradual: yup.boolean(),
    startBlock: yup.number().when('gradual', {
      is: true,
      then: yup
        .number()
        .required(ERROR_MESSAGES.REQUIRED)
        .test('checkStartBlock', 'Start block has to be smaller than end block', function (value) {
          return new BigNumber(String(value)).lt(this.parent.endBlock);
        })
        .test('checkStartBlock', `Block number can not be smaller than ${currentBlock}`, function (value) {
          return !new BigNumber(String(value)).lt(currentBlock);
        }),
      otherwise: yup.number(),
    }),

    endBlock: yup.number().when('gradual', {
      is: true,
      then: yup
        .number()
        .required(ERROR_MESSAGES.REQUIRED)
        .test('checkStartBlock', 'Start block has to be smaller than end block', function (value) {
          return new BigNumber(this.parent.startBlock).lt(String(value));
        })
        .test('checkStartBlock', `Block number can not be smaller than ${currentBlock}`, function (value) {
          return !new BigNumber(String(value)).lt(currentBlock);
        }),
      otherwise: yup.number(),
    }),
  });

  const weightValidation = () => {
    const values = refFormik.current!.values;

    const totalWeight = denormalizeBalance(new BigNumber(values.totalWeight), FPT_DECIMALS);

    if (totalWeight.lt(MIN_WEIGHT) || totalWeight.gt(MAX_WEIGHT)) {
      setWeightWarning(true);
    } else setWeightWarning(false);
  };

  const percentageValidation = () => {
    const values = refFormik.current!.values;

    Object.entries(values.weights).every(([, weight]) => {
      const currentPercentage = new BigNumber(weight).div(values.totalWeight).times(100);
      return currentPercentage.gte(MIN_PERCENTAGE) && currentPercentage.lte(MAX_PERCENTAGE);
    })
      ? setPercentageWarning(false)
      : setPercentageWarning(true);
  };

  const setTotalWeight = () => {
    refFormik.current?.setFieldValue(
      'totalWeight',
      refFormik.current.values.tokens
        .reduce((acc, tokenAddress) => {
          return acc + Number(refFormik.current?.values.weights[tokenAddress]);
        }, 0)
        .toString(),
    );
  };

  const calculateAmount = (newWeight: string, index: number) => {
    const token = pool.tokens[index];
    const oldWeight = parseFloat(pool.tokens[index].denormWeight);
    if (parseFloat(newWeight) > oldWeight) {
      setIsIncrease(true);
      const delta = new BigNumber(newWeight).minus(oldWeight);
      const tokenAmountIn = bmul(
        denormalizeBalance(new BigNumber(token.balance), tokenDecimal[token.address]),
        bdiv(delta, new BigNumber(token.denormWeight)),
      );
      const mintAmount = bmul(new BigNumber(totalSupply), bdiv(delta, new BigNumber(pool.totalWeight)));
      setChangeAmount({
        token: tokenAmountIn.toString(),
        LPToken: mintAmount.toString(),
      });
    } else if (parseFloat(newWeight) < oldWeight) {
      setIsIncrease(false);
      const delta = new BigNumber(oldWeight).minus(new BigNumber(newWeight));
      const poolAmountIn = bmul(
        denormalizeBalance(new BigNumber(token.balance), tokenDecimal[token.address]),
        bdiv(delta, new BigNumber(token.denormWeight)),
      );
      const burnAmount = bmul(new BigNumber(totalSupply), bdiv(delta, new BigNumber(pool.totalWeight)));
      setChangeAmount({
        token: poolAmountIn.toString(),
        LPToken: burnAmount.toString(),
      });
    } else {
      setIsIncrease(undefined);
    }
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
    const allowance = await checkApprove(wallet.bsc, proxy, crp);
    if (!allowance && !gradual) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NeedApprove, proxy });
      return;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanChangeWeight, proxy });
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
    updateWalletStatus().then();
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
      updateWalletStatus().then();
      getUserLPBalance().then();
    }
  }, [wallet.bsc, pool.id]);

  useEffect(() => {
    fetchCurrentBlock().then();
  }, [open]);

  const isWeightIncrease = (values: ChangeWeight | undefined) => {
    if (values) {
      const tokenAddress = pool.tokens[tokenIndex].id;
      const weight = parseFloat(pool.tokens[tokenIndex].denormWeight);
      const newWeights = parseFloat(values.weights[tokenAddress]);
      return newWeights > weight;
    }
  };

  const isWeightDecrease = (values: ChangeWeight | undefined) => {
    if (values) {
      const tokenAddress = pool.tokens[tokenIndex].id;
      const weight = parseFloat(pool.tokens[tokenIndex].denormWeight);
      const newWeights = parseFloat(values.weights[tokenAddress]);
      return newWeights < weight;
    }
  };

  const formatBlockNumber = (blockNumber: number) => {
    const block = Number(currentBlock);
    const delta = blockNumber - block;
    const blockDate = currentTime + 3000 * delta;
    return moment(blockDate).format('DD/MM/YYYY, HH:mm:ss');
  };

  const handleTokenChange = (key: number) => {
    setTokenIndex(key);
  };

  const handleSubmit = async (values: ChangeWeight | undefined) => {
    if (values) {
      setIsSubmitting(true);
      try {
        const controller = await getCrpController(pool.id, 'controller');
        const newWeights: Array<string> = [];

        if (gradual) {
          let oldWeightsParams = '';
          let newWeightsParams = '';
          pool.tokensList.map((tokenAddress: string) => {
            const id = pool.id.concat('-').concat(tokenAddress);
            const weight = denormalizeBalance(new BigNumber(values.weights[id]), FPT_DECIMALS).toString();
            newWeights.push(weight);
            newWeightsParams = newWeightsParams.concat(weight).concat(',');

            const token = pool.tokens.find((coin) => coin.address === tokenAddress);
            if (token) {
              const oldWeight = denormalizeBalance(new BigNumber(token.denormWeight), FPT_DECIMALS).toString();
              // oldWeightsParams.concat(oldWeight).concat(',');
              oldWeightsParams = oldWeightsParams.concat(oldWeight).concat(',');
            }
          });
          oldWeightsParams = oldWeightsParams.slice(0, -1);
          newWeightsParams = newWeightsParams.slice(0, -1);

          const params = {
            poolAddress: controller,
            newWeights: newWeights,
            startBlock: Number(values.startBlock),
            endBlock: Number(values.endBlock),
            account: wallet.bsc,
          };
          await updateWeightsGradually(params);
          await settingHistoryLog({
            pool_setting_name: 'Digital credits - Change weight gradually',
            pool_id: pool.id,
            wallet: wallet.bsc,
          });
          await postGraduallyStatus({
            pool_address: pool.id,
            start_block: Number(values.startBlock),
            end_block: Number(values.endBlock),
            old_weights: oldWeightsParams,
            new_weights: newWeightsParams,
          });
          await dispatch(getPoolDetail(pool.id));
          await setGraduallyTime();
          dispatch(
            openSnackbar({
              message: 'Gradual weight change has been started!',
              variant: SnackbarVariant.SUCCESS,
            }),
          );
          setIsSubmitting(false);
          handleCloseDialog();
        } else {
          if (isIncrease === undefined) {
            dispatch(
              openSnackbar({
                message: 'Please update the weight to confirm change!',
                variant: SnackbarVariant.ERROR,
              }),
            );
          } else {
            const token = pool.tokens[tokenIndex];
            if (isWeightIncrease(values)) {
              const params = {
                poolAddress: controller,
                token: token.address,
                newWeight: denormalizeBalance(new BigNumber(values.weights[token.id]), FPT_DECIMALS).toString(),
                tokenAmountIn: changeAmount.token,
                account: wallet.bsc,
              };
              await increaseWeight(params);
            } else if (isWeightDecrease(values)) {
              // const poolAmountIn = scale(poolWeiAmountIn, -18);
              const params = {
                poolAddress: controller,
                token: token.address,
                newWeight: denormalizeBalance(new BigNumber(values.weights[token.id]), FPT_DECIMALS).toString(),
                poolAmountIn: changeAmount.LPToken,
                account: wallet.bsc,
              };
              await decreaseWeight(params);
            }
            await settingHistoryLog({
              pool_setting_name: 'Digital credits - Change weight',
              pool_id: pool.id,
              wallet: wallet.bsc,
            });
            dispatch(
              openSnackbar({
                message: 'Update weight successfully!',
                variant: SnackbarVariant.SUCCESS,
              }),
            );
            let checkSubgraphData = await isWeightsUpdate(pool.id, values.weights);
            while (!checkSubgraphData) {
              await sleep(3000);
              checkSubgraphData = await isWeightsUpdate(pool.id, values.weights);
            }
            await dispatch(getPoolDetail(pool.id));
            handleCloseDialog();
          }
          setIsSubmitting(false);
        }
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
    <Dialog fullWidth maxWidth="sm" className={cx('dialog-root')} open={open} onClose={handleCloseDialog}>
      <div className={cx('dialog-header')}>
        <Tooltip arrow interactive title={gradual ? explanationGradual : explanation}>
          <QuestionIcon />
        </Tooltip>

        <div>{gradual ? 'Gradual weight change' : 'Weight change'}</div>

        <CloseIcon onClick={handleCloseDialog} />
      </div>

      <WarningPopup
        open={openWarningPopup}
        handleClose={() => setOpenWarningPopup(!openWarningPopup)}
        message={warningMessage}
      />

      <div className={cx('dialog-body')}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values, { setSubmitting }) => {
            if (weightWarning || percentageWarning) {
              return;
            }
            setSubmitting(true);
            await handleSubmit(values);
            setSubmitting(false);
          }}
          innerRef={refFormik}
          enableReinitialize={true}
          validationSchema={validationSchema}
        >
          {({ values, setFieldValue, resetForm }) => (
            <Form className={classes.form}>
              <RadioGroup
                value={values.currentToken}
                onChange={(event) => {
                  resetForm();
                  setFieldValue('currentToken', event.target.value);
                  setWeightWarning(false);
                  setPercentageWarning(false);
                  setIsIncrease(undefined);
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Digital credits</th>
                      <th>Weights</th>
                      <th>Percent</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pool.tokens.map((token, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <div>
                              {!gradual && (
                                <FormControlLabel
                                  label=""
                                  value={token.id}
                                  className={classesRadio.label}
                                  control={
                                    <Radio
                                      disableRipple
                                      icon={<span className={classesRadio.icon} />}
                                      checkedIcon={<span className={cx(classesRadio.icon, classesRadio.checkedIcon)} />}
                                    />
                                  }
                                />
                              )}
                              <TokenIcon name={token.symbol} />
                              <div style={{ marginLeft: '6px' }}>{token.symbol}</div>
                            </div>
                          </td>

                          <td>
                            {gradual && (
                              <FastField
                                name={`weights.${token.id}`}
                                component={InputFieldPool}
                                limitDigitAfterPeriod={2}
                                onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                  const key = values.tokens.indexOf(token.id.toString());
                                  await setFieldValue(`weights.${token.id}`, event.target.value);
                                  if (!gradual) {
                                    pool.tokens.map(async (coin, coinIndex) => {
                                      if (coinIndex !== key) {
                                        await setFieldValue(`weights.${coin.id}`, coin.denormWeight);
                                      }
                                    });
                                  }
                                  await setTotalWeight();
                                  await weightValidation();
                                  await percentageValidation();
                                  handleTokenChange(key);
                                  calculateAmount(event.target.value, key);
                                }}
                              />
                            )}

                            {!gradual && values.currentToken === token.id && (
                              <FastField
                                name={`weights.${token.id}`}
                                component={InputFieldPool}
                                limitDigitAfterPeriod={2}
                                onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                  const key = values.tokens.indexOf(token.id.toString());
                                  await setFieldValue(`weights.${token.id}`, event.target.value);
                                  if (!gradual) {
                                    pool.tokens.map(async (coin, coinIndex) => {
                                      if (coinIndex !== key) {
                                        await setFieldValue(`weights.${coin.id}`, coin.denormWeight);
                                      }
                                    });
                                  }
                                  await setTotalWeight();
                                  await weightValidation();
                                  await percentageValidation();
                                  handleTokenChange(key);
                                  calculateAmount(event.target.value, key);
                                }}
                              />
                            )}
                          </td>

                          <td>
                            <div>
                              <>
                                {`${formatPoolPercent(
                                  new BigNumber(token.denormWeight).div(pool.totalWeight).toString(),
                                )}% `}
                              </>
                              &#8594;
                              <>
                                {` ${formatPoolPercent(
                                  new BigNumber(values.weights[token.id]).div(values.totalWeight).toNumber(),
                                  2,
                                  '0',
                                )}%`}
                              </>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </RadioGroup>

              {gradual && (
                <>
                  <div className={cx('block-input')}>
                    <label htmlFor="startBlock">Start block</label>
                    <Field
                      name="startBlock"
                      component={InputFieldPool}
                      onlyNumber
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('startBlock', event.target.value);
                      }}
                    />
                    <div className={cx('block-date')}>{formatBlockNumber(Number(values.startBlock))}</div>
                  </div>

                  <div className={cx('block-input')}>
                    <label htmlFor="endBlock">End block</label>
                    <Field
                      name="endBlock"
                      component={InputFieldPool}
                      onlyNumber
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('endBlock', event.target.value);
                      }}
                    />
                    <div className={cx('block-date')}>{formatBlockNumber(Number(values.endBlock))}</div>
                  </div>
                </>
              )}

              {!gradual && isConnected(wallet) && (
                <>
                  {walletStatus.state === WalletState.NeedApprove && (
                    <div className={cx('unlock-lp-token')}>
                      <span>Unlock FPT to continue.</span>
                      <CButton
                        size="xs"
                        type="secondary"
                        content="Unlock"
                        isLoading={isUnlocking}
                        onClick={approveToken}
                      />
                    </div>
                  )}
                  {isIncrease !== undefined && (
                    <div className={cx('red-warning')}>
                      <div>
                        <RedWarningIcon />
                      </div>

                      <div>{`Weight change will ${isIncrease ? 'deposit' : 'remove'} ${normalizeBalance(
                        new BigNumber(changeAmount.token),
                        tokenDecimal[pool.tokens[tokenIndex].address],
                      )
                        .toFixed(2)
                        .toString()} ${pool.tokens[tokenIndex].symbol} tokens and ${
                        isIncrease ? 'mint' : 'burn'
                      } ${normalizeBalance(new BigNumber(changeAmount.LPToken), FPT_DECIMALS).toFixed(2).toString()} ${
                        pool.symbol
                      }`}</div>
                    </div>
                  )}
                </>
              )}

              {weightWarning && (
                <div className={cx('warning')}>
                  <WarningIcon />
                  <div>{ERROR_MESSAGES.TOTAL_WEIGHT_INVALID}</div>
                </div>
              )}

              {percentageWarning && (
                <div className={cx('warning')}>
                  <WarningIcon />
                  <div>{ERROR_MESSAGES.PERCENTAGE_INVALID}</div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      <div className={cx('dialog-actions')}>
        <CButton
          onClick={handleCloseDialog}
          size="md"
          type="secondary"
          isDisabled={isUnlocking || isSubmitting}
          content="Cancel"
        ></CButton>
        {!isConnected(wallet) && (
          <CButton onClick={handleOpenConnectDialog} size="md" type="primary" content="Connect wallet"></CButton>
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

              if (
                new BigNumber(totalSupply).gte(denormalizeBalance(new BigNumber(poolCap), FPT_DECIMALS)) &&
                isIncrease &&
                !gradual
              ) {
                setWarningMessage(
                  'Sorry, the pool has reached its max cap. Please change the Total FPT supply setting.',
                );
                setOpenWarningPopup(!openWarningPopup);
                return;
              } else if (
                new BigNumber(changeAmount.LPToken)
                  .plus(new BigNumber(totalSupply))
                  .gt(denormalizeBalance(new BigNumber(poolCap), FPT_DECIMALS)) &&
                isIncrease &&
                !gradual
              ) {
                const remainingAmount = new BigNumber(poolCap).minus(
                  normalizeBalance(new BigNumber(totalSupply), FPT_DECIMALS),
                );
                setWarningMessage(
                  `The pool can only issue ${remainingAmount.toFixed(2)} more ${pool.symbol}. Please change the Total ${
                    pool.symbol
                  } supply setting or add less liquidity.`,
                );
                setOpenWarningPopup(!openWarningPopup);
                return;
              }

              if (new BigNumber(changeAmount.LPToken).gt(new BigNumber(myLPTokenBalance)) && !isIncrease && !gradual) {
                const message = `Sorry, you do not have enough LP token to decrease weight!`;
                dispatch(
                  openSnackbar({
                    message: message,
                    variant: SnackbarVariant.ERROR,
                  }),
                );
                return;
              }

              refFormik.current?.submitForm();
            }}
            size="md"
            type="primary"
            content="Confirm"
            isDisabled={isUnlocking}
            isLoading={isSubmitting}
          ></CButton>
        )}
      </div>
    </Dialog>
  );
};

export default WeightChangePopup;
