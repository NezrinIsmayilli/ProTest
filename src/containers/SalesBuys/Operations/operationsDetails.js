/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
  setOperationsList,
  fetchOperationsList,
} from 'store/actions/finance/operations';
import { getImportExpensePayment } from 'store/actions/finance/initialBalance';
import { Button } from 'antd';
import { convertCurrency, convertMultipleCurrency, } from 'store/actions/settings/kassa';
import moment from 'moment';
import {
  fullDateTimeWithSecond,
  roundToDown,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';

import PaymentTableTab from 'containers/Finance/PaymentTable/operationDetails/paymentTableTab';
import styles from './styles.module.scss';
import OpDetailTab from './operationDetails/opDetailTab';
import OpFinOpInvoiceTab from './operationDetails/opFinOpInvoiceTab';
import OpInvoiceContentTab from './operationDetails/opInvoiceContentTab';
import Expenses from './operationDetails/Expenses';
import Costs from './operationDetails/Costs';

const math = require('exact-math');

function OperationsDetails(props) {
  const {
    isDeletedForLog,
    loadingForLogs = false,
    activeTab,
    setActiveTab,
    visible,
    convertCurrency,
    row,
    fetchSalesInvoiceInfo,
    fetchOperationsList,
    getImportExpensePayment,
    isLoading,
    filteredList,
    mainCurrencyCode,
    setOperationsList,
    tenant,
    allBusinessUnits,
    profile,
    credits,
    convertMultipleCurrency,
  } = props;
  const dispatch = useDispatch();
  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseRates, setExpenseRates] = useState([]);
  const [importExpenses, setImportExpenses] = useState([]);
  const [invoiceLength, setInvoiceLength] = useState(undefined);
  const [total, setTotal] = useState('0');
  const [rate, setRate] = useState(1);
  const [rates, setRates] = useState([]);
  const handleChangeTab = value => setActiveTab(value);
  
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpDetailTab
            profile={profile}
            isDeletedForLog={isDeletedForLog}
            isLoading={isLoading || loadingForLogs}
            allBusinessUnits={allBusinessUnits}
            details={detailsData}
            tenant={tenant}
          />
        );
      case 1:
        return (
          <OpFinOpInvoiceTab
            isDeletedForLog={isDeletedForLog}
            row={row}
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
            filteredList={filteredList}
          />
        );
      case 2:
        return (
          <OpInvoiceContentTab
            setInvoiceLength={setInvoiceLength}
            details={detailsData}
            visible={visible}
            isLoading={isLoading}
            tableDatas={tableDatas}
          />
        );
      case 3:
        return (
          <Expenses
            total={total}
            setTotal={setTotal}
            rate={rate}
            row={row}
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
            data={expenses}
            importExpense={importExpenses}
            tenant={tenant}
            rates={rates}
            expenseRates={expenseRates}
          />
        );
      case 4:
        return (
          <Costs
            totalPay={total}
            details={detailsData}
            visible={visible}
            isLoading={isLoading}
            data={tableDatas}
          />
        );
      case 5:
        return (
          <PaymentTableTab
            details={detailsData}
            creditRow={credits?.find(
              credit => credit.creditId === row.creditId
            )}
            creditPayment={
              credits?.find(credit => credit.creditId === row.creditId)
                ?.creditTable
            }
          />
        );
      default:
    }
  };
  useEffect(() => {
    if (expenses.length > 0 || importExpenses.length > 0) {
      let tmp = 0;
      tmp = expenses.reduce(
        (total_amount, { amount }) =>
          math.add(
            total_amount,
            Number(math.mul(Number(amount) || 0, Number(rate) || 1))
          ),
        0
      );

      let tmpExpense = 0;
      tmpExpense = roundToDown(
        importExpenses.reduce(
            (total, { amount, currencyId }) =>
                math.add(
                    total,
                    Number(
                        math.mul(
                            Number(
                                rates[
                                    [
                                        ...new Set(
                                          importExpenses.map(
                                                ({ currencyId }) =>
                                                    Number(currencyId)
                                            )
                                        ),
                                    ].indexOf(currencyId)
                                ]?.rate || 1
                            ),
                            Number(amount)
                        )
                    ) || 0
                ),
            0
        )
    );
      setTotal(tmp + tmpExpense);
    } else {
      setTotal(0);
    }
  }, [expenses, rate, rates, importExpenses]);
  useEffect(() => {
    if (detailsData.currencyId && expenses.length > 0) {
      convertCurrency({
        params: {
          fromCurrencyId: expenses[0]?.currencyId,
          toCurrencyId: detailsData.currencyId,
          amount: 1,
          dateTime: detailsData.operationDate,
        },
        onSuccessCallback: ({ data }) => {
          const { rate } = data;
          setRate(roundToDown(Number(rate)) || 1);
        },
      });
    }
  }, [detailsData.currencyId, expenses]);
  useEffect(() => {
    if (!visible) {
      setDetailsData([]);
      setInvoiceLength(undefined);
      dispatch(setOperationsList({ data: [] }));
    }
  }, [visible]);

  useEffect(() => {
    setActiveTab(0);
    if (row.id) {
      fetchSalesInvoiceInfo({
        id: row.id,
        onSuccess: res => {
          if (res.data.invoiceProducts && res.data.invoiceProducts.content)
            setTableDatas([
              ...Object.keys(res.data.invoiceProducts.content).map(
                index => res.data.invoiceProducts.content[index]
              ),
            ]);
          setDetailsData(res.data);
        },
      });
      fetchOperationsList({
        filters: {
          importPurchaseInvoices: [row.id],
        },
        setOperations: false,
        onSuccessCallback: ({ data }) => {
          setExpenses(data);
          if (data?.length > 0) {
            convertMultipleCurrency({
              filters: {
                  fromCurrencyId: [
                      ...new Set(
                        data.map(({ currencyId }) =>
                              Number(currencyId)
                          )
                      ),
                  ],
                  toCurrencyId: row?.currencyId,
                  amount: 1,
                  dateTime: row?.operationDate,
              },
              onSuccessCallback: ({ data }) => {
                setExpenseRates(data);
              },
          });
          }
        },
      });
      getImportExpensePayment(row.id, ({ data }) => {
        setImportExpenses(data.map(item=> {return {...item, amount: item.price}}))
        if (data?.length > 0) {
          convertMultipleCurrency({
            filters: {
                fromCurrencyId: [
                    ...new Set(
                      data.map(({ currencyId }) =>
                            Number(currencyId)
                        )
                    ),
                ],
                toCurrencyId: row?.currencyId,
                amount: 1,
                dateTime: row?.operationDate,
            },
            onSuccessCallback: ({ data }) => {
              setRates(data);
            },
        });
      }
    })
      if (row.isVat) {
        fetchOperationsList({
          filters: { invoices: [row.id], vat: 1, transactionTypes: [9] },
        });
      } else {
        fetchOperationsList({
          filters: { invoices: [row.id], vat: 0, transactionTypes: [9] },
        });
      }
    }
  }, [row.id, row.isVat]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
          disabled={isLoading}
        >
          Əlavə məlumat
        </Button>
        {Number(row.endPrice) > 0 ? (
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
            disabled={isLoading}
          >
            Ödəniş əməliyyatları ({filteredList.length})
          </Button>
        ) : null}
        <Button
          style={
            !Number(row?.endPrice) ?
              row?.invoiceTypeNumber === 10
                ? { borderRadius: 0, border: '1px solid #d9d9d9' }
                : { borderRadius: '0 4px 4px 0', border: '1px solid #d9d9d9' }
              : row?.invoiceTypeNumber === 10
              ? { borderRadius: 0 }
              : { borderRadius: '0 4px 4px 0' }
          }
          size="large"
          type={activeTab === 2 ? 'primary' : ''}
          onClick={() => handleChangeTab(2)}
          disabled={isLoading}
        >
          Qaimənin tərkibi (
          {invoiceLength ||
              tableDatas.reduce(
                (total, { quantity }) => math.add(total, Number(quantity) || 0),
                0
              )
            }
          )
        </Button>
        {detailsData.statusOfOperation &&
        detailsData.statusOfOperation !== 3 &&
        row?.invoiceTypeNumber === 10 ? (
          <>
            <Button
              style={{ borderRadius: 0, borderRight: 0, borderLeft: 0 }}
              size="large"
              type={activeTab === 3 ? 'primary' : ''}
              onClick={() => handleChangeTab(3)}
              disabled={isLoading}
            >
              Əlavə xərclər ({expenses.length + importExpenses.length})
            </Button>
            <Button
              style={{ borderRadius: '0 4px 4px 0 ' }}
              size="large"
              type={activeTab === 4 ? 'primary' : ''}
              onClick={() => handleChangeTab(4)}
              disabled={isLoading}
            >
              Maya dəyərinin hesablanması ({tableDatas.length})
            </Button>
          </>
        ) : (
          ''
        )}
        {row?.creditId !== null ? (
          <>
            <Button
              style={{ borderRadius: '0 4px 4px 0 ' }}
              size="large"
              type={activeTab === 5 ? 'primary' : ''}
              onClick={() => handleChangeTab(5)}
              disabled={isLoading}
            >
              Ödəniş cədvəli (
              {
                credits?.find(credit => credit.creditId === row.creditId)
                  ?.creditTable?.length
              }
              )
            </Button>
          </>
        ) : (
          ''
        )}
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.financeOperationsReducer.isLoading,
  filteredList: state.financeOperationsReducer.filteredList,
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceInfo,
    fetchOperationsList,
    setOperationsList,
    convertCurrency,
    getImportExpensePayment,
    convertMultipleCurrency,
  }
)(OperationsDetails);
