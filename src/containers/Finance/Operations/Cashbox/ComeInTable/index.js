/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Row, Col, Spin } from 'antd';

import TableRow from './Row';
import Thead from './Thead';

import styles from './table.module.scss';

const CSSTransitionClasses = {
  enter: styles.rowEnter,
  enterActive: styles.rowEnterActive,
  exit: styles.rowExit,
  exitActive: styles.rowExitActive,
};

function Table(props) {
  const {
    advance,
    onChange,
    currency,
    invoicePayableAmounts,
    onChangeRate,
    value,
    // redux
    contactInfo,
    isLoading,
    contact,
  } = props;

  const [paidInvoices, setPaidInvoices] = useState([]);
  const { unpaidInvoices = [] } = contactInfo;

  const unselectedInvoices = unpaidInvoices.map(invoice => {
    const isPaidInvoice = paidInvoices.find(
      paidInvoice => paidInvoice.id === invoice.id
    );

    return isPaidInvoice ? { ...invoice, disabled: true } : invoice;
  });

  useEffect(() => {
    if (unpaidInvoices.length) {
      const rows = [{}];
      setPaidInvoices(rows);
    } else {
      setPaidInvoices([]);
    }
  }, [unpaidInvoices.length]);

  // useEffect(() => {
  //   setPaidInvoices([]);
  // }, [contact]);

  useEffect(() => {
    if (value && unpaidInvoices.length) {
      const paidInvoices = value.map(paidInvoice => ({
        ...paidInvoice,
        disabled: true,
        name: undefined,
        // invoiceNumber: paidInvoice.name,
      }));

      setPaidInvoices(paidInvoices);
    }
  }, [value, unpaidInvoices.length]);

  useEffect(() => {
    const filteredPaidInvoices = paidInvoices.filter(value => value.id);
    if (onChange) {
      onChange(filteredPaidInvoices);
    }
  }, [JSON.stringify(paidInvoices)]);

  function onChangeTableRow(paidInvoice, index) {
    setPaidInvoices(prevPaidInvoices => {
      const newPaidInvoices = prevPaidInvoices.map((value, mapIndex) =>
        mapIndex !== index ? { ...value } : { ...paidInvoice, disabled: true }
      );
      return [...newPaidInvoices];
    });
  }

  function onClickAddRow() {
    setPaidInvoices(prevPaidInvoices => [...prevPaidInvoices, {}]);
  }

  function onClickDeleteRow(index) {
    setPaidInvoices(prevPaidInvoices => {
      const copy = [...prevPaidInvoices];
      copy.splice(index, 1);
      return copy;
    });
  }

  // const isRowAddPlusDisabled =
  //   paidInvoices.length === unpaidInvoices.length || unpaidInvoices.length;
  const isRowAddPlusDisabled = paidInvoices.length >= unpaidInvoices.length;

  return (
    <Row>
      <Col span={24}>
        <div className="body">
          <Spin spinning={isLoading}>
            <table className={styles.table}>
              <Thead
                disabled={isRowAddPlusDisabled}
                onClickAddRow={onClickAddRow}
              />
              <tbody>
                <TransitionGroup component={null}>
                  {paidInvoices.map((paidInvoice, index) => {
                    const invoicePayableAmount = invoicePayableAmounts.find(
                      value => value.id === paidInvoice.id
                    );
                    return (
                      <CSSTransition
                        key={index}
                        timeout={300}
                        classNames={CSSTransitionClasses}
                      >
                        <TableRow
                          {...{
                            index,
                            invoices: unselectedInvoices, // select options
                            paidInvoice,
                            currency,
                            invoicePayableAmount,
                          }}
                          onChange={onChangeTableRow}
                          onDelete={onClickDeleteRow}
                          onChangeRate={onChangeRate}
                        />
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
              </tbody>
            </table>
          </Spin>

          <div className={styles.tfoot}>
            <div>Avans</div>
            <div>
              {/* Compute Total */}
              {`${
                !Number.isNaN(advance) ? Number(advance).toFixed(3) : '0.00'
              } ${currency?.code || ''}`}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  contactInfo: state.financeOperationsReducer.contactInfo,
  isLoading: state.financeOperationsReducer.isLoading,
});

export default connect(mapStateToProps)(Table);
