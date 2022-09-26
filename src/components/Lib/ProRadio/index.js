import React from 'react';
import { Radio } from 'antd';
import styles from './styles.module.scss';

export function ProRadio({ children, ...rest }) {
  return (
    <Radio {...rest} className={styles.radio}>
      {children}
    </Radio>
  );
}
