/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Input, Button, Modal, Form, Row, Col } from 'antd';
import moment from 'moment';
import {
    ProFormItem,
    ProDatePicker,
    AddButton,
    ProSelect,
    ProInput,
} from 'components/Lib';
import { setSelectedProductionEmployeeExpense } from 'store/actions/sales-operation';
import { requiredRule, minLengthRule, dinamicMaxLengthRule } from 'utils/rules';
import { dateFormat } from 'utils';
import styles from '../../../styles.module.scss';

const roundTo = require('round-to');
const math = require('exact-math');

const EditModal = props => {
    const {
        form,
        isVisible,
        setIsVisible,
        row,
        selectedItemForUpdate,
        selectedProductionEmployeeExpense,
        setSelectedProductionEmployeeExpense,
        currencyCode,
        changeCost,
        selectedYearandMonth,
        setselectedYearandMonth,
        reportsFilteredData,
        isLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldValue,
        getFieldError,
        validateFields,
        setFieldsValue,
    } = form;

    const dispatch = useDispatch();

    const addCatalog = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { date, amount, name, type, hour, staff } = values;
                const newSelectedProductionEmployeeExpense = selectedProductionEmployeeExpense.map(
                    (item, index) => {
                        if (index === selectedItemForUpdate) {
                            return {
                                ...item,
                                employeeName: staff === 1 ? null : name,
                                staffEmployeeId: staff === 1 ? name : null,
                                staffEmployeeName:
                                    staff === 1
                                        ? reportsFilteredData.find(
                                              ({ id }) => id === name
                                          ).name
                                        : null,
                                staffEmployeeSurname:
                                    staff === 1
                                        ? reportsFilteredData.find(
                                              ({ id }) => id === name
                                          ).surname
                                        : null,
                                staffEmployeePatronymic:
                                    staff === 1
                                        ? reportsFilteredData.find(
                                              ({ id }) => id === name
                                          ).patronymic
                                        : null,
                                date: date.format(dateFormat),
                                price: Number(amount),
                                type,
                                hours: hour,
                            };
                        }
                        return item;
                    }
                );
                dispatch(
                    setSelectedProductionEmployeeExpense({
                        newSelectedProductionEmployeeExpense,
                    })
                );
                setIsVisible(false);
                changeCost({
                    price: math.sub(
                        math.mul(Number(amount), Number(hour || 1) || 0),
                        math.mul(
                            Number(
                                selectedProductionEmployeeExpense.find(
                                    (item, index) =>
                                        index === selectedItemForUpdate
                                ).price
                            ),
                            Number(
                                selectedProductionEmployeeExpense.find(
                                    (item, index) =>
                                        index === selectedItemForUpdate
                                ).hours
                            ) || 1
                        )
                    ),
                });
            }
        });
    };
    const handleAmount = (event, field) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
        if (re.test(event.target.value)) return event.target.value;

        if (event.target.value === '') return null;
        return getFieldValue(field);
    };
    useEffect(() => {
        setFieldsValue({
            date: moment(row?.date, 'DD-MM-YYYY'),
            name:
                row?.staffEmployeeId !== null
                    ? row?.staffEmployeeId
                    : row?.employeeName,
            staff: row?.staffEmployeeId !== null ? 1 : 2,
            type: row?.type,
            hour: roundTo(Number(row?.hours), 4),
            amount: Number(row?.price),
        });
        setselectedYearandMonth(row?.date);
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
                                onChange={(_, selectedDate) => {
                                    setselectedYearandMonth(selectedDate);
                                    if (getFieldValue('staff') === 1) {
                                        setFieldsValue({ name: undefined });
                                    }
                                }}
                            />
                        )}
                    </ProFormItem>
                    <ProFormItem
                        style={{ height: '80px' }}
                        customStyle={styles.formItem}
                        label="Ştat növü"
                        help={getFieldError('staff')?.[0]}
                    >
                        {getFieldDecorator('staff', {
                            getValueFromEvent: staff => staff,
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                allowClear={false}
                                placeholder="Seçin"
                                data={[
                                    { id: 1, name: 'Ştat' },
                                    { id: 2, name: 'Ştatdan kənar' },
                                ]}
                                onChange={() =>
                                    setFieldsValue({ name: undefined })
                                }
                            />
                        )}
                    </ProFormItem>
                    {getFieldValue('staff') === 1 ? (
                        <ProFormItem
                            label="Əməkdaşın adı"
                            customStyle={styles.formItem}
                            help={getFieldError('name')?.[0]}
                            style={{ height: '80px' }}
                        >
                            {getFieldDecorator('name', {
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    loading={isLoading}
                                    allowClear={false}
                                    placeholder="Seçin"
                                    data={reportsFilteredData}
                                    keys={['name', 'surname', 'patronymic']}
                                />
                            )}
                        </ProFormItem>
                    ) : (
                        <ProFormItem
                            label="Əməkdaşın adı"
                            customStyle={styles.formItem}
                            help={getFieldError('name')?.[0]}
                            style={{ height: '80px' }}
                        >
                            {getFieldDecorator('name', {
                                rules: [
                                    requiredRule,
                                    minLengthRule,
                                    dinamicMaxLengthRule(90),
                                ],
                            })(<Input size="large" placeholder="Yazın" />)}
                        </ProFormItem>
                    )}
                    <Row>
                        <Col span={14}>
                            <ProFormItem
                                label="Tip"
                                help={getFieldError('type')?.[0]}
                                style={{ marginRight: '10px' }}
                            >
                                {getFieldDecorator('type', {
                                    getValueFromEvent: type => {
                                        if (type === 2)
                                            setFieldsValue({ hour: undefined });
                                        return type;
                                    },
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        allowClear={false}
                                        data={[
                                            { id: 1, name: 'Vaxtamuzd' },
                                            { id: 2, name: 'İşəmuzd' },
                                        ]}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                        <Col span={10}>
                            <ProFormItem
                                label="Saat"
                                help={getFieldError('hour')?.[0]}
                            >
                                {getFieldDecorator('hour', {
                                    getValueFromEvent: event =>
                                        handleAmount(event, 'hour'),
                                    rules:
                                        getFieldValue('type') === 2
                                            ? []
                                            : [requiredRule],
                                })(
                                    <ProInput
                                        disabled={getFieldValue('type') === 2}
                                    />
                                )}
                            </ProFormItem>
                        </Col>
                    </Row>
                    <ProFormItem
                        label={`Məbləğ ${currencyCode}`}
                        customStyle={styles.formItem}
                        help={getFieldError('amount')?.[0]}
                        style={{ height: '80px' }}
                    >
                        {getFieldDecorator('amount', {
                            getValueFromEvent: event =>
                                handleAmount(event, 'amount'),
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
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
    reportsFilteredData: state.reportReducer.reports,
    isLoading: !!state.loadings.reports,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProductionEmployeeExpense,
    }
)(Form.create({ name: 'EditForm' })(EditModal));
