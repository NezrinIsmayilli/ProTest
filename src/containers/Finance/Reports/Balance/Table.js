import React from 'react';
import { connect } from 'react-redux';
import { Table as ProTable, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';

export const getColumns = ({ column, currencyCode, handleDetailClick }) => {
    const columns = [];

    columns[column.indexOf('tenantPersonName')] = {
        title: 'Təsisçi',
        dataIndex: 'tenantPersonName',
        width: 220,
        align: 'left',
        render: (
            value,
            { summaryRow, tenantPersonSurname, tenantPersonPatronymic }
        ) =>
            summaryRow
                ? null
                : `${value || ''} ${tenantPersonSurname ||
                      ''} ${tenantPersonPatronymic || ''}`,
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
        render: value =>
            `${formatNumberToLocale(
                defaultNumberFormat(value)
            )} ${currencyCode}`,
    };
    columns[column.indexOf('lastTransactionAmount')] = {
        title: 'Son ödəniş',
        dataIndex: 'lastTransactionAmount',
        width: 150,
        align: 'right',
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
        width: 100,
        render: (_value, { summaryRow }, index) =>
            summaryRow ? 'Toplam' : index + 1,
    });

    return columns;
};

const Table = props => {
    const {
        visibleColumns,
        currencyCode,
        getBalanceReport,
        balanceReport,
        handleDetailClick,
        balanceReportLoading,
    } = props;

    return (
        <ProTable
            loading={balanceReportLoading}
            scroll={{ x: 'max-content', y: 500 }}
            dataSource={getBalanceReport(balanceReport)}
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
    balanceReportLoading: state.loadings.fetchBalanceReport,
    balanceReport: state.financeReportsReducer.balanceReport,
});
export default connect(
    mapStateToProps,
    {}
)(Table);
