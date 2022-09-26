/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';

// utils and hooks
import { useParams, useHistory } from 'react-router-dom';
import useForm from 'react-hook-form';
import { calculateAndConvert } from 'hooks/useCurrencyCalculate';
import { operationNames, accountTypeOptions, toastHelper, today } from 'utils';

// actions
import { fetchContacts } from 'store/actions/relations';
import {
  fetchCashboxNames,
  fetchActiveCurrencies,
  fetchCashboxBalance,
  setCashBoxBalance,
} from 'store/actions/settings/kassa';
import {
  editCashboxInvoiceTransaction,
  fetchCashboxInvoiceTransactionInfo,
  createCashboxInvoiceTransaction,
  setCashboxInvoiceTransactionInfo,
  fetchContactInfo,
} from 'store/actions/finance/operations';

// components
import {
  Row,
  Col,
  Input,
  Button,
  InputNumber,
  Checkbox,
  Spin,
  Icon,
} from 'antd';
import { ProSelect, ProWrapper, ProFormItem, ProContent } from 'components/Lib';

import ComeInTable from './ComeInTable';

import styles from './styles.module.scss';

// aniamtion variants
const variants = {
  open: { opacity: 1, height: 'auto' },
  closed: { opacity: 0, height: 0 },
};

const compTitles = {
  1: 'Yeni məxaric',
  2: 'Yeni mədaxil',
};

const { INCOME, EXPENSE } = operationNames;
const required = { required: 'Bu dəyər boş olmamalıdır.' };

function joinByComma(items, key) {
  return items
    .map(
      value =>
        `${Number(value[key]).toFixed(2)} ${value.currencyCode ||
          value.currency_code}`
    )
    .join(', ');
}

/**
 * Main Container Cashbox
 */
