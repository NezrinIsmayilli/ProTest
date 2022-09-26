import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table as ProTable, DetailButton } from 'components/Lib';
import { Tooltip, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat, currentYear } from 'utils';
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
} from 'react-icons/all';
import {
  createProductConfiguration,
  fetchProductConfiguration,
  setSelectedProductConfiguration,
  editProductConfiguration,
  deleteProductConfiguration,
} from 'store/actions/finance/salesBonus';

import styles from '../../styles.module.scss';

const Table = props => {
  const {
    loading,
    filters,
    tableData,
    tableDataSub,
    collapseClick,
    handleDetailClick,
    handleDetailClickSub,
    mainCurrency,
    productConfiguration,
    defaultExpand,
    setDefaultExpand,
  } = props;
  const defaultData = [
    {
      children: [],

      id: 'default',
    },
  ];
  const [selected, setSelected] = useState(defaultData);
  const [allData, setAllData] = useState();

  const [sortedData, setSortedData] = useState();

  const getTotalValues = expensesInfo =>
    expensesInfo
      ? [
          {
            isTotal: true,
            total: expensesInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.total),
              0
            ),
            [filters.years?.map(item =>
              item.getFullYear()
            )[0]]: expensesInfo.reduce(
              (totalValue, currentValue) =>
                totalValue +
                Number(
                  currentValue?.[
                    filters.years?.map(item => item.getFullYear())[0]
                  ]
                ),
              0
            ),
            [filters.years?.map(item =>
              item.getFullYear()
            )[1]]: expensesInfo.reduce(
              (totalValue, currentValue) =>
                totalValue +
                Number(
                  currentValue?.[
                    filters.years?.map(item => item.getFullYear())[1]
                  ]
                ),
              0
            ),
          },
        ]
      : [];

  const getColumns = data => {
    const columns = [];
    columns.push({
      title: 'Gəlir və xərc müddəaları',
      dataIndex: 'name',
      width: 340,
      align: 'left',
      render: (value, row, { key }) =>
        row.isTotal ? (
          `Toplam məbləğ (${mainCurrency.code}):`
        ) : (
          <span style={{ fontSize: '15px', fontWeight: 700 }}>
            {row.hasOwnProperty('children') ? (
              <span style={{ fontSize: '15px', fontWeight: 700 }}>
                {value || '-'}, {mainCurrency.code}
              </span>
            ) : (
              <span style={{ fontSize: '15px', fontWeight: 400 }}>
                {value || '-'}, {mainCurrency.code}
              </span>
            )}
          </span>
        ),
    });
    if (data.length > 0) {
      const { data: years } = data[0];
      Object.keys(years).forEach(year => {
        columns.push({
          title: `${year}`,
          dataIndex: year,
          width: 150,
          align: 'center',
          render: (value, row) =>
            Number(value) === 0 || row.isTotal ? (
              <span
                style={
                  row.hasOwnProperty('children')
                    ? Number(value) > 0
                      ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                      : { color: 'red', fontSize: '15px', fontWeight: 700 }
                    : {}
                }
              >
                {formatNumberToLocale(defaultNumberFormat(value))}
              </span>
            ) : (
              <div className={styles.detailbtn}>
                {row.hasOwnProperty('children') ? (
                  <span
                    className={styles.rowNumbers}
                    style={
                      Number(value) > 0
                        ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                        : { color: 'red', fontSize: '15px', fontWeight: 700 }
                    }
                  >
                    {formatNumberToLocale(defaultNumberFormat(value))}
                  </span>
                ) : (
                  <span className={styles.rowNumbers}>
                    {formatNumberToLocale(defaultNumberFormat(value))}
                  </span>
                )}

                <Tooltip
                  title={formatNumberToLocale(defaultNumberFormat(value))}
                  placement="right"
                >
                  <DetailButton
                    className={styles.detailButton}
                    onClick={() =>
                      row.hasOwnProperty('children')
                        ? handleDetailClick(row, year)
                        : handleDetailClickSub(row, year)
                    }
                  />
                </Tooltip>
              </div>
            ),
        });
      });
    }
    columns.push({
      title: 'Toplam',
      dataIndex: 'total',
      width: 250,
      align: 'right',
      render: (value, row) => (
        <span
          style={
            row.isTotal
              ? { color: '#fff', fontSize: '15px', fontWeight: 700 }
              : Number(value) > 0
              ? { color: 'green', fontSize: '15px', fontWeight: 700 }
              : { color: 'red', fontSize: '15px', fontWeight: 700 }
          }
        >
          {formatNumberToLocale(defaultNumberFormat(value))}
        </span>
      ),
    });

    columns.push({
      title: 'Ortalama',
      dataIndex: 'average',
      width: 250,
      align: 'right',
      render: (value, row) =>
        row.isTotal ? (
          ''
        ) : (
          <span
            style={
              Number(value) > 0
                ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                : { color: 'red', fontSize: '15px', fontWeight: 700 }
            }
          >
            {formatNumberToLocale(defaultNumberFormat(value))}
          </span>
        ),
    });

    return columns;
  };

  const getProfitAndLossReports = data => {
    let profitAndLoss = [];
    if (data.length > 0) {
      profitAndLoss = data.map(
        ({ average, id, name, total, children, data }) => ({
          name,
          id,
          total,
          average,
          children: children.map(({ average, id, name, total, data }) => ({
            name,
            id,
            total,
            average,
            ...data,
          })),
          ...data,
        })
      );
    }
    return profitAndLoss;
  };

  useEffect(() => {
    setSortedData(allData);
  }, [allData]);

  useEffect(() => {
    if (productConfiguration && productConfiguration.length > 0) {
      const defaultFound = productConfiguration.find(
        product => product.configurationProductId === '0_0_0'
      );
      if (defaultFound) {
        setSelected([...tableData]);
      } else {
        setSelected([...tableData, ...defaultData]);
      }
    } else {
      setSelected([...defaultData]);
    }
  }, [productConfiguration]);

  useEffect(() => {
    setAllData(selected);
  }, [selected]);

  const customExpandIcon = props => {
    if (
      // eslint-disable-next-line react/destructuring-assignment
      props?.record?.children?.length < 0 ||
      // eslint-disable-next-line react/destructuring-assignment
      !props?.record?.hasOwnProperty('children')
    ) {
      return <span style={{ display: 'inline-block', width: '36px' }}></span>;
    }
    // eslint-disable-next-line react/destructuring-assignment
    if (props?.expanded) {
      return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <a
          style={{
            color: 'black',
            marginRight: '15px',
            display: 'inline-block',
          }}
          onClick={async e => {
            await collapseClick(props.record, e);
            await props.onExpand(props.record, e);
          }}
        >
          <IoIosArrowDropdownCircle
            style={{ verticalAlign: 'middle' }}
            fontSize="22px"
            color="#505050"
          />
        </a>
      );
    }
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <a
        style={{ color: 'black', marginRight: '15px', display: 'inline-block' }}
        onClick={async e => {
          await collapseClick(props.record, e);
          await props.onExpand(props.record, e);
        }}
      >
        <IoIosArrowDroprightCircle
          style={{ verticalAlign: 'middle' }}
          fontSize="22px"
          color="#505050"
        />
      </a>
    );
  };
  const handleExpand = (props, row) => {
    if (props) {
      setDefaultExpand([row.id]);
    } else {
      setDefaultExpand(defaultExpand =>
        defaultExpand.filter(item => item !== row.id)
      );
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ overflow: 'auto' }}>
        <div style={{ display: 'grid' }}>
          <ProTable
            className={`${styles.customTable} ${styles.customTableExpenses}`}
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={getProfitAndLossReports(
              tableDataSub.length > 0 ? tableDataSub : tableData
            )}
            rowKey={record => record.id}
            expandedRowKeys={defaultExpand}
            onExpand={(expanded, row) => handleExpand(expanded, row)}
            columns={getColumns(
              tableDataSub.length > 0 ? tableDataSub : tableData
            )}
            expandIcon={props => customExpandIcon(props)}
          />
        </div>
        <div style={{ display: 'grid' }}>
          <ProTable
            className={`${styles.customTable} ${styles.customTableFooter}`}
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={getTotalValues(getProfitAndLossReports(tableData))}
            rowKey={record => record.id}
            columns={getColumns(tableData)}
          />
        </div>
      </div>
    </Spin>
  );
};

const mapStateToProps = state => ({
  profitAndLossReport: state.expenses.profitByYear,
  loading: state.loadings.fetchProfitByYear,
  mainCurrency: state.kassaReducer.mainCurrency,
});
export default connect(
  mapStateToProps,
  {
    fetchProductConfiguration,
    createProductConfiguration,
    setSelectedProductConfiguration,
    editProductConfiguration,
    deleteProductConfiguration,
  }
)(Table);
