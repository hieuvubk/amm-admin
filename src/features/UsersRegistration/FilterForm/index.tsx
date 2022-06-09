import { InputLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { CSelect } from 'src/components/Base/Select';
import { stylesRegistration } from './styles';
import classnames from 'classnames/bind';
import style from '../style/Registration.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilter, USER_REGISTER_STATUS } from 'src/features/UsersRegistration/constants/index';
const cx = classnames.bind(style);
interface IFilterFormProps {
  conditionFilter: IFilter;
  handleFilterCondition?: (condition: IFilter) => void;
}
export const FilterForm: React.FC<IFilterFormProps> = (props) => {
  const classes = stylesRegistration();
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);

  const filter = (conditionFilter: IFilter): void => {
    if (props.handleFilterCondition) props.handleFilterCondition(conditionFilter);
  };

  const handleChangeStatus = (value: number): void => {
    conditionFilter.user_registration = value;
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
  const handleOnChangeEmail = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.email = '') : (conditionFilter.email = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Status:</InputLabel>
        <CSelect
          className={cx('status-select')}
          options={USER_REGISTER_STATUS}
          onChange={(value): void => {
            handleChangeStatus(value);
          }}
          defaultValue={{ value: 1, label: 'Pending' }}
          placeholder="Status"
        />
      </div>
      <div>
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
