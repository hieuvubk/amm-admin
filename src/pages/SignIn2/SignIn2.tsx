import React, { useState } from 'react';
import * as yup from 'yup';
import classNames from 'classnames/bind';
import { FastField, Form, Formik, ErrorMessage } from 'formik';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles';
import stylesSCSS from 'src/pages/SignIn2/styles/Login.module.scss';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import InputField from 'src/components/Form/InputField';
import { useAppDispatch } from 'src/store/hooks';
import LoginAttemptsExceeded from 'src/pages/SignIn2/components/LoginAttemptsExceeded';
import Error from 'src/components/Form/Error';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import { postLogin } from 'src/store/auth';
import ChangePassword from 'src/pages/SignIn2/components/ChangePassword';
import { routeConstants } from 'src/constants';

const cx = classNames.bind(stylesSCSS);

const SignIn2: React.FC = () => {
  const [isShowScreenLock, setIsShowScreenLock] = useState(false);
  const [showCaptchaError, setShowCaptcharError] = useState(true);

  const [changePassword, setChangePassword] = useState(false);
  const [username, setUsername] = useState<string>('');

  const dispatch = useAppDispatch();
  const classes = styles();
  const history = useHistory();

  const validationSchema = yup.object({
    username: yup.string().required('This field is required'),
    password: yup.string().required('This field is required'),
    isVerify: yup.string().required(),
  });

  const initialValues = {
    username: '',
    password: '',
    isVerify: '',
  };

  return (
    <>
      {changePassword && <ChangePassword username={username} setChangePassword={setChangePassword} />}

      {!changePassword && (
        <div className={cx('user-sign-in')}>
          {!isShowScreenLock && (
            <div className={cx('form-container-margin')}>
              <div className={cx('form-container')}>
                <Typography variant="h3" className={cx('title')}>
                  Sign In
                </Typography>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (value, { setSubmitting }): Promise<void> => {
                    setSubmitting(true);
                    const res = await dispatch(postLogin(value));

                    if (res?.payload?.status_code === 400 && res?.payload?.code === 'INVALID_GOOGLE_CAPTCHA') {
                      dispatch(
                        openSnackbar({
                          message: 'Invalid Captcha.',
                          variant: SnackbarVariant.ERROR,
                        }),
                      );
                      return;
                    }

                    if (res?.payload?.status_code === 403) {
                      if (res?.payload?.code === httpExceptionSubCode.FORBIDDEN.LOCK_ACCOUNT) {
                        setIsShowScreenLock(true);
                        return;
                      }

                      if (res?.payload?.code === httpExceptionSubCode.FORBIDDEN.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD) {
                        setUsername(value.username);
                        setChangePassword(true);
                        return;
                      }
                    }

                    if (res?.payload.code === 0) {
                      history.push(routeConstants.DASHBOARD);
                      return;
                    }

                    setSubmitting(false);
                  }}
                >
                  {(formikProps): JSX.Element => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { values, errors, touched, isSubmitting, setFieldValue } = formikProps;

                    return (
                      <>
                        <Form className={classes.form} id="create-form">
                          <FastField name="username" component={InputField} label="Email" placeholder="Email" />

                          <FastField
                            type="password"
                            name="password"
                            component={InputField}
                            label="Password"
                            placeholder="Password"
                          />
                          <div
                            className={cx('forgot_password')}
                            onClick={() => history.push(routeConstants.FORGOT_PASSWORD)}
                          >
                            Forgot password
                          </div>

                          <div className={cx('g-recaptcha')}>
                            <ReCAPTCHA
                              sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_SITEKEY || ''}
                              onExpired={() => {
                                setFieldValue('isVerify', '');
                                setShowCaptcharError(false);
                              }}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onChange={(v: any) => {
                                setFieldValue('isVerify', v);
                              }}
                            />
                          </div>
                          {showCaptchaError && (
                            <ErrorMessage
                              name="isVerify"
                              component={(): JSX.Element => (
                                <Error errorName="Please verify that you are not a robot" />
                              )}
                            />
                          )}
                        </Form>

                        <Button
                          form="create-form"
                          variant="contained"
                          color="primary"
                          type="submit"
                          className={classes.button}
                        >
                          Sign In
                        </Button>
                      </>
                    );
                  }}
                </Formik>
              </div>
            </div>
          )}

          {isShowScreenLock && <LoginAttemptsExceeded setIsShowScreenLock={setIsShowScreenLock} alt="Locked Account" />}
        </div>
      )}
    </>
  );
};

export default SignIn2;
