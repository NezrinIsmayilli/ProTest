import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { ReactComponent as MinusIcon } from 'assets/img/icons/minus.svg';
import { Button, Col, Form, Row } from 'antd';
import {
    ProDatePicker,
    ProFormItem,
    ProInput,
    ProSelect,
} from 'components/Lib';

// utils
import {
    messages,
    formItemSize,
    accountTypeOptions,
    fullDateTimeWithSecond,
} from 'utils';

// actions
import {
    fetchCashboxBalanceReport,
    createCashboxBalance,
} from 'store/actions/finance/reports';
import {
    fetchCurrencies,
    fetchCashboxNames,
} from 'store/actions/settings/kassa';
import { toast } from 'react-toastify';
import moment from 'moment';
import styles from '../styles.module.scss';

const requiredRule = {
    required: true,
    message: messages.requiredText,
};

const CashboxForm = React.forwardRef(props => {
    const {
        form,
        // actions
        selectedItem,
        fetchCashboxNames,
        fetchCashboxBalanceReport,
        fetchCurrencies,
        cashboxBalanceReport,
        cashBoxNames,
        currencies,
        createCashboxBalance,
        id,
        toggleCashboxModal,
        visiblePopup,
        currenciesLoading,
        isLoading,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        setFieldsValue,
        getFieldValue,
        resetFields,
    } = form;
    const [cashbox, setCashbox] = useState([]);
    const [cashboxType, setCashboxType] = useState(null);
    const [disabled, setDisabled] = useState(true);

    const [selectedCashbox, setSelectedCashbox] = useState([]);
    const [arrRow, setArrRow] = useState(undefined);
    const [amountsUlRow, setAmountsUlRow] = useState([undefined]);
    const [addingCashbox, setAddingCashbox] = useState([]);
    const [amountData, setAmountData] = useState([]);
    const [editBalance, setEditBalance] = useState([]);
    const [dateOfTransaction, setDateOfTransaction] = useState(undefined);

    const disabledDateEdit = current =>
        (current &&
            current < moment(dateOfTransaction, fullDateTimeWithSecond)) ||
        current > moment().endOf('day');

    const disabledDate = current => current && current >= moment().endOf('day');

    const handleAddExpenseClick = (clickType = 'add', selectedIndex) => {
        if (clickType === 'add') {
            if (selectedCashbox && selectedCashbox.length > 0) {
                setArrRow(prevExpenses => [
                    ...getFieldValue('amounts_ul'),
                    null,
                ]);
            } else {
                setAmountsUlRow(prevExpenses => [...prevExpenses, null]);
            }
        }
        if (clickType === 'remove') {
            setFieldsValue({
                [`amounts_ul[${selectedIndex}].amount`]: null,
            });
            if (selectedCashbox && selectedCashbox.length > 0) {
                setArrRow(prevExpenses =>
                    getFieldValue('amounts_ul').filter(
                        (prevExpense, index) => index !== selectedIndex
                    )
                );
                setFieldsValue({
                    amounts_ul: getFieldValue('amounts_ul').filter(
                        (_, index) => index !== selectedIndex
                    ),
                });
            } else {
                setAmountsUlRow(prevExpenses =>
                    prevExpenses.filter(
                        (prevExpense, index) => index !== selectedIndex
                    )
                );
                setFieldsValue({
                    amounts_ul: getFieldValue('amounts_ul').filter(
                        (_, index) => index !== selectedIndex
                    ),
                });
            }
        }
    };

    const selectCashboxType = type => {
        if (!type) {
            setCashboxType(null);
            setDisabled(true);
        } else {
            setFieldsValue({
                cashbox: undefined,
            });
            setCashbox([]);
            setDisabled(false);
            setCashboxType(type);
        }
    };
    useEffect(() => {
        if (cashboxType && !id) {
            fetchCashboxNames({
                attribute: cashboxType,
                filters: {
                    exceptIds: addingCashbox,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashboxType]);

    useEffect(() => {
        setFieldsValue({
            dateOfTransaction: moment(),
        });
        const filteredCashboxId = Object.keys(cashboxBalanceReport[0]).map(
            item => item
        );
        setAddingCashbox(filteredCashboxId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashboxBalanceReport]);

    useEffect(() => {
        if (!id) {
            resetFields();
            setFieldsValue({
                dateOfTransaction: moment(),
            });
            setCashboxType(null);
            setCashbox([]);
            setArrRow(undefined);
            setAmountsUlRow([undefined]);
            setSelectedCashbox([]);
            setDateOfTransaction(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visiblePopup, id]);

    useEffect(() => {
        setCashbox(cashBoxNames[cashboxType]);
        if (id) {
            setFieldsValue({
                cashbox:
                    cashBoxNames[cashboxType] &&
                    cashBoxNames[cashboxType].find(
                        cashBoxName =>
                            cashBoxName.name === selectedItem.cashboxName
                    )?.id,
            });
        }
        if (cashBoxNames[cashboxType]?.length == 1) {
            setFieldsValue({
                cashbox:
                    cashBoxNames[cashboxType] &&
                    cashBoxNames[cashboxType][0]?.id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashBoxNames]);

    useEffect(() => {
        if (cashbox?.length > 0) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [cashbox]);
    useEffect(() => {
        getFieldValue('amounts_ul').map((amounts, index) => {
            if (!currencies?.map(({ id }) => id).includes(amounts.currency)) {
                setFieldsValue({
                    [`amounts_ul[${index}].currency`]: undefined,
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('amounts_ul')?.length, currencies]);

    useEffect(() => {
        if (id) {
            const cashboxBalance = Object.values(cashboxBalanceReport[0]).find(
                cashboxBalance => cashboxBalance.id === id
            );
            const { dateOfTransaction, cashboxType, balances } =
                cashboxBalance || {};
            const currentType = accountTypeOptions.find(type =>
                type.name.toLowerCase().includes(cashboxType.toLowerCase())
            );
            const amounts_ul = [];

            for (const [key, value] of Object.entries(balances)) {
                amounts_ul.push({
                    currency: Number(key),
                    amount: Number(value),
                });
            }

            setEditBalance(balances);
            setDateOfTransaction(dateOfTransaction);
            setAmountData(amounts_ul);
            setCashboxType(currentType.id);
            fetchCashboxNames({ attribute: currentType.id });
            setArrRow(amounts_ul);
            setSelectedCashbox(amounts_ul);
            setFieldsValue({
                dateOfTransaction: moment(
                    dateOfTransaction,
                    fullDateTimeWithSecond
                ),
                cashboxType: currentType.id,
                amounts_ul,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, cashboxBalanceReport]);
    useEffect(() => {
        if (arrRow) {
            setFieldsValue({
                amounts_ul: arrRow,
            });
        } else {
            setFieldsValue({
                amounts_ul: [{ amount: undefined, currency: undefined }],
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arrRow]);
    useEffect(() => {
        const cashboxBalance = Object.values(cashboxBalanceReport[0]).find(
            cashboxBalance => cashboxBalance.id === id
        );
        fetchCurrencies({
            dateTime: cashboxBalance
                ? cashboxBalance.dateOfTransaction
                : getFieldValue('dateOfTransaction')?.format(
                      fullDateTimeWithSecond
                  ),
            withRatesOnly: 1,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getFieldValue('dateOfTransaction')]);

    const onSuccessCallback = () => {
        resetFields();
        toggleCashboxModal();
        fetchCashboxBalanceReport({
            filters: {
                transactionTypes: [14],
            },
            forInitial: true,
        });
        setEditBalance([]);
        setFieldsValue({
            dateOfTransaction: moment(),
        });
        setArrRow(undefined);
    };

    const handleSubmit = e => {
        e.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                const { dateOfTransaction, cashbox, amounts_ul } = values;

                const data = {
                    dateOfTransaction: dateOfTransaction.format(
                        fullDateTimeWithSecond
                    ),
                    cashbox,
                    description: null,
                    amounts_ul,
                };
                if (id) {
                    return createCashboxBalance(
                        data,
                        onSuccessCallback,
                        ({ error }) => {
                            const errorData =
                                error?.response?.data?.error?.errors?.data;
                            if (
                                amounts_ul
                                    .map(({ currency }) => currency)
                                    .includes(
                                        errorData?.current_tenant_currency_id
                                    )
                            ) {
                                const { amount } = amounts_ul.find(
                                    item =>
                                        item.currency ===
                                        errorData?.current_tenant_currency_id
                                );
                                toast.error(
                                    `${
                                        errorData?.date
                                    } tarixində hesabda mənfi yarandığı üçün məbləğ ${
                                        moment(
                                            dateOfTransaction,
                                            fullDateTimeWithSecond
                                        ).isAfter(
                                            moment(
                                                errorData?.date,
                                                fullDateTimeWithSecond
                                            )
                                        )
                                            ? Number(errorData?.amount)
                                            : Number(amount) +
                                              Number(errorData?.amount)
                                    } ${
                                        currencies.find(
                                            currency =>
                                                currency.id ===
                                                errorData?.current_tenant_currency_id
                                        )?.code
                                    } dəyərindən az ola bilməz`
                                );
                            } else {
                                setArrRow(prevExpenses => [
                                    ...getFieldValue('amounts_ul'),
                                    {
                                        amount: Number(
                                            editBalance[
                                                (errorData
                                                    ?.current_tenant_currency_id)
                                            ]
                                        ),
                                        currency:
                                            errorData?.current_tenant_currency_id,
                                    },
                                ]);
                                toast.error(
                                    `${
                                        errorData?.date
                                    } tarixində hesabda mənfi yarandığı üçün məbləğ ${Number(
                                        errorData?.amount
                                    )} ${
                                        currencies.find(
                                            currency =>
                                                currency.id ===
                                                errorData?.current_tenant_currency_id
                                        )?.code
                                    } dəyərindən az ola bilməz`
                                );
                            }
                        }
                    );
                }
                return createCashboxBalance(data, onSuccessCallback);
            }
        });
    };
    const handlePaymentAmount = (event, index) => {
        const re = /^[0-9]{1,10}\.?[0-9]{0,2}$/;
        if (re.test(event.target.value)) return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue(`amounts_ul[${index}].amount`);
    };

    return (
        <>
            <div className={styles.modalHeader}>
                <p>{id ? 'Düzəliş et' : 'Hesab əlavə et'}</p>
            </div>

            <Form onSubmit={handleSubmit} noValidate>
                <ProFormItem
                    style={{ marginBottom: '5px' }}
                    label="İlkin qalıq tarixi"
                    help={getFieldError('dateOfTransaction')?.[0]}
                >
                    {getFieldDecorator('dateOfTransaction', {
                        rules: [requiredRule],
                    })(
                        <ProDatePicker
                            size="large"
                            format={fullDateTimeWithSecond}
                            allowClear={false}
                            disabledDate={id ? disabledDateEdit : disabledDate}
                            placeholder="İlkin Qalıq"
                        />
                    )}
                </ProFormItem>
                <ProFormItem
                    style={{ marginBottom: '5px' }}
                    label="Hesab növü"
                    help={getFieldError('cashboxType')?.[0]}
                >
                    {getFieldDecorator('cashboxType', {
                        rules: [requiredRule],
                    })(
                        <ProSelect
                            size={formItemSize}
                            data={accountTypeOptions}
                            onChange={e => selectCashboxType(e)}
                            disabled={id}
                        />
                    )}
                </ProFormItem>
                <ProFormItem
                    style={{ marginBottom: '5px' }}
                    label="Hesab"
                    help={getFieldError('cashbox')?.[0]}
                >
                    {getFieldDecorator('cashbox', {
                        rules: [requiredRule],
                    })(
                        <ProSelect
                            disabled={disabled || id}
                            size={formItemSize}
                            data={cashbox}
                            loading={isLoading}
                        />
                    )}
                </ProFormItem>
                {selectedCashbox && selectedCashbox.length > 0
                    ? arrRow?.map((amounts_ul, index) => (
                          <Row>
                              <Col style={{ padding: '2px' }} span={13}>
                                  <ProFormItem
                                      style={{ marginBottom: '5px' }}
                                      label="Məbləğ"
                                      customStyle={styles.formItem}
                                      help={
                                          getFieldError(
                                              `amounts_ul[${index}].amount`
                                          )?.[0]
                                      }
                                  >
                                      {getFieldDecorator(
                                          `amounts_ul[${index}].amount`,
                                          {
                                              getValueFromEvent: event =>
                                                  handlePaymentAmount(
                                                      event,
                                                      index
                                                  ),
                                              rules: [
                                                  requiredRule,
                                                  {
                                                      type: 'number',
                                                      min: 0.1,
                                                      message:
                                                          'Ödəniş məbləği 0 ola bilməz.',
                                                      transform: value =>
                                                          Number(value),
                                                  },
                                                  // id &&
                                                  // {
                                                  //     type: 'number',
                                                  //     min: Number(amountData[index]?.amount),
                                                  //     message: 'Məbləğ ' + getEditingCurrencyRule(index) + ' dəyərindən az ola bilməz',
                                                  //     transform: value => Number(value),
                                                  // }
                                              ],
                                          }
                                      )(<ProInput />)}
                                  </ProFormItem>
                              </Col>
                              <Col style={{ padding: '2px' }} span={9}>
                                  <ProFormItem
                                      style={{ marginBottom: '5px' }}
                                      label="Valyuta"
                                      customStyle={styles.formItem}
                                      help={
                                          getFieldError(
                                              `amounts_ul[${index}].currency`
                                          )?.[0]
                                      }
                                  >
                                      {getFieldDecorator(
                                          `amounts_ul[${index}].currency`,
                                          {
                                              getValueFromEvent: value => value,
                                              rules: [requiredRule],
                                          }
                                      )(
                                          <ProSelect
                                              keys={['code']}
                                              disabled={
                                                  id &&
                                                  Object.keys(
                                                      Object.values(
                                                          cashboxBalanceReport[0]
                                                      ).find(
                                                          cashboxBalance =>
                                                              cashboxBalance.id ===
                                                              id
                                                      )?.balances || {}
                                                  )?.includes(
                                                      getFieldValue(
                                                          `amounts_ul[${index}].currency`
                                                      )?.toString()
                                                  )
                                              }
                                              data={
                                                  getFieldValue('amounts_ul')
                                                      .length > 0
                                                      ? getFieldValue(
                                                            `amounts_ul[${index}].currency`
                                                        ) &&
                                                        currencies.filter(
                                                            ({ id }) =>
                                                                id ===
                                                                getFieldValue(
                                                                    `amounts_ul[${index}].currency`
                                                                )
                                                        ).length > 0
                                                          ? [
                                                                {
                                                                    id: getFieldValue(
                                                                        `amounts_ul[${index}].currency`
                                                                    ),
                                                                    code: currencies.find(
                                                                        ({
                                                                            id,
                                                                        }) =>
                                                                            id ===
                                                                            getFieldValue(
                                                                                `amounts_ul[${index}].currency`
                                                                            )
                                                                    )?.code,
                                                                },
                                                                ...currencies?.filter(
                                                                    ({ id }) =>
                                                                        !getFieldValue(
                                                                            'amounts_ul'
                                                                        )
                                                                            ?.map(
                                                                                ({
                                                                                    currency,
                                                                                }) =>
                                                                                    currency
                                                                            )
                                                                            .includes(
                                                                                id
                                                                            )
                                                                ),
                                                            ]
                                                          : currencies?.filter(
                                                                ({ id }) =>
                                                                    !getFieldValue(
                                                                        'amounts_ul'
                                                                    )
                                                                        ?.map(
                                                                            ({
                                                                                currency,
                                                                            }) =>
                                                                                currency
                                                                        )
                                                                        .includes(
                                                                            id
                                                                        )
                                                            )
                                                      : currencies
                                              }
                                              loading={currenciesLoading}
                                              allowClear={false}
                                          />
                                      )}
                                  </ProFormItem>
                              </Col>
                              <Col span={2}>
                                  <ProFormItem label=" ">
                                      <div
                                          style={{
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              marginTop: '10px',
                                          }}
                                      >
                                          {index === 0 ? (
                                              <PlusIcon
                                                  color="#FF716A"
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() =>
                                                      handleAddExpenseClick(
                                                          'add',
                                                          index
                                                      )
                                                  }
                                              />
                                          ) : (
                                              <Button type="link">
                                                  <MinusIcon
                                                      color="#FF716A"
                                                      style={{
                                                          cursor: 'pointer',
                                                          position: 'relative',
                                                          top: '-5px',
                                                      }}
                                                      onClick={async v => {
                                                          handleAddExpenseClick(
                                                              'remove',
                                                              index
                                                          );
                                                      }}
                                                  />
                                              </Button>
                                          )}
                                      </div>
                                  </ProFormItem>
                              </Col>
                          </Row>
                      ))
                    : amountsUlRow.map((amounts_ul, index) => (
                          <Row>
                              <Col style={{ padding: '2px' }} span={13}>
                                  <ProFormItem
                                      style={{ marginBottom: '5px' }}
                                      label="Məbləğ"
                                      customStyle={styles.formItem}
                                      help={
                                          getFieldError(
                                              `amounts_ul[${index}].amount`
                                          )?.[0]
                                      }
                                  >
                                      {getFieldDecorator(
                                          `amounts_ul[${index}].amount`,
                                          {
                                              getValueFromEvent: event =>
                                                  handlePaymentAmount(
                                                      event,
                                                      index
                                                  ),
                                              rules: [
                                                  requiredRule,
                                                  {
                                                      type: 'number',
                                                      min: 0.1,
                                                      message:
                                                          'Ödəniş məbləği 0 ola bilməz.',
                                                      transform: value =>
                                                          Number(value),
                                                  },
                                                  // id &&
                                                  // {
                                                  //     type: 'number',
                                                  //     min: Number(amountData[index]?.amount),
                                                  //     message: 'Məbləğ ' + getEditingCurrencyRule(index) + ' dəyərindən az ola bilməz',
                                                  //     transform: value => Number(value),
                                                  // }
                                              ],
                                          }
                                      )(<ProInput />)}
                                  </ProFormItem>
                              </Col>
                              <Col style={{ padding: '2px' }} span={9}>
                                  <ProFormItem
                                      style={{ marginBottom: '5px' }}
                                      label="Valyuta"
                                      customStyle={styles.formItem}
                                      help={
                                          getFieldError(
                                              `amounts_ul[${index}].currency`
                                          )?.[0]
                                      }
                                  >
                                      {getFieldDecorator(
                                          `amounts_ul[${index}].currency`,
                                          {
                                              getValueFromEvent: value => value,
                                              rules: [requiredRule],
                                          }
                                      )(
                                          <ProSelect
                                              keys={['code']}
                                              disabled={id}
                                              data={
                                                  getFieldValue('amounts_ul')
                                                      .length > 0
                                                      ? getFieldValue(
                                                            `amounts_ul[${index}].currency`
                                                        ) &&
                                                        currencies.filter(
                                                            ({ id }) =>
                                                                id ===
                                                                getFieldValue(
                                                                    `amounts_ul[${index}].currency`
                                                                )
                                                        ).length > 0
                                                          ? [
                                                                {
                                                                    id: getFieldValue(
                                                                        `amounts_ul[${index}].currency`
                                                                    ),
                                                                    code: currencies.find(
                                                                        ({
                                                                            id,
                                                                        }) =>
                                                                            id ===
                                                                            getFieldValue(
                                                                                `amounts_ul[${index}].currency`
                                                                            )
                                                                    )?.code,
                                                                },
                                                                ...currencies?.filter(
                                                                    ({ id }) =>
                                                                        !getFieldValue(
                                                                            'amounts_ul'
                                                                        )
                                                                            ?.map(
                                                                                ({
                                                                                    currency,
                                                                                }) =>
                                                                                    currency
                                                                            )
                                                                            .includes(
                                                                                id
                                                                            )
                                                                ),
                                                            ]
                                                          : currencies?.filter(
                                                                ({ id }) =>
                                                                    !getFieldValue(
                                                                        'amounts_ul'
                                                                    )
                                                                        ?.map(
                                                                            ({
                                                                                currency,
                                                                            }) =>
                                                                                currency
                                                                        )
                                                                        .includes(
                                                                            id
                                                                        )
                                                            )
                                                      : currencies
                                              }
                                              loading={currenciesLoading}
                                              allowClear={false}
                                          />
                                      )}
                                  </ProFormItem>
                              </Col>
                              <Col span={2}>
                                  <ProFormItem label=" ">
                                      <div
                                          style={{
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              marginTop: '10px',
                                          }}
                                      >
                                          {index === 0 ? (
                                              <PlusIcon
                                                  color="#FF716A"
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() =>
                                                      handleAddExpenseClick(
                                                          'add',
                                                          index
                                                      )
                                                  }
                                              />
                                          ) : (
                                              <Button type="link">
                                                  <MinusIcon
                                                      color="#FF716A"
                                                      style={{
                                                          cursor: 'pointer',
                                                          position: 'relative',
                                                          top: '-5px',
                                                      }}
                                                      onClick={async v => {
                                                          handleAddExpenseClick(
                                                              'remove',
                                                              index
                                                          );
                                                      }}
                                                  />
                                              </Button>
                                          )}
                                      </div>
                                  </ProFormItem>
                              </Col>
                          </Row>
                      ))}

                <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    className={styles.buttonsBox}
                >
                    Təstiq et
                </Button>
            </Form>
        </>
    );
});

const AddInitialRemainsCashbox = Form.create({ name: 'CashboxForm' })(
    CashboxForm
);

const mapStateToProps = state => ({
    cashBoxNames: state.kassaReducer.cashBoxNames,
    currencies: state.currenciesReducer.currencies,
    businessUnits: state.businessUnitReducer.businessUnits,
    currenciesLoading: state.loadings.fetchCurrencies,
    isLoading: state.kassaReducer.isLoading,
    cashboxBalanceReport: state.financeReportsReducer.cashboxInitialBalance,
});

export default connect(
    mapStateToProps,
    {
        fetchCashboxBalanceReport,
        createCashboxBalance,
        fetchCashboxNames,
        fetchCurrencies,
    },
    null,
    { forwardRef: true }
)(AddInitialRemainsCashbox);
