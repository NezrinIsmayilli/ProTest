import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Table as ProTable, TableFooter } from 'components/Lib';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import math from 'exact-math';
import styles from './styles.module.scss';
import { Tooltip } from 'antd';

const Table = props => {
  const [columnsMain, setColumnsMain] = useState([]);
  const [load, setLoad] = useState(false);
  const [usedCurrency, setUsedCurrency] = useState([]);
  const {
    cashboxBalanceReport,
    cashboxBalanceReportLoading,
    fetchMainCurrency,
    mainCurrency,
    currencies,
    cashBox,
    cashBoxCurrencies,
  } = props;
  useEffect(() => {
    setLoad(true);
    setColumnsMain([]);
    setUsedCurrency([]);
    fetchMainCurrency();
    // getColumns(cashBox);
  }, [cashBox]);
  useEffect(() => {
    getColumns(cashBox);
  }, [usedCurrency]);
  useEffect(() => {
    if (cashBoxCurrencies.length > 0) {
      const usedCurr = currencies.filter(({ id }) => {
        if (cashBoxCurrencies?.includes(id)) {
          return true;
        }
        return false;
      });
      setUsedCurrency(usedCurr);
      setLoad(false);
    }
  }, [cashBoxCurrencies]);
  const getColumns = data => {
    const columns = [];
    columns.push({
      title: '№',
      width: 90,
      render: (value, row, index) => (row.summaryRow ? 'Toplam' : index + 1),
    });
    columns.push({
      title: 'Hesab növü',
      width: 150,
      dataIndex: 'cashboxType',
      align: 'left',
      render: value => value || '',
    });
    columns.push({
      title: 'Hesab',
      width: 150,
      dataIndex: 'cashboxName',
      align: 'left',
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || '-'}</span>
        </Tooltip>
      ),
    });
    if (data.length > 0) {
      usedCurrency.map(currency => {
        columns.push({
          title: currency.code,
          width: 150,
          className: styles.currency,
          dataIndex: 'balances',
          align: 'right',
          render: (value, row) =>
            row.summaryRow
              ? `${formatNumberToLocale(
                  defaultNumberFormat(value[currency.id])
                )} ${currency.code}`
              : value[currency.id]
              ? formatNumberToLocale(defaultNumberFormat(value[currency.id]))
              : 0,
        });
      });
    } else {
      setLoad(false);
      return null;
    }
    columns.push({
      title: `Toplam (${mainCurrency.code})`,
      width: 150,
      className: styles.currency,
      dataIndex: 'totalConvertedAmount',
      align: 'center',
      render: (value, row) =>
        row.summaryRow
          ? `${formatNumberToLocale(defaultNumberFormat(value))} ${
              mainCurrency.code
            }`
          : formatNumberToLocale(defaultNumberFormat(value)),
    });
    setColumnsMain(columns);
    setLoad(false);
    // return columns;
  };
  const getCashboxReport = data => {
    const balances = {};
    if (data.length > 0) {
      currencies.map(currency => {
        balances[currency.id] = data.reduce(
          (total, current) =>
            math.add(
              Number(total),
              current.balances[currency.id]
                ? Number(current.balances[currency.id])
                : 0
            ),
          0
        );
      });
      const totalConvertedAmount = data.reduce(
        (total, current) =>
          math.add(Number(total), Number(current.totalConvertedAmount)),
        0
      );
      return [
        ...data,
        {
          summaryRow: true,
          balances,
          totalConvertedAmount,
        },
      ];
    }
    return data;
  };

  return (
    <ProTable
      loading={load || cashboxBalanceReportLoading}
      style={{ marginTop: '25px ' }}
      scroll={{ x: 'max-content' }}
      dataSource={getCashboxReport(cashBox)}
      columns={columnsMain}
      footerClassName={styles.cashboxTableFooter}
      footer={
        !cashBox.length > 0 ? <TableFooter mebleg={0} title="Toplam" /> : null
      }
    />
  );
};

const mapStateToProps = state => ({
  cashboxBalanceReportLoading: state.loadings.fetchCashboxBalanceReport,
  cashboxBalanceReport: state.financeReportsReducer.cashboxBalanceReport,
  mainCurrency: state.kassaReducer.mainCurrency,
});
export default connect(
  mapStateToProps,
  { fetchMainCurrency }
)(Table);
