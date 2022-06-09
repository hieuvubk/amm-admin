import classnames from 'classnames/bind';
import React, { useState } from 'react';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import stylesSCSS from 'src/features/DigitalCreditSettings/components/FilterForm/FilterForm.module.scss';
import digitalCreditStatus from 'src/features/DigitalCreditSettings/constants/digitalCreditStatus';
import { IFilter } from 'src/features/DigitalCreditSettings/interfaces';

const cx = classnames.bind(stylesSCSS);

interface IFilterFormProps {
  conditionFilter: IFilter;
  setConditionFilter: (condition: IFilter) => void;
}

const FilterForm: React.FC<IFilterFormProps> = (props) => {
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);
  const filter = (conditionFilter: IFilter): void => {
    if (props.setConditionFilter) props.setConditionFilter(conditionFilter);
  };
  const handleChange = (value: number): void => {
    conditionFilter.status = value;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleChangeDigital = (value: string): void => {
    conditionFilter.digital_credit = value;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };

  const handleOnChangeDigital = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.digital_credit = '') : (conditionFilter.digital_credit = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };

  return (
    <div className={cx('filter-form')}>
      <div className={cx('status-select-wrapper')}>
        <label className={cx('label-select')}>Status:</label>

        <CSelect
          className={cx('status-select')}
          options={digitalCreditStatus}
          defaultValue={digitalCreditStatus[0]}
          onChange={(status: number): void => handleChange(status)}
        />

        <CInput
          isSearch
          className={cx('search-input')}
          type="text"
          placeholder={'Search Digital credits'}
          size="sm"
          onKeyPress={(digital_credit: string): void => handleChangeDigital(digital_credit)}
          onChange={(value: string): void => handleOnChangeDigital(value)}
        />
      </div>
    </div>
  );
};

export default FilterForm;
