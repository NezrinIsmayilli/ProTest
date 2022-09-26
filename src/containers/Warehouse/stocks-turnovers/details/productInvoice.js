/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Spin, Tooltip } from 'antd';
import ReactToPrint from 'react-to-print';
import { Table } from 'components/Lib';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    fullDateTimeWithSecond,
} from 'utils';
import styles from '../../styles.module.scss';

function ProductInvoice(props) {
    const {
        row,
        activeTab,
        suppliers,
        stockInfo,
        stockStatisticInfoLoading,
        mainCurrencyCode,
        permissionsByKeyValue,
        filters,
    } = props;

    const componentRef = useRef();

    const getInfoWithTotal = invoiceInfo =>
        invoiceInfo
            ? [
                ...invoiceInfo,
                {
                    isLastRow: true,
                    quantity: invoiceInfo.reduce(
                        (totalValue, currentValue) =>
                            totalValue + Number(currentValue.quantity),
                        0
                    ),
                    cost_per_unit: invoiceInfo.reduce(
                        (totalValue, currentValue) =>
                            totalValue + Number(currentValue.cost_per_unit),
                        0
                    ),
                    total_cost: invoiceInfo.reduce(
                        (totalValue, currentValue) =>
                            totalValue + Number(currentValue.total_cost),
                        0
                    ),
                    price_per_unit: invoiceInfo.reduce(
                        (totalValue, currentValue) =>
                            totalValue + Number(currentValue.price_per_unit),
                        0
                    ),
                    total_price: invoiceInfo.reduce(
                        (totalValue, currentValue) =>
                            totalValue + Number(currentValue.total_price),
                        0
                    ),
                },
            ]
            : [];

    const getColumns = () => {
        const columns = [
            {
                title: '№',
                width: 90,
                render: (value, row, index) =>
                    row.isLastRow ? 'Toplam' : index + 1,
            },
            {
                title: 'Tarix',
                dataIndex: 'operation_date',
                width: 150,
                align: 'left',
                render: (value, row) =>
                    row.isLastRow
                        ? ''
                        : moment(value).format(fullDateTimeWithSecond),
            },
            {
                title: 'Hərəkətsizlik müddəti',
                dataIndex: 'days_count_in_stock',
                width: 150,
                align: 'left',
            },
            {
                title: 'Qaimə',
                dataIndex: 'invoice_number',
                width: 130,
                align: 'left',
                render: (value, row) => (row.isLastRow ? '' : value),
            },
            {
                title: activeTab === 1 ? 'Təchizatçı' : 'Qarşı tərəf',
                dataIndex: 'supplier_name',
                width: 200,
                ellipsis: true,
                align: 'center',
                render: (value, row) =>
                    row.isLastRow ? (
                        ''
                    ) : row.invoice_type === 11 ? (
                        'İSTEHSALAT'
                    ) : row.invoice_type === 7 ? (
                        'İlkin qalıq'
                    ) : (
                        <Tooltip placement="topLeft" title={value}>
                            <span>{value || '-'}</span>
                        </Tooltip>
                    ),
            },
            {
                title: 'Say',
                dataIndex: 'quantity',
                width: 150,
                align: 'center',
                render: value =>
                    formatNumberToLocale(defaultNumberFormat(value || 0)),
            },
            {
                title: 'Ölçü vahidi',
                dataIndex: 'unit_of_measurement',
                width: 100,
                align: 'center',
                render: (value, row) => (row.isLastRow ? '' : value || '-'),
            },
        ];

        if (permissionsByKeyValue.stock_report_details_cost.permission !== 0) {
            columns.push({
                title: 'Maya dəyəri',
                dataIndex: 'original_price',
                width: 150,
                align: 'right',
                render: (value, { isLastRow, original_currency_code }) =>
                    isLastRow
                        ? ''
                        : `${formatNumberToLocale(
                            defaultNumberFormat(value)
                        )} ${original_currency_code}`,
            });
        }
        if (
            permissionsByKeyValue.stock_report_details_cost_main.permission !==
            0
        ) {
            columns.push({
                title: `Maya dəyəri (${mainCurrencyCode})`,
                dataIndex: 'cost_per_unit',
                width: 150,
                align: 'right',
                render: (value, { isLastRow }) =>
                    isLastRow
                        ? null
                        : `${formatNumberToLocale(
                            defaultNumberFormat(value)
                        )} ${mainCurrencyCode}`,
            });
        }
        if (
            permissionsByKeyValue.stock_report_details_cost_total.permission !==
            0
        ) {
            columns.push({
                title: 'Toplam Maya dəyəri',
                dataIndex: 'total_cost',
                width: 180,
                align: 'right',
                render: value =>
                    `${formatNumberToLocale(
                        defaultNumberFormat(value)
                    )} ${mainCurrencyCode}`,
            });
        }

        return columns;
    };

    return (
        <Spin spinning={stockStatisticInfoLoading}>
            <div ref={componentRef} style={{ padding: 16 }}>
                <div className={styles.invoiceHeader}>
                    <span
                        className={styles.modalTitle}
                    >{`${row?.stock_name} - ${row?.product_name}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ReactToPrint
                            trigger={() => (
                                <Button
                                    className={styles.customSquareButton}
                                    style={{ marginRight: 10 }}
                                    shape="circle"
                                    disabled={!'name'}
                                    icon="printer"
                                />
                            )}
                            content={() => componentRef.current}
                        />
                    </div>
                </div>

                <Table
                    scroll={{ x: 'max-content', y: 400 }}
                    dataSource={getInfoWithTotal(stockInfo)}
                    className={styles.invoiceTable}
                    columns={getColumns()}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />
            </div>
        </Spin>
    );
}

const mapStateToProps = state => ({
    stockInfo: state.stockReducer.stockStaticsInfo,
    mainCurrencyCode: state.stockReducer.mainCurrencyCode,
    stockStatisticInfoLoading: state.loadings.fetchStockStaticsInfo,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {}
)(ProductInvoice);
