import React from 'react';
// content

import { Button } from 'antd';
import styles from './styles.module.scss';

export function OperationType(props) {
  const {
    disabled,
    disablePayables,
    disableReceivables,
    onClickType = () => {},
    cashIn = 1,
    cashOut = -1,
    value,
    invoices
  } = props;
  return (
    <div className={styles.typeBox} style={{ margin: '20px 0' }}>
      <h6 className={styles.label}>Əməliyyatın növü</h6>

      <div className={styles.types}>
        <Button
          onClick={() => {
            onClickType(cashIn, invoices);
          }}
          disabled={disabled || disableReceivables}
          type={value === cashIn ? 'primary' : ''}
          shape="round"
          className="ProBtnSmall"
        >
          Mədaxil
        </Button>
        <Button
          onClick={() => {
            onClickType(cashOut, invoices);
          }}
          disabled={disabled || disablePayables}
          type={value === cashOut ? 'primary' : ''}
          shape="round"
          className="ProBtnSmall"
        >
          Məxaric
        </Button>
      </div>
    </div>
  );
}
