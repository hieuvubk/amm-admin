import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { Menu, MenuItem, ProSidebar, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import { Link, useHistory } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import './style.scss';

const useStyle = makeStyles(() => ({
  sideBar: {
    height: '100vh',
    position: 'fixed',
    zIndex: 100,
  },
}));

const Sidebar: React.FC = () => {
  const classes = useStyle();
  const history = useHistory();
  const [openRoute, setOpenRoute] = useState<string[]>([history.location.pathname?.split('/')[1]]);

  const handleOpenRoute = (route: string): void => {
    openRoute.includes(route) ? setOpenRoute(openRoute) : setOpenRoute([...openRoute, route]);
  };

  return (
    <div className={classes.sideBar}>
      <ProSidebar>
        <Menu iconShape="square">
          <SubMenu
            title="Dashboard"
            onClick={() => handleOpenRoute('dashboard')}
            open={!!openRoute.find((item) => item.indexOf('dashboard') !== -1)}
          >
            <MenuItem>
              <Link to={routeConstants.FX_CROSS_MATRIX}>FX cross matrix</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.MARKETOVERVIEW}>Market Overview</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.DASHBOARD_GENERALSETTINGS}>General Settings</Link>
            </MenuItem>
          </SubMenu>

          <SubMenu
            title="Order book"
            onClick={() => handleOpenRoute('orderbook')}
            open={!!openRoute.find((item) => item.indexOf('orderbook') !== -1)}
          >
            <MenuItem>
              <Link to={routeConstants.TRADING_FEE_SETTINGS}>Trading fee settings</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.DIGITAL_CREDIT_SETTINGS}>Digital credit settings</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.PAIR_SETTINGS}>Pair settings</Link>
            </MenuItem>
          </SubMenu>

          <SubMenu
            title="Liquidity pools"
            onClick={() => handleOpenRoute('pools')}
            open={!!openRoute.find((item) => item.indexOf('pools') !== -1)}
          >
            <MenuItem>
              <Link to={routeConstants.POOL_DASHBOARD}>Pool Dashboard</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.POOL_REQUEST}>Pool Request</Link>
            </MenuItem>
          </SubMenu>

          <SubMenu
            title="Manage user"
            onClick={() => handleOpenRoute('users')}
            open={!!openRoute.find((item) => item.indexOf('users') !== -1)}
          >
            <MenuItem>
              <Link to={routeConstants.USERLIST}>User list</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.USERREGISTRATION}>User registration</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.WALLETLIST}>Whitelist Address</Link>
            </MenuItem>
          </SubMenu>
          <SubMenu
            title="Manage admin"
            onClick={() => handleOpenRoute('admin')}
            open={!!openRoute.find((item) => item.indexOf('admin') !== -1)}
          >
            <MenuItem>
              <Link to={routeConstants.ADMIN_LIST}>Admin list</Link>
            </MenuItem>
            <MenuItem>
              <Link to={routeConstants.WHITELIST_ADDRESS}>Whitelist address</Link>
            </MenuItem>
          </SubMenu>
          <MenuItem>
            <Link to={routeConstants.HISTORY_LOG}>History log</Link>
          </MenuItem>
        </Menu>
      </ProSidebar>
    </div>
  );
};

export default Sidebar;
