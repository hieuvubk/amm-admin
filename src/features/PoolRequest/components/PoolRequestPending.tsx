/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import stylesSCSS from 'src/features/PoolRequest/styles/PoolRequestPending.module.scss';
import classnames from 'classnames/bind';
import { RadioGroup, FormControlLabel, Radio, Button, Tooltip } from '@material-ui/core';
import { ReactComponent as PlusIcon } from 'src/assets/icon/plus2.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/icon/delete.svg';
import { ReactComponent as ArrowDownIcon } from 'src/assets/icon/Arrow-Down.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { ReactComponent as LockIcon } from 'src/assets/icon/lock2.svg';
import { ReactComponent as UnlockIcon } from 'src/assets/icon/unlock.svg';
import { ReactComponent as QuestionIcon } from 'src/assets/icon/question.svg';
import { ReactComponent as ArrowDownIcon2 } from 'src/assets/icon/sidebar/arrow-down.svg';
import { ReactComponent as ArrowUpIcon } from 'src/assets/icon/sidebar/arrow-up.svg';
import { bnum, isDigitalCreditSelected } from 'src/pages/CreatePoolRequest/helpers';
import AssetSelector from 'src/pages/CreatePoolRequest/AssetSelector';
import { CCheckbox } from 'src/components/Base/Checkbox';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { useHistory, useParams } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import { FLEXIBLE_POOL_RIGHTS, POOL_TYPE, POOL_TYPE_RADIO } from 'src/features/Pools/constants';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getTokensList } from 'src/features/Pools/redux/apis';
import { TokenPrice } from 'src/interfaces/pool';
import BigNumber from 'src/helpers/bignumber';
import { ErrorMessage, FastField, Field, FieldArray, FieldArrayRenderProps, Form, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import InputFieldPool from 'src/features/Pools/component/InputFieldPool';
import styles from 'src/features/PoolRequest/styles/styles';
import {
  approve,
  checkApprove,
  getTokenApprove,
  getTokenBalance,
  getUserBalance,
  hasAdminRole,
  TokenBalance,
} from 'src/pages/CreatePoolRequest/helpers/userBalance';
import { buildProxy, getUserProxy, isProxyExist } from 'src/pages/CreatePoolRequest/helpers/proxy';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { denormalizeBalance, normalizeBalance } from 'src/pages/CreatePoolRequest/helpers/utils';
import { createFixPool, createSmartPool } from 'src/pages/CreatePoolRequest/helpers/newPool';
import { zeroAddress } from 'src/pages/CreatePoolRequest/constants/addresses';
import {
  AMOUNT_TOOLTIP,
  DEFAULT_ADD_TOKEN_TIMELOCK,
  DEFAULT_INITIAL_SUPPLY,
  DEFAULT_WEIGHT_CHANGE_DURATION,
  ERROR_MESSAGES,
  maxDigitsAfterDecimalRegex,
  MAX_BALANCE,
  MAX_FEE,
  MAX_PERCENTAGE,
  MAX_WEIGHT,
  MIN_BALANCE,
  MIN_DECIMAL,
  MIN_FEE,
  MIN_PERCENTAGE,
  MIN_WEIGHT,
  tokensAddressRegex,
  WalletState,
} from 'src/pages/CreatePoolRequest/constants';
import { INewPool, WalletStatus } from 'src/pages/CreatePoolRequest/interfaces';
import mapValues from 'lodash/mapValues';
import { CButton } from 'src/components/Base/Button';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { getPoolRequestDetail, updatePoolRequestDetail } from 'src/features/PoolRequest/api';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import { PoolStatus, PoolType } from 'src/features/PoolRequest/constants';
import { CTextArea } from 'src/components/Base/TextArea';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import PriceMatrix from 'src/features/Pools/component/PriceMatrix';
import _ from 'lodash';
import { createPoolHistoryLog } from 'src/pages/CreatePoolRequest/helpers/historyLog';
import { clearPoolRequestDetail } from 'src/features/PoolRequest/redux/PoolRequest.slice';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';
import CheckboxImage from 'src/components/Base/CheckboxImage';
import { tokenDecimals } from 'src/features/Pools/helper/dataFormater';

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
  unapprovedToken: { address: '', symbol: '' },
};

const FPT_DECIMALS = 18;

export interface TokenApprove {
  [tokenAddress: string]: boolean;
}

