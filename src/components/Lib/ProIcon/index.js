import React from 'react';
import styles from './styles.module.scss';

export const ProIcon = ({
  icon = 'three-dots',
  alt = 'icon_alt',
  color = '#FFFFFF',
  iconWidth = 20,
  iconHeight = 20,
  ...rest
}) => {
  const iconUrl = `/img/icons/`;

  return (
    <img
      width={iconWidth}
      height={iconHeight}
      src={`${iconUrl}${icon}.svg`}
      alt={alt}
      className={styles.icon}
    />
  );
};
