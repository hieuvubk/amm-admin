/* eslint-disable max-len */
import React, { useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { CInput } from 'src/components/Base/Input';
import styles from './EditTradingFee.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { updateTradingFee } from 'src/features/TradingFee/redux/apis';
import { getTradingFee } from 'src/features/TradingFee/redux/apis';
import { CButton } from 'src/components/Base/Button';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { UPDATE_TRADING_FEE } from 'src/constants/message.message';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';
const cx = classNames.bind(styles);

interface funcProps {
  id: number;
  value: number;
  handleCancel: () => void;
  name: string;
  info: string;
  label: string;
}

const EditTradingFee = (props: funcProps): JSX.Element => {
  const [valueInput, setValueInput] = useState<number>();
  const [preventSave, setPreventSave] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputVal = useRef<any>(null);

  const onChangeInput = (e: number) => {
    setValueInput(e);
  };
  const handleSave = async () => {
    if (!preventSave) {
      const action = {
        id: props.id,
        key: props.info,
        value: valueInput ? valueInput : inputVal.current?.value,
        email: currentUser.email,
        userId: currentUser.id,
        orderBookName: props.name,
      };
      await dispatch(updateTradingFee(action));
      await dispatch(getTradingFee());
      await initFetchListNotiPopup();
      props.handleCancel();
      dispatch(openSnackbar({ message: `${UPDATE_TRADING_FEE.SUCCESS}`, variant: SnackbarVariant.SUCCESS }));
    }
  };

  const onPreventSave = (flag: boolean): void => {
    setPreventSave(flag);
  };

  return (
    <div className={cx('content-form')}>
      <label className={cx('info')}>{props.label}</label>
      <CInput
        // className={cx('input-field')}
        ref={inputVal}
        type="text"
        size="sm"
        placeholder={props.label}
        defaultValue={props.value}
        value={valueInput}
        validateFloatNumber={true}
        numberMaxValue={1}
        floatNumberLimitDigitAfterComma={4}
        onChange={(value: number): void => onChangeInput(Number(value))}
        isError={true}
        message={'This field is required.'}
        preventSave={(flag: boolean) => onPreventSave(flag)}
      />
      <CButton type="primary" size="sm" content="Save" onClick={handleSave} />
      <CButton type="primary" size="sm" content="Cancel" onClick={props.handleCancel} />
    </div>
  );
};

export default EditTradingFee;
