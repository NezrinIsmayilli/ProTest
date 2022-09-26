import React from 'react';
import styles from './styles.module.scss';

export function CustomerTypeDetail(props) {
  const { secondary, date, text } = props;
  return (
    <div className={styles.customerTypeDetail}>
      <ul>
        <li>
          <span>{date}</span>
        </li>
        <li>
          <span>{secondary}</span>
        </li>
        <li>
          <span>{text}</span>
        </li>
      </ul>
    </div>
  );
}
