/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import stylesSCSS from './AddDigitalCreditPopup.module.scss';
import classNames from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { ReactComponent as LockIcon } from 'src/assets/icon/lock2.svg';
import { ReactComponent as UnlockIcon } from 'src/assets/icon/unlock.svg';
import { ReactComponent as ArrowDownIcon } from 'src/assets/icon/Arrow-Down.svg';
import { ReactComponent as ArrowDownIcon2 } from 'src/assets/icon/sidebar/arrow-down.svg';
import { ReactComponent as ArrowUpIcon } from 'src/assets/icon/sidebar/arrow-up.svg';
import { Button, Tooltip } from '@material-ui/core';
import { Pool, TokenPrice } from 'src/interfaces/pool';
import { ErrorMessage, FastField, Form, Formik, FormikProps } from 'formik';
import { CButton } from 'src/components/Base/Button';
import AssetSelector from 'src/pages/CreatePoolRequest/AssetSelector';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import InputFieldPool from 'src/features/Pools/component/InputFieldPool';
import { isDigitalCreditSelected } from 'src/pages/CreatePoolRequest/helpers';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getTokensList } from 'src/features/Pools/redux/apis';
import {
  formatPoolPercent,
  formatTokenAmount,
  setDataPrecision,
  tokenDecimals,
} from 'src/features/Pools/helper/dataFormater';
import BigNumber from 'src/helpers/bignumber';
import styles from './styles';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { getCrpController, getUserProxy } from '../helper/ultis';
import { getUserBalance } from 'src/pages/CreatePoolRequest/helpers/userBalance';
import { denormalizeBalance, normalizeBalance } from 'src/pages/CreatePoolRequest/helpers/utils';
import { approve, checkApprove, getTotalShares } from '../RemoveDigitalCreditPopup/helper/ultis';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { commitAddToken } from './helper/ultis';
import WarningPopup from '../WarningPopup/WarningPopup';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import {
  AMOUNT_TOOLTIP,
  ERROR_MESSAGES,
  MAX_BALANCE,
  MAX_PERCENTAGE,
  MIN_BALANCE,
  MIN_PERCENTAGE,
  tokensAddressRegex,
} from 'src/pages/CreatePoolRequest/constants';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import * as yup from 'yup';
import WaitingPopup from 'src/features/Pools/component/PoolDetail/Settings/AddDigitalCreditPopup/WaitingPopup';
import { IsCommitted } from '../../PoolDetail';
import PriceMatrix from 'src/features/Pools/component/PriceMatrix';
import isEmpty from 'lodash/isEmpty';

interface Props {
  pool: Pool;
  open: boolean;
  handleClose: () => void;
  poolCap: string;
  updateAddToken: () => void;
}

interface WalletStatus {
  state: WalletState;
  proxy: string;
  newToken: {
    address: string;
    symbol: string;
  };
}

enum WalletState {
  Unknown = 1,
  NotController = 2,
  MaxPoolToken = 3,
  NeedApprove = 4,
  CanAddToken = 5,
}

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
  newToken: { address: '', symbol: '' },
};

const cx = classNames.bind(stylesSCSS);
const FPT_DECIMALS = 18;

