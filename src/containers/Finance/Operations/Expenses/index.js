/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useReducer,
  useMemo,
} from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import useForm from 'react-hook-form';
import { toast } from 'react-toastify';

// utils and hooks
import {
  createReducer,
  accountTypeOptions,
  formItemSize,
  toastHelper,
  today,
} from 'utils';

// components
import { Row, Col, Input, Button, Spin, Icon } from 'antd';
import { ProSelect, ProContent, ProFormItem, ProWrapper } from 'components/Lib';

// actions
import { fetchStructures } from 'store/actions/structure';
import { fetchEmployees } from 'store/actions/employees';
import {
  fetchCashboxNames,
  fetchCashboxBalance,
  fetchActiveCurrencies,
} from 'store/actions/settings/kassa';

import {
  fetchExpenseTransactionInfo,
  createExpenseTransaction,
  editExpenseTransaction,
} from 'store/actions/finance/operations';

// main components
import CatalogModal from './CatalogModal';
import Table from './Table';

import styles from './expenses.module.scss';

const returnUrl = `/finance/operations?tab=3`;

const initialState = {
  isCatalogModalOpen: false,
  bucket: [],
};

// util func to reduce DRY code
function getNewBucket(oldBucket, id, field, value) {
  const index = oldBucket.findIndex(expense => expense.id === id);
  const oldExpense = oldBucket[index];

  const newExpense = {
    ...oldExpense,
    [field]: value,
  };

  const newBucket = [...oldBucket];
  newBucket.splice(index, 1, newExpense);

  return newBucket;
}

// REDUCER
const reducer = createReducer(initialState, {
  closeCatalogModal: state => ({ ...state, isCatalogModalOpen: false }),

  openCatalogModal: state => ({ ...state, isCatalogModalOpen: true }),

  addSelectedExpensesToBucket: (state, action) => ({
    ...state,
    isCatalogModalOpen: false,
    bucket: action.tempBucket.concat(state.bucket),
  }),

  resetBucket: state => ({
    ...state,
    bucket: [],
  }),

  removeFromBucket: (state, action) => {
    const newBucket = [...state.bucket].filter(
      product => product.id !== action.id
    );
    return {
      ...state,
      bucket: newBucket,
    };
  },

  changeResponsiblePerson: (state, action) => ({
    ...state,
    bucket: getNewBucket(
      state.bucket,
      action.id,
      'responsiblePerson',
      action.responsiblePerson
    ),
  }),

  handleExpenseAmount: (state, action) => ({
    ...state,
    bucket: getNewBucket(
      state.bucket,
      action.id,
      'expenseAmount',
      action.expenseAmount
    ),
  }),

  setBucket: (state, action) => ({
    ...state,
    bucket: action.bucket,
  }),
});

/**
 * Main Expenses Container Component - 'Xercler'
 */
