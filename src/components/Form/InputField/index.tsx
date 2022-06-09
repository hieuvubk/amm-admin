import { TextField, TextFieldProps } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import classnames from 'classnames/bind';
import { ErrorMessage, FieldProps, getIn } from 'formik';
import React, { useState } from 'react';
import { hidePassSvg, showPassSvg } from 'src/assets/icon';
import Error from 'src/components/Form/Error';
import styles from './InputField.module.scss';

const cx = classnames.bind(styles);

type InputFieldProps = FieldProps & TextFieldProps;

const InputField: React.FC<InputFieldProps> = (props) => {
  const { field, form, type, label, placeholder, disabled } = props;
  const { name } = field;
  const { errors, touched } = form;
  const errorsDetail = getIn(errors, name);
  const touchedDetail = getIn(touched, name);
  const showError = Boolean(errorsDetail && touchedDetail);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <FormControl className={cx('input-field')}>
      {label && (
        <label className={cx('label')} htmlFor={name}>
          {label}
        </label>
      )}

      <div className={cx('password-field-container')}>
        <TextField
          className={cx('form-input', showError ? 'error' : 'normal')}
          id={name}
          error={showError}
          variant="outlined"
          {...field}
          type={type === 'password' && showPassword ? 'text' : type}
          disabled={disabled}
          placeholder={placeholder}
        />
        {type === 'password' && (
          <div onClick={() => setShowPassword(!showPassword)} className={cx('icon-container')}>
            <img className={cx('icon')} src={!showPassword ? showPassSvg : hidePassSvg} alt="" />
          </div>
        )}
      </div>

      <ErrorMessage name={name} component={(): JSX.Element => <Error errorName={errorsDetail} />} />
    </FormControl>
  );
};

export default InputField;
