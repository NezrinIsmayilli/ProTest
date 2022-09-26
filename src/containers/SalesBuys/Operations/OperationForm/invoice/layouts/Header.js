import React from 'react';
import { ReactComponent as ExcelIcon } from 'assets/img/icons/description.svg';
// import { ReactComponent as PrintIcon } from 'assets/img/icons/printer-2.svg';
import styles from '../../styles.module.scss';

const HeaderLayout = props => {
  const {  toggleDecsriptionModal } = props;

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
          {/* <PrintIcon
            className={`${styles.icon} ${styles.printIcon}`}
            onClick={() => toast.error('ASFLJADFGLADKJGADJKGL')}
          /> */}
        </div>
      </div>
    </div>
  );
};

export const Header = HeaderLayout;
