/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import useForm from 'react-hook-form';
import moment from 'moment';

// utils and hooks
import {
  accountTypeOptions,
  formItemSize,
  toastHelper,
  today,
  dateFormat,
  isValidNumber,
} from 'utils';

// components
import { Row, Col, Input, Button, Spin, Icon, Checkbox, Tooltip } from 'antd';
import {
  ProSelect,
  ProContent,
  ProFormItem,
  ProWrapper,
  ProDatePicker,
} from 'components/Lib';

// actions
import { fetchEmployees } from 'store/actions/employees';
import {
  fetchCashboxNames,
  fetchCashboxBalance,
  fetchActiveCurrencies,
} from 'store/actions/settings/kassa';
import { fetchWorkers } from 'store/actions/hrm/workers';

import {
  fetchSalaryPaymentTransactionInfo,
  createSalaryPaymentTransaction,
  editSalaryPaymentTransaction,
  fetchWorkerCurrentBalance,
} from 'store/actions/finance/operations';

import styles from './salary.module.scss';

// ƏH = 6
const returnUrl = `/finance/operations?tab=6`;

/**
 * Salary Payment Transaction   - 'Emekhaqqi/ƏH odenisi'
 */
function SalaryPayment(props) {
  const {
    employees,
    activeCurrencies,
    balance,
    cashBoxNames,
    profile,
    salaryPaymentTransactionInfo,
    workers,
    workersLoading,

    currentBalance,
    currentBalanceLoading,

    // loadings
    employeesLoading,
    isBalanceLoading,
    cashBoxNamesLoading,
    actionLoading,

    // actions
    fetchCashboxBalance,
    fetchCashboxNames,
    fetchActiveCurrencies,
    fetchEmployees,
    fetchSalaryPaymentTransactionInfo,
    fetchWorkers,

    createSalaryPaymentTransaction,
    editSalaryPaymentTransaction,
    fetchWorkerCurrentBalance,
  } = props;

  const { id: transactionId = '' } = useParams();
  const history = useHistory();

  const [isDisabledAccount, setIsDisabledAccount] = useState(true);
  const [balanceValue, setBalanceValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(!!transactionId);
  const [isAvansChecked, setIsAvansChecked] = useState(false);

  function toggleAvansCheckbox() {
    setIsAvansChecked(!isAvansChecked);
  }

  // refs for scrolling to the top when inputs not valid
  const formSection = useRef(null);

  const {
    register,
    errors,
    triggerValidation,
    setValue,
    getValues,
  } = useForm();

  const {
    operationDate,
    operator,
    description = '',

    accountType,
    cashbox,

    employee,
    amount,
    currency,
  } = getValues();

  useEffect(() => {
    if (activeCurrencies.length === 0) {
      fetchActiveCurrencies('cashbox');
    }

    if (employees.length === 0) {
      fetchEmployees();
    }

    if (workers.length === 0) {
      fetchWorkers();
    }

    if (transactionId) {
      // callback onFailure
      fetchSalaryPaymentTransactionInfo(transactionId, () => {
        setIsSpinning(false);
      });
    }
  }, []);

  // set default operator to account user
  useEffect(() => {
    if (profile && profile.id && employees.length > 0)
      setValue('operator', profile.id);
  }, [profile, employees]);

  // IN EDIT
  useEffect(() => {
    if (transactionId && salaryPaymentTransactionInfo.cashboxType) {
      const {
        createdAt, // operation date
        createdById, // operator id
        description,

        cashboxType,
        cashboxName, // cashbox id
        cashboxNameText,

        isAdvance,
        employee,
        amount,
        currencyId,
      } = salaryPaymentTransactionInfo;

      Promise.all([
        fetchCashboxNames({ attribute: cashboxType }, () => {
          setValue('cashbox', cashboxName);
        }),
        fetchCashboxBalance({ attribute: cashboxName }),
      ])
        .then(() => {
          // set initial state of form inputs
          setValue(
            'operationDate',
            moment(createdAt, dateFormat).format(dateFormat)
          );
          setValue('description', description);
          setValue('operator', createdById);

          setValue('accountType', cashboxType);
          setValue('cashbox', cashboxNameText);
          setIsAvansChecked(isAdvance);

          setValue('employee', employee);
          setValue('amount', (+amount).toFixed(2));
          setValue('currency', currencyId);
        })
        .catch(() => {
          setIsSpinning(false);
        });
    }
  }, [salaryPaymentTransactionInfo]);

  useEffect(() => {
    if (
      salaryPaymentTransactionInfo &&
      Object.keys(salaryPaymentTransactionInfo).length > 0 &&
      Object.keys(cashBoxNames).length > 0 &&
      balance &&
      balance.length > 0
    ) {
      setIsSpinning(false);
    }
  }, [salaryPaymentTransactionInfo, cashBoxNames, balance]);

  useEffect(() => {
    if (accountType && cashBoxNames[accountType].length !== 0) {
      setIsDisabledAccount(false);
    }
  }, [cashBoxNames]);

  // reset balance and cashbox
  useEffect(() => {
    setBalanceValue('');
    setValue('cashbox', undefined);
  }, [accountType]);

  // get all Balances of CashBox by comma after balance loaded
  useEffect(() => {
    if (!isBalanceLoading && accountType) {
      const allBalancesByComma = balance
        .map(
          account =>
            `${(+account.balance).toFixed(2)} ${account.currencyCode || ''}`
        )
        .join(', ');

      setBalanceValue(allBalancesByComma);
    }
  }, [isBalanceLoading]);

  // register inputs
  useLayoutEffect(() => {
    register({ name: 'operationDate' }, { required: 'error' });
    register({ name: 'operator' }, { required: 'error' });
    register({ name: 'description' });

    register({ name: 'accountType' }, { required: 'error' });
    register({ name: 'cashbox' }, { required: 'error' });

    register({ name: 'employee' }, { required: 'error' });
    register({ name: 'amount' }, { required: 'error' });
    register({ name: 'currency' }, { required: 'error' });

    // set datepicker value today
    setValue('operationDate', today);
    setValue('description', '');

    return () => {
      setValue('accountType', null);
    };
  }, []);

  // change handler for description and amount inputs
  function onChange(event) {
    let { name, value } = event.target || {};

    if (name === 'description') {
      value = value.substring(0, 250);
    }

    if (name === 'amount') {
      const isValid = isValidNumber(value);

      if (!isValid || /-|\.(\d){3,}$/.test(value)) {
        return;
      }

      return setValue(name, value, true);
    }

    setValue(name, value, true);
  }

  // onchange handle for datepicker
  function onChangeDate(date) {
    if (date.trim()) {
      setValue('operationDate', date);
    } else {
      setValue('operationDate', today);
    }
  }

  // ProSelect change handler
  function onSelect(name, value) {
    if (name === 'accountType') {
      fetchCashboxNames({ attribute: value });
    }
    if (name === 'cashbox') {
      fetchCashboxBalance({ attribute: value });
    }

    setValue(name, value, true);
  }

  // validate form and send add/edit actions
  async function submitSalaryPayment(e) {
    e.preventDefault();

    const isFormValid = await triggerValidation();

    if (isFormValid) {
      // make api data structure
      const data = {
        // operationDate,
        // operator,
        cashboxName: cashbox,
        isAdvance: isAvansChecked,
        employee,
        amount,
        currency,
        description,
      };

      if (transactionId) {
        editSalaryPaymentTransaction(data, transactionId, handleSucces);
      } else {
        createSalaryPaymentTransaction(data, handleSucces);
      }
    } else {
      // if Form is not valid scroll to the top
      formSection.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleSucces() {
    return toastHelper(history, returnUrl);
  }

  function handleCancel() {
    history.replace(returnUrl);
  }

  // set default employee currency
  useEffect(() => {
    if (employee) {
      fetchWorkerCurrentBalance(employee);
    }

    const { tenantCurrencyId } =
      workers.find(item => item.id === employee) || {};

    setValue('currency', tenantCurrencyId);
  }, [employee]);

  return (
    <ProWrapper>
      <section className="operationsWrapper">
        <div className={styles.containerFluid}>
          <Spin spinning={isSpinning}>
            <form onSubmit={submitSalaryPayment} ref={formSection} noValidate>
              {/* Title */}
              <div className={styles.nameCode}>
                {transactionId ? 'Redaktə et' : 'Əmək haqqı ödənişi'}
                <div className={styles.nameAndDate}>
                  <span className={styles.date}>{today}</span>
                  <span className={styles.userName}>{profile.name}</span>
                </div>
              </div>

              {/* 1. Ümümi məlumat */}
              <ProContent title="1. Ümümi məlumat">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* operationDate - default today selected */}
                    <ProFormItem label="Tarix" required>
                      <ProDatePicker
                        value={moment(operationDate, dateFormat)}
                        name="operationDate"
                        onChange={(_, selectedDate) => {
                          onChangeDate(selectedDate);
                        }}
                        disabled={!!operationDate}
                      />
                    </ProFormItem>

                    {/* operator */}
                    <ProFormItem
                      label="Əməliyyatçı"
                      validateStatus={errors.operator || ''}
                      required
                    >
                      <ProSelect
                        data={employees}
                        value={operator}
                        hasError={!!errors.operator}
                        keys={['name', 'lastName']}
                        onChange={value => onSelect('operator', value)}
                        loading={employeesLoading}
                        disabled={employeesLoading || !!operator}
                      />
                    </ProFormItem>
                  </Col>

                  <Col span={12}>
                    {/* Qeyd */}
                    <ProFormItem label="Qeyd" autoHeight>
                      <Input.TextArea
                        rows={6}
                        name="description"
                        value={description}
                        onChange={onChange}
                      ></Input.TextArea>
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              {/*  2. Hesab  */}
              <ProContent title="2. Hesab">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* Hesab növü - accountType */}
                    <ProFormItem
                      label="Hesab növü"
                      validateStatus={errors.accountType || ''}
                      required
                    >
                      <ProSelect
                        value={accountType}
                        data={accountTypeOptions}
                        onChange={value => onSelect('accountType', value)}
                        hasError={!!errors.accountType}
                        showFirstOption={false}
                      />
                    </ProFormItem>
                  </Col>

                  <Col span={8}>
                    {/* Göndərən hesab/account/kassa */}
                    <ProFormItem
                      label="Hesab"
                      validateStatus={errors.cashbox || ''}
                      required
                    >
                      <Tooltip
                        placement="topRight"
                        title={isDisabledAccount ? 'Öncə hesab növü seçin' : ''}
                        getPopupContainer={parent => parent.parentNode}
                      >
                        <ProSelect
                          value={cashbox}
                          loading={cashBoxNamesLoading}
                          disabled={isDisabledAccount || cashBoxNamesLoading}
                          data={cashBoxNames[accountType]}
                          onChange={value => onSelect('cashbox', value)}
                          hasError={!!errors.cashbox}
                          showFirstOption={false}
                          notUseMemo
                        />
                      </Tooltip>
                    </ProFormItem>

                    {/* remain balance amount in account/cashbox/kassa */}
                    <div className={styles.balance}>
                      <span>
                        Hesabda qalıq:{' '}
                        {isBalanceLoading ? (
                          <Icon type="sync" spin />
                        ) : (
                          balanceValue || 0
                        )}
                      </span>
                    </div>
                  </Col>

                  <Col span={24}>
                    {/* Avans/Advance */}
                    <ProFormItem>
                      <Checkbox
                        checked={isAvansChecked}
                        onChange={toggleAvansCheckbox}
                      >
                        Avans
                      </Checkbox>
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              {/* 3. Ödəniş məlumatı */}
              <ProContent title="3. Ödəniş məlumatı">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* employee  */}
                    <ProFormItem
                      label="Əməkdaş"
                      validateStatus={errors.employee || ''}
                      required
                    >
                      <ProSelect
                        data={workers}
                        value={employee}
                        hasError={!!errors.employee}
                        keys={['name', 'surname']}
                        onChange={value => onSelect('employee', value)}
                        loading={workersLoading}
                        disabled={workersLoading}
                      />
                    </ProFormItem>

                    {/* not implimented yet - HRM waiting */}
                    <div className={styles.balance}>
                      {!isAvansChecked ? (
                        <span>
                          Hesablanmış qalıq məbləğ:{' '}
                          {currentBalanceLoading ? (
                            <Icon type="sync" spin />
                          ) : (
                            currentBalance
                          )}
                        </span>
                      ) : null}
                    </div>
                  </Col>

                  <Col span={8}>
                    {/* amount */}
                    <ProFormItem
                      label="Ödəniləcək Məbləğ"
                      validateStatus={
                        errors.currency || errors.amount ? 'error' : ''
                      }
                      required
                    >
                      <Input
                        type="text"
                        name="amount"
                        size={formItemSize}
                        maxLength={9}
                        placeholder="0.00"
                        value={amount}
                        onChange={onChange}
                        autoComplete="off"
                        addonAfter={
                          // currency
                          <ProSelect
                            style={{ width: 80 }}
                            disabled
                            data={activeCurrencies}
                            keys={['code']}
                            // onChange={value => onSelect('currency', value)}
                            value={currency}
                          />
                        }
                      />
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              {/* action buttons */}
              <div className={styles.salesAddBtns}>
                <Button
                  loading={actionLoading}
                  disabled={false}
                  type="primary"
                  htmlType="submit"
                  size={formItemSize}
                >
                  Yadda saxla
                </Button>
                <Button
                  style={{
                    marginLeft: 10,
                  }}
                  size={formItemSize}
                  onClick={handleCancel}
                >
                  İmtina
                </Button>
              </div>
            </form>
          </Spin>
        </div>
      </section>
    </ProWrapper>
  );
}

const mapStateToProps = state => ({
  employees: state.employeesReducer.employees,
  employeesLoading: state.employeesReducer.isLoading,

  cashBoxNames: state.kassaReducer.cashBoxNames,
  cashBoxNamesLoading: state.kassaReducer.isLoading,

  activeCurrencies: state.kassaReducer.activeCurrencies,

  balance: state.kassaReducer.cashBoxBalance,
  isBalanceLoading: state.kassaReducer.isBalanceLoading,

  profile: state.profileReducer.profile,
  salaryPaymentTransactionInfo:
    state.financeOperationsReducer.salaryPaymentTransactionInfo,

  actionLoading: state.financeOperationsReducer.actionLoading,
  currentBalance: state.financeOperationsReducer.currentBalance,
  currentBalanceLoading: !!state.loadings.fetchWorkerCurrentBalance,

  workers: state.workersReducer.workers,
  workersLoading: state.workersReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchCashboxNames,
    fetchCashboxBalance,
    fetchActiveCurrencies,
    fetchEmployees,
    fetchSalaryPaymentTransactionInfo,

    createSalaryPaymentTransaction,
    editSalaryPaymentTransaction,
    fetchWorkerCurrentBalance,

    fetchWorkers,
  }
)(SalaryPayment);
