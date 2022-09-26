/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Col, Button, InputNumber, Icon } from 'antd';
import { ProContent, ProSelect } from 'components/Lib';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useDebouncedCallback } from 'use-debounce';
import { isValidNumber } from 'utils/inputValidations';

import styles from './table.module.scss';

const classNames = {
  enter: styles.rowEnter,
  enterActive: styles.rowEnterActive,
  exit: styles.rowExit,
  exitActive: styles.rowExitActive,
};

const TableRow = props => {
  const {
    index,
    expense,
    employees,
    // actions
    removeFromBucket,
    changeResponsiblePerson,
    handleExpenseAmount,
  } = props;

  const { id, name, responsiblePerson, expenseAmount } = expense;

  const [amount, setAmount] = useState(expenseAmount);

  useEffect(() => {
    setAmount(expenseAmount);
  }, [expenseAmount]);

  // Debounce callback
  const [debouncedAmountHandler] = useDebouncedCallback((expenseAmount, id) => {
    handleExpenseAmount(expenseAmount, id);
  }, 500);

  function expenseAmountHandler(value) {
    if (isValidNumber(value)) {
      setAmount(value);
      debouncedAmountHandler(value, id);
    }
  }

  return (
    <tr className={styles.tr}>
      {/* № */}
      <td className={styles.width10}>{index + 1}</td>

      {/* Maddə  */}
      <td className={styles.width20}>
        <strong>{name}</strong>
      </td>

      {/* Məsul Şəxs */}
      <td className={styles.width25}>
        <ProSelect
          data={employees}
          value={responsiblePerson}
          keys={['name', 'lastName']}
          hasError={responsiblePerson === undefined}
          onSelect={responsiblePerson => {
            changeResponsiblePerson(responsiblePerson, id);
          }}
        />
      </td>

      {/* Xərcin dəyəri */}
      <td className={styles.width15}>
        <InputNumber
          size="large"
          value={amount}
          placeholder={0}
          className={`
              ${styles.width100} 
              ${amount === undefined && styles.error}
          `}
          min={0}
          precision={2}
          maxLength={9}
          onChange={expenseAmountHandler}
        />
      </td>

      {/* minus - remove button */}
      <td className={`${styles.width10} ${styles.txtCenter}`}>
        <button
          type="button"
          className={styles.addRow}
          onClick={() => removeFromBucket(id)}
        >
          <Icon type="minus-circle" />
        </button>
      </td>
    </tr>
  );
};

export default function Table(props) {
  const {
    openCatalogModal,
    bucket = [],
    employees,
    totalExpenseAmountWithCurrency,
    // actions
    removeFromBucket,
    changeResponsiblePerson,
    handleExpenseAmount,
  } = props;

  return (
    <ProContent
      title="2. Xərclər siyahısı"
      right={
        <Button type="link" onClick={openCatalogModal}>
          Kataloqdan seç
        </Button>
      }
    >
      <Col>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.width10}>№</th>
              <th className={styles.width20}>Maddə</th>
              <th className={styles.width25}>Məsul Şəxs</th>
              <th className={styles.width15}>Xərcin dəyəri</th>
              {/* <th className={styles.width10}>Valyuta</th> */}
              <th className={styles.width10}> </th>
            </tr>
          </thead>
          <tbody>
            <TransitionGroup component={null}>
              {bucket.map((expense, index) => (
                <CSSTransition
                  key={expense.id}
                  timeout={300}
                  classNames={classNames}
                >
                  {/* Table Row */}
                  <TableRow
                    {...{
                      index,
                      expense,
                      employees,
                      // actions
                      changeResponsiblePerson,
                      removeFromBucket,
                      handleExpenseAmount,
                    }}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </tbody>
        </table>
        <div className={styles.tfoot}>
          <div>Cəmi məbləğ</div>
          <p>{totalExpenseAmountWithCurrency}</p>
        </div>
      </Col>
    </ProContent>
  );
}
