import React from 'react';
import styles from '../styles.module.scss';

function Detail({ primary, secondary }) {
  return (
    <li className={styles.ulLi}>
      <span>{primary}</span>

      <span>{secondary}</span>
    </li>
  );
}

export default Detail;
