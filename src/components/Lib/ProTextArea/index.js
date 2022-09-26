import React from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';

const { TextArea } = Input;

export const ProTextArea = props => {
  const {
    minLength = 3,
    maxLength = 120,
    rows = 4,
    placeholder = 'Yazın',
    ...rest
  } = props;
  return (
    <TextArea
      minLength={minLength}
      maxLength={maxLength}
      rows={rows}
      className={styles.textArea}
      placeholder={placeholder}
      {...rest}
    />
  );
};
