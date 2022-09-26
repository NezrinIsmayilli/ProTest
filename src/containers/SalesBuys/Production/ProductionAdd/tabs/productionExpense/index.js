/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
} from 'react-icons/all';
import {
  handleResetInvoiceFields,
  setSelectedProducts,
  fetchProductionExpensesList,
} from 'store/actions/sales-operation';
import { fetchFilteredReports } from 'store/actions/hrm/report';
import { deleteTransaction } from 'store/actions/finance/operations';
import { Col, Collapse, Button, Input, Modal, Divider } from 'antd';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { today, dateFormat } from 'utils';
import moment from 'moment';
import ExpenseTable from './expense';
import MaterialTable from './material';
import EmployeeExpenseTable from './expenseEmployee';
import { Summary } from '../../invoice';
import styles from '../../styles.module.scss';

const { TextArea } = Input;
const { Panel } = Collapse;

const math = require('exact-math');

function disabledDate(current) {
  return current && current > moment().endOf('day');
}

const Expense = props => {
  const {
    id,
    // States
    summaries,
    // Loadings
    productionInfoLoading,
    // DATA
    mainCurrency,
    // API
    deleteTransaction,
    fetchFilteredReports,
    fetchMainCurrency,
    fetchProductionExpensesList,
    handleResetInvoiceFields,
    changeCost,
    mergedInvoiceContent,
    setMergedInvoiceContent,
  } = props;

  const [financeDeleteVisible, setFinanceDeleteVisible] = useState(false);
  const [description, setDescription] = useState();
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [selectedYearandMonth, setselectedYearandMonth] = useState(today);

  useEffect(() => {
    fetchMainCurrency();
    return () => {
      handleResetInvoiceFields();
    };
  }, []);

  useEffect(() => {
    if (selectedYearandMonth) {
   
      fetchFilteredReports(
        Number(moment(selectedYearandMonth, dateFormat).format('YYYY')),
        Number(moment(selectedYearandMonth, dateFormat).format('M')),
              { filters: { isArchived: 0 } }
      )
    }
  }, [selectedYearandMonth]);

  useEffect(() => {
    if (!financeDeleteVisible) {
      setSelectedRow(undefined);
      setDescription();
    }
  }, [financeDeleteVisible]);
  const handleDelete = () => {
    deleteTransaction(
      selectedRow.cashboxTransactionId,
      description,
      onDeleteOperation
    );
    setFinanceDeleteVisible(false);
  };
  const onDeleteOperation = () => {
    changeCost(
      {
        price: math.mul(
          Number(selectedRow?.amountConvertedToMainCurrency || 0),
          -1
        ),
      },
      true
    );
    fetchProductionExpensesList({
      filters: { invoices: [id], vat: 0, limit: 1000 },
    });
  };
  return (
    <>
      <Modal
        visible={financeDeleteVisible}
        footer={null}
        className={styles.customDeleteModal}
        onCancel={() => setFinanceDeleteVisible(false)}
      >
        <div style={{ padding: 24, paddingBottom: 12 }}>
          <h6 className={styles.modalTitle}>Silinmə səbəbini qeyd edin</h6>
          <TextArea
            rows={4}
            onChange={e => {
              setDescription(e.target.value);
            }}
            value={description}
          />

          <Divider style={{ marginBottom: 0 }} />
        </div>
        <div className={styles.modalAction}>
          <Button
            type="primary"
            onClick={handleDelete}
            style={{ marginRight: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MdCheckCircle size={18} style={{ marginRight: 4 }} />
              Təsdiq et
            </div>
          </Button>
          <Button
            type="primary"
            className={styles.rejectButton}
            onClick={() => setFinanceDeleteVisible(false)}
            style={{ marginRight: 6 }}
          >
            <MdClose size={18} style={{ marginRight: 4 }} />
            İmtina
          </Button>
        </div>
      </Modal>

      <div>
        {/* <Spin spinning={invoiceInfoLoading}></Spin> */}
        <div className={styles.summaryBox}>
          {summaries.map(({ label, value, percent }) => (
            <Col span={6} className={styles.summaryCol}>
              <Summary
                label={label}
                value={value}
                percent={percent}
                loading={productionInfoLoading}
                mainCurrency={mainCurrency}
              />
            </Col>
          ))}
        </div>
        <Collapse
          accordion
          style={{ backgroundColor: 'transparent' }}
          expandIconPosition="right"
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) =>
            isActive ? (
              <IoIosArrowDropdownCircle style={{ fontSize: '24px' }} />
            ) : (
              <IoIosArrowDroprightCircle style={{ fontSize: '24px' }} />
            )
          }
        >
          <Panel
            header={
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '22px',
                }}
              >
                Xərclər
              </div>
            }
            key="1"
            className={styles.collapse}
          >
            <ExpenseTable
              mainCurrency={mainCurrency}
              changeCost={changeCost}
              setFinanceDeleteVisible={setFinanceDeleteVisible}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              disabledDate={disabledDate}
            />
          </Panel>
          <Panel
            header={
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '22px',
                }}
              >
                Materiallar
              </div>
            }
            key="2"
            className={styles.collapse}
          >
            <MaterialTable
              mainCurrency={mainCurrency}
              changeCost={changeCost}
              id={id}
              mergedInvoiceContent={mergedInvoiceContent}
              setMergedInvoiceContent={setMergedInvoiceContent}
              disabledDate={disabledDate}
            />
          </Panel>
          <Panel
            header={
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '22px',
                }}
              >
                İşçilik
              </div>
            }
            key="3"
            className={styles.collapse}
          >
            <EmployeeExpenseTable
              mainCurrency={mainCurrency}
              changeCost={changeCost}
              setFinanceDeleteVisible={setFinanceDeleteVisible}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              disabledDate={disabledDate}
              selectedYearandMonth={selectedYearandMonth}
              setselectedYearandMonth={setselectedYearandMonth}
            />
          </Panel>
        </Collapse>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  mainCurrency: state.kassaReducer.mainCurrency,
  productionInfoLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedProducts: state.salesOperation.selectedProducts,
});

export const ProductionExpense = connect(
  mapStateToProps,
  {
    // API
    fetchMainCurrency,
    handleResetInvoiceFields,
    setSelectedProducts,
    deleteTransaction,
    fetchProductionExpensesList,
    fetchFilteredReports,
  }
)(Expense);
