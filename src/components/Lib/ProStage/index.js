import React from 'react';
import { Select } from 'antd';
import { ReactComponent as Circle } from 'assets/img/icons/circle.svg';
import styles from './ProStage.module.scss';

export const ProStage = props => {
  const {
    visualStage,
    statuses = [],
    onChange = () => {},
    disabled = false,
    customStyle = {},
  } = props;
  return (
    <div>
      <Select
        className={`${styles.stage} ${customStyle} ${
          visualStage ? styles[`selected-${visualStage.name}`] : {}
        }`}
        showArrow={false}
        size="small"
        value={visualStage?.id}
        onChange={onChange}
        disabled={disabled}
        getPopupContainer={trigger => trigger.parentNode}
      >
        {statuses.map(({ id, label, color }) => (
          <Select.Option value={id} className={styles.dropdown} key={id}>
            <Circle
              fill={color}
              width={10}
              height={10}
              style={{ marginRight: '5px' }}
            />{' '}
            {label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
