import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProSelect, ProFormItem } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import styles from '../../../styles.module.scss';
import { useParams } from 'react-router-dom';

const ExpenseField = props => {
    const { form, field, tenant, productionInvoices, contracts } = props;
    const {
        getFieldError,
        getFieldDecorator,
        getFieldValue,
        setFieldsValue,
    } = form;
    const { label, placeholder, name } = field;

    const contractsArr = contracts.map(contract => ({
        ...contract,
        name: `${contract.counterparty_name} - ${contract.contract_no}`,
    }));
    const productionArr = productionInvoices.map(invoice => ({
        ...invoice,
        name: `${invoice.invoiceNumber} - ${
            invoice.clientName ? invoice.clientName : 'Daxili sifariş'
        }`,
    }));
    const { id } = useParams();
    useEffect(() => {
       
      if(!id){
        if (!getFieldValue('expenseType') && productionInvoices.length === 0) {
            setFieldsValue({
                expense: { ...tenant, id: 0 }.id,
            });
        }
        if (getFieldValue('expenseType') === 1) {
            setFieldsValue({
                expense:
                    productionArr.length === 1
                        ? productionArr[0].id
                        : undefined,
            });
        } else if (getFieldValue('expenseType') === 0) {
            setFieldsValue({
                expense:
                    contractsArr.length === 1 ? contractsArr[0].id : undefined,
            });
        }
      }
    }, [getFieldValue('expenseType'),productionArr.length]);
    return (
        <>
            {productionInvoices.length > 0 ? (
                <>
                    <div className={styles.field}></div>
                    <div className={styles.field}></div>
                    <div className={styles.field}></div>
                </>
            ) : null}
            <div className={styles.field}>
                <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                    {getFieldDecorator(name, {
                        getValueFromEvent: category => category,
                        rules: [requiredRule],
                    })(
                        <ProSelect
                            placeholder={placeholder}
                            disabled={
                                getFieldValue('expenseType') === 2
                            }
                            data={
                                getFieldValue('expenseType') === 2
                                    ? [{ ...tenant, id: 0 }]
                                    : getFieldValue('expenseType') === 1
                                    ? [...productionArr]
                                    : productionInvoices.length === 0
                                    ? [
                                          {
                                              ...tenant,
                                              id: 0,
                                          },
                                          ...contractsArr,
                                      ]
                                    : [...contractsArr]
                            }
                            keys={['name']}
                        />
                    )}
                </ProFormItem>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    productionInvoices: state.salesAndBuysReducer.invoices,
    contracts: state.contractsReducer.filteredContracts,
});

export const Expense = connect(
    mapStateToProps,
    {}
)(ExpenseField);
