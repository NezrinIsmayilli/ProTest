import React from 'react';
import { Avatar, Tooltip } from 'antd';

import styles from './styles.module.scss';

export function InfoCard({
  attachmentUrl = '',
  width = 32,
  name = '',
  surname = '',
  number = null,
  patronymic = '',
  occupationName = '',
}) {
  return (
    <div className={styles.flexCenter}>
      <Avatar
        src={attachmentUrl || '/img/default.jpg'}
        size={width}
        alt={`${name}${surname}`}
      />

      <div className={styles.title}>
        <h3>
          <Tooltip
            placement="topLeft"
            title={
              number !== null
                ? `${name} ${surname} (${number})`
                : `${name} ${surname} ${patronymic} - ${occupationName}` || ''
            }
          >
            <span>
              {' '}
              {number !== null
                ? `${name} ${surname} (${number})`
                : `${name} ${surname} ${patronymic}`}
              <p>{occupationName}</p>
            </span>
          </Tooltip>
        </h3>
      </div>
    </div>
  );
}
