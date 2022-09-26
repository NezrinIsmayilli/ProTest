import React, { useState, useEffect } from 'react';
import { re_amount, re_quantity } from 'utils/constants';
import styles from './styles.module.scss';

const QuantityInput = ({
  row = {},
  minValue = 0,
  disabled = false,
  selectedInvoices = [],
  setSelectedInvoices = () => {},
  defaultValue = '',
}) => {
  const [quantityInput, setQuantityInput] = useState(defaultValue);
  const increase = () => {
    setQuantityInput(prevValue => {
      if (Number(row.quantity) - Number(prevValue || 0) < 1) {
        return prevValue;
      }
      if (
        selectedInvoices.filter(
          selectedInvoice =>
            selectedInvoice.invoice_product_id === row.invoice_product_id
        ).length > 0
      ) {
        const newSelectedInvoices = selectedInvoices.map(selectedInvoice => {
          if (selectedInvoice.invoice_product_id === row.invoice_product_id) {
            return { ...selectedInvoice, quantity: Number(prevValue) + 1 };
          }
          return selectedInvoice;
        });
        setSelectedInvoices(newSelectedInvoices);
      } else {
        setSelectedInvoices(prevSelectedInvoices => [
          ...prevSelectedInvoices,
          { ...row, quantity: Number(prevValue) + 1 },
        ]);
      }
      return Number(prevValue) + 1;
    });
  };
  const decrease = () => {
    setQuantityInput(prevValue => {
      if (Number(prevValue) < 1) {
        return prevValue;
      }
      if (
        selectedInvoices.filter(
          selectedInvoice =>
            selectedInvoice.invoice_product_id === row.invoice_product_id
        ).length > 0
      ) {
        const newSelectedInvoices = selectedInvoices.map(selectedInvoice => {
          if (selectedInvoice.invoice_product_id === row.invoice_product_id)
            return {
              ...selectedInvoice,
              quantity: Number(prevValue) - 1,
            };
          return selectedInvoice;
        });
        setSelectedInvoices(newSelectedInvoices);
      } else {
        setSelectedInvoices([
          ...selectedInvoices,
          { ...row, quantity: Number(prevValue) - 1 },
        ]);
      }

      return Number(prevValue) - 1;
    });
  };

  const handleChange = newValue => {
    if (
      (re_amount.test(newValue) && newValue <= Number(row.quantity)) ||
      newValue === ''
    ) {
      setQuantityInput(newValue);
      if (
        selectedInvoices.filter(
          selectedInvoice =>
            selectedInvoice.invoice_product_id === row.invoice_product_id
        ).length > 0
      ) {
        if (Number(newValue) > 0) {
          const newSelectedInvoices = selectedInvoices.map(selectedInvoice => {
            if (selectedInvoice.invoice_product_id === row.invoice_product_id)
              return {
                ...row,
                quantity: newValue || null,
              };
            return selectedInvoice;
          });
          setSelectedInvoices(newSelectedInvoices);
        } else {
          const newSelectedInvoices = selectedInvoices.filter(
            selectedInvoice =>
              selectedInvoice.invoice_product_id !== row.invoice_product_id
          );
          setSelectedInvoices(newSelectedInvoices);
        }
      } else if (Number(newValue > 0)) {
        setSelectedInvoices([
          ...selectedInvoices,
          { ...row, quantity: newValue || null },
        ]);
      }
    }
  };

  return (
    <div className={styles.quantityInput}>
      <button
        type="button"
        className={styles.decrease}
        onClick={decrease}
        disabled={disabled}
      >
        <img
          width={10}
          height={2}
          src="/img/icons/decrease.svg"
          alt="trash"
          className={styles.icon}
    
        />
      </button>
      <input
        type="text"
        className={styles.value}
        value={quantityInput}
        onChange={e => handleChange(e.target.value)}
        placeholder="0"
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.increase}
        onClick={increase}
        disabled={disabled}
      >
        <img
          width={10}
          height={10}
          src="/img/icons/increase.svg"
          alt="trash"
          className={styles.icon}
        />
      </button>
    </div>
  );
};

export default QuantityInput;
