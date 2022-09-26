import React from 'react';
import { ReactComponent as ExcelIcon } from 'assets/img/icons/description.svg';
import styles from '../../styles.module.scss';

const HeaderLayout = props => {
  const { toggleDecsriptionModal } = props;

  return (
    <div className={styles.Header}>
      <span className={styles.newOperationTitle}>Qaimə</span>
      <div className={styles.buttons}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ExcelIcon
            className={`${styles.icon} ${styles.descriptionIcon}`}
            onClick={toggleDecsriptionModal}
          />
        </div>
      </div>
    </div>
  );
};

export const Header = HeaderLayout;
