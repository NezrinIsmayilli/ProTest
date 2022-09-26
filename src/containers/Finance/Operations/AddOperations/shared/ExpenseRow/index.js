import React, { useEffect, useState } from 'react';
import { Row, Col, Tooltip } from 'antd';
import { ProFormItem, ProSelect, ProInput } from 'components/Lib';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { ReactComponent as MinusIcon } from 'assets/img/icons/minus.svg';
import { requiredRule } from 'utils/rules';
import styles from '../styles.module.scss';

const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
export const ExpenseRow = props => {
    const {
        form,
        index,
        handleAddExpenseClick,
        handleExpenseChange,
        handleAddModal,
        currencyCode,
        expenseCatalogs,
        editId,
        disabled,
    } = props;
    const {
        setFieldsValue,
        getFieldDecorator,
        getFieldError,
        getFieldValue,
    } = form;

    const subcatalogs = expenseCatalogs.children
        ? expenseCatalogs.children[getFieldValue(`expenses[${index}].catalog`)]
        : null;

    const catalogs = expenseCatalogs?.root?.filter(({ type }) => type !== 6);
    useEffect(() => {
        if (catalogs && catalogs.length === 1) {
            setFieldsValue({
                [`expenses[${index}].catalog`]: catalogs[0].id,
            });
        }
        if (subcatalogs && subcatalogs.length === 1) {
            setFieldsValue({
                [`expenses[${index}].subCatalog`]: subcatalogs[0].id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        getFieldValue(`expenses[${index}].catalog`),
        expenseCatalogs?.root,
        subcatalogs,
    ]);
    return (
        <>
            <Row gutter={8}>
                <Col span={8}>
                    <ProFormItem
                        label="Əməliyyatın kateqoriyası"
                        help={getFieldError(`expenses[${index}].catalog`)?.[0]}
                    >
                        {getFieldDecorator(`expenses[${index}].catalog`, {
                            getValueFromEvent: category => {
                                setFieldsValue({
                                    expenses: getFieldValue('expenses').map(
                                        (expense, expenseIndex) =>
                                            expenseIndex === index
                                                ? {
                                                      ...expense,
                                                      subCatalog: undefined,
                                                  }
                                                : expense
                                    ),
                                });
                                return category;
                            },
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                data={expenseCatalogs?.root?.filter(
                                    ({ type }) => type !== 6
                                )}
                                allowClear={false}
                                disabled={disabled}
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col
                    span={8}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <ProFormItem
                        customStyle={styles.expenseItem}
                        style={{ marginTop: '4px' }}
                        label={
                            <div style={{ display: 'flex' }}>
                                <div>Əməliyyatın alt kateqoriyası</div>
                                <Tooltip title="Xərc adı əlavə et">
                                    <PlusIcon
                                        color="#FF716A"
                                        disabled={disabled}
                                        style={
                                            !getFieldValue(
                                                `expenses[${index}].catalog`
                                            ) || disabled
                                                ? {
                                                      marginLeft: '50px',
                                                      cursor: 'pointer',
                                                      width: '14px',
                                                      height: '14px',
                                                      pointerEvents: 'none',
                                                      fill: '#868686',
                                                  }
                                                : {
                                                      marginLeft: '50px',
                                                      cursor: 'pointer',
                                                      height: '14px',
                                                      width: '14px',
                                                  }
                                        }
                                        onClick={() =>
                                            handleAddModal(
                                                getFieldValue(
                                                    `expenses[${index}].catalog`
                                                ),
                                                index
                                            )
                                        }
                                    />
                                </Tooltip>
                            </div>
                        }
                        help={
                            getFieldError(`expenses[${index}].subCatalog`)?.[0]
                        }
                        keys={['name']}
                    >
                        {getFieldDecorator(`expenses[${index}].subCatalog`, {
                            getValueFromEvent: category => category,
                            rules: [requiredRule],
                        })(
                            <ProSelect
                                data={
                                    expenseCatalogs.children
                                        ? expenseCatalogs.children[
                                              getFieldValue(
                                                  `expenses[${index}].catalog`
                                              )
                                          ]
                                        : []
                                }
                                allowClear={false}
                                disabled={
                                    !getFieldValue(
                                        `expenses[${index}].catalog`
                                    ) || disabled
                                    // ||
                                    // (expenseCatalogs.children
                                    //   ? !expenseCatalogs.children[
                                    //       getFieldValue(`expenses[${index}].catalog`)
                                    //     ]?.length > 0
                                    //   : true)
                                }
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col span={editId ? 8 : 6}>
                    <ProFormItem
                        label="Məbləğ"
                        help={getFieldError(`expenses[${index}].amount`)?.[0]}
                    >
                        {getFieldDecorator(`expenses[${index}].amount`, {
                            getValueFromEvent: event => {
                                if (
                                    re.test(event.target.value) &&
                                    event.target.value <= 1000000
                                ) {
                                    handleExpenseChange(
                                        event.target.value,
                                        index
                                    );
                                    return event.target.value;
                                }
                                if (event.target.value === '') {
                                    handleExpenseChange(null, index);
                                    return null;
                                }
                                return getFieldValue(
                                    `expenses[${index}].amount`
                                );
                            },
                            rules: [
                                requiredRule,
                                {
                                    type: 'number',
                                    min: 0.1,
                                    message: 'Ödəniş məbləği 0 ola bilməz.',
                                    transform: value => Number(value),
                                },
                            ],
                        })(
                            <ProInput
                                suffix={currencyCode}
                                disabled={disabled}
                            />
                        )}
                    </ProFormItem>
                </Col>
                {!editId && (
                    <Col span={2}>
                        <ProFormItem label=" ">
                            <div
                                style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {index === 0 ? (
                                    <PlusIcon
                                        color="#FF716A"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            handleAddExpenseClick('add', index)
                                        }
                                    />
                                ) : (
                                    <MinusIcon
                                        color="#FF716A"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            handleAddExpenseClick(
                                                'remove',
                                                index
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </ProFormItem>
                    </Col>
                )}
            </Row>
        </>
    );
};
