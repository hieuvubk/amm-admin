import { InputLabel } from '@material-ui/core';
import React, { useState } from 'react';
import { CSelect } from 'src/components/Base/Select';
import { stylesHistoryLog } from 'src/features/history-log/FilterForm/style';
import classnames from 'classnames/bind';
import style from 'src/features/history-log/style/history-log.module.scss';
import { CInput } from 'src/components/Base/Input';
import { IFilterHistoryLog, DateRange } from 'src/features/history-log/interfaces/index';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import { ActivityList } from 'src/features/history-log/constants/index';
import moment from 'moment';
import { subTimeJS } from 'src/helpers/date';

const cx = classnames.bind(style);
interface IFilterFormProps {
  conditionFilter: IFilterHistoryLog;
  handleFilterCondition?: (condition: IFilterHistoryLog) => void;
  validateNumber?: boolean;
}
export const FilterFormHisToryLog: React.FC<IFilterFormProps> = (props) => {
  const classes = stylesHistoryLog();
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);
  const filter = (conditionFilter: IFilterHistoryLog): void => {
    if (props.handleFilterCondition) props.handleFilterCondition(conditionFilter);
  };
  const handleChangeActivity = (value: string): void => {
    conditionFilter.activity_type = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeDate = (obj: DateRange): void => {
    conditionFilter.from = moment(obj.startDate).set({ hour: 0, minute: 0, second: 0 }).format();
    conditionFilter.to = moment(obj.endDate).set({ hour: 23, minute: 59, second: 59 }).format();
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeUser = (value: string): void => {
    conditionFilter.admin_id = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleOnChangeUserId = (value: string): void => {
    Number(value) === 0 ? (conditionFilter.admin_id = '') : (conditionFilter.admin_id = value);
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Activity type:</InputLabel>
        <CSelect
          className={cx('status-select')}
          options={ActivityList}
          onChange={(value): void => {
            handleChangeActivity(value);
          }}
          defaultValue={ActivityList[0]}
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Date:</InputLabel>
        <CustomDateRangePicker
          onChange={(date: DateRange) => handleChangeDate(date)}
          maxDate={new Date()}
          minDate={subTimeJS(new Date(), 1, 'year')}
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Admin ID:</InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder="Search"
          validateNumber={props.validateNumber}
          onKeyPress={(value: string): void => handleChangeUser(value)}
          onChange={(value: string): void => handleOnChangeUserId(value)}
        />
      </div>
    </div>
  );
};

FilterFormHisToryLog.defaultProps = {
  validateNumber: false,
};
