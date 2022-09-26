import React from 'react';
import { Tooltip } from 'antd';
import styles from './styles.module.scss';

export const ProTooltip = props => {
  const { title = 'Tooltip', align = 'right', icon = 'three-dots' } = props;

  const getMoreData = data => {
    return Array.isArray(data) ? data : [data];
  };
  const iconUrl = `/img/icons/`;

  return (
    <Tooltip
      title={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {getMoreData(title).map(item => (
            <span>{item}</span>
          ))}
        </div>
      }
      placement={align}
    >
      <img
        width={20}
        height={20}
        src={`${iconUrl}${icon}.svg`}
        alt="iconAlt"
        className={styles.icon}
      />
    </Tooltip>
  );
};
