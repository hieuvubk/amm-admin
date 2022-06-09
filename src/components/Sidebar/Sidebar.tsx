/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './sidebar.scss';
import { ROUTE_SIDEBAR_ACCOUNT } from './routes';
import { ReactComponent as ArrowDown } from 'src/assets/icon/sidebar/arrow-down.svg';
import { ReactComponent as ArrowUp } from 'src/assets/icon/sidebar/arrow-up.svg';
import { useAppSelector } from 'src/store/hooks';
import { routeConstants } from 'src/constants';

export interface IRoute {
  name: string;
  path: string;
  component: any;
  icon?: any;
  children?: IRoute[];
}

const processRouteActive = (route: string): string => {
  if (route.includes('/pools-request/')) return routeConstants.POOL_REQUEST;
  else if (route.includes('/pools/')) return routeConstants.POOL_DASHBOARD;
  else if (route.includes('/users/user-registration')) return routeConstants.USERREGISTRATION;
  else if (route === routeConstants.WALLETLIST) return routeConstants.WALLETLIST;
  else if (route.includes('/users/')) return routeConstants.USERLIST;
  else if (route === routeConstants.WHITELIST_ADDRESS) return routeConstants.WHITELIST_ADDRESS;
  else if (route.includes('/admin/')) return routeConstants.ADMIN_LIST;
  else return route;
};

const Sidebar: React.FC = () => {
  const history = useHistory();
  const [routesActive, setRouteActive] = useState<string>(location.pathname);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [menuRoutesActive, setMenuRouteActive] = useState<string[]>([location.pathname]);
  const handleMenuRoute = (route: IRoute) => {
    if (!route.children?.length) {
      setRouteActive(processRouteActive(route.path));
      history.push(route.path);
    }
    menuRoutesActive.find((v: string) => v.indexOf(route.path) !== -1)
      ? setMenuRouteActive(menuRoutesActive.filter((item) => !(item.indexOf(route.path) !== -1)))
      : setMenuRouteActive([...menuRoutesActive, route.path]);
  };
  React.useEffect(() => {
    setRouteActive(processRouteActive(location.pathname));
  }, [location.pathname]);
  const renderMenuItem = (item: IRoute) => (
    <li
      key={item.path}
      className={`${routesActive.indexOf(item.path) !== -1 ? 'li-active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setRouteActive(processRouteActive(item.path));
        history.push(item.path);
      }}
    >
      <Link to={item.path} key={item.path} className={`${routesActive.indexOf(item.path) !== -1 ? 'active' : ''}`}>
        <span className="">{item.name}</span>
      </Link>
    </li>
  );
  const renderRoutes = (routes: IRoute[]) =>
    routes.map((item: IRoute) => {
      if (Array.isArray(item.children)) {
        const { icon: Icon } = item;

        return (
          <ul key={item.path + item.name} onClick={() => handleMenuRoute(item)}>
            <div style={{ position: 'relative' }}>
              <Icon stroke={routesActive.indexOf(item.path) ? 'var(--color-route)' : 'var(--color-primary)'} />
              <span>{item.name}</span>
              {!!item.children.length && (
                <span style={{ position: 'absolute', right: 15 }}>
                  {menuRoutesActive.find((v: string) => v.indexOf(item.path) !== -1) ? (
                    <ArrowUp stroke="var(--color-route)" />
                  ) : (
                    <ArrowDown stroke="var(--color-route)" />
                  )}
                </span>
              )}
            </div>

            {menuRoutesActive.find((v: string) => v.indexOf(item.path) !== -1) ? (
              <div>
                {!!item.children.length &&
                  item.children.map((sub: IRoute) => {
                    if (Array.isArray(sub.children)) {
                      return (
                        <ul key={sub.path + sub.name} title={sub.name}>
                          {renderRoutes(sub.children)}
                        </ul>
                      );
                    }
                    return renderMenuItem(sub);
                  })}
              </div>
            ) : null}
          </ul>
        );
      }
      return renderMenuItem(item);
    });

  return (
    <div>
      <div className="sidebar-prefix">
        {renderRoutes(ROUTE_SIDEBAR_ACCOUNT.filter((item) => item.role.includes(currentUser.role)))}
      </div>
    </div>
  );
};

export default Sidebar;
