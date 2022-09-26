/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// ant components
import { Row, Col, Input, Spin } from 'antd';

// custom components
import {
  ProContent,
  ProFormItem,
  ProSelect,
  ProFormAction,
  ProWrapper,
} from 'components/Lib';

// actions
import {
  fetchCashboxNames,
  fetchActiveCurrencies,
  fetchCashboxBalance,
} from 'store/actions/settings/kassa';
import {
  createMoneyTransfer,
  getTransaction,
  editMoneyTransfer,
} from 'store/actions/finance/operations';

import {
  isFormValid,
  isValidNumber,
  accountTypeOptions,
  formItemSize,
  today,
  operationNames,
  createReducer,
  toastHelper,
} from 'utils';

import styles from './styles.module.scss';

// initial reducer state
const initialState = {
  errors: {
    sameAccount: '',
  },
  values: {
    senderAccountType: null,
    senderAccount: null,
    receiverAccountType: null,
    receiverAccount: null,
    currency: null,
    amount: null,
    note: null,
  },
  senderAccountBalance: '',
  receiverAccountBalance: '',
};

// use Reducer
const reducer = createReducer(initialState, {
  mainFormFieldChange: (state, action) => {
    const { name, value } = action;

    if (name === 'amount') {
      if (
        value.length >= 9 ||
        !isValidNumber(value) ||
        /-|\.(\d){3,}$/.test(value)
      ) {
        return state;
      }
    }

    if (name === 'note' && value.length > 255) {
      return state;
    }

    return {
      ...state,
      values: {
        ...state.values,
        [name]: value,
      },
      errors: {
        ...state.errors,
        [name]: '',
      },
    };
  },
  setTransactionData: (state, action) => {
    const { transaction } = action;

    return {
      ...state,
      values: {
        ...state.values,
        senderAccountType: transaction.fromCashboxTypeId,
        senderAccount: transaction.fromCashboxId,
        receiverAccountType: transaction.toCashboxTypeId,
        receiverAccount: transaction.toCashboxId,
        currency: transaction.currencyId,
        amount: (+transaction.amount).toFixed(2),
        note: transaction.description,
      },
    };
  },

  accountChange: (state, action) => ({
    ...state,
    values: {
      ...state.values,
      [action.name]: action.value,
    },
    errors: {
      ...state.errors,
      sameAccount: action.error,
      [action.name]: '',
    },
  }),

  validate: (state, action) => ({
    ...state,
    errors: { ...state.errors, ...action.errors },
  }),

  setBalance: (state, action) => ({
    ...state,
    [action.cashboxType]:
      action.balance.length > 0
        ? action.balance.reduce(
            (acc, item) =>
              `${acc}${acc ? ', ' : ''}${(+item.balance).toFixed(2)} ${
                item.currencyCode
              }`,
            ''
          )
        : 0,
  }),
});

