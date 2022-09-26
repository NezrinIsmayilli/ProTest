import React from 'react';
import styles from './styles.module.scss';

export function CustomerTag(props) {
  const { text, desc } = props;
  return (
    <div className={styles.customerTypeDetail}>
      <ul>
        <li>
          <span>{text}</span>
        </li>
        <li>
          <h4>{desc}</h4>
        </li>
      </ul>
    </div>
  );
}