const AddDigitalCreditPopup: React.FC<Props> = ({ pool, open, handleClose, poolCap, updateAddToken }) => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const classes = styles();
  const [tokensListSG, tokensListDB] = useAppSelector((state) => [state.pool.tokens.data, state.allCoins.coins.data]);
  const [openMatrixPrice, setOpenMatrixPrice] = React.useState(false);

  const refFormik = React.useRef<FormikProps<typeof initialValues>>(null);
  const [refElm, setRefEml] = React.useState<HTMLButtonElement | null>(null);

  const [walletStatus, setWalletStatus] = React.useState<WalletStatus>(defaultWalletState);
  const [, setMyBalance] = React.useState<string[]>([]);
  const [newTokenBalance, setNewTokenBalance] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [isCommitted, setIsCommitted] = React.useState<IsCommitted>();

  const [weightWarning, setWeightWarning] = React.useState<boolean>(false);
  const [percentageWarning, setPercentageWarning] = React.useState(false);
  const [openWarningPopup, setOpenWarningPopup] = React.useState(false);
  const [openWaitingPopup, setOpenWaitingPopup] = React.useState(false);
  const [amountLock, setAmountLock] = React.useState(true);
  const [totalSupply, setTotalSupply] = React.useState<string>('');
  const [mintAmount, setMintAmount] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const tokenDecimal = useAppSelector(tokenDecimals);

  React.useEffect(() => {
    dispatch(getTokensList());
    dispatch(getCoinsApi());
  }, [dispatch]);

  const handleCloseDialog = () => {
    if (!isSubmitting && !isUnlocking) {
      setWeightWarning(false);
      setPercentageWarning(false);
      setAmountLock(true);
      setNewTokenBalance('');
      handleClose();
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
      setMessage('Please connect to the pool controller address to change pool settings');
      return;
    }

    const tokensLength = pool.tokens.length;
    if (tokensLength === 8) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.MaxPoolToken, proxy });
      return;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanAddToken, proxy });
  };

  const getUserTokensBalance = async () => {
    const balances: Array<string> = [];
    await Promise.all(
      tokensListSG.map(async (token) => {
        const balance = await getUserBalance(wallet.bsc, token.id);
        const formattedBalance = normalizeBalance(new BigNumber(balance), tokenDecimal[token.id])
          .integerValue(BigNumber.ROUND_HALF_CEIL)
          .toString();
        balances.push(formattedBalance);
      }),
    );
    setMyBalance(balances);
  };

  const totalShares = async () => {
    const controller = await getCrpController(pool.id, 'controller');
    const share = await getTotalShares(controller);
    setTotalSupply(normalizeBalance(new BigNumber(share), FPT_DECIMALS).toString());
    return normalizeBalance(new BigNumber(share), FPT_DECIMALS);
  };

  const calculateMintAmount = (newWeight: string) => {
    const mintAmount = (parseFloat(totalSupply) * parseFloat(newWeight)) / parseFloat(pool.totalWeight);
    setMintAmount(mintAmount.toString());
  };

  const getUserNewTokenBalance = async (token: string) => {
    if (wallet.bsc) {
      const balance = await getUserBalance(wallet.bsc, token);
      const formattedBalance = normalizeBalance(new BigNumber(balance), tokenDecimal[token])
        .integerValue(BigNumber.ROUND_HALF_CEIL)
        .toString();
      setNewTokenBalance(formattedBalance);
      return formattedBalance;
    }
  };

  const isApproved = async (token: string) => {
    if (wallet.bsc) {
      if (walletStatus.state === WalletState.NotController) {
        return;
      }
      const proxy = walletStatus.proxy;
      const check = await checkApprove(wallet.bsc, proxy, token);
      if (!check) {
        setWalletStatus({ ...defaultWalletState, state: WalletState.NeedApprove, proxy });
        return;
      }
      setWalletStatus({ ...defaultWalletState, state: WalletState.CanAddToken, proxy });
    }
  };

  const approveToken = async (tokenAddress: string) => {
    setIsUnlocking(true);
    try {
      const proxy = walletStatus.proxy;
      await approve(wallet.bsc, proxy, tokenAddress);
      await updateWalletStatus();
      setIsUnlocking(false);
    } catch (e) {
      setIsUnlocking(false);
      throw e;
    }
  };

  React.useEffect(() => {
    if (wallet.bsc && tokensListSG) {
      getUserTokensBalance().then();
      updateWalletStatus().then();
      // gradualState().then();
    }
    // isApproveAll();
  }, [wallet.bsc, tokensListSG.length]);

  React.useEffect(() => {
    if (pool.id) {
      totalShares().then();
      // gradualState().then();
    }
    // isApproveAll();
  }, [pool.id]);

  const initTotalWeight = pool.tokens
    .reduce((acc, token) => {
      return acc + Number(token.denormWeight);
    }, 0)
    .toString();

  const initialValues = {
    tokens: pool.tokens.map((token) => {
      return {
        id: token.id,
        symbol: token.symbol,
        weights: token.denormWeight,
        balance: token.balance,
        address: token.address,
      };
    }),
    newToken: 'token123',
    newWeight: '',
    newAmount: '',
    newTotalWeight: initTotalWeight,
  };

  const validationSchema = yup.object({
    newToken: yup.string().matches(tokensAddressRegex, ERROR_MESSAGES.REQUIRED),
    newWeight: yup.number().required(ERROR_MESSAGES.REQUIRED).min(1, ERROR_MESSAGES.WEIGHT_SMALLER_THAN_1),
    newAmount: yup
      .number()
      .required(ERROR_MESSAGES.REQUIRED)
      .moreThan(0, ERROR_MESSAGES.AMOUNT_NOT_0_ERROR)
      .test('checkAmountExceedBalance', ERROR_MESSAGES.EXCEED_BALANCE, function (value) {
        return !new BigNumber(String(value)).gt(newTokenBalance);
      })
      .test('checkAmountValid', ERROR_MESSAGES.AMOUNT_INVALID, function (value) {
        const curAmount = denormalizeBalance(new BigNumber(String(value)), FPT_DECIMALS);
        return curAmount.lte(MAX_BALANCE) && curAmount.gte(MIN_BALANCE);
      }),
  });

  const openPriceMatrixValidation = () => {
    const errors = refFormik.current!.errors;

    if (!isEmpty(errors.newToken) || !isEmpty(errors.newAmount) || !isEmpty(errors.newWeight)) {
      setOpenMatrixPrice(false);
    }
  };

  const setTotalWeight = () => {
    refFormik.current?.values.newWeight !== ''
      ? refFormik.current?.setFieldValue(
          'newTotalWeight',
          new BigNumber(refFormik.current.values.newWeight).plus(initTotalWeight).toString(),
        )
      : refFormik.current?.setFieldValue('newTotalWeight', initTotalWeight);
  };

  const getTokenDetail = (tokenAddress: string) => {
    const tokenDetailWithPrice = tokensListSG.find(
      (element) => element.id.toLowerCase() === tokenAddress.toLowerCase(),
    );
    const tokenDetailInCoinsList = tokensListDB.find(
      (element) => element.bsc_address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    const tokenDetail: TokenPrice | undefined = tokenDetailInCoinsList && {
      id: tokenDetailInCoinsList?.bsc_address,
      symbol: tokenDetailInCoinsList?.symbol,
      name: tokenDetailInCoinsList?.name,
      decimals: String(tokenDetailInCoinsList?.decimal),
      price: '0',
    };

    return tokenDetailWithPrice ? tokenDetailWithPrice : tokenDetail;
  };

  const calcAmount = () => {
    const values = refFormik.current?.values;

    if (values?.newToken) {
      const newTokenDetail = getTokenDetail(values.newToken);
      if (newTokenDetail && newTokenDetail?.price !== '0') {
        const firstToken = values.tokens[0];
        const firstTokenPrice = getTokenDetail(firstToken.address)?.price;

        if (firstTokenPrice) {
          const newAmount = new BigNumber(firstToken.balance)
            .times(firstTokenPrice)
            .div(firstToken.weights)
            .times(values.newWeight)
            .div(newTokenDetail.price);

          newAmount.isNaN()
            ? refFormik.current?.setFieldValue('newAmount', '')
            : refFormik.current?.setFieldValue(
                'newAmount',
                newAmount.toFixed(tokenDecimal[values.newToken]).toString(),
              );
        }
      }
    }
  };

  const handleAmountLock = () => {
    setAmountLock(!amountLock);
    refFormik.current?.setFieldValue('newAmount', '');
  };

  const handleValidation = () => {
    const MAX_WEIGHT = new BigNumber(50).times(denormalizeBalance(new BigNumber(1), FPT_DECIMALS));
    const MIN_WEIGHT = denormalizeBalance(new BigNumber(1), FPT_DECIMALS);

    if (refFormik.current) {
      const values = refFormik.current.values;
      const newTotalWeight = denormalizeBalance(new BigNumber(values.newTotalWeight), FPT_DECIMALS);
      if (newTotalWeight.lt(MIN_WEIGHT) || newTotalWeight.gt(MAX_WEIGHT)) {
        setWeightWarning(true);
      } else {
        setWeightWarning(false);
      }

      const newPercentage = new BigNumber(values.newWeight).div(values.newTotalWeight).times(100);
      if (newPercentage.gte(MIN_PERCENTAGE) && newPercentage.lte(MAX_PERCENTAGE)) {
        setPercentageWarning(false);
      } else {
        return setPercentageWarning(true);
      }

      Object.entries(values.tokens).every(([, { weights }]) => {
        const currentPercentage = new BigNumber(weights).div(values.newTotalWeight).times(100);
        return currentPercentage.gte(MIN_PERCENTAGE) && currentPercentage.lte(MAX_PERCENTAGE);
      })
        ? setPercentageWarning(false)
        : setPercentageWarning(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (refFormik.current) {
        const crp = await getCrpController(pool.id, 'controller');
        const params = {
          crpAddress: crp,
          tokenAddress: refFormik.current.values.newToken,
          balance: denormalizeBalance(
            new BigNumber(refFormik.current.values.newAmount),
            tokenDecimal[refFormik.current.values.newToken],
          ).toString(),
          weight: denormalizeBalance(new BigNumber(refFormik.current.values.newWeight), FPT_DECIMALS).toString(),
          account: wallet.bsc,
        };
        const newToken = getTokenDetail(refFormik.current.values.newToken);
        await commitAddToken(params);
        setIsCommitted({
          status: true,
          token: newToken?.symbol ? newToken.symbol : '',
          param: {
            crpAddress: crp,
            tokenAddress: params.tokenAddress,
            tokenAmountIn: params.balance,
          },
        });
        await updateAddToken();
        setOpenWaitingPopup(true);
      }
      setIsSubmitting(false);

      // handleCloseDialog();
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
  };

  return (
    <Dialog fullWidth maxWidth="lg" className={cx('dialog-root')} open={open} onClose={handleCloseDialog}>
      <div className={cx('dialog-header')}>
        <div></div>

        <div>Add digital credits</div>

        <CloseIcon onClick={handleCloseDialog} />
      </div>

      <WarningPopup
        open={openWarningPopup}
        handleClose={() => setOpenWarningPopup(!openWarningPopup)}
        message={message}
      />

      {isCommitted && (
        <WaitingPopup
          open={openWaitingPopup}
          handleClose={() => setOpenWaitingPopup(false)}
          committedStatus={isCommitted}
          pool={pool}
          isLoading={true}
          handleCloseDialog={handleCloseDialog}
          updateAddToken={updateAddToken}
        />
      )}

      <div className={cx('dialog-body')}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values, { setSubmitting }) => {
            if (weightWarning || percentageWarning) {
              return true;
            }

            setSubmitting(true);
            await handleSubmit();
            setSubmitting(false);
          }}
          innerRef={refFormik}
          validationSchema={validationSchema}
          enableReinitialize
        >
          {({ values, setFieldValue, errors }) => {
            const newTokenDetail = getTokenDetail(values.newToken);

            return (
              <>
                <Form className={classes.form}>
                  <table>
                    <thead>
                      <tr>
                        <th className={cx('digital-credits-th')}>Digital credits</th>
                        <th className={cx('balance-th')}>My balance</th>
                        <th className={cx('weight-th')}>Weights</th>
                        <th className={cx('percent-th')}>Percent</th>
                        <th className={cx('amount-th')}>
                          <div>
                            <Tooltip
                              arrow
                              interactive
                              title={amountLock ? AMOUNT_TOOLTIP.LOCK : AMOUNT_TOOLTIP.UNLOCK}
                              placement="top"
                            >
                              {amountLock ? (
                                <LockIcon onClick={handleAmountLock} />
                              ) : (
                                <UnlockIcon onClick={handleAmountLock} />
                              )}
                            </Tooltip>
                            Amount
                          </div>
                        </th>
                        <th className={cx('price-th')}>Market price</th>
                        <th className={cx('value-th')}>Total value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {values.tokens.length > 0 &&
                        values.tokens.map((token) => {
                          const curTokenDetail = tokensListSG.find((element) => element.id === token.address);

                          return (
                            <tr key={token.id}>
                              <td className={cx('digital-credits-td')}>
                                <div className={cx('token-icon-symbol-unlock')}>
                                  <TokenIcon name={token.symbol} size="25" />
                                  <div>{token.symbol}</div>
                                </div>
                              </td>
                              <td className={cx('balance-td')}>-</td>
                              <td className={cx('weight-td')}>{token.weights}</td>
                              <td className={cx('percent-td')}>
                                {`${formatPoolPercent(
                                  new BigNumber(token.weights).div(values.newTotalWeight).toString(),
                                )}%`}
                              </td>
                              <td className={cx('amount-td')}>{formatTokenAmount(token.balance)}</td>
                              <td className={cx('price-td')}>
                                {amountLock ? `$${setDataPrecision(curTokenDetail?.price || '0', 4)}` : '-'}
                              </td>
                              <td className={cx('value-td')}>
                                {amountLock
                                  ? `$${new BigNumber(token.balance)
                                      .times(new BigNumber(curTokenDetail?.price || '0'))
                                      .toFixed(4)
                                      .toString()}`
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}

                      <tr>
                        <td className={cx('digital-credits-td', 'new-token')}>
                          <div
                            className={cx(
                              isDigitalCreditSelected(values.newToken) ? 'token-icon-symbol-unlock' : 'token-selector',
                            )}
                          >
                            <Button
                              endIcon={<ArrowDownIcon />}
                              onClick={(event) => {
                                setRefEml(event.currentTarget);
                              }}
                            >
                              {!isDigitalCreditSelected(values.newToken) ? (
                                <div>Choose digital credit</div>
                              ) : (
                                <>
                                  {newTokenDetail?.symbol && <TokenIcon name={newTokenDetail.symbol} size="25" />}
                                  <div>{newTokenDetail?.symbol}</div>{' '}
                                </>
                              )}
                            </Button>

                            {isDigitalCreditSelected(values.newToken) &&
                              isConnected(wallet) &&
                              walletStatus.state === WalletState.NeedApprove && (
                                <CButton
                                  size="xs"
                                  type="secondary"
                                  content="Unlock"
                                  isLoading={isUnlocking}
                                  onClick={() => approveToken(values.newToken)}
                                />
                              )}
                            <ErrorMessage className={cx('error')} component="div" name="newToken" />

                            <AssetSelector
                              refElm={refElm}
                              open={Boolean(refElm)}
                              handleClose={setRefEml}
                              assets={tokensListDB
                                .filter(
                                  (item) =>
                                    ![...pool.tokensList, values.newToken].includes(item.bsc_address.toLowerCase()),
                                )
                                .map((item) => ({
                                  id: item.bsc_address.toLowerCase(),
                                  name: item.name,
                                  symbol: item.symbol,
                                  decimals: '',
                                  price: '',
                                }))}
                              onSelectAsset={async (asset) => {
                                setRefEml(null);
                                await setFieldValue('newToken', asset.id);
                                amountLock && (await calcAmount());
                                setWalletStatus({
                                  ...walletStatus,
                                  newToken: { address: asset.id, symbol: asset.symbol },
                                });
                                await getUserNewTokenBalance(asset.id);
                                await isApproved(asset.id);
                              }}
                            />
                          </div>
                        </td>
                        <td className={cx('balance-td', 'new-token')}>{newTokenBalance}</td>
                        <td className={cx('weight-td', 'new-token')}>
                          <FastField
                            placeholder="Weights"
                            component={InputFieldPool}
                            name="newWeight"
                            limitDigitAfterPeriod={2}
                            onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                              await setFieldValue('newWeight', event.target.value);
                              await setTotalWeight();
                              amountLock && (await calcAmount());
                              await handleValidation();
                              await openPriceMatrixValidation();
                              calculateMintAmount(event.target.value);
                            }}
                          />
                        </td>
                        <td className={cx('percent-td', 'new-token')}>
                          {`${formatPoolPercent(
                            new BigNumber(values.newWeight).div(values.newTotalWeight).isNaN()
                              ? '0'
                              : new BigNumber(values.newWeight).div(values.newTotalWeight).toString(),
                            2,
                            '0',
                          )}%`}
                        </td>
                        <td className={cx('amount-td', 'new-token')}>
                          <FastField
                            placeholder="Amount"
                            component={InputFieldPool}
                            name="newAmount"
                            onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                              await setFieldValue('newAmount', event.target.value);
                              await handleValidation();
                              await openPriceMatrixValidation();
                            }}
                          />
                        </td>
                        <td className={cx('price-td', 'new-token')}>
                          {amountLock ? `$${setDataPrecision(newTokenDetail?.price || 0, 4)}` : '-'}
                        </td>
                        <td className={cx('value-td', 'new-token')}>
                          {!amountLock
                            ? '-'
                            : values.newAmount
                            ? `$${setDataPrecision(
                                new BigNumber(values.newAmount).times(newTokenDetail?.price || 0),
                                4,
                              )}`
                            : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Form>

                {!amountLock && (
                  <>
                    <button
                      className={cx('price-matrix-btn')}
                      type="button"
                      disabled={!isEmpty(errors.newToken) || !isEmpty(errors.newAmount) || !isEmpty(errors.newWeight)}
                      onClick={() => setOpenMatrixPrice(!openMatrixPrice)}
                    >
                      Internal price matrix {openMatrixPrice ? <ArrowUpIcon /> : <ArrowDownIcon2 />}
                    </button>

                    {openMatrixPrice && (
                      <PriceMatrix
                        tokens={[
                          ...values.tokens.map((token) => {
                            return {
                              symbol: String(token?.symbol),
                              balance: String(token.balance),
                              weight: String(token.weights),
                            };
                          }),
                          ...[
                            {
                              symbol: String(newTokenDetail?.symbol),
                              balance: String(refFormik.current?.values.newAmount),
                              weight: String(refFormik.current?.values.newWeight),
                            },
                          ],
                        ]}
                      />
                    )}
                  </>
                )}
              </>
            );
          }}
        </Formik>
      </div>

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

      <div className={cx('dialog-actions')}>
        <CButton
          onClick={handleCloseDialog}
          size="md"
          type="secondary"
          isDisabled={isUnlocking || isSubmitting}
          content="Cancel"
        ></CButton>
        {!isConnected(wallet) && (
          <CButton onClick={handleOpenConnectDialog} size="md" type="success" content="Connect Wallet"></CButton>
        )}

        {isConnected(wallet) && (
          <CButton
            isDisabled={isUnlocking}
            isLoading={isSubmitting}
            type="success"
            size="md"
            onClick={() => {
              if (walletStatus.state === WalletState.NotController) {
                setOpenWarningPopup(!openWarningPopup);
                return;
              }

              if (new BigNumber(totalSupply).gte(new BigNumber(poolCap))) {
                setMessage('Sorry, the pool has reached its max cap. Please change the Total FPT supply setting.');
                setOpenWarningPopup(!openWarningPopup);
                return;
              } else if (new BigNumber(totalSupply).plus(new BigNumber(mintAmount)).gt(new BigNumber(poolCap))) {
                const remainingAmount = new BigNumber(poolCap).minus(new BigNumber(totalSupply));
                setMessage(
                  `The pool can only issue ${remainingAmount.toFixed(2)} more ${pool.symbol}. Please change the Total ${
                    pool.symbol
                  } supply setting or add less liquidity.`,
                );
              }
              if (parseFloat(totalSupply) + parseFloat(mintAmount) > parseFloat(poolCap)) {
                setOpenWarningPopup(!openWarningPopup);
                return;
              }
              refFormik.current?.submitForm();
            }}
            content="Add Digital Credit"
          />
        )}
      </div>
    </Dialog>
  );
};

export default AddDigitalCreditPopup;
