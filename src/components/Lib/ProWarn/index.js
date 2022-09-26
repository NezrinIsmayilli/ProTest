import React from 'react';
import styles from './styles.module.scss';
import { ReactComponent as WarnIcon } from '../../../assets/img/icons/warn.svg';

export function ProWarn({ children }) {
  return (
    <div className={styles.warn}>
      <p>{children}</p>
      <WarnIcon />
    </div>
  );
}
