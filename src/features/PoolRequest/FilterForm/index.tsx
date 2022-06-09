import { InputLabel } from '@material-ui/core';
import React from 'react';
import { CSelect } from 'src/components/Base/Select';
import { stylesRegistration } from './styles';
import classnames from 'classnames/bind';
import style from 'src/features/PoolRequest/styles/PoolRequest.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilter, USER_TYPE, POOL_TYPE, POOL_STATUS } from 'src/features/PoolRequest/constants/index';
import { useAppSelector } from 'src/store/hooks';
import AssetSelector from 'src/pages/CreatePoolRequest/AssetSelector';
const cx = classnames.bind(style);
interface IFilterFormProps {
  conditionFilter: IFilter;
  setConditionFilter: React.Dispatch<React.SetStateAction<IFilter>>;
}
export const FilterForm: React.FC<IFilterFormProps> = ({ conditionFilter, setConditionFilter }) => {
  const classes = stylesRegistration();
  const [, setUserId] = React.useState<number>();
  const digitalCreditsList = useAppSelector((state) => state.allCoins.coins.data);
  const selectTokenRef = React.useRef(null);
  const [openAssetSelector, setOpenAssetSelector] = React.useState(false);
  const [selectedToken, setSelectedToken] = React.useState({ label: 'All', value: '9999' });

  const digitalCreditOptions = [
    { id: '9999', name: 'All', symbol: 'All', decimals: '', price: '' },
    ...digitalCreditsList.map((item) => {
      return {
        id: String(item.bsc_address),
        name: item.name,
        symbol: item.symbol,
        decimals: '',
        price: '',
      };
    }),
  ];

  const handleChangeDigital = (tokenAddress: string | undefined): void => {
    const tokenSelectedID = digitalCreditsList.find(
      (token) => token.bsc_address.toLowerCase() === tokenAddress?.toLowerCase(),
    )?.id;

    setConditionFilter({ ...conditionFilter, digital_credit: tokenSelectedID, page: 1 });
  };

  const handleChangePoolType = (value: number): void => {
    setConditionFilter({ ...conditionFilter, type: value, page: 1 });
  };

  const handleChangeUserType = (value: number): void => {
    setConditionFilter({ ...conditionFilter, user_type: value, page: 1 });
  };

  const handleChangeStatus = (value: number): void => {
    setConditionFilter({ ...conditionFilter, status: value, page: 1 });
  };

  const handleChangeUser = (value: number): void => {
    const user_id = Number(value) === 0 ? undefined : value;
    setConditionFilter({ ...conditionFilter, user_id: user_id, page: 1 });
  };

  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Digital credit:</InputLabel>
        <div ref={selectTokenRef}>
          <CSelect
            value={selectedToken}
            onChange={() => {}}
            options={[]}
            menuIsOpen={false}
            onMenuOpen={() => setOpenAssetSelector(true)}
          />
        </div>

        <AssetSelector
          refElm={selectTokenRef.current}
          open={openAssetSelector}
          handleClose={() => setOpenAssetSelector(false)}
          assets={digitalCreditOptions}
          onSelectAsset={(asset) => {
            setSelectedToken({ label: asset.name, value: asset.id });
            setOpenAssetSelector(false);
            handleChangeDigital(asset.id);
          }}
        />
      </div>

      <div>
        <InputLabel className={cx('text-filter-bar')}>Pool type:</InputLabel>
        <CSelect
          options={POOL_TYPE}
          onChange={(value) => {
            handleChangePoolType(value);
          }}
          defaultValue={POOL_TYPE[0]}
          placeholder="Pool type"
        />
      </div>

      <div>
        <InputLabel className={cx('text-filter-bar')}>User type:</InputLabel>
        <CSelect
          className={cx('user-type-select')}
          options={USER_TYPE}
          onChange={(value): void => {
            handleChangeUserType(value);
          }}
          defaultValue={USER_TYPE[0]}
          placeholder="User type"
        />
      </div>

      <div>
        <InputLabel className={cx('text-filter-bar')}>Status:</InputLabel>
        <CSelect
          options={POOL_STATUS}
          onChange={(value): void => {
            handleChangeStatus(value);
          }}
          defaultValue={POOL_STATUS[0]}
          placeholder="Pool status"
        />
      </div>

      <div>
        <InputLabel className={cx('text-filter-bar')}>User ID:</InputLabel>
        <CInput
          isSearch
          validateNumber
          size="sm"
          placeholder="Search"
          onKeyPress={(value: number): void => handleChangeUser(value)}
          onChange={(value: number): void => setUserId(value)}
        />
      </div>
    </div>
  );
};
