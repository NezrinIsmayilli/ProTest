import React from 'react';

import styles from './styles.module.scss';

export const JobsSidebarItemWrapper = ({ label = '', children }) => (
  <div className={styles.wrap}>
    <div className={styles.inputWrapper}>
      <div className={styles.title}>{label}</div>
      {children}
    </div>
  </div>
);
