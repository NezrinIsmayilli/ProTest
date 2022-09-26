import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export const ProTypeFilterButton = props => {
  const {
    isActive = false,
    label = 'Button',
    size = 'medium',
    ...rest
  } = props;
  return (
    <Button
      size={size}
      className={` ${isActive ? styles.isActive : null} ${styles.filterButton}`}
      {...rest}
    >
      {label}
    </Button>
  );
};
