import { InputLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { CSelect } from 'src/components/Base/Select';
import { styles } from 'src/features/UserList/FilterForm/styles';
import classnames from 'classnames/bind';
import style from 'src/features/UserList/Users.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilter, USER_STATUS_SEARCH, USER_TYPE } from 'src/features/UserList/Constant';

const cx = classnames.bind(style);

interface IFilterFormProps {
  conditionFilter: IFilter;
  handleFilterCondition?: (condition: IFilter) => void;
  displayUserType?: boolean;
  displayStatus?: boolean;
  displayUserId?: boolean;
  displayEmail?: boolean;
  searchTitle?: string;
  showSearchTitle?: boolean;
  validateNumber?: boolean;
  placeholder?: string;
}
export const FilterForm: React.FC<IFilterFormProps> = (props) => {
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

  const handleChangeEmail = (value: string): void => {
    conditionFilter.email = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleChangeUserId = (value: string): void => {
    conditionFilter.user_id = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleOnChangeUserId = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.user_id = '') : (conditionFilter.user_id = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };

  const handleOnChangeEmail = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.email = '') : (conditionFilter.email = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={classes.filterForm}>
      <div className={props.displayUserType ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>User type:</InputLabel>
        <CSelect
          options={USER_TYPE}
          onChange={(value): void => {
            handleChangeUserType(value);
          }}
          placeholder="User type"
          defaultValue={USER_TYPE[0]}
        />
      </div>
      <div className={props.displayStatus ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>Status:</InputLabel>
        <CSelect
          options={USER_STATUS_SEARCH}
          onChange={(value): void => {
            handleChangeStatus(value);
          }}
          placeholder="Status"
          defaultValue={USER_STATUS_SEARCH[0]}
        />
      </div>
      <div className={props.displayUserId ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>
          {props.showSearchTitle ? `${props.searchTitle}:` : ''}
        </InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder={props.placeholder}
          validateNumber={props.validateNumber}
          onKeyPress={(value: string): void => handleChangeUserId(value)}
          onChange={(value: string): void => handleOnChangeUserId(value)}
        />
      </div>
      <div className={props.displayEmail ? cx('') : cx('hide-element')}>
        <InputLabel className={cx('text-filter-bar')}>Email:</InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder="Email"
          onKeyPress={(value: string): void => handleChangeEmail(value)}
          onChange={(value: string): void => handleOnChangeEmail(value)}
        />
      </div>
    </div>
  );
};

FilterForm.defaultProps = {
  displayUserType: true,
  displayStatus: true,
  displayUserId: true,
  displayEmail: true,
  searchTitle: 'User ID',
  showSearchTitle: true,
  validateNumber: false,
  placeholder: '',
};
