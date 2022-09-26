import React from 'react';
import styles from './styles.module.scss';

export const ProSidebarItem = props => {
  const { label = '', children } = props;
  return (
    <div className={styles.wrap}>
      <div className={styles.inputWrapper}>
        <div className={styles.title}>{label}</div>
        {children}
      </div>
    </div>
  );
};
