import React, { useRef, useState } from 'react';
import { DateRangePicker as DatePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { renderDate, subTimeJS } from 'src/helpers/date';
import useOnClickOutside from 'src/hooks/useClickOutside';
import './style.scss';

export interface IDate {
  startDate: Date;
  endDate: Date;
  key?: string;
}
type DateActive = 'week' | 'month' | 'custom';

interface Props {
  onChange: (v: IDate) => void;
  showOptionDate?: boolean;
  classNameProps?: string;
  maxDate?: Date;
  minDate?: Date;
}

const CustomDateRangePicker: React.FC<Props> = ({
  onChange = () => {},
  showOptionDate = false,
  classNameProps: classNameProps,
  maxDate,
  minDate,
}) => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [dateActive, setDateActive] = useState<DateActive>('week');
  const [state, setState] = useState([
    {
      startDate: subTimeJS(new Date(), 1, 'week'),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnChange = (ranges: any) => {
    const { selection } = ranges;
    setState([selection]);

    if (selection.startDate.getTime() === selection.endDate.getTime()) setError(true);
    else setError(false);
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
                setShowDate(false);
                onChange({
                  startDate: subTimeJS(new Date(), 1, 'week'),
                  endDate: subTimeJS(new Date(), 1, 'day'),
                });
                setDateActive('week');
              }}
              className="btn-element"
              style={{
                background: 'var(--color-input-bg)',
                cursor: 'pointer',
                color: dateActive === 'week' ? 'var(--color-primary)' : 'var(--title-active)',
                border: dateActive === 'week' ? '1px solid var(--color-primary)' : 'var(--title-active)',
              }}
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                setShowDate(false);
                onChange({
                  startDate: subTimeJS(new Date(), 30, 'day'),
                  endDate: subTimeJS(new Date(), 1, 'day'),
                });
                setDateActive('month');
              }}
              className="btn-element"
              style={{
                background: 'var(--color-input-bg)',
                cursor: 'pointer',
                color: dateActive === 'month' ? 'var(--color-primary)' : 'var(--title-active)',
                border: dateActive === 'month' ? '1px solid var(--color-primary)' : 'var(--title-active)',
              }}
            >
              Last 30 days
            </button>
            <button className="btn-element" style={{ background: 'var(--color-input-bg)' }}>
              <div
                onClick={() => {
                  setShow(!show);
                  setDateActive('custom');
                }}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  // top: '-10px',
                }}
              >
                {!showDate ? (
                  <span
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      // background: 'var(--input-background)',
                      cursor: 'pointer',
                      width: 'max-content',
                      color: dateActive === 'custom' ? 'var(--color-primary)' : 'var(--title-active)',
                      border: dateActive === 'custom' ? '1px solid var(--color-primary)' : 'var(--title-active)',
                    }}
                  >
                    Custom Range
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      // background: 'var(--input-background)',
                      cursor: 'pointer',
                      color: dateActive === 'custom' ? 'var(--color-primary)' : 'var(--title-active)',
                      border: dateActive === 'custom' ? '1px solid var(--color-primary)' : 'var(--title-active)',
                    }}
                  >
                    {renderDate(state[0].startDate)} - {renderDate(state[0].endDate)}
                  </span>
                )}
              </div>
              {show && (
                <div className="form" ref={ref}>
                  <DatePicker
                    onChange={handleOnChange}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    ranges={state}
                    editableDateInputs={false}
                    direction="horizontal"
                    weekStartsOn={1}
                    monthDisplayFormat="MMMM"
                    weekdayDisplayFormat="iiiiii"
                    maxDate={maxDate}
                    minDate={minDate}
                  />
                  <div className="btn">
                    {error && <div className="error">Please choose two dates in the custom range.</div>}
                    <div>
                      <button
                        className="cancelBtn"
                        onClick={() => {
                          setShow(false);
                          setShowDate(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={error}
                        className="submitBtn"
                        onClick={() => {
                          setShow(false);
                          onChange(state[0]);
                          setShowDate(true);
                          setDateActive('custom');
                        }}
                      >
                        Set Date
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
