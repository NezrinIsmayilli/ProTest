import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import styles from '../styles.module.scss';
import {
  Agent,
  Counterparty,
  Contract,
  Date,
  Currency,
  SalesManager,
  StockFrom,
  StockTo,
  Expense,
  ExpenseType,
} from './fields';

const componentAdapter = {
  agent: Agent,
  counterparty: Counterparty,
  currency: Currency,
  date: Date,
  salesman: SalesManager,
  contract: Contract,
  stockFrom: StockFrom,
  stockTo: StockTo,
  expense: Expense,
  expenseType: ExpenseType,
};

const FormGenerator = ({ name, ...rest }) =>
  React.createElement(componentAdapter[name], rest);

const GeneralInformation = ({
  fields,
  invoiceInfoLoading = false,
  form,
  unitStock,
  counterpartyLabel,
  setUnitStock,
  invoiceInfo,
}) => {
  return (
    <>
      <div className={styles.parentBox}>
        <div className={styles.paper}>
          <Spin spinning={invoiceInfoLoading}>
            <span className={styles.newOperationTitle}>Ümumi məlumat</span>
            <div className={styles.fieldsContainer}>
              {fields.map((field, key) => (
                <FormGenerator
                  key={key}
                  field={field}
                  form={form}
                  name={field.type}
                  unitStock={unitStock}
                  counterpartyLabel={counterpartyLabel}
                  setUnitStock={setUnitStock}
                  invoiceInfo={invoiceInfo}
                />
              ))}
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  invoiceInfoLoading: state.loadings.invoicesInfo,
});

export default connect(
  mapStateToProps,
  {}
)(GeneralInformation);
