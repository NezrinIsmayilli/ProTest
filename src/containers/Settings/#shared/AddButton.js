import React from 'react';
import { Button } from 'antd';

import styles from '../index.module.sass';

export function AddButton({ children, ...rest }) {
  return (
    <div className={styles.body}>
      <div className={styles['btn-container']}>
        <Button {...rest} icon="plus" size="large" type="primary">
          {children}
        </Button>
      </div>
    </div>
  );
}
