import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProDatePicker, ProFormItem, ProSelect } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond } from 'utils';
import { Col } from 'antd';
import { updateContractDetails } from 'store/actions/sales-operation';
import styles from '../styles.module.scss';

const GeneralInformation = ({
  form,
  currencies,
  clients,
  stocks,
  users,
  contracts,
  contractDetails,
  updateContractDetails,
  contacts,
  suppliers,

  // Loadings
  usersLoading,
  suppliersLoading,
  clientsLoading,
  contactsLoading,
  currenciesLoading,
  contractsLoading,
  stocksLoading,
}) => {
  const {
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    getFieldValue,
  } = form;
  const {
    isContractSelected,
    contractAmount,
    contractBalance,
    currencyCode,
  } = contractDetails;

  return (
    <>
      <span className={styles.newOperationTitle}>Ümumi məlumat</span>
      <div className={styles.fieldsContainer}>
        <div className={styles.field}>
          <ProFormItem label="Tarix" help={getFieldError('dateTime')?.[0]}>
            {getFieldDecorator('dateTime', {
              rules: [requiredRule],
            })(
              <ProDatePicker
                disabled
                size="large"
                format={fullDateTimeWithSecond}
                allowClear={false}
                placeholder="Seçin"
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem label="Valyuta" help={getFieldError('currency')?.[0]}>
            {getFieldDecorator('currency', {
              getValueFromEvent: currencyId => currencyId,
              rules: [requiredRule],
            })(
              <ProSelect
                allowClear={false}
                loading={currenciesLoading}
                disabled
                placeholder="Seçin"
                data={currencies}
                keys={['code']}
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem label="Qarşı tərəf" help={getFieldError('client')?.[0]}>
            {getFieldDecorator('client', {
              rules: [requiredRule],
            })(
              <ProSelect
                allowClear={false}
                loading={suppliersLoading || clientsLoading}
                data={[...clients, ...suppliers]}
                placeholder="Seçin"
                disabled
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem
            label="Satış menecerİ"
            help={getFieldError('salesman')?.[0]}
          >
            {getFieldDecorator('salesman', {
              getValueFromEvent: category => category,
              rules: [requiredRule],
            })(
              <ProSelect
                data={users}
                keys={['name', 'lastName']}
                allowClear={false}
                loading={usersLoading}
                placeholder="Seçin"
                disabled
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem
            label="Müqavilə"
            help={getFieldError('contract')?.[0]}
            helperText={
              isContractSelected ? (
                <span className={styles.contractBalance}>
                  Müqavilə limiti: {}{' '}
                  <strong style={{ color: '#55AB80' }}>
                    {Number(contractAmount)
                      ? `${Number(contractBalance)} ${currencyCode}`
                      : 'Limitsiz'}
                  </strong>
                </span>
              ) : null
            }
          >
            {getFieldDecorator('contract', {
              getValueFromEvent: contractId => {
                const selectedContract =
                  contracts.find(contract => contract.id === contractId) || {};
                const { amount, rest, currencycode } = selectedContract;
                if (contractId) {
                  updateContractDetails({
                    isContractSelected: contractId,
                    contractAmount: Number(amount),
                    contractBalance: Number(rest),
                    currencyCode: currencycode,
                  });
                } else {
                  updateContractDetails();
                }

                return contractId;
              },
              rules: [],
            })(
              <ProSelect
                loading={contractsLoading}
                disabled
                placeholder="Seçin"
                data={contracts.filter(
                  contract =>
                    contract.counterparty_id === getFieldValue('client')
                )}
                keys={['contract_no']}
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem label="Agent" help={getFieldError('agent')?.[0]}>
            {getFieldDecorator('agent', {
              getValueFromEvent: category => category,
              rules: [],
            })(
              <ProSelect
                loading={contactsLoading}
                disabled
                placeholder="Seçin"
                data={contacts}
              />
            )}
          </ProFormItem>
        </div>
        <div className={styles.field}>
          <ProFormItem label="Anbar" help={getFieldError('stock')?.[0]}>
            {getFieldDecorator('stock', {
              rules: [requiredRule],
            })(
              <ProSelect
                loading={stocksLoading}
                placeholder="Seçin"
                data={stocks}
                disabled
              />
            )}
          </ProFormItem>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  currencies: state.kassaReducer.currencies,
  clients: state.newContactsReducer.clients,
  suppliers: state.newContactsReducer.suppliers,
  users: state.usersReducer.users,
  contracts: state.contractsReducer.contracts,
  contractDetails: state.salesOperation.contractDetails,
  stocks: state.stockReducer.stocks,
  contacts: state.newContactsReducer.contacts,

  suppliersLoading: state.loadings.fetchSuppliers,
  contractsLoading: state.loadings.fetchContracts,
  clientsLoading: state.loadings.fetchClients,
  usersLoading: state.loadings.fetchUsers,
  invoiceInfoLoading: state.loadings.invoicesInfo,
  currenciesLoading: state.loadings.fetchCurrencies,
  stocksLoading: state.loadings.fetchStocks,
  contactsLoading: state.loadings.fetchContacts,
});

export default connect(
  mapStateToProps,
  { updateContractDetails }
)(GeneralInformation);
