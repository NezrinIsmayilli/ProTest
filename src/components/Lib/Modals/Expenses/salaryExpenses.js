/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Col } from 'antd';
import { Table, ProButton, ProSelect } from 'components/Lib';
import { defaultNumberFormat, formatNumberToLocale, months } from 'utils';
import math from 'exact-math';
import styles from './styles.module.scss';

export const SalaryExpenses = props => {
  const {
    title,
    subTitle,
    mainCurrency,
    data,
    dataLoading,
    quarter,
    isMonth,
    values,
    setValues,
  } = props;

  const componentRef = useRef();
  const [month, setMonth] = useState([]);

  useEffect(() => {
    const quarterMonth = [];
    if (quarter) {
      months.map(month => {
        if (
          month.id == quarter[0] ||
          month.id == quarter[1] ||
          month.id == quarter[2]
        ) {
          quarterMonth.push(month);
        }
      });
      setMonth(quarterMonth);
    }
  }, [quarter]);
  const handleFilter = value => {
    setValues(value);
  };

  const getFilteredInvoices = tableData => {
    if (values?.length > 0) {
      const newtableDatas = tableData.filter(({ month }) => {
        if (values.length > 0 ? values.includes(month) : true) {
          return true;
        }
        return false;
      });
      return newtableDatas;
    }
    return tableData;
  };
  const getExpenses = data => {
    let expenses = [];

    if (data?.length > 0) {
      const salaryInMainCurrency = data.reduce(
        (total, current) =>
          math.add(Number(total), Number(current.salaryInMainCurrency)),
        0
      );
      expenses = [
        ...data,
        {
          summaryRow: true,
          salaryInMainCurrency,
        },
      ];
    }
    return expenses;
  };

  const columns = [
    {
      title: '№',
      width: 90,
      render: (val, row, index) => (row.summaryRow ? 'Toplam' : index + 1),
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      render: (value, row) =>
        row.summaryRow ? '' : `${value} ${row.surname} ${row.patronymic}`,
    },
    {
      title: 'Kateqoriya',
      dataIndex: 'transactionTypeName',
      render: (value, row) => (row.summaryRow ? '' : `Əməkhaqqı ödənişi`),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'transactionAmount',
      align: 'right',
      render: (value, { summaryRow, currencyCode }) =>
        summaryRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    !isMonth
      ? {
          title: 'Ay',
          dataIndex: 'month',
          render: (value, row) =>
            months?.map(month => {
              if (month.id === value) {
                return month.label;
              }
            }),
        }
      : {},
    {
      title: `Bu ay cəmi`,
      dataIndex: 'salary',
      align: 'right',
      render: (value, row) =>
        row.summaryRow
          ? ''
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
              row.currencyCode
            }`,
    },
    {
      title: `Bu ay cəmi (${mainCurrency?.code})`,
      dataIndex: 'salaryInMainCurrency',
      align: 'right',
      render: value =>
        ` ${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
  ];

  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <div className={styles.exportBox}>
        <Col span={12}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <label className={styles.title}>{title}</label>
            <label className={styles.subTitle}>{subTitle}</label>
          </div>
        </Col>
        <ReactToPrint
          trigger={() => (
            <ProButton
              className={styles.customSquareButton}
              style={{ marginRight: 10 }}
              shape="circle"
              icon="printer"
            />
          )}
          content={() => componentRef.current}
        />
      </div>
      {!isMonth ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Ay</span>
          <ProSelect
            value={values}
            mode="multiple"
            style={{ width: '300px' }}
            size="middle"
            data={quarter ? month : months}
            onChange={handleFilter}
            keys={['label']}
          />
        </div>
      ) : null}
      <Table
        scroll={{ x: 'max-content' }}
        dataSource={getExpenses(getFilteredInvoices(data))}
        loading={dataLoading}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
      />
    </div>
  );
};
