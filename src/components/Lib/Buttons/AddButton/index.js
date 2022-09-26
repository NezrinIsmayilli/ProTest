import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export const AddButton = ({ label = 'Əlavə et', size = 'large', ...rest }) => (
  <Button size={size} className={styles.addButton} {...rest}>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </div>
  </Button>
);
