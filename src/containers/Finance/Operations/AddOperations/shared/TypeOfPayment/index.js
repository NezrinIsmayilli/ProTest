import React from 'react';
import { Button } from 'antd';
import styles from './styles.module.scss';

export function TypeOfPayment(props) {
  const { typeOfPayment = 0, changeTypeOfPayment, type, disabled } = props;
  return (
    <div className={styles.parentWrapper}>
      <span className={styles.label}>Ödəniş növü</span>

      <div className={styles.buttonGroup}>
        <Button
          onClick={() => {
            changeTypeOfPayment(1, type);
          }}
          shape="round"
          type={typeOfPayment === 1 ? 'primary' : ''}
          disabled={disabled}
        >
          Nəğd
        </Button>
        <Button
          onClick={() => {
            changeTypeOfPayment(2, type);
          }}
          shape="round"
          type={typeOfPayment === 2 ? 'primary' : ''}
          disabled={disabled}
        >
          Bank
        </Button>
        <Button
          onClick={() => {
            changeTypeOfPayment(3, type);
          }}
          shape="round"
          type={typeOfPayment === 3 ? 'primary' : ''}
          disabled={disabled}
        >
          Kart
        </Button>
        <Button
          onClick={() => {
            changeTypeOfPayment(4, type);
          }}
          shape="round"
          type={typeOfPayment === 4 ? 'primary' : ''}
          disabled={disabled}
        >
          Digər
        </Button>
      </div>
    </div>
  );
}
