import { Tooltip } from 'antd';
import React from 'react';

import styles from '../styles.module.scss';

export function UserCard(props) {
  const { data } = props;

  const { name, lastName, attachment, isItMe } = data;

  return (
    <div className={styles.userCard}>
      <img
        className={isItMe ? styles.currentUser : ''}
        alt={`${name}${lastName}`}
        src={attachment?.thumb || '/img/default.jpg'}
        width={32}
        height={32}
      />
      <div className={styles.userCardTitle}>
        <Tooltip placement="topLeft" title={`${name} ${lastName}`}>
          <span>
            {name} {lastName}
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
