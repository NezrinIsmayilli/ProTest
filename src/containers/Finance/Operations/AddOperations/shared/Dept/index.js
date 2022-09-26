/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';

export const Dept = props => {
  const { value = null, currency, loading = false } = props;
  return (
    <Spin spinning={loading}>
      <div className={styles.deptBox}>
        <strong className={styles.dept}>Borc:</strong>
        <strong className={styles.value}>
          {formatNumberToLocale(defaultNumberFormat(value || 0))} {currency}
        </strong>
      </div>
    </Spin>
  );
};
