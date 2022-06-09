import axios from 'axios';
import classNames from 'classnames/bind';
import { FastField, Field, FieldArray, Form, Formik, FormikProps } from 'formik';
import React from 'react';
import { useHistory } from 'react-router';
import { CButton } from 'src/components/Base/Button';
import InputField from 'src/components/Form/InputField';
import SelectField from 'src/components/Form/SelectedField';
import { routeConstants } from 'src/constants';
import { REGISTER_ADMIN_WALLET_MESSAGE } from 'src/constants/message.message';
import 'src/features/Admin/components/CreateAccount/style.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { TITLE } from 'src/features/Admin/contants';
import { AccountInfo } from 'src/features/Admin/interfaces';
import { checkExistWalletAddress, createAdmin } from 'src/features/Admin/redux/apis';
import stylesSCSS from 'src/features/Admin/styles/CreateAccount.module.scss';
import { MISSING_EXTENSION_ERROR } from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import { STELLAR_TYPE } from 'src/features/wallet/Constant';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import { isStellarAccountActive, isStellarPublicKey } from 'src/helpers/stellarHelper/address';
import { companyNameRegex, nameRegex, positionRegex, walletAddressRegex } from 'src/helpers/user';
import { DBCoin, StellarBalance } from 'src/interfaces/user';
import { getFunctionalCurrency } from 'src/services/admin';
import { useAppDispatch } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import Web3 from 'web3';
import * as yup from 'yup';
import styles from './styles';

const cx = classNames.bind(stylesSCSS);

