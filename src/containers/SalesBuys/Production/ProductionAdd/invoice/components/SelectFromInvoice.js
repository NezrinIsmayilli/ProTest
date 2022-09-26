import React from 'react';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { Tooltip } from 'antd';
import styles from '../../styles.module.scss';

const SelectIcon = props => {
  const { disabled = false, handleClick, quantity, selectedNumbers } = props;

  const onClick = () => {
    if (disabled) {
      return;
    }
    handleClick();
  };
  return (
    <div>
      {disabled ? (
        <PlusIcon
          width="16px"
          height="16px"
          onClick={onClick}
          className={`${styles.invoiceIcon} ${
            disabled ? styles.invoiceIconDisabled : {}
          }`}
        />
      ) : (
        <Tooltip
          placement="right"
          title={`Transfer əməliyyatını tamamlamaq üçün ilk öncə ${quantity} ədəd seriya nömrəsi daxil etməlisiniz.`}
        >
          <PlusIcon
            width="16px"
            height="16px"
            onClick={onClick}
            style={
              selectedNumbers
                ? selectedNumbers?.length < Number(quantity)
                  ? { fill: 'red' }
                  : {}
                : { fill: 'red' }
            }
            className={`${styles.invoiceIcon} ${
              disabled ? styles.invoiceIconDisabled : {}
            }`}
          />
        </Tooltip>
      )}
    </div>
  );
};

export const SelectFromInvoice = SelectIcon;