function Cashbox(props) {
  const {
    // componentType comein or comeout
    compType,
    // actions
    fetchCashboxBalance,
    fetchContacts,
    fetchContactInfo,
    fetchCashboxNames,
    fetchActiveCurrencies,

    createCashboxInvoiceTransaction,
    editCashboxInvoiceTransaction,
    fetchCashboxInvoiceTransactionInfo,
    setCashBoxBalance,
    setCashboxInvoiceTransactionInfo,

    // state
    activeCurrencies,
    balance,
    cashBoxNames,
    cashboxInvoiceTransactionInfo = {},
    contactInfo,
    contacts,

    // loadings
    actionLoading,
    cashBoxNamesIsLoading,
    contactInfoIsLoading,
    cashBoxBalanceIsLoading,
  } = props;

  const history = useHistory();
  const { id: transactionId = '' } = useParams();

  const isEditMode = transactionId;
  const tabIndex = compType === 2 ? INCOME : EXPENSE;

  const [isChecked, setIsChecked] = useState(false);
  const [isDisabledAccount, setIsDisabledAccount] = useState(true);
  const [balanceValue, setBalanceValue] = useState('-');
  const [advanceValue, setAdvanceValue] = useState('0.00');
  const [invoicePayableAmounts, setInvoicePayableAmounts] = useState({
    amounts: [],
    advance: 0,
  });
  const [isSpinning, setIsSpinning] = useState(isEditMode);

  const scrollTop = useRef(null);
  const invoices_ul = useRef([]);

  const {
    register,
    errors,
    handleSubmit,
    setValue,
    clearError,
    watch,
  } = useForm();

  const { accountType, amount = 0, currency, cashbox, contact, description } =
    watch([
      'accountType',
      'amount',
      'currency',
      'cashbox',
      'contact',
      'description',
    ]) || {}; // target specific fields by their names

  const selectedCurrency =
    (activeCurrencies &&
      activeCurrencies.find(value => value.id === currency)) ||
    {};

  // fetch initial needed datas
  useEffect(() => {
    if (contacts.length === 0) {
      fetchContacts();
    }

    if (activeCurrencies.length === 0) {
      fetchActiveCurrencies();
    }

    if (isEditMode) {
      fetchCashboxInvoiceTransactionInfo(transactionId, onInvoiceInfoFetched);
    }
  }, []);

  // in edit set Initial values after info data fetched
  function onInvoiceInfoFetched(data) {
    const {
      cashboxTypeId,
      cashboxId,
      payerId,
      amount,
      currencyId,
      description,
    } = data || {};

    if (cashboxTypeId) {
      setValue('accountType', cashboxTypeId);

      Promise.all([
        fetchCashboxNames({ attribute: cashboxTypeId }, () => {
          setValue('cashbox', cashboxId);
        }),
        fetchCashboxBalance({ attribute: cashboxId }),
        fetchContactInfo(payerId, compType, transactionId),
      ]);

      setValue('contact', payerId);
      setValue('currency', currencyId);
      setValue('amount', amount);
      setValue('description', description);
    }
  }

  useEffect(() => {
    const isAllInitialDataLoading =
      cashboxInvoiceTransactionInfo &&
      Object.keys(cashboxInvoiceTransactionInfo).length > 0 &&
      Object.keys(cashBoxNames).length > 0 &&
      balance &&
      balance.length > 0;

    if (isAllInitialDataLoading) {
      setIsSpinning(false);
    }
  }, [amount, cashboxInvoiceTransactionInfo, cashBoxNames, balance]);

  useEffect(() => {
    if (accountType && cashBoxNames[accountType].length !== 0) {
      setIsDisabledAccount(false);
    }
  }, [cashBoxNames]);

  useEffect(() => {
    if (balance) {
      setBalanceValue(joinByComma(balance, 'balance'));
    }
  }, [balance]);

  useEffect(() => {
    if (contactInfo && contactInfo.advance && contactInfo.advance.length > 0) {
      setAdvanceValue(joinByComma(contactInfo.advance, 'advance_amount'));
    }
  }, [contactInfo]);

  // if errors have in form ,scroll to the top
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollTop.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [errors]);

  useEffect(() => {
    if (currency && amount) {
      calculatePayableAmounts(amount);
    }
  }, [currency, amount]);

  useEffect(() => {
    setValue('cashbox', null, false);
    setCashBoxBalance({});
  }, [accountType]);

  useLayoutEffect(() => {
    register({ name: 'accountType' }, required);
    register({ name: 'cashbox' }, required);
    register({ name: 'contact' }, required);
    register({ name: 'amount' }, required);
    register({ name: 'currency' }, required);
    register({ name: 'description' });
  }, []);

  // cleaning before unmount
  useEffect(
    () => () => {
      invoices_ul.current = [];
      setCashBoxBalance({});
    },
    []
  );

  const calculatePayableAmounts = useCallback(
    amount => {
      let remainingAmount = amount;
      if (contactInfo && contactInfo.unpaidInvoices) {
        const calculatedPayableAmounts = contactInfo.unpaidInvoices.map(
          unpaidInvoice => {
            const {
              id,
              remainingInvoiceDebt,
              tenantCurrencyId,
            } = unpaidInvoice;

            if (id) {
              const convertedReminingInvoiceDebt = calculateAndConvert(
                remainingInvoiceDebt,
                selectedCurrency.rate || 1,
                tenantCurrencyId,
                activeCurrencies,
                true
              );
              const isHasUnpaidInvoice = invoices_ul.current.find(
                value => value.id === id
              );

              if (!isHasUnpaidInvoice) return { id };
              if (
                convertedReminingInvoiceDebt <= remainingAmount &&
                remainingAmount > 0
              ) {
                remainingAmount -= convertedReminingInvoiceDebt;
                return { amount: convertedReminingInvoiceDebt, id };
              }
              const copyRemainingAmount = remainingAmount;
              remainingAmount = 0;

              return { amount: copyRemainingAmount, id };
            }
          }
        );
        setInvoicePayableAmounts({
          amounts: calculatedPayableAmounts,
          advance: remainingAmount,
        });
      }
    },
    [amount, currency]
  );

  // Cari borc:
  const allUnpaidInvoices = sumInvoiceDebtsSameCurrencies();

  function onChange(event) {
    let { name, value = '' } = event.target || {};

    if (name === 'description') {
      value = value.substring(0, 250);
    }

    setValue(name, value, true);
  }

  function onChangeCheckBox() {
    setIsChecked(!isChecked);
  }

  function onSelect(name, value) {
    if (name === 'accountType') {
      fetchCashboxNames({ attribute: value });
    }
    if (name === 'cashbox') {
      fetchCashboxBalance({ attribute: value });
    }
    if (name === 'contact') {
      // reset invoices
      setCashboxInvoiceTransactionInfo({
        data: { ...cashboxInvoiceTransactionInfo, invoices: [] },
      });
      fetchContactInfo(value, compType);
    }

    setValue(name, value);
    clearError(name);
  }

  function handleFormSubmit(values) {
    const data = {
      tabIndex,
      data: {
        ...values,
        type: compType,
        accountType: undefined,
        description: values.description || '',
        invoices_ul: invoices_ul.current,
      },
    };

    if (isEditMode) {
      data.transactionId = transactionId;
      return editCashboxInvoiceTransaction(data, successCallback);
    }

    createCashboxInvoiceTransaction(data, successCallback);
  }

  function onChangeInvoices(invoices) {
    invoices_ul.current = invoices.map(value => ({
      ...value,
      disabled: undefined,
    }));
    calculatePayableAmounts(amount);
  }

  function sumInvoiceDebtsSameCurrencies() {
    if (contactInfo && contactInfo.unpaidInvoices) {
      const invoices = {};

      contactInfo.unpaidInvoices.forEach(invoice => {
        const debt = parseFloat(invoice.remainingInvoiceDebt);
        const { currencyCode } = invoice;

        if (invoices[currencyCode]) {
          invoices[currencyCode] += debt;
        } else {
          invoices[currencyCode] = debt;
        }
      });

      const result = Object.keys(invoices)
        .map(key => `${invoices[key]} ${key}`)
        .join(', ');

      return result;
    }
    return '';
  }

  function successCallback() {
    return toastHelper(history, `/finance/operations?tab=${tabIndex}`);
  }

  function handleCancel() {
    history.replace(`/finance/operations?tab=${tabIndex}`);
  }

  function getError(field) {
    return errors[field] ? 'error' : '';
  }

  return (
    <ProWrapper>
      <Spin spinning={isSpinning}>
        <section className="operationsWrapper">
          <div className={styles.containerFluid}>
            <form onSubmit={handleSubmit(handleFormSubmit)} ref={scrollTop}>
              {/* invoice title */}
              <div className={styles.nameCode}>
                {isEditMode ? 'Redaktə et' : compTitles[compType]}
                <div className={styles.nameAndDate}>
                  <span className={styles.date}>{today}</span>
                </div>
              </div>

              {/* 1. Hesab */}
              <ProContent title="1. Hesab">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* Hesab növü - type */}
                    <ProFormItem
                      label="Hesab növü"
                      validateStatus={getError('accountType')}
                      required
                    >
                      <ProSelect
                        value={accountType}
                        data={accountTypeOptions}
                        onChange={value => onSelect('accountType', value)}
                        hasError={errors.accountType}
                        showFirstOption={false}
                      />
                    </ProFormItem>

                    {/* Hesab  - account */}
                    <ProFormItem
                      label="Hesab"
                      validateStatus={getError('cashbox')}
                      required
                    >
                      <ProSelect
                        value={cashbox}
                        loading={
                          cashBoxNamesIsLoading || cashBoxBalanceIsLoading
                        }
                        disabled={isDisabledAccount || cashBoxNamesIsLoading}
                        data={cashBoxNames[accountType]}
                        onChange={value => onSelect('cashbox', value)}
                        hasError={errors.cashbox}
                        showFirstOption={false}
                        notUseMemo
                      />
                    </ProFormItem>

                    <div className={styles.balance}>
                      <span>Hesabda qalıq: </span>
                      <span>
                        {cashBoxBalanceIsLoading ? (
                          <Icon type="loading" />
                        ) : (
                          balanceValue
                        )}
                      </span>
                    </div>

                    {/* Təhcizatçı / Alıcı - supplier */}
                    <ProFormItem
                      label="Təhcizatçı / Alıcı"
                      validateStatus={getError('contact')}
                      required
                    >
                      <ProSelect
                        keys={['name', 'surname']}
                        value={contact}
                        data={contacts}
                        onChange={value => onSelect('contact', value)}
                        hasError={errors.contact}
                        showFirstOption={false}
                        loading={contactInfoIsLoading}
                      />
                    </ProFormItem>

                    <div className={styles.debt}>
                      Cari borc:{' '}
                      <span>
                        {contactInfoIsLoading ? (
                          <Icon type="loading" />
                        ) : (
                          `${allUnpaidInvoices || '-'}`
                        )}
                      </span>
                    </div>
                  </Col>

                  <Col span={12}>
                    {/* Qeyd */}
                    <ProFormItem label="Qeyd" autoHeight>
                      <Input.TextArea
                        rows={6}
                        name="description"
                        value={description}
                        onChange={onChange}
                        className={styles.textarea}
                      ></Input.TextArea>
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              {/* 2. Ödəniş məlumatı */}
              <ProContent title=" 2. Ödəniş məlumatı">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* Ödənilən məbləğ  */}
                    <ProFormItem
                      label="Ödənilən məbləğ"
                      validateStatus={getError('amount')}
                      required
                    >
                      <InputNumber
                        value={amount}
                        size="large"
                        precision={2}
                        maxLength={9}
                        min={0}
                        onChange={value => onSelect('amount', value || 0)}
                        className={`${styles.number} ${
                          errors.amount ? styles.inputOnError : ''
                        }`}
                      />
                    </ProFormItem>

                    <div>
                      <Checkbox
                        className={styles.checkbox}
                        onChange={onChangeCheckBox}
                      >
                        Avans
                      </Checkbox>
                    </div>
                    <div className={styles.balance}>
                      <span>Avans: </span>
                      <span>
                        {contactInfoIsLoading ? (
                          <Icon type="loading" />
                        ) : (
                          advanceValue
                        )}
                      </span>
                    </div>
                  </Col>

                  <Col span={6}>
                    <ProFormItem
                      label=" Valyuta"
                      validateStatus={getError('currency')}
                      required
                    >
                      <ProSelect
                        value={currency}
                        keys={['code']}
                        data={activeCurrencies}
                        onChange={value => onSelect('currency', value)}
                        hasError={errors.currency}
                        showFirstOption={false}
                      />
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              {/* 3. Sənədlər */}
              <motion.div
                animate={!isChecked ? 'open' : 'closed'}
                variants={variants}
                initial="open"
                transition={{ duration: 0.3 }}
                className={styles.motion}
              >
                <ProContent title="3. Sənədlər">
                  <ComeInTable
                    onChange={onChangeInvoices}
                    advance={invoicePayableAmounts.advance}
                    invoicePayableAmounts={invoicePayableAmounts.amounts}
                    currency={selectedCurrency}
                    value={cashboxInvoiceTransactionInfo.invoices}
                    contact={contact}
                  />
                </ProContent>
              </motion.div>

              {/* action buttons */}
              <div className={styles.salesAddBtns}>
                <Button
                  loading={actionLoading}
                  disabled={false}
                  type="primary"
                  htmlType="submit"
                  size="large"
                >
                  {isEditMode ? 'Düzəliş et' : 'Əlavə et'}
                </Button>
                <Button
                  style={{
                    marginLeft: 10,
                  }}
                  size="large"
                  onClick={handleCancel}
                >
                  İmtina
                </Button>
              </div>
            </form>
          </div>
        </section>
      </Spin>
    </ProWrapper>
  );
}

