import React, { useState } from 'react';
import { forgotPassword } from 'src/services/user';
import Verification from 'src/pages/ForgotPassword/pages/Vertification';
import ResetPassword from 'src/pages/ForgotPassword/pages/ResetPassword';
import GetPassToken from 'src/pages/ForgotPassword/pages/GetPassToken';

const ForgotPassword2: React.FC = () => {
  const [getPassTokenSuccess, setGetPassTokenSuccess] = useState<boolean>(false);
  const [verification, setVerification] = useState<boolean>(false);
  const [resetPassword, setResetPassword] = useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [passToken, setPassToken] = useState<string>('');

  const onGetPassToken = async (resetPassEmail: string | undefined) => {
    if (resetPassEmail) setEmail(resetPassEmail);

    const res = await forgotPassword({ email: resetPassEmail ? resetPassEmail : email });

    if (res && res.code === 0) {
      setEmail(resetPassEmail ? resetPassEmail : email);
      setGetPassTokenSuccess(true);
      setVerification(true);
    } else {
      setGetPassTokenSuccess(false);
    }
  };

  return (
    <>
      {!resetPassword && !verification && <GetPassToken onGetPassToken={onGetPassToken} />}
      {resetPassword && <ResetPassword token={passToken} email={email} />}
      {verification && (
        <Verification
          email={email}
          resendCode={onGetPassToken}
          setResetPassword={setResetPassword}
          setPassToken={setPassToken}
          setVerification={setVerification}
          getPassTokenSuccess={getPassTokenSuccess}
        />
      )}
    </>
  );
};

export default ForgotPassword2;
