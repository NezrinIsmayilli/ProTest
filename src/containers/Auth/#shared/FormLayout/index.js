import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from 'assets/img/logo_smb_min.svg';
import styles from '../../styles.module.scss';

export function FormLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
        <Link to="/" className={styles.logo}>
          <Logo height={56} />
        </Link>
        <div className={styles.formContent}>{children} </div>
      </div>
    </div>
  );
}
