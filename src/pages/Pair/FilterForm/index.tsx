import { InputLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { CSelect } from 'src/components/Base/Select';
import { stylesRegistration } from './styles';
import classnames from 'classnames/bind';
import style from 'src/pages/Pair/styles/Pairs.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilter, STATUS } from 'src/pages/Pair/constants/Constant';
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
    conditionFilter.status = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeDigitalCredit = (value?: string): void => {
    conditionFilter.base_coin_symbol = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleOnChangeDigitalCredit = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.base_coin_symbol = '') : (conditionFilter.base_coin_symbol = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('status-label')}>Status:</InputLabel>
        <CSelect
          options={STATUS}
          defaultValue={STATUS[0]}
          className={cx('select')}
          onChange={(value): void => {
            handleChangeStatus(value);
          }}
          placeholder="Status"
        />
      </div>
      <div>
        <CInput
          isSearch
          size="sm"
          placeholder="Search base currency"
          onKeyPress={(value: string): void => handleChangeDigitalCredit(value)}
          onChange={(value: string): void => handleOnChangeDigitalCredit(value)}
        />
      </div>
    </div>
  );
};
