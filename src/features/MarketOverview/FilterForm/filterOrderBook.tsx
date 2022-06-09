import { InputLabel } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { useState } from 'react';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import { IFilter, PAIR } from 'src/features/MarketOverview/constants/index';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import { renderDate } from 'src/helpers/date';
import { DateRange } from 'src/interfaces/user';
import style from '../style/MarketOverView.module.scss';
import { stylesFilter } from 'src/features/MarketOverview/FilterForm/styles';
const cx = classnames.bind(style);
interface IFilterFormProps {
  conditionFilter: IFilter;
  handleFilterCondition?: (condition: IFilter) => void;
  validateNumber?: boolean;
}
export const FilterOrderBook: React.FC<IFilterFormProps> = (props) => {
  const classes = stylesFilter();
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);
  const filter = (conditionFilter: IFilter): void => {
    if (props.handleFilterCondition) props.handleFilterCondition(conditionFilter);
  };

  const handleChangePair = (value: number): void => {
    conditionFilter.pair_id = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeUser = (value: string): void => {
    conditionFilter.user_id = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangTime = (date: DateRange) => {
    conditionFilter.start_date = renderDate(date.startDate);
    conditionFilter.end_date = renderDate(date.endDate);
    conditionFilter.page = 1;
  };
  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Pair:</InputLabel>
        <CSelect
          options={PAIR}
          onChange={(value): void => {
            handleChangePair(value);
          }}
          placeholder="All"
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>User Id:</InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder="Search"
          onKeyPress={(value: string): void => handleChangeUser(value)}
          validateNumber={props.validateNumber}
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Time:</InputLabel>
        <CustomDateRangePicker
          onChange={(date: DateRange) => handleChangTime(date)}
          classNameProps={'fix-style-date-range'}
        />
      </div>
    </div>
  );
};

FilterOrderBook.defaultProps = {
  validateNumber: false,
};
