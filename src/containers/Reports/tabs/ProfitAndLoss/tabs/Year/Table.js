import React from 'react';
import { connect } from 'react-redux';
import { Table as ProTable, DetailButton } from 'components/Lib';
import { Tooltip } from 'antd';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  profitAndLossSummaryRows,
  profitAndLossReportsWithoutDetail,
} from 'utils';
import styles from '../../styles.module.scss';

const Table = props => {
  const {
    loading,
    handleDetailClick,
    getProfitAndLossReports,
    profitAndLossReport,
    mainCurrency,
  } = props;

  const getColumns = data => {
    const columns = [];
    if (data.length > 0) {
      columns.push({
        title: 'Gəlir və xərc müddəaları',
        dataIndex: 'name',
        width: 350,
        align: 'left',
        render: (value, { key }) => (
          <span
            style={
              profitAndLossSummaryRows.includes(key)
                ? { fontSize: '15px', fontWeight: 700 }
                : {}
            }
          >
            {value}, {mainCurrency.code}
          </span>
        ),
      });
      const { data: years } = data[0];
      Object.keys(years).forEach(year => {
        columns.push({
          title: `${year}`,
          dataIndex: year,
          width: 150,
          align: 'center',
          render: (value, row) =>
            Number(value) === 0 ||
            profitAndLossReportsWithoutDetail.includes(row.key) ? (
              <span
                style={
                  profitAndLossSummaryRows.includes(row.key)
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
                <span className={styles.rowNumbers}>
                  {formatNumberToLocale(defaultNumberFormat(value))}
                </span>

                <Tooltip
                  title={formatNumberToLocale(defaultNumberFormat(value))}
                  placement="right"
                >
                  <DetailButton
                    className={styles.detailButton}
                    onClick={() => handleDetailClick(row, year)}
                  />
                </Tooltip>
              </div>
            ),
        });
      });

      columns.push({
        title: 'Toplam',
        dataIndex: 'total',
        width: 250,
        align: 'right',
        render: (value, row) => (
          <span
            style={
              profitAndLossSummaryRows.includes(row.key)
                ? Number(value) > 0
                  ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                  : { color: 'red', fontSize: '15px', fontWeight: 700 }
                : { fontSize: '15px', fontWeight: 700 }
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
        render: (value, row) => (
          <span
            style={
              profitAndLossSummaryRows.includes(row.key)
                ? Number(value) > 0
                  ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                  : { color: 'red', fontSize: '15px', fontWeight: 700 }
                : { fontSize: '15px', fontWeight: 700 }
            }
          >
            {formatNumberToLocale(defaultNumberFormat(value))}
          </span>
        ),
      });
    }
    return columns;
  };

  return (
    <ProTable
      loading={loading}
      scroll={{ x: 'max-content' }}
      dataSource={getProfitAndLossReports(profitAndLossReport, mainCurrency)}
      columns={getColumns(profitAndLossReport, mainCurrency)}
      rowKey={record => record.id}
      className={styles.customTable}
    />
  );
};

const mapStateToProps = state => ({
  profitAndLossReport: state.profitAndLoss.profitByYear,
  loading: state.loadings.fetchProfitByYear,
  mainCurrency: state.kassaReducer.mainCurrency,
});
export default connect(
  mapStateToProps,
  {}
)(Table);
