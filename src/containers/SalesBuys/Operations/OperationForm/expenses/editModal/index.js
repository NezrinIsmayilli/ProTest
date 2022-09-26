/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Modal, Form } from 'antd';
import moment from 'moment';
import {
    ProFormItem,
    ProDatePicker,
    AddButton,
    ProSelect,
} from 'components/Lib';
import {
    editBalance,
    fetchBalance,
    getBalanceSheet,
} from 'store/actions/reports/balance-sheet';
import { setSelectedProducts } from 'store/actions/sales-operation';
import { requiredRule, minLengthRule, mediumTextMaxRule } from 'utils/rules';
import { dateFormat } from 'utils';
import styles from '../../styles.module.scss';

const EditModal = props => {
    const {
        form,
        isVisible,
        setIsVisible,
        editBalance,
        fetchBalance,
        selectedItemForUpdate,
        row,
        type,
        date,
        currencies,
        setSelectedImportProducts,
        selectedImportProducts,
        setSelectedProducts,
        selectedProducts,
    } = props;

    const {
        getFieldDecorator,
        getFieldValue,
        getFieldError,
        validateFields,
        setFieldsValue,
    } = form;

    const onSuccessCallback = () => {
        setIsVisible(false);
        fetchBalance({ filters: { types: [type], date } });
    };
    const addCatalog = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { date, amount, name, currency } = values;
                const invoiceData = selectedImportProducts?.filter(
                    ({ expenseInvoiceId }) => expenseInvoiceId !== null
                );
                const newSelectedProductionExpense = selectedImportProducts
                    ?.filter(
                        ({ expenseInvoiceId }) => expenseInvoiceId === null
                    )
                    .map((item, index) => {
                        if (index === selectedItemForUpdate) {
                            return {
                                ...item,
                                name,
                                operationDate: date?.format(dateFormat),
                                endPrice: Number(amount),
                                usedPrice: Number(amount),
                                currencyId: currency,
                                currencyCode: currencies?.find(
                                    ({ id }) => id === currency
                                )?.code,
                            };
                        }
                        return item;
                    });
                setSelectedProducts({
                    newSelectedProducts: selectedProducts.map(
                        selectedProduct => ({
                            ...selectedProduct,
                            fromEdit: false,
                        })
                    ),
                });
                setSelectedImportProducts([
                    ...newSelectedProductionExpense,
                    ...invoiceData,
                ]);
                setIsVisible(false);
            }
        });
    };
    const handleAmount = event => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
        if (event.target.value === '-') {
            return event.target.value;
        }
        if (re.test(event.target.value) && event.target.value <= 10000000)
            return event.target.value;

        if (event.target.value === '') return null;
        return getFieldValue('amount');
    };
    useEffect(() => {
        setFieldsValue({
            date: moment(row?.operationDate, 'DD-MM-YYYY'),
            name: row?.name,
            amount: Number(row?.endPrice),
            currency: row?.currencyId,
        });
    }, [isVisible]);
    return (
        <Modal
            closable={false}
            confirmLoading
            footer={null}
            className={styles.customModal}
            style={{ marginTop: '100px' }}
            onCancel={() => setIsVisible(false)}
            visible={isVisible}
        >
            <Button
                className={styles.closeButton}
                size="large"
                onClick={() => setIsVisible(false)}
            >
                <img
                    width={14}
                    height={14}
                    src="/img/icons/X.svg"
                    alt="trash"
                    className={styles.icon}
                />
            </Button>

            <div className={styles.addCatalogModal}>
                <h2>Düzəliş et</h2>

                <Form onSubmit={event => addCatalog(event)}>
                    <ProFormItem
                        label="Tarix"
                        customStyle={styles.formItem}
                        help={getFieldError('date')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('date', {
                            rules: [requiredRule],
                        })(
                            <ProDatePicker
                                disabledDate={current =>
                                    current &&
                                    current > moment(date, 'DD-MM-YYYY')
                                }
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        label="Xərcin adı"
                        customStyle={styles.formItem}
                        help={getFieldError('name')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('name', {
                            rules: [
                                requiredRule,
                                minLengthRule,
                                mediumTextMaxRule,
                            ],
                        })(<Input size="large" placeholder="Yazın" />)}
                    </ProFormItem>
                    <ProFormItem
                        label="Valyuta"
                        customStyle={styles.formItem}
                        help={getFieldError('currency')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('currency', {
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                keys={['code']}
                                data={currencies}
                                allowClear={false}
                                // disabled={isDisabled}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        label="Məbləğ"
                        customStyle={styles.formItem}
                        help={getFieldError('amount')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('amount', {
                            getValueFromEvent: event => handleAmount(event),
                            rules: [requiredRule],
                        })(<Input size="large" placeholder="Yazın" />)}
                    </ProFormItem>
                    <AddButton htmlType="submit" label="Təsdiq et" />
                </Form>
            </div>
        </Modal>
    );
};

const mapStateToProps = state => ({
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        editBalance,
        fetchBalance,
        getBalanceSheet,
        setSelectedProducts,
    }
)(Form.create({ name: 'EditForm' })(EditModal));
