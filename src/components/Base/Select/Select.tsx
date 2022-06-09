/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import classnames from 'classnames/bind';
import React, { useState, forwardRef, Fragment, useEffect, useRef } from 'react';
import Select, { MenuPlacement, OptionsType, ValueType, components } from 'react-select';
import stylesSCSS from './Select.module.scss';
import './select.scss';
import { TextField, FormControl, InputAdornment } from '@material-ui/core';
import SearchIcon from 'src/assets/icon/search.svg';
import CloseDarkButton from 'src/assets/icon/close-dark.svg';
import styles from './styles';

export interface ISelect {
  icon?: string;
  label: string;
  value: any;
}

export const renderDefaultValueSelect = (string: string): ISelect => ({
  label: string,
  value: string,
});

export const renderOptionsSelect = (arr: string[]): ISelect[] => arr.map((item) => renderDefaultValueSelect(item));

interface Props {
  value?: ISelect | ISelect[];
  onChange: (value: any) => void;
  options: ISelect[];
  defaultValue?: ISelect | ISelect[];
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  onMenuScrollToBottom?: () => void;
  className?: string;
  isError?: boolean;
  message?: string;
  menuPlacement?: MenuPlacement;
  menuIsOpen?: boolean;
  onMenuOpen?: () => void;
  showSearchBar?: boolean;
  hideSearchBarSearchIcon?: boolean;
  valueSet?: number;
  isSearchable?: boolean;
}

const cx = classnames.bind(stylesSCSS);

const Control = (allProps: any) => {
  const { children, ...props } = allProps;

  useEffect(() => {
    // Only for one selection
    if (
      allProps.selectProps.valueSet >= 0 &&
      allProps.getValue()[0].value !== allProps.selectProps.options[allProps.selectProps.valueSet].value
    )
      allProps.setValue(allProps.selectProps.options[allProps.selectProps.valueSet]);
  }, [allProps.selectProps.valueSet]);

  return (
    <components.Control {...props}>
      {allProps.selectProps.value && allProps.selectProps.value.icon && (
        <img className={cx('icon-option', 'control-field-icon-option')} src={allProps.selectProps.value.icon} />
      )}
      {children}
    </components.Control>
  );
};

const filterOption = (option: ISelect, string: string) => {
  if (!string) return true;
  return option.label.toLowerCase().includes(string.toLowerCase()) ? true : false;
};

const Option = (props: any) => (
  <components.Option {...props}>
    <div className={cx('custom-option')}>
      {props.data.icon && <img className={cx('icon-option')} src={props.data.icon} />}
      {props.data.label}
    </div>
  </components.Option>
);

const Menu = (allProps: any) => {
  const { selectProps, ...props } = allProps;
  const { onInputChange, inputValue, setInputValue, onMenuInputFocus, hideSearchBarSearchIcon } = selectProps;

  return (
    <Fragment>
      <components.Menu {...props} selectProps={selectProps}>
        <Fragment>
          <div className={cx('search-bar-container')}>
            <TextField
              variant="outlined"
              className={cx('search-bar', hideSearchBarSearchIcon ? 'search-bar-no-search-icon' : '')}
              placeholder={'Search'}
              value={inputValue}
              onChange={(e) =>
                onInputChange(e.currentTarget.value, {
                  action: 'input-change',
                })
              }
              onMouseDown={(e: any) => {
                e.stopPropagation();
                e.target.focus();
              }}
              onFocus={onMenuInputFocus}
              InputProps={
                hideSearchBarSearchIcon
                  ? undefined
                  : {
                      startAdornment: (
                        <InputAdornment position="start">
                          <img src={SearchIcon} alt="" />
                        </InputAdornment>
                      ),
                    }
              }
            />

            <span className={cx('clear-search-icon-container')}>
              <img src={CloseDarkButton} onClick={() => setInputValue('')} alt="" />
            </span>
          </div>

          <div className={cx('options')}>{props.children}</div>
        </Fragment>
      </components.Menu>
    </Fragment>
  );
};

const CSelect: React.FC<Props> = forwardRef<HTMLInputElement, Props>(
  (
    { onChange = () => {}, isError = false, message = '', isSearchable = false, showSearchBar = false, ...props },
    ref,
  ) => {
    const classes = styles();

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const onDomClick = (e: any) => {
      if (containerRef !== null && containerRef.current !== null) {
        const menu = containerRef.current.querySelector('.select__menu');

        if (!containerRef.current.contains(e.target) || !menu || !menu.contains(e.target)) {
          setIsFocused(false);
          setInputValue('');
        }
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', onDomClick);

      return () => {
        document.removeEventListener('mousedown', onDomClick);
      };
    }, []);

    return (
      <div ref={containerRef}>
        <Select
          onChange={(v: any) => {
            setIsFocused(false);
            onChange(Array.isArray(v) ? v.map((item: ISelect) => item.value) : v.value);
          }}
          {...props}
          backspaceRemovesValue={false}
          filterOption={filterOption}
          classNamePrefix={cx('theme-select')}
          className={`${props.className} ${classes.select}`}
          isSearchable={isSearchable}
          noOptionsMessage={() => 'Not found'}
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            border: '0 !important',
            '&:foc': {
              border: '0 !important',
            },
            colors: {
              ...theme.colors,
              primary: '#1A88C9',
            },
          })}
          components={
            showSearchBar
              ? {
                  Menu,
                  Option,
                  Control,
                }
              : undefined
          }
          inputValue={inputValue}
          setInputValue={setInputValue}
          onMenuInputFocus={() => setIsFocused(true)}
          onInputChange={(val) => setInputValue(val)}
          {...{
            menuIsOpen: isFocused || undefined,
            isFocused: isFocused || undefined,
          }}
          maxMenuHeight={250}
        />
        <div className="text-left">{isError && <span className="text-red-600 text-xs ">{message}</span>}</div>
      </div>
    );
  },
);

export default CSelect;