const CreateAccount: React.FC = () => {
  const [loadingSetting, setLoadingSetting] = React.useState(false);
  const classes = styles();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const validationSchema = yup.object({
    title: yup.string().required('This field is required'),
    fullname: yup
      .string()
      .strict(false)
      .trim()
      .matches(nameRegex, 'Sorry, special characters are not allowed.')
      .required('This field is required'),
    company: yup
      .string()
      .strict(false)
      .trim()
      .matches(companyNameRegex, 'Sorry, special characters are not allowed.')
      .required('This field is required'),
    position: yup
      .string()
      .strict(false)
      .trim()
      .matches(positionRegex, 'Sorry, numbers and special characters are not allowed.')
      .required('This field is required'),
    email: yup.string().email('Please enter a correct email.').required('This field is required'),
    functional_currencies: yup.array().required().min(1, 'This field is required'),
    wallets: yup.array().of(
      yup
        .string()
        .strict(false)
        .trim()
        .matches(
          walletAddressRegex,
          `Sorry, only letters (a-z and A-Z), numbers (0-9),
             and no space or special characters are allowed.`,
        )
        .required('This field is required'),
    ),
  });
  const initialValues = {
    email: '',
    title: '',
    fullname: '',
    company: '',
    position: '',
    user_type: 0,
    functional_currencies: [] as number[],
    wallets: [''] as string[],
  };
  const refFormik = React.useRef<FormikProps<typeof initialValues>>(null);
  const [functionalCurrencyList, setFunctionalCurrencyList] = React.useState<{ value: number; label: string }[]>();

  const getFunctionalCurrencyList = async () => {
    const res = await getFunctionalCurrency();
    await setFunctionalCurrencyList(
      res?.map((item) => ({
        value: item.id,
        label: item.currency,
      })),
    );
  };

  React.useEffect(() => {
    getFunctionalCurrencyList();
  }, []);

  const arrayJoin = (stellarArr: Array<StellarBalance>, dbCoinArr: Array<DBCoin>): Array<DBCoin> => {
    const res = dbCoinArr.filter((dbCoinElement: DBCoin) => {
      return stellarArr.find((stellarElement: StellarBalance) => {
        return (
          stellarElement.asset_code === dbCoinElement.symbol &&
          stellarElement.asset_issuer === dbCoinElement.stellar_issuer &&
          stellarElement.asset_type === STELLAR_TYPE.get(dbCoinElement.type)
        );
      });
    });
    return res;
  };

  const onSubmitFunc = async (
    value: AccountInfo,
    setSubmitting: (isSubmitting: boolean) => void,
    resetForm: () => void,
    setFieldError: (param1: string, param2: string) => void,
  ): Promise<void> => {
    setSubmitting(true);
    setLoadingSetting(true);
    let saveToDb = true;
    const coinList = await dispatch(getCoinsApi());
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      dispatch(
        openSnackbar({
          message: MISSING_EXTENSION_ERROR,
          variant: SnackbarVariant.ERROR,
        }),
      );
      return;
    }
    // validate and check wallet address here
    for (let i = 0; i < value.wallets.length; i++) {
      // check validate Stellar, BSC
      const checkAddressType = value.wallets[i].substr(0, 2);
      let isBsc;
      let isStellar;
      if (checkAddressType === '0x') {
        const isAddress = window.web3.utils.isAddress(value.wallets[i]);
        if (isAddress) {
          isBsc = await window.web3.eth.getCode(value.wallets[i]);
        } else {
          setFieldError(`wallets.${i}`, REGISTER_ADMIN_WALLET_MESSAGE.INVALID_ADDRESS);
          saveToDb = false;
        }
      } else {
        isStellar = isStellarPublicKey(value.wallets[i]);
      }
      if (!isStellar && isBsc !== '0x') {
        setFieldError(`wallets.${i}`, REGISTER_ADMIN_WALLET_MESSAGE.INVALID_ADDRESS);
        saveToDb = false;
      } else {
        // check exists on DB
        const existAddress = await dispatch(checkExistWalletAddress(value.wallets[i]));
        if (existAddress.payload.data) {
          setFieldError(`wallets.${i}`, REGISTER_ADMIN_WALLET_MESSAGE.ADDRESS_EXISTS);
          saveToDb = false;
        }
        if (isStellar) {
          // check active
          const stellarActive = isStellarAccountActive(value.wallets[i]);
          if (!stellarActive) {
            setFieldError(`wallets.${i}`, REGISTER_ADMIN_WALLET_MESSAGE.ADDRESS_NOT_ACTIVE);
            saveToDb = false;
          }
          // check trusline
          const response = await axios
            .get(`${process.env.REACT_APP_HORIZON}accounts/${value.wallets[i]}`)
            .catch((error) => error);
          const dbAssetCode = coinList.payload.data;
          const stellarAssetCode = response.data.balances;
          const arrJoin = arrayJoin(stellarAssetCode, dbAssetCode);
          if (arrJoin.length !== dbAssetCode.length) {
            setFieldError(`wallets.${i}`, REGISTER_ADMIN_WALLET_MESSAGE.ADDRESS_NOT_TRUSTLINE);
            saveToDb = false;
          }
        }
      }
    }
    // call server to save admin
    if (saveToDb) {
      const result = await dispatch(createAdmin(value));
      if (createAdmin.fulfilled.match(result)) {
        dispatch(
          openSnackbar({
            message: 'Create new admin successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
        resetForm();
        history.push(routeConstants.ADMIN_LIST);
      }
      // This address or email is already
      if (result.payload.code === 1) {
        setFieldError('email', REGISTER_ADMIN_WALLET_MESSAGE.EMAIL_REGISTED);
      }
      setSubmitting(false);
    }
    setLoadingSetting(false);
  };

  return (
    <div className={cx('admin-create')}>
      <>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manage admin',
              onClick: (): void => history.push(routeConstants.ADMIN_LIST),
            },
            {
              content: 'Admin list',
              onClick: (): void => history.push(routeConstants.ADMIN_LIST),
            },
            {
              content: 'Create admin account',
            },
          ]}
        />

        <div className={cx('title')}>Create admin account</div>

        <div className={cx('form-container')}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (value, { setSubmitting, resetForm, setFieldError }) =>
              await onSubmitFunc(value, setSubmitting, resetForm, setFieldError)
            }
            innerRef={refFormik}
          >
            {(formikProps): JSX.Element => {
              // do something here ...
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { values, errors, touched, isSubmitting } = formikProps;
              return (
                <Form className={classes.form} id="create-form">
                  <div className={cx('form-control')}>
                    <FastField
                      name="title"
                      component={SelectField}
                      label="Title"
                      placeholder="Choose your title"
                      options={TITLE}
                    />
                  </div>
                  <div className={cx('form-control')}>
                    <FastField name="fullname" component={InputField} label="Full name" placeholder="Full name" />
                  </div>
                  <div className={cx('form-control')}>
                    <FastField
                      name="company"
                      component={InputField}
                      label="Company/Organization"
                      placeholder="Company/Organization"
                    />
                  </div>
                  <div className={cx('form-control')}>
                    <FastField name="position" component={InputField} label="Position" placeholder="Position" />
                  </div>
                  <div className={cx('form-control')}>
                    <FastField name="email" component={InputField} label="Email" placeholder="Email" />
                  </div>
                  <div className={cx('form-control')}>
                    <Field
                      name="functional_currencies"
                      component={SelectField}
                      label="Functional currency"
                      placeholder="Choose your functional currency"
                      options={functionalCurrencyList}
                      isMulti={true}
                      isSearch={true}
                      showSearchBar={true}
                    />
                  </div>
                  <div className={cx('form-control')}>
                    <label>Wallet addresses</label>
                    <FieldArray name="wallets">
                      {(arrayHelpers) => {
                        return (
                          <div>
                            {values.wallets.length > 0 &&
                              values.wallets.map((wallet, index, array) => (
                                <div key={index} className={`${classes.wallets} ${cx('wallet-address-field')}`}>
                                  <FastField
                                    name={`wallets.${index}`}
                                    component={InputField}
                                    placeholder="Wallet addresses"
                                  />
                                  {index === 0 ? (
                                    <CButton
                                      classNamePrefix="add-btn"
                                      size="sm"
                                      type="primary"
                                      content="+"
                                      onClick={() => {
                                        if (array?.every((element) => element !== '')) arrayHelpers.push('');
                                      }}
                                    />
                                  ) : (
                                    <CButton
                                      classNamePrefix="remove-btn"
                                      size="sm"
                                      type="error"
                                      content="x"
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  )}
                                </div>
                              ))}
                          </div>
                        );
                      }}
                    </FieldArray>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
        <div className={cx('btn-submit')}>
          <CButton
            onClick={() => refFormik.current?.handleSubmit()}
            size={'md'}
            type={'primary'}
            isLoading={loadingSetting}
            fullWidth={false}
            content="Create account"
          />
        </div>
      </>
    </div>
  );
};

export default CreateAccount;
