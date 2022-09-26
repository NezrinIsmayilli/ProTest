import React from 'react';
import { Input, Select } from 'antd';

import styles from './styles.module.scss';

export function InputBox(props) {
  const {
    hasError,
    disabled,
    size = 'large',
    inputType,
    children,
    disableGutter,
    label,
    placeholder,
    secondary,
    className,
    helperText,
    style,
    ...rest
  } = props;
  return (
    <div
      className={`${styles.inputBox} ${className}`}
      style={{ marginBottom: disableGutter ? 0 : 20, ...style }}
    >
      {(label || secondary) && (
        <div className={styles.inputLabelBox}>
          <label>{label}</label>

          {secondary}
        </div>
      )}
      {inputType === 'select' ? (
        <Select
          getPopupContainer={trigger => trigger.parentNode}
          className={`${styles.select} ${hasError ? styles.selectError : ''} ${
            disabled ? styles.disabled : ''
          }`}
          dropdownClassName={styles.dropdown}
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          {...rest}
        >
          {children}
        </Select>
      ) : inputType === 'radio' ? (
        children
      ) : (
        <Input
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          {...rest}
        />
      )}

      {helperText && <div className={styles.helperTextBox}>{helperText}</div>}
    </div>
  );
}
