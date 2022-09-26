/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { useCurrencyConverter } from 'hooks/useCurrencyCalculate';
import { useEditableInput } from 'hooks';

import { Input, Icon, InputNumber } from 'antd';
import { ProSelect } from 'components/Lib';
import { FaSave, FaPencilAlt } from 'react-icons/fa';

import styles from './table.module.scss';

const TableRow = props => {
  const {
    index,
    invoices,
    paidInvoice,
    onChange,
    onDelete,
    currency = {},
    invoicePayableAmount = {},
  } = props;

  const [invoiceId, setInvoiceId] = useState(paidInvoice.id);
  const [paidDebt, setPaidDebt] = useState(
    paidInvoice.amount ? Number(paidInvoice.amount).toFixed(2) : 0
  );
  const [rate, setRate] = useState();

  const mainRate = rate || currency.rate || 1;

  const {
    inputValue,
    setInputValue,
    editable,
    editableRef,
    changeEditableHandle,
    inputChangeHandle,
  } = useEditableInput(mainRate);

  const isNumberValid = true;

  const selectedInvoice =
    (invoices &&
      invoices.length &&
      invoices.find(value => value.id === invoiceId)) ||
    {};

  const {
    // id,
    currencyCode,
    // invoice_debt_amount,
    // converted_paid_amount,
    remainingInvoiceDebt,
    tenantCurrencyId,
  } = selectedInvoice;

  const convertedAmountByCurrency = useCurrencyConverter(
    [paidDebt],
    mainRate,
    tenantCurrencyId
  );

  const convertedPaidDebt = useCurrencyConverter(
    [paidDebt],
    mainRate,
    tenantCurrencyId,
    false
  );

  const convertedRemainingDebt = useCurrencyConverter(
    [remainingInvoiceDebt],
    mainRate,
    tenantCurrencyId,
    true
  );

  const calculatedRemainingDebt =
    remainingInvoiceDebt - convertedAmountByCurrency;

  // when changed amount currency clear rate
  useEffect(() => {
    if (currency.rate) {
      setRate(undefined);
    }
  }, [JSON.stringify(currency)]);

  useEffect(() => {
    if (convertedRemainingDebt < convertedAmountByCurrency && rate) {
      setPaidDebt(convertedRemainingDebt);
    }
  }, [rate]);

  useEffect(() => {
    if (invoicePayableAmount.amount > 0) {
      if (invoicePayableAmount.amount > convertedRemainingDebt) {
        setPaidDebt(convertedRemainingDebt);
        return;
      }
      setPaidDebt(invoicePayableAmount.amount);
    }
  }, [JSON.stringify(invoicePayableAmount)]);

  useEffect(() => {
    const invoice = {
      id: invoiceId,
      amount: paidDebt,
      rate: rate || null,
    };
    onChange(invoice, index);
  }, [paidDebt, invoiceId]);

  function onSelect(value) {
    setInvoiceId(value);
  }

  function priceHandler(num) {
    const value = !Number.isNaN(num) && num > 0 ? num : '';
    // for keyboard input
    if (value > convertedRemainingDebt) {
      setPaidDebt(Number(convertedRemainingDebt).toFixed(2));
      return;
    }
    setPaidDebt(value);
  }

  function onRateEdit(inputValue) {
    if (inputValue) {
      const value =
        !Number.isNaN(inputValue) && inputValue > 0 ? inputValue : 1;
      setRate(value);
    }
  }

  function saveHandle() {
    changeEditableHandle();
    if (editable && inputValue) {
      onRateEdit(inputValue === '0' ? '1' : inputValue);
      setInputValue(inputValue === '0' ? '1' : inputValue);
    } else {
      setInputValue(rate || 1);
    }
  }

  function onBlurRate() {
    changeEditableHandle();
    if (editable && inputValue) {
      onRateEdit(inputValue === '0' ? '1' : inputValue);
      setInputValue(inputValue === '0' ? '1' : inputValue);
    } else {
      setInputValue(rate || 1);
    }
  }

  return (
    <tr className={`${styles.tr} ${isNumberValid ? '' : styles.error}`}>
      <td>{index + 1}</td>
      <td>
        <ProSelect
          onChange={value => onSelect(value)}
          data={invoices}
          keys={['invoiceNumber']}
          showFirstOption={false}
          value={invoiceId}
          notUseMemo
        />
      </td>
      <td>{`${
        remainingInvoiceDebt ? Number(remainingInvoiceDebt).toFixed(2) : ''
      } ${currencyCode || ''}`}</td>
      <td>{`${
        convertedPaidDebt ? Number(convertedPaidDebt).toFixed(2) : ''
      } ${currencyCode || ''}`}</td>
      <td>
        <InputNumber
          size="large"
          value={paidDebt}
          min="0"
          precision={5} // 0.00
          onChange={priceHandler}
          // addonAfter={(currency && currency.code) || ' - '}
        />
      </td>
      <td>
        {editable ? (
          <Input
            placeholder="0.00"
            name="rate"
            value={inputValue}
            min="0.1"
            onChange={inputChangeHandle}
            ref={editableRef}
            style={{
              borderColor: !inputValue ? 'red' : '#dedede',
              maxWidth: '70%',
            }}
            onBlur={onBlurRate}
          />
        ) : (
          <span>{inputValue}</span>
        )}
        <a onClick={saveHandle} href="javascript:;" className={styles.edit}>
          {editable ? <FaSave size={16} /> : <FaPencilAlt size={16} />}
        </a>
      </td>
      <td className={styles.txtRight}>
        {`${
          !Number.isNaN(calculatedRemainingDebt)
            ? Number(calculatedRemainingDebt).toFixed(2)
            : ''
        } ${currencyCode || ''}`}
      </td>
      <td>
        <button
          type="button"
          className={styles.addRow}
          onClick={() => onDelete(index)}
        >
          <Icon type="minus-circle" />
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
