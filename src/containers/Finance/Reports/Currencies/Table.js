import React from 'react';
import { connect } from 'react-redux';
import { Table as ProTable } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';

export const getColumns = ({ column }) => {
    const columns = [];
    columns[column.indexOf('startAt')] = {
        title: 'Başlama tarixi',
        width: 250,
        dataIndex: 'startAt',
        align: 'left',
        render: value => value || '',
    };

    columns[column.indexOf('endAt')] = {
        title: 'Bitmə tarixi',
        width: 250,
        dataIndex: 'endAt',
        align: 'left',
        render: value => value || 'Davam edir',
    };
    columns[column.indexOf('currencyCode')] = {
        title: 'Valyuta',
        dataIndex: 'currencyCode',
        width: 120,
        align: 'center',
        render: value => value || '',
    };
    columns[column.indexOf('rate')] = {
        title: 'Son məzənnə',
        dataIndex: 'rate',
        width: 150,
        align: 'right',
        render: value => formatNumberToLocale(defaultNumberFormat(value)),
    };
    columns[column.indexOf('prevRate')] = {
        title: 'Əvvəlki məzənnə',
        dataIndex: 'prevRate',
        width: 150,
        align: 'right',
        render: value => formatNumberToLocale(defaultNumberFormat(value)),
    };
    columns[column.indexOf('dynamicsPercent')] = {
        title: 'Dinamika (%)',
        dataIndex: 'dynamicsPercent',
        width: 150,
        align: 'right',
        render: (value, row) =>
            value ? `${value}%` : row.prevRate ? '0%' : '100%',
    };

    columns.unshift({
        title: '№',
        width: 60,
        render: (value, row, index) => index + 1,
    });

    return columns;
};
const Table = props => {
    const { currencyReport, currenctReportLoading, visibleColumns } = props;

    return (
        <ProTable
            loading={currenctReportLoading}
            scroll={{ x: 'max-content', y: 500 }}
            dataSource={currencyReport}
            columns={getColumns({
                column: visibleColumns,
            })}
            rowKey={record => record.id}
        />
    );
};

const mapStateToProps = state => ({
    currenctReportLoading: state.loadings.fetchCurrencyReport,
    currencyReport: state.financeReportsReducer.currencyReport,
});
export default connect(
    mapStateToProps,
    {}
)(Table);
