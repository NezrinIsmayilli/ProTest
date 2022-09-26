import React from 'react';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import styles from '../../styles.module.scss';

const SelectIcon = props => {
  const { disabled = false, handleClick } = props;

  const onClick = () => {
    if (disabled) {
      return;
    }
    handleClick();
  };
  return (
    <div>
      <PlusIcon
        width="16px"
        height="16px"
        onClick={onClick}
        className={`${styles.invoiceIcon} ${
          disabled ? styles.invoiceIconDisabled : {}
        }`}
      />
    </div>
  );
};

export const SelectFromInvoice = SelectIcon;
