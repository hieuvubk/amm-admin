import React, { FC } from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import { UserRole } from 'src/features/UserList/Constant';
import { getCookieStorage } from 'src/helpers/storage';
import jwt_decode from 'jwt-decode';

interface Props {
  component: typeof React.Component;
  auth: boolean;
}

const PrivateRoute: FC<Props> = ({ component: Component, auth = !!getCookieStorage('access_token'), ...rest }) => {
  let role = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenDecoded: any = jwt_decode(getCookieStorage('access_token'));
    role = tokenDecoded?.role;
  } catch (error) {}
  return (
    <Route
      {...rest}
      render={(props: RouteComponentProps) =>
        auth && Number(role) !== UserRole.USER ? <Component {...props} /> : <Redirect to={routeConstants.SIGN_IN} />
      }
    />
  );
};

export default PrivateRoute;