Cashbox.propTypes = {
  compType: PropTypes.oneOf([1, 2]),
};

const mapStateToProps = state => ({
  cashboxInvoiceTransactionInfo:
    state.financeOperationsReducer.cashboxInvoiceTransactionInfo,
  contactInfo: state.financeOperationsReducer.contactInfo,
  actionLoading: state.financeOperationsReducer.actionLoading,
  contactInfoIsLoading: state.financeOperationsReducer.isLoading,
  cashBoxNamesIsLoading: state.kassaReducer.isLoading,
  cashBoxBalanceIsLoading: !!state.loadings.balance,
  cashBoxNames: state.kassaReducer.cashBoxNames,
  activeCurrencies: state.kassaReducer.activeCurrencies,
  balance: state.kassaReducer.cashBoxBalance,
  contacts: state.contactsReducer.contacts,
});

export default connect(
  mapStateToProps,
  {
    fetchContactInfo,
    fetchContacts,
    fetchCashboxNames,
    fetchActiveCurrencies,
    fetchCashboxBalance,
    fetchCashboxInvoiceTransactionInfo,
    createCashboxInvoiceTransaction,
    editCashboxInvoiceTransaction,
    setCashBoxBalance,
    setCashboxInvoiceTransactionInfo,
  }
)(Cashbox);
