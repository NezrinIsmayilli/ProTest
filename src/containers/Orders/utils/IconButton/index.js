import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

const IconButton = ({
  buttonSize = 'large',
  buttonStyle = {},
  label,
  icon,
  iconAlt = 'icon-alt',
  iconWidth = 20,
  iconHeight = 20,
  ...rest
}) => {
  const iconUrl = `/img/icons/`;
  return (
    <Button
      size={buttonSize}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...buttonStyle,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          width={iconWidth}
          height={iconHeight}
          src={`${iconUrl}${icon}.svg`}
          alt="iconAlt"
          className={styles.icon}
          style={label && { marginRight: '8px' }}
        />
        {label}
      </div>
    </Button>
  );
};

export default IconButton;
