import React from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';

export const ProInput = props => {
  const { placeholder = 'Yazın', size = 'large', ...rest } = props;
  return (
    <Input
      size={size}
      placeholder={placeholder}
      className={styles.input}
      autoComplete="off"
      autoFill="off"
      {...rest}
    />
  );
};
