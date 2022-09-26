import React from 'react';

import { Icon } from 'antd';

import styles from './table.module.scss';

const Thead = props => {
  const { disabled, onClickAddRow } = props;
  return (
    <thead>
      <tr>
        <th className={styles.width70}>#</th>
        <th className={styles.width230}>Satış sənədi</th>
        <th className={styles.width150}>Sənəd üzrə borc</th>
        <th className={styles.width120}>Azalan borc</th>
        <th className={styles.width200}>Ödənilən məbləğ</th>
        <th className={styles.width120}>Məzənnə</th>
        <th className={`${styles.width120} ${styles.txtRight}`}>Qalan borc</th>
        <th>
          <button
            disabled={disabled}
            type="button"
            className={styles.addRow}
            onClick={onClickAddRow}
          >
            <Icon type="plus-circle" />
          </button>
        </th>
      </tr>
    </thead>
  );
};

export default Thead;
