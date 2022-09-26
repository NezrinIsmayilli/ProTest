import React from 'react';
import { Button } from 'antd';
import { ReactComponent as NewIcon } from 'assets/img/icons/new.svg';
import styles from './styles.module.scss';

export const ButtonLightBlue = ({
  label = ' ',
  size = 'large',
  color = '#4E9CDF',
  iconWidth = 20,
  iconHeight = 20,
  ...rest
}) => (
  <Button size={size} className={styles.buttonLightBlue} {...rest}>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NewIcon
        fill={color}
        width={iconWidth}
        height={iconHeight}
        style={{ marginRight: '8px' }}
      />
      {label}
    </div>
  </Button>
);