function Expenses(props) {
  const {
    structures,
    employees,
    activeCurrencies,
    balance,
    cashBoxNames,
    profile,
    expenseTransactionInfo,

    actionLoading,
    isBalanceLoading,
    cashBoxNamesIsLoading,

    fetchCashboxBalance,
    fetchCashboxNames,
    fetchActiveCurrencies,
    fetchStructures,
    fetchEmployees,
    fetchExpenseTransactionInfo,

    createExpenseTransaction,
    editExpenseTransaction,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isCatalogModalOpen, bucket } = state;

  // state handling functions
  function openCatalogModal() {
    dispatch({ type: 'openCatalogModal' });
  }

  function closeCatalogModal() {
    dispatch({ type: 'closeCatalogModal' });
  }

  function addSelectedExpensesToBucket(tempBucket) {
    dispatch({ type: 'addSelectedExpensesToBucket', tempBucket });
  }

  function removeFromBucket(id) {
    dispatch({ type: 'removeFromBucket', id });
  }

  function resetBucket(tempBucket) {
    dispatch({ type: 'resetBucket', tempBucket });
  }

  function changeResponsiblePerson(responsiblePerson, id) {
    dispatch({ type: 'changeResponsiblePerson', responsiblePerson, id });
  }

  function handleExpenseAmount(expenseAmount, id) {
    dispatch({ type: 'handleExpenseAmount', expenseAmount, id });
  }

  function setBucket(bucket) {
    dispatch({ type: 'setBucket', bucket });
  }

  const { id: transactionId = '' } = useParams();
  const history = useHistory();

  const [isDisabledAccount, setIsDisabledAccount] = useState(true);
  const [balanceValue, setBalanceValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(!!transactionId);

  // refs for scrolling to the top when inputs not valid
  const mainFormSection = useRef(null);
  const tableSection = useRef(null);

  const {
    register,
    errors,
    triggerValidation,
    setValue,
    getValues,
  } = useForm();

  const {
    accountType,
    cashbox,
    structure,
    currency,
    description = '',
  } = getValues();

  useEffect(() => {
    if (activeCurrencies.length === 0) {
      fetchActiveCurrencies();
    }

    if (structures.length === 0) {
      fetchStructures();
    }

    if (employees.length === 0) {
      fetchEmployees();
    }

    if (transactionId) {
      // callback onFailure
      fetchExpenseTransactionInfo(transactionId, () => {
        setIsSpinning(false);
      });
    }
  }, []);

  // in edit
  useEffect(() => {
    if (transactionId && expenseTransactionInfo.cashboxTypeId) {
      const {
        cashboxTypeId,
        cashboxId,
        structureId,
        currencyId,
        description,
        expenseItems,
      } = expenseTransactionInfo;

      Promise.all([
        fetchCashboxNames({ attribute: cashboxTypeId }, () => {
          setValue('cashbox', cashboxId);
        }),
        fetchCashboxBalance({ attribute: cashboxId }),
      ])
        .then(() => {
          // set initial state
          setValue('accountType', cashboxTypeId);
          setValue('structure', structureId);
          setValue('description', description);
          setValue('currency', currencyId);

          const initBucket = expenseItems.map(expense => ({
            id: expense.expenseId,
            name: expense.expenseName,
            catalogName: expense.expenseCatalog || '',
            responsiblePerson: expense.responsibleTenantPersonId,
            expenseAmount: expense.amount,
          }));

          setBucket(initBucket);
        })
        .catch(() => {
          setIsSpinning(false);
        });
    }
  }, [expenseTransactionInfo]);

  useEffect(() => {
    if (
      expenseTransactionInfo &&
      Object.keys(expenseTransactionInfo).length > 0 &&
      Object.keys(cashBoxNames).length > 0 &&
      balance &&
      balance.length > 0
    ) {
      setIsSpinning(false);
    }
  }, [expenseTransactionInfo, cashBoxNames, balance]);

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
            `${Number(account.balance).toFixed(2)} ${account.currencyCode}`
        )
        .join(', ');

      setBalanceValue(allBalancesByComma);
    }
  }, [isBalanceLoading]);

  // register inputs
  useLayoutEffect(() => {
    register({ name: 'accountType' }, { required: 'error' });
    register({ name: 'cashbox' }, { required: 'error' });
    register({ name: 'structure' }, { required: 'error' });
    register({ name: 'currency' }, { required: 'error' });
    register({ name: 'description' });

    return () => {
      setValue('accountType', null);
    };
  }, []);

  // change handler for description texteara
  function onChange(event) {
    let { name, value } = event.target || {};
    if (name === 'description') {
      value = value.substring(0, 250);
    }
    setValue(name, value, true);
  }

  function onSelect(name, value) {
    if (name === 'accountType') {
      fetchCashboxNames({ attribute: value });
    }
    if (name === 'cashbox') {
      fetchCashboxBalance({ attribute: value });
    }

    setValue(name, value, true);
  }

  // table footer overall price
  const totalExpenseAmount = bucket.reduce(
    (acc, expense) => acc + Number(expense.expenseAmount),
    0
  );

  // selected currency code 3 Letter AZN
  const selectedCurrency = useMemo(
    () => activeCurrencies.find(item => item.id === currency),
    [currency]
  );

  const totalExpenseAmountWithCurrency = `
     ${totalExpenseAmount.toFixed(2)}  ${selectedCurrency?.code || ''}
   `;

  async function submitExpense(e) {
    e.preventDefault();
    const [isMainFormValid, isTableValid] = await Promise.all([
      triggerValidation(),
      triggerTableValidation(),
    ]);

    // if main Form is not valid scroll to the top
    if (!isMainFormValid) {
      mainFormSection.current.scrollIntoView({ behavior: 'smooth' });
    }
    // if table inputs is not valid and main form is valid scroll to the table section
    if (!isTableValid && isMainFormValid) {
      tableSection.current.scrollIntoView({ behavior: 'smooth' });
    }

    if (isMainFormValid && isTableValid) {
      // make api data structure for server
      const expenseItems_ul = bucket.map(expense => ({
        expense: expense.id,
        responsiblePerson: expense.responsiblePerson,
        amount: parseFloat(expense.expenseAmount),
      }));

      const data = {
        cashboxType: accountType,
        cashbox,
        structure,
        currency,
        description,
        expenseItems_ul,
      };

      if (transactionId) {
        editExpenseTransaction(data, transactionId, () =>
          toastHelper(history, returnUrl)
        );
      } else {
        createExpenseTransaction(data, () => toastHelper(history, returnUrl));
      }
    }
  }

  function triggerTableValidation() {
    let isValid = true;

    const validatedBucket = bucket.map(expense => {
      const { responsiblePerson, expenseAmount } = expense;

      if (!responsiblePerson || !expenseAmount) {
        isValid = false;
      }

      return {
        ...expense,
        responsiblePerson: responsiblePerson || undefined,
        expenseAmount: expenseAmount || undefined,
      };
    });

    if (bucket.length === 0) {
      isValid = false;
      toast.success('Siyahı boş olmamalıdır.', {
        className: 'error-toast',
      });
    }

    if (!isValid) {
      setBucket(validatedBucket);
    }

    return Promise.resolve(isValid);
  }

  function handleCancel() {
    history.replace(returnUrl);
  }

  return (
    <ProWrapper>
      <section className="operationsWrapper">
        <div className={styles.containerFluid}>
          <Spin spinning={isSpinning}>
            <form onSubmit={submitExpense} ref={mainFormSection}>
              <div className={styles.nameCode}>
                {transactionId ? 'Redaktə et' : 'Yeni xərc'}
                <div className={styles.nameAndDate}>
                  <span className={styles.date}>{today}</span>
                  <span className={styles.userName}>{profile.name}</span>
                </div>
              </div>
              {/* 1. Hesab */}
              <ProContent title="1. Hesab">
                <Row gutter={32}>
                  <Col span={12}>
                    {/* Hesab növü - type */}
                    <ProFormItem
                      label="Hesab növü"
                      validateStatus={errors.accountType}
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
                      validateStatus={errors.cashbox}
                      required
                    >
                      <ProSelect
                        value={cashbox}
                        loading={cashBoxNamesIsLoading}
                        disabled={isDisabledAccount || cashBoxNamesIsLoading}
                        data={cashBoxNames[accountType]}
                        onChange={value => onSelect('cashbox', value)}
                        hasError={errors.cashbox}
                        showFirstOption={false}
                        notUseMemo
                      />
                    </ProFormItem>
                    <div className={styles.balance}>
                      <span>
                        Hesabda qalıq:{' '}
                        {isBalanceLoading ? (
                          <Icon type="sync" spin />
                        ) : (
                          balanceValue
                        )}
                      </span>
                    </div>

                    <Row gutter={24}>
                      <Col span={12}>
                        {/* Structure */}
                        <ProFormItem
                          label="Struktur"
                          validateStatus={errors.structure}
                          required
                        >
                          <ProSelect
                            value={structure}
                            data={structures}
                            onChange={value => onSelect('structure', value)}
                            hasError={errors.structure}
                            showFirstOption={false}
                          />
                        </ProFormItem>
                      </Col>

                      <Col span={12}>
                        {/* Valyuta */}
                        <ProFormItem
                          label="Valyuta"
                          validateStatus={errors.currency}
                          required
                        >
                          <ProSelect
                            value={currency}
                            data={activeCurrencies}
                            keys={['code']}
                            hasError={errors.currency}
                            onChange={value => onSelect('currency', value)}
                          />
                        </ProFormItem>
                      </Col>
                    </Row>
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
                <div ref={tableSection} />
              </ProContent>

              <CatalogModal
                {...{
                  isCatalogModalOpen,
                  closeCatalogModal,
                  bucket,
                  addSelectedExpensesToBucket,
                  removeFromBucket,
                  resetBucket,
                }}
              />

              <Table
                {...{
                  openCatalogModal,
                  bucket,
                  employees,
                  totalExpenseAmountWithCurrency,
                  // actions
                  removeFromBucket,
                  changeResponsiblePerson,
                  handleExpenseAmount,
                }}
              />

              {/* action buttons */}
              <div className={styles.salesAddBtns}>
                <Button
                  loading={actionLoading}
                  disabled={false}
                  type="primary"
                  htmlType="submit"
                  size={formItemSize}
                >
                  {transactionId ? 'Düzəliş et' : 'Əlavə et'}
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
  cashBoxNames: state.kassaReducer.cashBoxNames,
  activeCurrencies: state.kassaReducer.activeCurrencies,
  balance: state.kassaReducer.cashBoxBalance,
  structures: state.structureReducer.structures,
  employees: state.employeesReducer.employees,
  profile: state.profileReducer.profile,
  expenseTransactionInfo: state.financeOperationsReducer.expenseTransactionInfo,

  actionLoading: state.financeOperationsReducer.actionLoading,
  cashBoxNamesIsLoading: state.kassaReducer.isLoading,
  isBalanceLoading: state.kassaReducer.isBalanceLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchCashboxNames,
    fetchCashboxBalance,
    fetchActiveCurrencies,
    fetchStructures,
    fetchEmployees,

    createExpenseTransaction,
    editExpenseTransaction,
    fetchExpenseTransactionInfo,
  }
)(Expenses);
