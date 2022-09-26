import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export const DetailButton = props => {
  const { label, icon = 'eye', children, ...rest } = props;

  return (
    <Button className={styles.button} icon={icon} {...rest}>
      {children}
    </Button>
  );
};
