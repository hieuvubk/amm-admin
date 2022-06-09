import React from 'react';
import styles from './TabsSwitch.module.scss';
import classNames from 'classnames/bind';
import { ReactComponent as RedNotification } from 'src/assets/icon/red-notification.svg';

type TabsSwitchProps<T> = {
  options: { value: T; label: string }[];
  defaultOption: { value: T; label: string };
  onSelect: (selection: { value: T; label: string }) => void;
  type: 'switch' | 'tab' | 'chart';
  actionsNotification?: boolean;
};

const cx = classNames.bind(styles);

const TabsSwitch = <T extends unknown>({
  options,
  defaultOption,
  onSelect,
  type,
  actionsNotification = false,
}: TabsSwitchProps<T>): JSX.Element => {
  const [selection, setSelection] = React.useState<number>();

  React.useEffect(() => {
    setSelection(options.findIndex((option) => option.value === defaultOption.value));
  }, [defaultOption.value, options]);

  return (
    <div className={cx(`${type}-button`)}>
      {options.map((option, index) => (
        <button
          key={index}
          className={index === selection ? cx(`on-select`) : ''}
          onClick={() => {
            setSelection(index);
            onSelect(option);
          }}
        >
          {option.label}

          {actionsNotification && option.label === 'Actions' && <RedNotification />}
        </button>
      ))}
    </div>
  );
};

export default TabsSwitch;
