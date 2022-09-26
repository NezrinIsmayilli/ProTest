import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProSelect, ProFormItem } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import styles from '../../../styles.module.scss';

const ExpenseTypeField = props => {
    const { form, field, tenant, productionInvoices } = props;
    const {
        getFieldError,
        getFieldDecorator,
        setFieldsValue,
        getFieldValue,
    } = form;
    const { label, placeholder, name } = field;
    const expense_type = [
        { id: 2, name: 'Baş ofis' },
        { id: 0, name: 'Müqavilə' },
        { id: 1, name: 'İstehsalat' },
    ];
    const ContractFn = event => {
        setFieldsValue({
            expense:
                event === 2
                    ? {
                          ...tenant,
                          id: 0,
                      }.id
                    : undefined,
        });
    };

    return productionInvoices.length > 0 ? (
        <div className={styles.field}>
            <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                {getFieldDecorator(name, {
                    getValueFromEvent: expenseType => {
                        ContractFn(expenseType);
                        return expenseType;
                    },
                    rules: [requiredRule],
                })(
                    <ProSelect
                        placeholder={placeholder}
                        data={expense_type}
                        keys={['name']}
                    />
                )}
            </ProFormItem>
        </div>
    ) : null;
};

const mapStateToProps = state => ({
    productionInvoices: state.salesAndBuysReducer.invoices,
    tenant: state.tenantReducer.tenant,
});

export const ExpenseType = connect(
    mapStateToProps,
    {}
)(ExpenseTypeField);
