import React from 'react';
import { ProInput } from 'components/Lib';
import styles from '../../../styles.module.scss';

const QuantityComponent = props => {
  const { value, row, handleQuantityChange, limit } = props;
  const { id, catalog } = row;

  const onChange = event => {
    handleQuantityChange(id, event.target.value, limit);
  };
  return (
    <ProInput
      size="default"
      value={value}
      onChange={onChange}
      disabled={!catalog.isWithoutSerialNumber}
      className={`${Number(value || 0) > 0 ? {} : styles.inputError} ${
        styles.tableInput
      }`}
    />
  );
};

export const Quantity = QuantityComponent;
