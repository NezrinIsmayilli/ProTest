import React from 'react';
import styles from '../../styles.module.scss';

const HeaderLayout = props => {
  return (
    <div className={styles.Header}>
      <span className={styles.newOperationTitle}>Tərkib</span>
      <div className={styles.buttons}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        ></div>
      </div>
    </div>
  );
};

export const Header = HeaderLayout;
