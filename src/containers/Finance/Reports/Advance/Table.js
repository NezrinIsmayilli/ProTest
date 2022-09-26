import React from 'react';
import { connect } from 'react-redux';
import { Table as ProTable, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { Tooltip } from 'antd';

export const getColumns = ({ column, currencyCode, handleDetailClick }) => {
    const columns = [];

    columns[column.indexOf('contactFullName')] = {
        title: 'Qarşı tərəf',
        dataIndex: 'contactFullName',
        align: 'left',
        ellipsis: true,
        render: value => (
            <Tooltip placement="topLeft" title={value || ''}>
                <span>{value || '-'}</span>
            </Tooltip>
        ),
    };
    columns[column.indexOf('amountCashOut')] = {
        title: 'Məxaric',
        dataIndex: 'amountCashOut',
        width: 150,
        align: 'right',
        render: value =>
            `${formatNumberToLocale(
                defaultNumberFormat(value)
            )} ${currencyCode}`,
    };
    columns[column.indexOf('amountCashIn')] = {
        title: 'Mədaxil',
        dataIndex: 'amountCashIn',
        width: 150,
        align: 'right',
        render: value =>
            `${formatNumberToLocale(
                defaultNumberFormat(value)
            )} ${currencyCode}`,
    };

    columns[column.indexOf('balance')] = {
        title: 'Balans',
        dataIndex: 'balance',
        width: 150,
        align: 'right',
        render: (value, { summaryRow }) =>
            summaryRow ? (
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`
            ) : (
                <span
                    style={
                        Number(value) > 0
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    {formatNumberToLocale(defaultNumberFormat(value))}{' '}
                    {currencyCode}
                </span>
            ),
    };
    columns[column.indexOf('lastTransactionAmount')] = {
        title: 'Son ödəniş',
        dataIndex: 'lastTransactionAmount',
        align: 'center',
        render: (value, { summaryRow }) =>
            summaryRow
                ? null
                : `${formatNumberToLocale(
                      defaultNumberFormat(value)
                  )} ${currencyCode}`,
    };
    columns[column.indexOf('lastTransactionDate')] = {
        title: 'Son ödəniş tarixi',
        dataIndex: 'lastTransactionDate',
        width: 200,
        align: 'center',
        render: (value, { summaryRow }) => (summaryRow ? null : `${value}`),
    };
    columns.push({
        title: 'Seç',
        width: 80,
        key: 'detailButton',
        align: 'center',
        render: row =>
            row.summaryRow ? null : (
                <DetailButton onClick={() => handleDetailClick(row)} />
            ),
    });

    columns.unshift({
        title: '№',
        dataIndex: 'id',
        align: 'left',
        width: 120,
        render: (_value, { summaryRow }, index) =>
            summaryRow ? 'Toplam' : index + 1,
    });

    return columns;
};

const Table = props => {
    const {
        currencyCode,
        visibleColumns,
        advanceReport,
        handleDetailClick,
        getAdvanceReport,
        advanceReportLoading,
    } = props;

    return (
        <ProTable
            loading={advanceReportLoading}
            scroll={{ x: 'max-content', y: 500 }}
            dataSource={getAdvanceReport(advanceReport)}
            columns={getColumns({
                column: visibleColumns,
                currencyCode,
                handleDetailClick,
            })}
            rowKey={record => record.id}
        />
    );
};

const mapStateToProps = state => ({
    advanceReportLoading: state.loadings.fetchAdvanceReport,
    advanceReport: state.financeReportsReducer.advanceReport,
});
export default connect(
    mapStateToProps,
    {}
)(Table);
