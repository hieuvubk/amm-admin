import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import classNames from 'classnames/bind';
import styles from './LiquidityProvidersSetting.module.scss';
import PoolOverview from 'src/features/Pools/component/PoolDetail/PoolOverview';
import stylesPagination from 'src/components/Pagination/style';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { CSelect } from 'src/components/Base/Select';
import { CButton } from 'src/components/Base/Button';
import { BULK_ACTION_LPER_SETTING, BULK_ACTION_TYPE, LPerSelection, LPerType } from 'src/features/Pools/constants';
import { CInput } from 'src/components/Base/Input';
import { Pagination } from '@material-ui/lab';
import BulkActionPopup from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting/BulkActionPopup';
import {
  canProvideLiquidity,
  getBSCWallets,
  switchSetting,
} from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting/helper/utils';
import { ISelect } from 'src/components/Base/Select2/Select2';
import _ from 'lodash';
import { getCrpController, getRights } from 'src/features/Pools/component/PoolDetail/Settings/helper/ultis';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import WaitingPopup from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting/WaitingPopup';
import CheckboxImage from 'src/components/Base/CheckboxImage';
import CLoading from 'src/components/Loading';
import EmailOverflowField from 'src/components/EmailOverflowField/EmailOverflowField';

const cx = classNames.bind(styles);

interface SelectUser {
  userId: string;
  email: string;
  addresses: string[];
  type: number;
  selected: boolean;
}

enum UserType {
  Restricted,
  Unrestricted,
}

enum UserTypeLabel {
  Restricted = 'Restricted user',
  Unrestricted = 'Unrestricted user',
}

const USER_TYPE = [
  { value: undefined, label: 'All' },
  { value: UserType.Restricted, label: UserTypeLabel.Restricted },
  { value: UserType.Unrestricted, label: UserTypeLabel.Unrestricted },
];

