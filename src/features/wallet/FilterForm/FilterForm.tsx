import { InputLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { CSelect } from 'src/components/Base/Select';
import { styles } from 'src/features/wallet/FilterForm/styles';
import classnames from 'classnames/bind';
import style from 'src/features/wallet/Wallets.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilter, USER_TYPE, WALLET_STATUS } from 'src/features/wallet/Constant';
const cx = classnames.bind(style);

interface IFilterFormProps {
  conditionFilter: IFilter;
  handleFilterCondition?: (condition: IFilter) => void;
  displayStatus?: boolean;
  displayUserType?: boolean;
  displayUserId?: boolean;
  searchTitle?: string;
  validateNumber?: boolean;
  placeholder?: string;
}
export const FilterWalletForm: React.FC<IFilterFormProps> = (props) => {
  const classes = styles();
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);

  const filter = (conditionFilter: IFilter): void => {
    if (props.handleFilterCondition) props.handleFilterCondition(conditionFilter);
  };

  const handleChangeUserType = (value: number): void => {
    conditionFilter.user_type = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleChangeStatus = (value: number): void => {
    conditionFilter.status = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeUserId = (value: number): void => {
    conditionFilter.user_id = value ? parseInt(String(value)) : value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleOnChangeUserId = (value: number): void => {
    Number(value) === 0 ? (conditionFilter.user_id = 0) : (conditionFilter.user_id = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={classes.filterForm}>
      <div className={props.displayStatus ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>Status:</InputLabel>
        <CSelect
          options={WALLET_STATUS}
          defaultValue={WALLET_STATUS[0]}
          onChange={(value): void => {
            handleChangeStatus(value);
          }}
          placeholder="Status"
        />
      </div>
      <div className={props.displayUserType ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>User type:</InputLabel>
        <CSelect
          options={USER_TYPE}
          onChange={(value): void => {
            handleChangeUserType(value);
          }}
          defaultValue={USER_TYPE[0]}
          placeholder="User type"
        />
      </div>
      <div className={props.displayUserId ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>{props.searchTitle}:</InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder={props.placeholder}
          onKeyPress={(value: number): void => handleChangeUserId(value)}
          onChange={(value: number): void => handleOnChangeUserId(value)}
          validateNumber={props.validateNumber}
        />
      </div>
    </div>
  );
};

FilterWalletForm.defaultProps = {
  displayStatus: true,
  displayUserType: true,
  displayUserId: true,
  searchTitle: 'User ID',
  validateNumber: false,
  placeholder: '',
};