function MoneyTransfer(props) {
  const {
    history,
    match,
    cashBoxNames,
    fetchCashboxNames,
    isLoading,
    isBalanceLoading,
    cashBoxBalance,
    selectedCashBoxForBalance,
    fetchCashboxBalance,
    cashboxLoading,
    activeCurrencies,
    fetchActiveCurrencies,
    createMoneyTransfer,
    editMoneyTransfer,
    transaction,
    getTransaction,
    actionLoading,
  } = props;

  const edited_id = +match.params.id;
  const is_edit = typeof edited_id === 'number' && edited_id > 0;

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    values,
    errors,
    senderAccountBalance,
    receiverAccountBalance,
  } = state;

  const {
    senderAccountType,
    senderAccount,
    receiverAccountType,
    receiverAccount,
    currency,
    amount,
    note,
  } = values;

  // balance handle
  useEffect(() => {
    if (senderAccount) {
      fetchCashboxBalance({ attribute: senderAccount });
    }
  }, [senderAccount]);

  useEffect(() => {
    if (receiverAccount) {
      fetchCashboxBalance({ attribute: receiverAccount });
    }
  }, [receiverAccount]);

  useEffect(() => {
    if (cashBoxBalance) {
      dispatch({
        type: 'setBalance',
        cashboxType:
          selectedCashBoxForBalance === senderAccount
            ? 'senderAccountBalance'
            : selectedCashBoxForBalance === receiverAccount
            ? 'receiverAccountBalance'
            : '',
        balance: cashBoxBalance,
      });
    }
  }, [senderAccount, receiverAccount, selectedCashBoxForBalance]);

  function mainFormFieldChange(name, value) {
    dispatch({ type: 'mainFormFieldChange', name, value });
  }

  function accountChange(name, value, error) {
    dispatch({ type: 'accountChange', name, value, error });
  }

  // sender accounts
  useEffect(() => {
    if (
      cashBoxNames[senderAccountType] &&
      cashBoxNames[senderAccountType].length < 1
    ) {
      fetchCashboxNames({ attribute: senderAccountType });
    }
  }, [senderAccountType]);

  // receiver accounts
  useEffect(() => {
    if (
      cashBoxNames[receiverAccountType] &&
      cashBoxNames[receiverAccountType].length < 1
    ) {
      fetchCashboxNames({ attribute: receiverAccountType });
    }
  }, [receiverAccountType]);

  // fetch all active currencies
  useEffect(() => {
    if (is_edit) {
      getTransaction(edited_id);
    }
    if (!activeCurrencies.length) {
      fetchActiveCurrencies();
    }
  }, []);

  useEffect(() => {
    if (transaction) {
      dispatch({ type: 'setTransactionData', transaction });
    }
  }, [transaction]);

  const handleAccountSelect = (e, type = 'sender') => {
    if (e) {
      if (type === 'sender') {
        if (e === receiverAccount) {
          accountChange(
            'senderAccount',
            e,
            'Göndərən hesab və qəbul edən hesab eyni ola bilməz'
          );
        } else {
          accountChange('senderAccount', e, '');
        }
      } else if (e === senderAccount) {
        accountChange(
          'receiverAccount',
          e,
          'Göndərən hesab və qəbul edən hesab eyni ola bilməz'
        );
      } else {
        accountChange('receiverAccount', e, '');
      }
    }
  };

  // form submit and redirect to back
  // useEffect(() => {
  //   if (added) {
  //     toast.success('Pul transfer uğurla əlavə edildi', {
  //       className: 'success-toast',
  //       onOpen: history.goBack,
  //     });
  //   }
  //   if (edited) {
  //     toast.success('Pul transfer uğurla redaktə olundu', {
  //       className: 'success-toast',
  //       onOpen: history.goBack,
  //     });
  //   }
  // }, [added, edited]);

  const handleFormSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isFormValid(
        {
          currency,
          amount: Number(amount),
          senderAccountType,
          senderAccount,
          receiverAccountType,
          receiverAccount,
        },
        [
          { name: 'currency', required: true },
          { name: 'amount', required: true },
          { name: 'senderAccountType', required: true },
          { name: 'senderAccount', required: true },
          { name: 'receiverAccountType', required: true },
          { name: 'receiverAccount', required: true },
        ],
        errors => dispatch({ type: 'validate', errors })
      )
    ) {
      if (is_edit) {
        editMoneyTransfer(
          {
            description: note,
            currency,
            amount,
            cashBoxTypeFrom: senderAccountType,
            cashBoxNameFrom: senderAccount,
            cashBoxTypeTo: receiverAccountType,
            cashBoxNameTo: receiverAccount,
          },
          operationNames.MONEY_TRANSFER,
          edited_id,
          () => toastHelper(history, '/finance/operations?tab=4')
        );
      } else {
        createMoneyTransfer(
          {
            description: note,
            currency,
            amount,
            cashBoxTypeFrom: senderAccountType,
            cashBoxNameFrom: senderAccount,
            cashBoxTypeTo: receiverAccountType,
            cashBoxNameTo: receiverAccount,
          },
          operationNames.MONEY_TRANSFER,
          () => toastHelper(history, '/finance/operations?tab=4')
        );
      }
    }
  };

  return (
    <ProWrapper>
      <section className="operationsWrapper">
        <Spin size="large" spinning={isLoading || (is_edit && cashboxLoading)}>
          <div className={`${styles.containerFluid} container`}>
            <div className={styles.nameCode}>
              Pullar yerdəyişməsi - {is_edit ? '#Redaktə' : '#Yeni'}
              <div className={styles.nameAndDate}>
                <span className={styles.date}>{today}</span>
                {/* TODO */}
                {/* <span className={styles.userName}>Eshgin</span> */}
              </div>
            </div>

            <Row>
              <ProContent title="1. Göndərən hesab">
                <Col span={24}>
                  <Row gutter={32}>
                    {/* Sender - account type */}
                    <Col span={12}>
                      <div className={styles.inputs}>
                        <ProFormItem
                          label="Hesab növü"
                          validateStatus={errors.senderAccountType}
                          required
                        >
                          <ProSelect
                            data={accountTypeOptions}
                            size="large"
                            hasError={false}
                            showFirstOption={false}
                            onChange={e =>
                              mainFormFieldChange('senderAccountType', e)
                            }
                            value={senderAccountType}
                          />
                        </ProFormItem>
                      </div>
                    </Col>

                    {/* Sender  - account */}
                    <Col span={12}>
                      <div className={styles.inputs}>
                        <ProFormItem
                          label="Hesab"
                          validateStatus={
                            errors.senderAccount || errors.sameAccount
                              ? 'error'
                              : ''
                          }
                          help={
                            errors.sameAccount ? errors.sameAccount : undefined
                          }
                          required
                        >
                          <ProSelect
                            data={cashBoxNames[senderAccountType]}
                            size="large"
                            loading={cashboxLoading || isBalanceLoading}
                            hasError={false}
                            showFirstOption={false}
                            onChange={e => handleAccountSelect(e)}
                            value={senderAccount}
                          />
                        </ProFormItem>
                        {senderAccountBalance !== '' && !errors.sameAccount && (
                          <div className={styles.balance}>
                            {`Hesabda qalıq: ${senderAccountBalance}`}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Col>
              </ProContent>
              <ProContent title="2. Qəbul edən hesab">
                <Col span={24}>
                  <Row gutter={32}>
                    {/*   Receive - account type */}
                    <Col span={12}>
                      <div className={styles.inputs}>
                        <ProFormItem
                          label="Hesab növü"
                          validateStatus={errors.receiverAccountType}
                          required
                        >
                          <ProSelect
                            data={accountTypeOptions}
                            size="large"
                            hasError={false}
                            showFirstOption={false}
                            onChange={e =>
                              mainFormFieldChange('receiverAccountType', e)
                            }
                            value={receiverAccountType}
                          />
                        </ProFormItem>
                      </div>
                    </Col>

                    {/*  Receive - account */}
                    <Col span={12}>
                      <div className={styles.inputs}>
                        <ProFormItem
                          label="Hesab"
                          validateStatus={
                            errors.receiverAccount || errors.sameAccount
                              ? 'error'
                              : ''
                          }
                          help={
                            errors.sameAccount ? errors.sameAccount : undefined
                          }
                          required
                        >
                          <ProSelect
                            data={cashBoxNames[receiverAccountType]}
                            size="large"
                            loading={cashboxLoading || isBalanceLoading}
                            hasError={false}
                            onChange={e => handleAccountSelect(e, 'receiver')}
                            value={receiverAccount}
                          />
                        </ProFormItem>
                        {receiverAccountBalance && !errors.sameAccount && (
                          <div className={styles.balance}>
                            {`Hesabda qalıq: ${receiverAccountBalance}`}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Col>
              </ProContent>
              <ProContent title="3. Məbləğ">
                <Col span={24}>
                  <Row gutter={32}>
                    <Col span={12}>
                      {/* Money - amount */}
                      <div className={styles.inputs}>
                        <ProFormItem
                          label="Yerdəyişmə üçün məbləğ"
                          validateStatus={errors.currency || errors.amount}
                          required
                          help={
                            errors.amount
                              ? 'məbləğ daxil edin'
                              : errors.currency
                              ? 'Valyutanı seçin'
                              : ''
                          }
                        >
                          <Input
                            // type="number"
                            size={formItemSize}
                            placeholder="0.00"
                            value={amount}
                            onChange={e => {
                              mainFormFieldChange('amount', e.target.value);
                            }}
                            addonAfter={
                              <ProSelect
                                style={{ width: 80 }}
                                data={activeCurrencies}
                                keys={['code']}
                                onChange={e =>
                                  mainFormFieldChange('currency', e)
                                }
                                value={currency}
                              />
                            }
                          />
                        </ProFormItem>
                      </div>
                    </Col>

                    {/* Money  - note */}
                    <Col span={12}>
                      <ProFormItem label="Qeyd">
                        <Input
                          size={formItemSize}
                          placeholder="Qeyd:"
                          value={note}
                          onChange={e =>
                            mainFormFieldChange('note', e.target.value)
                          }
                        />
                      </ProFormItem>
                    </Col>
                  </Row>
                </Col>
              </ProContent>
            </Row>

            {/* form action element */}
            <ProFormAction
              actionLoading={actionLoading}
              handleFormClick={e => handleFormSubmit(e)}
              returnUrl="/finance/operations?tab=4"
            />
          </div>
        </Spin>
      </section>
    </ProWrapper>
  );
}

const mapStateToProps = state => ({
  cashBoxNames: state.kassaReducer.cashBoxNames,
  cashboxLoading: state.kassaReducer.isLoading,
  isBalanceLoading: state.kassaReducer.isBalanceLoading,
  cashBoxBalance: state.kassaReducer.cashBoxBalance,
  selectedCashBoxForBalance: state.kassaReducer.selectedCashBoxForBalance,
  activeCurrencies: state.kassaReducer.activeCurrencies,
  transaction: state.financeOperationsReducer.transaction,
  actionLoading: state.financeOperationsReducer.actionLoading,
  isLoading: state.financeOperationsReducer.isLoading,
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      fetchActiveCurrencies,
      fetchCashboxNames,
      createMoneyTransfer,
      getTransaction,
      editMoneyTransfer,
      fetchCashboxBalance,
    }
  )(MoneyTransfer)
);