const LiquidityProvidersSetting: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const styles = stylesPagination();
  const { poolId } = useParams<{ poolId: string }>();
  const currentPool = useAppSelector((state) => state.pool.current.data);
  const loadingHeader = useAppSelector((state) => state.pool.current.loadingData);
  const [loadingData, setLoadingData] = React.useState(false);
  const [loadingSettingStatus, setLoadingSettingStatus] = React.useState(false);

  const [currentSelection, setCurrentSelection] = React.useState(LPerType.Unknow);
  const [openBulkActionPopup, setOpenBulkActionPopup] = React.useState(false);
  const [userType, setUserType] = React.useState(USER_TYPE[0]);

  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(1);
  const [allUser, setAllUser] = React.useState<SelectUser[]>([]);
  const [restricted, setRestricted] = React.useState<SelectUser[]>([]);
  const [unrestricted, setUnrestricted] = React.useState<SelectUser[]>([]);
  const [listRecordChecked, setListRecordChecked] = React.useState<SelectUser[]>([]);

  const [unWhitelistUsers, setUnWhitelistUsers] = React.useState<ISelect[]>([]);
  const [currentBulkAction, setCurrentBulkAction] = React.useState<number>(BULK_ACTION_TYPE.ADD_USER);
  const [selectedAll, setSelectedAll] = React.useState<boolean>(false);
  const [openWaitingPopup, setOpenWaitingPopup] = React.useState<boolean>(false);
  const [isWaiting, setIsWaiting] = React.useState<boolean>(false);
  const wallet = useAppSelector((state) => state.wallet);

  const getUsers = async () => {
    setLoadingData(true);
    if (currentSelection === LPerType.Segregated) {
      const BSCUsers = await getBSCWallets();
      const unWhitelist: Array<ISelect> = [];
      const whitelisted: Array<SelectUser> = [];
      const tempRestricted: Array<SelectUser> = [];
      const tempUnrestricted: Array<SelectUser> = [];
      const controller = await getCrpController(poolId, 'controller');
      await Promise.all(
        Object.keys(BSCUsers).map(async (userId) => {
          const whitelistedAddresses: Array<string> = [];
          const unWhitelistedAddresses: Array<string> = [];
          await Promise.all(
            BSCUsers[userId].map(async (user) => {
              const check = await canProvideLiquidity(user.address, controller);
              if (check) {
                whitelistedAddresses.push(user.address);
              } else {
                unWhitelistedAddresses.push(user.address);
              }
            }),
          );
          const user = {
            userId: userId,
            email: BSCUsers[userId][0].user_email,
            addresses: whitelistedAddresses,
            type: BSCUsers[userId][0].user_type,
            selected: false,
          };

          if (whitelistedAddresses.length > 0) {
            whitelisted.push(user);

            if (BSCUsers[userId][0].user_type === UserType.Restricted) {
              tempRestricted.push(user);
            }

            if (BSCUsers[userId][0].user_type === 1) {
              tempUnrestricted.push(user);
            }
          }
          if (unWhitelistedAddresses.length > 0) {
            unWhitelist.push({
              value: {
                userId: userId,
                email: BSCUsers[userId][0].user_email,
                addresses: unWhitelistedAddresses,
                type: BSCUsers[userId][0].user_type,
                selected: false,
              },
              label: `User ${userId}`,
            });
          }
        }),
      );
      setListRecordChecked(whitelisted.slice(0, 10));
      setTotalPage(Math.ceil(whitelisted.length / 10));
      setUnWhitelistUsers(unWhitelist);
      setAllUser(whitelisted);
      setRestricted(tempRestricted);
      setUnrestricted(tempUnrestricted);
    }
    setLoadingData(false);
  };

  const getSettingStatus = async () => {
    const crp = await getCrpController(poolId, 'controller');
    const rights = await getRights(crp);
    if (rights) {
      if (rights.canWhitelistLPs) {
        setCurrentSelection(LPerType.Segregated);
      } else {
        setCurrentSelection(LPerType.All);
      }
    }
  };

  const handleWaitingPopup = (waiting: boolean) => {
    setIsWaiting(waiting);
    setOpenWaitingPopup(true);
  };

  const handleOnChangeUserId = (value: string): void => {
    const currentList = userType === USER_TYPE[1] ? restricted : userType === USER_TYPE[2] ? unrestricted : allUser;

    if (value) {
      const user = currentList.find((user) => user.userId === value);

      if (user) {
        setListRecordChecked([user]);
      } else {
        setListRecordChecked([]);
      }
      setTotalPage(1);
    } else {
      setListRecordChecked(currentList.slice(0, 10));
      setPage(1);
      setTotalPage(Math.ceil(currentList.length / 10));
    }
  };

  const selectUserType = async (value: number | undefined) => {
    setUserType(value === undefined ? USER_TYPE[0] : USER_TYPE[value + 1]);
    setSelectedAll(false);
  };

  React.useEffect(() => {
    (async () => {
      await setLoadingSettingStatus(true);
      dispatch(getPoolDetail(poolId));
      await getSettingStatus();
      await setLoadingSettingStatus(false);
    })();
  }, [dispatch, poolId]);

  React.useEffect(() => {
    if (currentSelection === LPerType.Segregated) {
      getUsers().then();
    }
  }, [currentSelection]);

  React.useEffect(() => {
    const temp = userType === USER_TYPE[1] ? restricted : userType === USER_TYPE[2] ? unrestricted : allUser;
    setListRecordChecked(temp.slice(0, 10));
    setTotalPage(Math.ceil(temp.length / 10));
    setPage(1);
  }, [userType.value]);

  React.useEffect(() => {
    setListRecordChecked(
      (userType === USER_TYPE[1] ? restricted : userType === USER_TYPE[2] ? unrestricted : allUser).slice(
        (page - 1) * 10,
        page * 10,
      ),
    );
  }, [page]);

  const handleSelected = (value: boolean, userCheck: SelectUser) => {
    const user = _.cloneDeep(userCheck);
    const listClone = _.cloneDeep(listRecordChecked);
    user.selected = value;
    const idx = listClone.findIndex((rec: SelectUser) => rec.userId === user.userId);
    listClone[idx] = _.cloneDeep(user);
    setListRecordChecked(() => _.cloneDeep(listClone));
    setSelectedAll(false);
  };

  const handleSelectAll = () => {
    const userList = listRecordChecked;
    userList?.map((user) => {
      user.selected = !selectedAll;
    });
    setListRecordChecked(userList);
    setSelectedAll(!selectedAll);
  };

  const handleSwitchSelection = async (option: LPerType) => {
    handleWaitingPopup(true);
    try {
      const crp = await getCrpController(poolId, 'controller');
      await switchSetting({
        crp: crp,
        isLimit: option === LPerType.Segregated,
        account: wallet.bsc,
      });
      setCurrentSelection(option);
      handleWaitingPopup(false);
    } catch (err) {
      setOpenWaitingPopup(false);
      throw err;
    }
  };

  return (
    <div className={cx('lper-setting')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Liquidity pool',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'Pool dashboard',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'A pool detail',
            onClick: (): void => history.goBack(),
          },
          {
            content: 'Liquidity provider settings',
          },
        ]}
      />

      <div className={cx('pool-overview')}>
        {currentPool?.id && !loadingHeader ? (
          <PoolOverview pool={currentPool} showPoolInfo={false} />
        ) : (
          <div className={cx('header-loading')}>
            <CLoading size="md" type="spin" />
          </div>
        )}
      </div>

      <WaitingPopup open={openWaitingPopup} isWaiting={isWaiting} handleClose={() => setOpenWaitingPopup(false)} />

      {loadingSettingStatus || loadingData ? (
        <div className={cx('loading')}>
          <CLoading size="md" type="spin" />
        </div>
      ) : (
        <>
          <div className={cx('select-lper-type')}>
            <div>
              <span>Liquidity providers</span>
              <CSelect
                options={LPerSelection}
                onChange={async (option) => {
                  if (isConnected(wallet) && option !== currentSelection) {
                    handleSwitchSelection(option);
                  }
                }}
                // defaultValue={currentSelection === LPerType.All ? LPerSelection[0] : LPerSelection[1]}
                value={currentSelection === LPerType.All ? LPerSelection[0] : LPerSelection[1]}
              />
            </div>
            {currentSelection === LPerType.Segregated && allUser.length === 0 && (
              <CButton
                size="sm"
                type="success"
                content="+ Add user"
                onClick={() => {
                  setCurrentBulkAction(BULK_ACTION_TYPE.ADD_USER);
                  setOpenBulkActionPopup(!openBulkActionPopup);
                }}
              />
            )}
          </div>

          <div
            className={cx(`${currentSelection === LPerType.Segregated && allUser.length > 0 ? 'lper-table' : 'text'}`)}
          >
            {!loadingSettingStatus && !loadingData && currentSelection === LPerType.All && (
              <div>All users can add liquidity from this pool</div>
            )}
            {!loadingSettingStatus && !loadingData && currentSelection === LPerType.Segregated && allUser.length > 0 && (
              <>
                <div className={cx('filter-form')}>
                  <div>
                    <label>User type:</label>
                    <CSelect
                      options={USER_TYPE}
                      onChange={(value: number | undefined) => selectUserType(value)}
                      defaultValue={USER_TYPE[0]}
                      placeholder="User type"
                    />
                  </div>

                  <div>
                    <label>User ID:</label>
                    <CInput
                      isSearch
                      validateNumber
                      size="sm"
                      placeholder="Search"
                      onKeyPress={(value: string) => handleOnChangeUserId(value)}
                    />
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>
                        <CheckboxImage size="sm" checked={selectedAll} onClick={handleSelectAll} />
                      </th>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>User type</th>
                      <th className={cx('empty')}></th>
                    </tr>
                  </thead>

                  <tbody>
                    {listRecordChecked.map((user, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <CheckboxImage
                              size="sm"
                              onClick={(value) => handleSelected(value, user)}
                              checked={user.selected}
                            />
                          </td>

                          <td>
                            <Link to={`/users/${user.userId}`}>{user.userId}</Link>
                          </td>

                          <td>
                            <EmailOverflowField email={user.email} />
                          </td>

                          <td>{user.type === 0 ? 'Restricted user' : 'Unrestricted user'}</td>
                          <td className={cx('empty')}></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {listRecordChecked.length === 0 && <div className={cx('not-found')}>Not found</div>}
              </>
            )}
            {!loadingSettingStatus && !loadingData && currentSelection === LPerType.Segregated && allUser.length === 0 && (
              <>
                <div>Please add user to Segregated user list.</div>
                <div>Only users in this list can add liquidity to this pool.</div>
              </>
            )}
          </div>

          {currentSelection === LPerType.Segregated && allUser.length > 0 && (
            <div className={cx('footer')}>
              <CSelect
                value={{ value: null, label: 'Bulk Action' }}
                options={BULK_ACTION_LPER_SETTING}
                placeholder="Bulk Action"
                menuPlacement="top"
                onChange={(option) => {
                  setCurrentBulkAction(option);
                  setOpenBulkActionPopup(!openBulkActionPopup);
                }}
              />
              {totalPage > 1 && (
                <Pagination
                  className={styles.pagination}
                  page={page}
                  count={totalPage}
                  variant="outlined"
                  shape="rounded"
                  onChange={(_event, page) => setPage(page)}
                />
              )}
            </div>
          )}

          <BulkActionPopup
            poolId={poolId}
            unWhitelisted={unWhitelistUsers}
            listRecordChecked={listRecordChecked}
            remove={currentBulkAction === BULK_ACTION_TYPE.REMOVE_USER}
            open={openBulkActionPopup}
            handleClose={() => setOpenBulkActionPopup(!openBulkActionPopup)}
            loadData={() => getUsers()}
          />
        </>
      )}
    </div>
  );
};

export default LiquidityProvidersSetting;
