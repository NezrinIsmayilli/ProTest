import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  updateContractDetails,
  updateInvoiceCurrencyCode,
  setSelectedProducts,
} from 'store/actions/sales-operation';
import { ProSelect, ProFormItem } from 'components/Lib';
import styles from '../../../styles.module.scss';

const ContractField = props => {
  const {
    form,
    field,
    contracts,
    contractsLoading,
    updateContractDetails,
    updateInvoiceCurrencyCode,
    setSelectedProducts,
    contractDetails,
    invoiceInfo,
  } = props;
  const {
    getFieldError,
    getFieldDecorator,
    getFieldValue,
    setFieldsValue,
  } = form;
  const { label, placeholder, name, from, direction } = field;
  const {
    isContractSelected,
    contractAmount,
    contractBalance,
    currencyCode,
  } = contractDetails;

  return (
    <div className={styles.field}>
      <ProFormItem
        label={label}
        help={getFieldError(name)?.[0]}
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
        {getFieldDecorator(name, {
          getValueFromEvent: contractId => {
            if (from === 'return') {
              setSelectedProducts({ newSelectedProducts: [] });
            }
            const selectedContract =
              contracts.find(contract => contract.id === contractId) || {};
            const {
              amount,
              rest,
              currencycode,
              currency_id,
            } = selectedContract;
            if (contractId) {
              setFieldsValue({ currency: currency_id });
              updateInvoiceCurrencyCode(currencycode);
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
            disabled={
              contractsLoading ||
              (!getFieldValue('supplier') && !getFieldValue('client')) || invoiceInfo?.isUsedByAnotherInvoice
            }
            placeholder={placeholder}
            data={contracts.filter(
              contract =>
                contract.direction === direction &&
                contract.counterparty_id ===
                  (getFieldValue('supplier') || getFieldValue('client'))
            )}
            keys={['contract_no']}
          />
        )}
      </ProFormItem>
    </div>
  );
};

const mapStateToProps = state => ({
  contractDetails: state.salesOperation.contractDetails,
  contractsLoading: state.loadings.fetchContracts,
  contracts: state.contractsReducer.contracts,
});

export const Contract = connect(
  mapStateToProps,
  {
    updateInvoiceCurrencyCode,
    updateContractDetails,
    setSelectedProducts,
  }
)(ContractField);
