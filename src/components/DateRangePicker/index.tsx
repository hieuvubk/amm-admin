import React, { useEffect, useRef, useState } from 'react';
import { DateRangePicker as DatePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addTimeJS, getEndOfDay, getFirstOfDay, renderDate, subTimeJS } from 'src/helpers/date';
import useOnClickOutside from 'src/hooks/useClickOutside';
import './style.scss';
import { ReactComponent as ArrowDown } from 'src/assets/icon/Arrow-Down.svg';

interface IDate {
  startDate: Date;
  endDate: Date;
}
interface Props {
  onChange: (v: IDate) => void;
  showOptionDate?: boolean;
  classNameProps?: string;
  maxDate?: Date;
  minDate?: Date;
  inChart?: boolean;
  month?: number;
  formStyle?: string;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  defaultShowDate?: boolean;
  startDate?: Date;
  endDate?: Date;
}

const CustomDateRangePicker: React.FC<Props> = ({
  onChange = () => {},
  showOptionDate = false,
  classNameProps: classNameProps,
  maxDate,
  minDate,
  inChart = false,
  month = 2,
  formStyle = '',
  defaultStartDate,
  defaultEndDate,
  defaultShowDate = false,
  startDate,
  endDate,
}) => {
  const [show, setShow] = useState(false);
  const [showDate, setShowDate] = useState(defaultShowDate);
  const [state, setState] = useState([
    {
      startDate: defaultStartDate ? defaultStartDate : subTimeJS(new Date(new Date().setHours(0, 0, 0, 0)), 1, 'week'),
      endDate: defaultEndDate ? defaultEndDate : new Date(new Date().setHours(0, 0, 0, 0)),
      key: 'selection',
    },
  ]);
  const refDate = useRef({
    startDate: state[0].startDate,
    endDate: state[0].endDate,
  });

  useEffect(() => {
    setState([
      {
        startDate: startDate ? startDate : subTimeJS(new Date(new Date().setHours(0, 0, 0, 0)), 1, 'week'),
        endDate: endDate ? endDate : new Date(new Date().setHours(0, 0, 0, 0)),
        key: 'selection',
      },
    ]);
  }, [startDate, endDate]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnChange = (ranges: any) => {
    const { selection } = ranges;

    setState([
      {
        ...selection,
        startDate: new Date(getFirstOfDay(selection.startDate)),
        endDate: new Date(getEndOfDay(selection.endDate)),
      },
    ]);
  };
  const ref = useRef(null);

  const handleClickOutside = () => {
    setShow(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <div>
      <div className={`btn-select ${classNameProps}`}>
        {showOptionDate && (
          <span>
            <button
              onClick={() => {
                onChange({
                  startDate: subTimeJS(new Date(), 1, 'week'),
                  endDate: addTimeJS(new Date(), 1, 'day'),
                });
              }}
              className="btn-element"
              style={{ background: 'var(--color-input-bg)' }}
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                onChange({
                  startDate: subTimeJS(new Date(), 30, 'day'),
                  endDate: addTimeJS(new Date(), 1, 'day'),
                });
              }}
              className="btn-element"
              style={{ background: 'var(--color-input-bg)' }}
            >
              Last 30 days
            </button>
          </span>
        )}

        <div className={`main-btn${inChart ? '-in-chart' : ''}`} onClick={() => setShow(!show)}>
          {!showDate ? (
            <>
              <span className="custom-range">Custom range</span>
              {!inChart ? null : <ArrowDown />}
            </>
          ) : (
            <span className="show-date">
              {renderDate(state[0].startDate)} - {renderDate(state[0].endDate)}
            </span>
          )}
        </div>

        {show && (
          <div className={`form ${formStyle}`} ref={ref}>
            <DatePicker
              onChange={handleOnChange}
              moveRangeOnFirstSelection={false}
              months={month}
              ranges={state}
              editableDateInputs={false}
              direction="horizontal"
              weekStartsOn={1}
              monthDisplayFormat="MMMM yyyy"
              weekdayDisplayFormat="iiiiii"
              maxDate={maxDate}
              minDate={minDate}
            />
            <div className="btn">
              <div>
                <button
                  className="cancelBtn"
                  onClick={() => {
                    setShow(false);
                    setState([
                      {
                        startDate: refDate.current.startDate,
                        endDate: refDate.current.endDate,
                        key: 'selection',
                      },
                    ]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="submitBtn"
                  onClick={() => {
                    setShow(false);
                    onChange(state[0]);
                    refDate.current = { ...state[0] };
                    setShowDate(true);
                  }}
                >
                  Set Date
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
