import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export default function TabButton(props) {
  const { label, size, active, ...rest } = props;

  return (
    <Button
      size={size}
      {...rest}
      className={`${styles.tabButton} ${active ? styles.activeTab : ''}`}
    >
      {label}
    </Button>
  );
}