const cx = classnames.bind(stylesSCSS);
const PoolRequestPending: React.FC = () => {
  const classes = styles();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [wallet, tokensListSG, poolRequestDetail, tokensListDB] = useAppSelector((state) => [
    state.wallet,
    state.pool.tokens.data,
    state.poolRequest.current.data,
    state.allCoins.coins.data,
  ]);

  const [openMatrixPrice, setOpenMatrixPrice] = React.useState(false);
  const [myBalance, setMyBalance] = React.useState<TokenBalance>({});
  const [tokenApproved, setTokenApproved] = React.useState<TokenApprove>({});
  const [refElm, setRefEml] = React.useState<HTMLButtonElement | null>(null);
  const [curIdx, setCurIdx] = React.useState(0);
  const [curTokenAddress, setCurTokenAddress] = React.useState('');
  const [proxy, setProxy] = React.useState<string>('');

  const [weightWarning, setWeightWarning] = React.useState<boolean>(false);
  const [feeWarning, setFeeWarning] = React.useState<boolean>(false);
  const [percentageWarning, setPercentageWarning] = React.useState(false);

  const [walletStatus, setWalletStatus] = React.useState<WalletStatus>(defaultWalletState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const refFormik = React.useRef<FormikProps<INewPool>>(null);
  const tokenDecimal = useAppSelector(tokenDecimals);

  const poolRequestCoins =
    tokensListDB &&
    poolRequestDetail.pool_coins &&
    tokensListDB.filter((coin) => poolRequestDetail.pool_coins.some(({ coin_id }) => coin_id === coin.id));

  const initialTokens = poolRequestCoins && poolRequestCoins.map((coin) => coin.bsc_address.toLowerCase());

  const initialWeights =
    initialTokens &&
    poolRequestDetail.pool_coins &&
    poolRequestDetail.pool_coins.reduce(
      (prevValue, { weight }, index) => ((prevValue[initialTokens[index]] = Number(weight).toFixed(2)), prevValue),
      {} as Record<string, string>,
    );

  const initialAmounts =
    initialTokens &&
    poolRequestDetail.pool_coins &&
    poolRequestDetail.pool_coins.reduce(
      (prevValue, { weight }, index) => ((prevValue[initialTokens[index]] = ''), prevValue),
      {} as Record<string, string>,
    );

  const initialTotalWeight =
    poolRequestDetail.pool_coins &&
    poolRequestDetail.pool_coins.reduce((prevValue, { weight }) => prevValue + Number(weight), 0);

  const initialValues: INewPool = {
    type: poolRequestDetail.type === PoolType.Fixed ? POOL_TYPE.FIXED.value : POOL_TYPE.FLEXIBLE.value,
    amountLock: true,
    amounts: initialAmounts
      ? initialAmounts
      : {
          token1: '',
          token2: '',
        },
    weights: initialWeights
      ? initialWeights
      : {
          token1: '',
          token2: '',
        },
    totalWeight: initialTotalWeight ? String(initialTotalWeight) : '',
    swapFee: poolRequestDetail.fee_ratio_lp ? bnum(poolRequestDetail.fee_ratio_lp).toFixed(2) : '',
    protocolFee: poolRequestDetail.fee_ratio_velo ? bnum(poolRequestDetail.fee_ratio_velo).toFixed(2) : '',
    totalFee: poolRequestDetail.swap_fee ? bnum(poolRequestDetail.swap_fee).toFixed(2) : '',
    tokens: initialTokens ? initialTokens : ['token1', 'token2'],
    poolTokenSymbol: '',
    poolTokenName: '',
    rights: {
      canPauseSwapping: Boolean(poolRequestDetail.flex_right_config?.canPauseSwapping),
      canChangeSwapFee: Boolean(poolRequestDetail.flex_right_config?.canChangeSwapFee),
      canChangeWeights: Boolean(poolRequestDetail.flex_right_config?.canChangeWeights),
      canAddRemoveTokens: Boolean(poolRequestDetail.flex_right_config?.canAddRemoveTokens),
      canWhitelistLPs: Boolean(poolRequestDetail.flex_right_config?.canWhitelistLPs),
      canChangeCap: Boolean(poolRequestDetail.flex_right_config?.canChangeCap),
    },
    message: '',
  };

  const feeSchema = yup
    .number()
    .required(ERROR_MESSAGES.REQUIRED)
    .test('maxDigitsAfterDecimal', ERROR_MESSAGES.MAX_DIGITS_AFTER_DECIMAL, (number) =>
      maxDigitsAfterDecimalRegex().test(String(number)),
    );

  const isBscConnected = (): boolean => {
    return !!wallet.bsc;
  };

  const weightValidation = () => {
    const values = refFormik.current!.values;

    for (const [, weight] of Object.entries(values.weights)) {
      if (!weight) {
        setWeightWarning(false);
        return;
      }
    }

    const totalWeight = denormalizeBalance(new BigNumber(values.totalWeight), FPT_DECIMALS);

    if (totalWeight.lt(MIN_WEIGHT) || totalWeight.gt(MAX_WEIGHT)) {
      setWeightWarning(true);
      return;
    }

    setWeightWarning(false);
  };

  const allFeeValidation = () => {
    const values = refFormik.current!.values;
    const totalFee = denormalizeBalance(new BigNumber(values.totalFee).div(100), FPT_DECIMALS);

    if (totalFee.lt(MIN_FEE) || totalFee.gt(MAX_FEE)) {
      setFeeWarning(true);
      return;
    }

    setFeeWarning(false);
  };

  const percentageValidation = () => {
    const values = refFormik.current!.values;

    for (const [, weight] of Object.entries(values.weights)) {
      if (!weight) {
        setPercentageWarning(false);
        return;
      }
      const currentPercentage = bnum(weight).div(values.totalWeight).times(100);
      if (currentPercentage.gte(MIN_PERCENTAGE) && currentPercentage.lte(MAX_PERCENTAGE)) {
        setPercentageWarning(false);
      } else {
        setPercentageWarning(true);
      }
    }
  };

  const openPriceMatrixValidation = () => {
    const errors = refFormik.current!.errors;

    if (!_.isEmpty(errors.tokens) || !_.isEmpty(errors.weights) || !_.isEmpty(errors.amounts)) {
      setOpenMatrixPrice(false);
    }
  };

  React.useEffect(() => {
    dispatch(getTokensList());
    dispatch(getPoolRequestDetail(Number(id)));
    dispatch(getCoinsApi());

    return () => {
      dispatch(clearPoolRequestDetail());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (
      _.isEqual(initialValues.weights, initialWeights) &&
      _.isEqual(initialValues.totalWeight, String(initialTotalWeight))
    ) {
      weightValidation();
      allFeeValidation();
      percentageValidation();
    }
  }, [initialValues]);

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

  const getUserTokensBalance = async () => {
    const balances = await getTokenBalance(wallet.bsc);
    setMyBalance(balances);
  };

  const getBalance = (address: string) => {
    if (myBalance) {
      if (myBalance[address]) {
        return normalizeBalance(new BigNumber(myBalance[address]), tokenDecimal[address])
          .integerValue(BigNumber.ROUND_HALF_CEIL)
          .toString();
      } else return '0';
    } else return '0';
  };

  const updateWalletStatus = async () => {
    if (!wallet.bsc) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.Unknown });
      return;
    }
    const isAdmin = await hasAdminRole(wallet.bsc);
    if (!isAdmin) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NeedAdminRole });
      return;
    }
    const proxy = await getUserProxy(wallet.bsc);
    if (proxy === zeroAddress) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NeedProxy });
      return;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanCreatePool, proxy });
  };

  const getApproved = async () => {
    const approved = await getTokenApprove(wallet.bsc);
    setTokenApproved(approved);
  };

  const approveToken = async (tokenAddress: string) => {
    setIsLoading(true);
    try {
      const userProxy = walletStatus.proxy;
      await approve(wallet.bsc, userProxy, tokenAddress);
      await updateWalletStatus();
      await getApproved();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const handleProxy = async () => {
    try {
      setIsLoading(true);
      const newProxy = await buildProxy(wallet.bsc);
      setProxy(newProxy);
      await updateWalletStatus();
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  React.useEffect(() => {
    if (wallet.bsc) {
      getUserTokensBalance().then();
      updateWalletStatus().then();
      getApproved().then();
    }
    // isApproveAll();
  }, [wallet.bsc]);

  const getPercentage = (tokenAddress: string, values: INewPool) => {
    return Number(values.totalWeight) === 0
      ? 0
      : ((Number(values.weights[tokenAddress]) / Number(values.totalWeight)) * 100).toFixed(2);
  };

  const getTotalValue = (tokenAddress: string, values: INewPool) => {
    const tokenPrice = Number(getTokenDetail(tokenAddress)?.price);

    if (Number.isNaN(tokenPrice) || !values.amounts[tokenAddress]) return 0;

    return bnum(values.amounts[tokenAddress]).times(tokenPrice).toFixed(4);
  };

  const validationSchema = yup.object({
    swapFee: feeSchema.test('checkTotalFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
      return BigNumber.sum(String(value), this.parent.protocolFee).isEqualTo(this.parent.totalFee);
    }),
    protocolFee: feeSchema.test('checkTotalFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
      return BigNumber.sum(String(value), this.parent.swapFee).isEqualTo(this.parent.totalFee);
    }),
    totalFee: feeSchema,
    weights: yup.lazy((obj) =>
      yup.object(
        mapValues(obj, () =>
          yup
            .string()
            .required(ERROR_MESSAGES.REQUIRED)
            .test('notZero', ERROR_MESSAGES.WEIGHT_SMALLER_THAN_1, function (value) {
              return !new BigNumber(String(value)).lt(1);
            }),
        ),
      ),
    ),
    amounts: yup.lazy((obj) =>
      yup.object(
        mapValues(obj, (amount, address) =>
          yup
            .string()
            .required(ERROR_MESSAGES.REQUIRED)
            .test('notZero', ERROR_MESSAGES.AMOUNT_NOT_0_ERROR, function (value) {
              return !new BigNumber(String(value)).isZero();
            })
            .test('checkAmountExceedBalance', ERROR_MESSAGES.EXCEED_BALANCE, function (value) {
              return !new BigNumber(String(value)).gt(getBalance(String(address)));
            })
            .test('checkAmountValid', ERROR_MESSAGES.AMOUNT_INVALID, function (value) {
              const curAmount = denormalizeBalance(new BigNumber(String(value)), MIN_DECIMAL);
              return curAmount.lte(MAX_BALANCE) && curAmount.gte(MIN_BALANCE);
            }),
        ),
      ),
    ),
    tokens: yup.array().of(yup.string().matches(tokensAddressRegex, ERROR_MESSAGES.REQUIRED)),
    type: yup.boolean(),
    rights: yup
      .object({
        canPauseSwapping: yup.boolean(),
        canChangeSwapFee: yup.boolean(),
        canChangeWeights: yup.boolean(),
        canAddRemoveTokens: yup.boolean(),
        canWhitelistLPs: yup.boolean(),
        canChangeCap: yup.boolean(),
      })
      .when('type', {
        is: true,
        then: yup
          .object()
          .test(
            'atLeastOne',
            ERROR_MESSAGES.REQUIRED,
            (value) =>
              (value.canAddRemoveTokens ||
                value.canChangeCap ||
                value.canChangeSwapFee ||
                value.canChangeWeights ||
                value.canWhitelistLPs ||
                value.canPauseSwapping) as boolean,
          ),
        otherwise: yup.object(),
      }),
    message: yup
      .string()
      .required(ERROR_MESSAGES.REQUIRED)
      .min(10, ERROR_MESSAGES.MESSAGE_LENGTH_ERROR)
      .max(500, ERROR_MESSAGES.MESSAGE_LENGTH_ERROR),
  });

  const handleWeightAmountChange = (tokenAddress: string) => {
    const [values, setFieldValue] = [refFormik.current!.values, refFormik.current!.setFieldValue];
    const curTokenPrice = new BigNumber(String(getTokenDetail(tokenAddress)?.price));
    if (curTokenPrice.isNaN()) return;

    const curTokenValue = bnum(values.amounts[tokenAddress]).times(curTokenPrice);
    const curTotalValue = curTokenValue.div(values.weights[tokenAddress]);

    const totalWeight = values.tokens.reduce((acc, tokenAddress) => {
      const weight = new BigNumber(values.weights[tokenAddress]);
      if (!weight.isNaN()) return acc.plus(weight);
      else return acc.plus(0);
    }, new BigNumber(0));
    setFieldValue('totalWeight', totalWeight.toString());

    if (refFormik.current?.values.amountLock) {
      for (const token of values.tokens) {
        if (token === tokenAddress) continue;

        const tokenWeight = bnum(values.weights[token] || '');
        if (curTotalValue.isNaN() || tokenWeight.isNaN()) {
          setFieldValue(`amounts.${token}`, '');
          refFormik.current!.setFieldTouched(`amounts.${token}`, false);
          continue;
        }
        const tokenPrice = bnum(getTokenDetail(token)?.price);
        if (tokenPrice.isNaN() || tokenPrice.isZero()) {
          setFieldValue(`amounts.${token}`, '');
          continue;
        }

        const tokenValue = tokenWeight.times(curTotalValue);
        const tokenAmount = tokenValue.div(tokenPrice);
        setFieldValue(`amounts.${token}`, tokenAmount.toFixed(tokenDecimal[token]));
      }
    }
  };

  const handleAmountLock = () => {
    refFormik.current?.setFieldValue('amountLock', !refFormik.current.values.amountLock);
    Object.keys(refFormik.current!.values.amounts).forEach((key) => {
      refFormik.current!.setFieldValue(`amounts.${key}`, '');
      refFormik.current!.setFieldTouched(`amounts.${key}`, false);
    });
  };

  const handleSubmit = async (values: INewPool) => {
    const swapFee = denormalizeBalance(new BigNumber(values.totalFee), FPT_DECIMALS).div(100).toString();
    const protocolFee = denormalizeBalance(new BigNumber(values.protocolFee), FPT_DECIMALS).div(100).toString();
    const balances: Array<string> = [];
    const weights: Array<string> = [];
    values.tokens.map((tokenAddress) => {
      balances.push(
        denormalizeBalance(new BigNumber(values.amounts[tokenAddress]), tokenDecimal[tokenAddress]).toString(),
      );
      weights.push(denormalizeBalance(new BigNumber(values.weights[tokenAddress]), FPT_DECIMALS).toString());
    });

    if (values.type === POOL_TYPE.FIXED.value) {
      const params = {
        tokens: values.tokens,
        balances: balances,
        weights: weights,
        swapFee: swapFee,
        protocolFee: protocolFee,
        finalize: true,
        account: wallet.bsc,
      };
      const newPool = await createFixPool(params);
      await createPoolHistoryLog({ pool_id: id, wallet: wallet.bsc, status: 3 });
      return newPool;
    } else {
      const params = {
        poolParams: {
          poolTokenSymbol: 'FPT',
          poolTokenName: values.poolTokenName || '',
          constituentTokens: values.tokens,
          tokenBalances: balances,
          tokenWeights: weights,
          swapFee: swapFee,
          protocolFee: protocolFee,
        },
        crpParams: {
          initialSupply: denormalizeBalance(new BigNumber(DEFAULT_INITIAL_SUPPLY), FPT_DECIMALS).toString(),
          minimumWeightChangeBlockPeriod: DEFAULT_WEIGHT_CHANGE_DURATION,
          addTokenTimeLockInBlocks: DEFAULT_ADD_TOKEN_TIMELOCK,
        },
        rights: {
          canPauseSwapping: values.rights.canPauseSwapping,
          canChangeSwapFee: values.rights.canChangeSwapFee,
          canChangeWeights: values.rights.canChangeWeights,
          canAddRemoveTokens: values.rights.canAddRemoveTokens,
          canWhitelistLPs: values.rights.canWhitelistLPs,
          canChangeCap: values.rights.canChangeCap,
          canChangeProtocolFee: values.rights.canChangeSwapFee,
        },
        account: wallet.bsc,
      };
      const newPool = await createSmartPool(params);
      await createPoolHistoryLog({ pool_id: id, wallet: wallet.bsc, status: 3 });
      return newPool;
    }
  };

  let boundArrayHelpers: FieldArrayRenderProps;

  const bindArrayHelpers = (arrayHelpers: FieldArrayRenderProps) => {
    boundArrayHelpers = arrayHelpers;
  };

  const overflowMinNumber = (text: string, num: number) => {
    let res = '';
    let count = 0;

    for (let i = 0; i < text.length; i++) {
      res = res + text[i];
      if (/^[0-9]+$/.test(text[i])) count++;
      if (count === num) break;
    }

    if (res.length < text.length) {
      return (
        <Tooltip arrow interactive placement="top" title={text}>
          <span>{`${res}...`}</span>
        </Tooltip>
      );
    } else return res;
  };

  return (
    <div className={cx('new-pool-request')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Liquidity pool',
            onClick: () => history.push(routeConstants.POOL_REQUEST),
          },
          {
            content: 'Pool request',
            onClick: () => history.push(routeConstants.POOL_REQUEST),
          },
          {
            content: 'Pending pool request detail',
          },
        ]}
      />

      <div className={cx('title')}>Pending pool request</div>

      {weightWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>{ERROR_MESSAGES.TOTAL_WEIGHT_INVALID}</div>
        </div>
      )}

      {feeWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>{ERROR_MESSAGES.FEE_INVALID}</div>
        </div>
      )}

      {percentageWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>{ERROR_MESSAGES.PERCENTAGE_INVALID}</div>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validateOnMount
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          if (weightWarning || feeWarning || percentageWarning) {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
            return;
          }

          setSubmitting(true);
          const newPoolAddress = await handleSubmit(values);

          const initialPoolRequest = _.omit(initialValues, [
            'poolTokenSymbol',
            'poolTokenName',
            'message',
            'amounts',
            'totalWeight',
          ]);

          const createdPoolRequest = _.omit(values, [
            'poolTokenSymbol',
            'poolTokenName',
            'message',
            'amounts',
            'totalWeight',
          ]);

          const isEqual = _.isEqualWith(initialPoolRequest, createdPoolRequest, (value, other) => {
            if (!new BigNumber(value).isNaN() && !new BigNumber(other).isNaN())
              return new BigNumber(value).isEqualTo(other);
            else return undefined;
          });

          await dispatch(
            updatePoolRequestDetail({
              id: Number(id),
              status: PoolStatus.Created,
              message: values.message,
              poolAddress: newPoolAddress,
              isChange: !isEqual,
            }),
          );
          await initFetchListNotiPopup();
          setSubmitting(false);
          resetForm();

          history.push(routeConstants.POOL_REQUEST);
          dispatch(
            openSnackbar({
              message: 'A new liquidity pool has been created successfully!',
              variant: SnackbarVariant.SUCCESS,
            }),
          );
        }}
        validationSchema={validationSchema}
        innerRef={refFormik}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, setFieldTouched, errors }) => (
          <>
            {tokensListSG.length > 0 && (
              <Form className={classes.form}>
                <div className={cx('from')}>
                  <div className={cx('sub-title')}>From</div>
                  <div>{poolRequestDetail.user_id ? poolRequestDetail.user_id : ''}</div>
                </div>

                <div className={cx('email')}>
                  <div className={cx('sub-title')}>Email</div>
                  <div>{poolRequestDetail.user ? poolRequestDetail.user.email : ''}</div>
                </div>

                <div className={cx('pool-types')}>
                  <div className={cx('sub-title')}>Pool type</div>
                  <div className={cx('radio-pool-types')}>
                    <RadioGroup
                      value={values.type}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        if (!isSubmitting) {
                          setFieldValue('type', event.target.value === 'true');
                        }
                      }}
                    >
                      <FormControlLabel
                        value={POOL_TYPE_RADIO.FIXED.value}
                        control={
                          <Radio
                            disableRipple
                            icon={<span className={classes.icon} />}
                            checkedIcon={<span className={cx(classes.icon, classes.checkedIcon)} />}
                          />
                        }
                        label={POOL_TYPE_RADIO.FIXED.label}
                      />
                      <FormControlLabel
                        value={POOL_TYPE_RADIO.FLEXIBLE.value}
                        control={
                          <Radio
                            disableRipple
                            icon={<span className={classes.icon} />}
                            checkedIcon={<span className={cx(classes.icon, classes.checkedIcon)} />}
                          />
                        }
                        label={POOL_TYPE_RADIO.FLEXIBLE.label}
                      />
                    </RadioGroup>
                  </div>
                </div>

                <div className={cx('digital-credit')}>
                  <FieldArray name="tokens">
                    {(arrayHelpers) => {
                      bindArrayHelpers(arrayHelpers);

                      return (
                        <table>
                          <thead>
                            <tr>
                              <th className={cx('digital-credits-th')}>Digital credits</th>
                              <th className={cx('balance-th')}>My balance</th>
                              <th className={cx('weight-th')}>Weight</th>
                              <th className={cx('percent-th')}>Percent</th>
                              <th className={cx('amount-th')}>
                                <div>
                                  <Tooltip
                                    arrow
                                    interactive
                                    title={values.amountLock ? AMOUNT_TOOLTIP.LOCK : AMOUNT_TOOLTIP.UNLOCK}
                                    placement="top"
                                  >
                                    {values.amountLock ? (
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
                              <th
                                className={cx('add-th')}
                                onClick={async () => {
                                  if (isSubmitting) {
                                    return;
                                  }
                                  const length = values.tokens.length;

                                  if (length < 8) {
                                    let isAllDigitalCreditSelected = true;

                                    values.tokens.forEach((tokenAddress, tokenIndex) => {
                                      setFieldTouched(`weights.${tokenAddress}`, false);
                                      setFieldTouched(`amounts.${tokenAddress}`, false);

                                      if (!isDigitalCreditSelected(tokenAddress)) {
                                        isAllDigitalCreditSelected = false;
                                        setFieldTouched(`tokens[${tokenIndex}]`, true, true);
                                      }
                                    });

                                    if (isAllDigitalCreditSelected) {
                                      const tempTokenKey = await String(new Date().getTime());
                                      await arrayHelpers.push(tempTokenKey);
                                      await setFieldValue(`weights.${tempTokenKey}`, '');
                                      await setFieldValue(`amounts.${tempTokenKey}`, '');
                                      await openPriceMatrixValidation();
                                    }
                                  }
                                }}
                              >
                                <div className={values.tokens.length < 8 ? undefined : cx('transparent')}>
                                  <PlusIcon />
                                  Add
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {values.tokens.length > 0 &&
                              values.tokens.map((tokenAddress, index) => {
                                const tokenDetail = getTokenDetail(tokenAddress);
                                return (
                                  <tr
                                    key={tokenAddress === '' ? index : tokenAddress}
                                    className={cx('asset', 'asset-digital-credit')}
                                  >
                                    <td className={cx('digital-credits-td')}>
                                      <div
                                        className={cx(
                                          isDigitalCreditSelected(tokenAddress)
                                            ? 'token-icon-symbol-unlock'
                                            : 'token-selector',
                                        )}
                                      >
                                        <Button
                                          endIcon={<ArrowDownIcon />}
                                          onClick={(event) => {
                                            if (!isSubmitting) {
                                              setCurIdx(index);
                                              setCurTokenAddress(tokenAddress);
                                              setRefEml(event.currentTarget);
                                            }
                                          }}
                                        >
                                          {!isDigitalCreditSelected(tokenAddress) ? (
                                            <div>Choose digital credit</div>
                                          ) : (
                                            <>
                                              {tokenDetail?.symbol && <TokenIcon name={tokenDetail.symbol} size="25" />}
                                              <div>{tokenDetail?.symbol}</div>{' '}
                                            </>
                                          )}
                                        </Button>

                                        {isDigitalCreditSelected(tokenAddress) &&
                                          isBscConnected() &&
                                          walletStatus.state === WalletState.CanCreatePool &&
                                          tokenApproved[tokenAddress] === false && (
                                            <CButton
                                              size="xs"
                                              type="secondary"
                                              content="Unlock"
                                              onClick={() => approveToken(tokenAddress)}
                                            />
                                          )}

                                        <ErrorMessage
                                          className={cx('error')}
                                          component="div"
                                          name={`tokens[${index}]`}
                                        />
                                      </div>
                                    </td>
                                    <td className={cx('balance-td')}>
                                      {overflowMinNumber(getBalance(tokenAddress), 10)}
                                    </td>
                                    <td className={cx('weight-td')}>
                                      <FastField
                                        placeholder="Weights"
                                        limitDigitAfterPeriod={2}
                                        name={`weights.${tokenAddress}`}
                                        component={InputFieldPool}
                                        onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                          if (!isSubmitting) {
                                            await setFieldValue(`weights.${tokenAddress}`, event.target.value);
                                            await handleWeightAmountChange(tokenAddress);
                                            await weightValidation();
                                            await percentageValidation();
                                            await openPriceMatrixValidation();
                                          }
                                        }}
                                        onClick={() => {
                                          setFieldTouched(`tokens[${index}]`, true, true);
                                        }}
                                      />
                                    </td>
                                    <td className={cx('percent-td')}>{getPercentage(tokenAddress, values)}%</td>
                                    <td className={cx('amount-td')}>
                                      <FastField
                                        placeholder="Amount"
                                        name={`amounts.${tokenAddress}`}
                                        component={InputFieldPool}
                                        limitDigitAfterPeriod={5}
                                        onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                          if (!isSubmitting) {
                                            await setFieldValue(`amounts.${tokenAddress}`, event.target.value);
                                            if (!new BigNumber(tokenDetail?.price || '0').eq(0)) {
                                              await handleWeightAmountChange(tokenAddress);
                                            }
                                            await percentageValidation();
                                            await openPriceMatrixValidation();
                                          }
                                        }}
                                        onClick={async () => {
                                          await setFieldTouched(`tokens[${index}]`, true, true);
                                        }}
                                      />
                                    </td>
                                    <td className={cx('price-td')}>
                                      {values.amountLock ? `$${parseFloat(tokenDetail?.price || '0').toFixed(4)}` : '-'}
                                    </td>
                                    <td className={cx('value-td')}>
                                      {values.amountLock
                                        ? overflowMinNumber(`$${getTotalValue(tokenAddress, values)}`, 10)
                                        : '-'}
                                    </td>
                                    <td className={cx('add-td')}>
                                      <div>
                                        {values.tokens.length > 2 && (
                                          <DeleteIcon
                                            onClick={() => {
                                              setFieldValue(`weights.${tokenAddress}`, undefined);
                                              setFieldValue(`amounts.${tokenAddress}`, undefined);
                                              arrayHelpers.remove(index);
                                            }}
                                          />
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      );
                    }}
                  </FieldArray>
                </div>

                {!values.amountLock && (
                  <>
                    <button
                      className={cx('price-matrix-btn')}
                      type="button"
                      disabled={!_.isEmpty(errors.tokens) || !_.isEmpty(errors.weights) || !_.isEmpty(errors.amounts)}
                      onClick={() => setOpenMatrixPrice(!openMatrixPrice)}
                    >
                      Internal price matrix {openMatrixPrice ? <ArrowUpIcon /> : <ArrowDownIcon2 />}
                    </button>

                    {openMatrixPrice && (
                      <PriceMatrix
                        tokens={values.tokens
                          .filter((tokenAddress) => isDigitalCreditSelected(tokenAddress))
                          .map((tokenAddress) => {
                            const tokenDetail = getTokenDetail(tokenAddress);
                            return {
                              symbol: String(tokenDetail?.symbol),
                              weight: String(values.weights[tokenAddress]),
                              balance: String(values.amounts[tokenAddress]),
                            };
                          })}
                      />
                    )}
                  </>
                )}

                <div className={cx('swap-fee')}>
                  <div className={cx('sub-title')}>Swap fee (%)</div>
                  <div className={cx('input-swap-fee')}>
                    <FastField
                      placeholder="0.00"
                      name="totalFee"
                      limitDigitAfterPeriod={2}
                      component={InputFieldPool}
                      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                        if (!isSubmitting) {
                          await setFieldValue('totalFee', event.target.value);
                          await allFeeValidation();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className={cx('swap-fee-ratio')}>
                  <div className={cx('sub-title')}>Swap fee ratio (%)</div>
                  <div>
                    <div className={cx('input-wrapper')}>
                      <div className={cx('label')}>Velo admin</div>
                      <FastField
                        placeholder="0.00"
                        name="protocolFee"
                        limitDigitAfterPeriod={2}
                        component={InputFieldPool}
                        onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                          if (!isSubmitting) {
                            await setFieldValue('protocolFee', event.target.value);
                            await allFeeValidation();
                          }
                        }}
                      />
                    </div>
                    <div className={cx('input-wrapper')}>
                      <div className={cx('label')}>Liquidity provider</div>
                      <FastField
                        placeholder="0.00"
                        name="swapFee"
                        limitDigitAfterPeriod={2}
                        component={InputFieldPool}
                        onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                          if (!isSubmitting) {
                            await setFieldValue('swapFee', event.target.value);
                            await allFeeValidation();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {values.type === POOL_TYPE.FLEXIBLE.value && (
                  <div className={cx('rights')}>
                    <div className={cx('sub-title')}>Rights</div>
                    {Object.entries(values.rights).map(([rightName, value]) => {
                      return (
                        <div key={rightName} className={cx('option-wrapper')}>
                          <CheckboxImage
                            size="md"
                            checked={value}
                            disable={isSubmitting}
                            onClick={(value) => {
                              if (!isSubmitting) {
                                setFieldValue(`rights.${rightName}`, value);
                              }
                            }}
                            label={FLEXIBLE_POOL_RIGHTS[rightName]}
                          />
                        </div>
                      );
                    })}
                    <ErrorMessage className={cx('error')} component="div" name="rights" />
                  </div>
                )}

                <div className={cx('message')}>
                  <CTextArea
                    classNamePrefix={cx('input-message')}
                    placehodler="Input admin message"
                    value={values.message}
                    setTextArea={(value) => {
                      if (!isSubmitting) {
                        setFieldValue('message', value);
                      }
                    }}
                  ></CTextArea>
                  <ErrorMessage className={cx('error')} component="div" name="message" />
                </div>

                <div className={cx('action-buttons')}>
                  <CButton
                    isDisabled={isSubmitting}
                    type="secondary"
                    size="md"
                    onClick={() => history.push(routeConstants.POOL_REQUEST)}
                    content="Cancel"
                  />

                  <CButton
                    isDisabled={isSubmitting}
                    type="secondary"
                    size="md"
                    onClick={async () => {
                      if (errors && errors.message) {
                        setFieldTouched('message');
                      } else {
                        await dispatch(
                          updatePoolRequestDetail({
                            id: Number(id),
                            status: PoolStatus.Rejected,
                            message: values.message,
                          }),
                        );
                        await initFetchListNotiPopup();
                        if (isBscConnected()) {
                          await createPoolHistoryLog({ pool_id: id, wallet: wallet.bsc, status: 2 });
                        } else {
                          await createPoolHistoryLog({ pool_id: id, wallet: ' ', status: 2 });
                        }
                        await history.push(routeConstants.POOL_REQUEST);
                        dispatch(
                          openSnackbar({
                            message: 'Reject pool request successfully!',
                            variant: SnackbarVariant.SUCCESS,
                          }),
                        );
                      }
                    }}
                    content="Reject request"
                  />

                  {!isBscConnected() && (
                    <CButton type="success" size="md" onClick={handleOpenConnectDialog} content="Connect wallet" />
                  )}

                  {isBscConnected() && walletStatus.state === WalletState.NeedAdminRole && (
                    <CButton type="success" size="md" onClick={() => {}} content="Only admin" />
                  )}

                  {isBscConnected() && walletStatus.state === WalletState.NeedProxy && (
                    <CButton type="success" size="md" onClick={handleProxy} content="Setup proxy" />
                  )}

                  {isBscConnected() && walletStatus.state === WalletState.CanCreatePool && (
                    <CButton
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                      type="success"
                      size="md"
                      actionType="submit"
                      content="Create new pool"
                    />
                  )}
                </div>

                <div className={cx('tooltip-container')}>
                  {isBscConnected() && walletStatus.state === WalletState.NeedProxy && (
                    <div className={cx('tooltip')}>
                      <Tooltip
                        arrow
                        interactive
                        title={`You need to create proxy contract to manage liquidity on FCX. This is a one-time action and will save you gas in the long-term. `}
                      >
                        <div className={cx('custom-tooltip')}>
                          <div>Setup proxy</div>
                          <QuestionIcon />
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </div>

                <AssetSelector
                  refElm={refElm}
                  open={Boolean(refElm)}
                  handleClose={setRefEml}
                  assets={tokensListDB
                    .filter((item) => !values.tokens.includes(item.bsc_address.toLowerCase()))
                    .map((item) => ({
                      id: item.bsc_address.toLowerCase(),
                      name: item.name,
                      symbol: item.symbol,
                      decimals: '',
                      price: '',
                    }))}
                  onSelectAsset={async (asset: TokenPrice) => {
                    setRefEml(null);
                    await setFieldValue(`weights.${asset.id}`, '');
                    await setFieldValue(`amounts.${asset.id}`, '');
                    await boundArrayHelpers.replace(curIdx, asset.id);
                    await setFieldValue(`weights.${curTokenAddress}`, undefined);
                    await setFieldValue(`amounts.${curTokenAddress}`, undefined);
                    await setFieldTouched(`tokens[${curIdx}]`, false, true);
                  }}
                />
              </Form>
            )}
          </>
        )}
      </Formik>
    </div>
  );
};

export default PoolRequestPending;
