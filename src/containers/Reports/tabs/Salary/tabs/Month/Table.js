import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
} from 'react-icons/all';
import { InfoCard, Table as ProTable } from 'components/Lib';
import { Spin } from 'antd';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  months as defaultMonths,
} from 'utils';
import styles from '../../styles.module.scss';
import { types } from '../types';

function Table(props) {
  const {
    loading,
    mainCurrency,
    tableData,
    tableDataSub,
    collapseClick,
    setDefaultExpand,
    defaultExpand,
    filters,
  } = props;

  useEffect(() => {
    setDefaultExpand([]);
  }, []);

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
          1: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[1]),
            0
          ),
          2: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[2]),
            0
          ),
          3: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[3]),
            0
          ),
          4: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[4]),
            0
          ),
          5: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[5]),
            0
          ),
          6: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[6]),
            0
          ),
          7: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[7]),
            0
          ),
          8: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[8]),
            0
          ),
          9: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[9]),
            0
          ),
          10: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[10]),
            0
          ),
          11: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[11]),
            0
          ),
          12: expensesInfo.reduce(
            (totalValue, currentValue) =>
              totalValue + Number(currentValue?.[12]),
            0
          ),
        },
      ]
      : [];

  const getColumns = data => {
    const columns = [];
    if (data.length > 0) {
      let table = document.getElementsByClassName('ant-table-body')[0];
      var hasHorizontalScrollbar = table.scrollWidth > table.clientWidth;
    }

    if (types[filters.groupBy].type == 'employee') {
      let employeeInfo = {
        title: types[filters.groupBy].label_column,
        dataIndex: types[filters.groupBy].columnName,
        width: 350,
        align: 'left',
        render: (value, row) =>
          row.isTotal ? (
            `Toplam məbləğ (${mainCurrency.code}):`
          ) : (
            <div className={styles.employeeInfo}>
              <InfoCard
                name={row.name}
                surname={row.surname}
                patronymic={row.patronymic}
                occupationName={row.occupationName}
                attachmentUrl={row.attachmentUrl}
                width="32px"
                height="32px"
              />
            </div>
          ),
      };
      if (data.length > 0) {
        if (hasHorizontalScrollbar) {
          employeeInfo['fixed'] = 'left';
        }
      }
      columns.push(employeeInfo);
    } else {
      let employeeInfo = {
        title: types[filters.groupBy].label_column,
        dataIndex: types[filters.groupBy].columnName,
        width: 350,
        align: 'left',
        render: (value, row) =>
          row.isTotal ? (
            `Toplam məbləğ (${mainCurrency.code}):`
          ) : row.hasOwnProperty('children') ? (
            <span className={styles.groupTitle}>
              {row.name || 'Təyin olunmayıb'}
            </span>
          ) : (
            <div className={styles.employeeInfo}>
              <InfoCard
                name={row.name}
                surname={row.surname}
                patronymic={row.patronymic}
                occupationName={row.occupationName}
                attachmentUrl={row.attachmentUrl}
                width="32px"
                height="32px"
              />
            </div>
          ),
      };
      if (hasHorizontalScrollbar) {
        employeeInfo['fixed'] = 'left';
      }
      columns.push(employeeInfo);
    }
    if (data.length > 0) {
      const { data: months } = data[0];
      Object.keys(months).forEach(month => {
        const { label } = defaultMonths.find(({ id }) => id === Number(month));
        columns.push({
          title: label,
          width: 150,
          dataIndex: month,
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
              <>
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
              </>
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

  const getSalaryReports = data => {
    let salary = [];
    if (data.length > 0) {
      salary = data.map(
        ({
          average,
          id,
          name,
          surname,
          patronymic,
          structureName,
          total,
          employees,
          occupationName,
          attachmentUrl,
          data,
        }) => ({
          name,
          surname,
          occupationName,
          patronymic,
          structureName,
          id: id == null ? -1 : id,
          total,
          average,
          attachmentUrl,
          children: employees?.map(
            ({
              average,
              id,
              name,
              surname,
              patronymic,
              structureName,
              total,
              occupationName,
              attachmentUrl,
              data,
            }) => ({
              name,
              surname,
              occupationName,
              patronymic,
              structureName,
              id: id == null ? -1 : id,
              total,
              average,
              attachmentUrl,
              ...data,
            })
          ),
          ...data,
        })
      );
    }
    return salary;
  };

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
        {types[filters.groupBy].type == 'employee' ? (
          <div style={{ display: 'grid' }}>
            <ProTable
              pagination={false}
              scroll={{ x: true }}
              className={`${styles.customTable} table`}
              dataSource={getSalaryReports(
                tableDataSub.length > 0 ? tableDataSub : tableData
              )}
              rowKey={record => record.id}
              columns={getColumns(
                tableDataSub.length > 0 ? tableDataSub : tableData
              )}
            />
          </div>
        ) : (
          <div style={{ display: 'grid' }}>
            <ProTable
              pagination={false}
              scroll={{ x: true }}
              className={`${styles.customTable} table`}
              dataSource={getSalaryReports(
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
        )}
        <div style={{ display: 'grid' }}>
          <ProTable
            className={`${styles.customTableFooter}`}
            pagination={false}
            scroll={{ x: true }}
            dataSource={getTotalValues(getSalaryReports(tableData))}
            rowKey={record => record.id}
            columns={getColumns(tableData)}
          />
        </div>
      </div>
    </Spin>
  );
}
const mapStateToProps = state => ({
  loading: state.loadings.fetchSalaryByMonth,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(mapStateToProps)(Table);
