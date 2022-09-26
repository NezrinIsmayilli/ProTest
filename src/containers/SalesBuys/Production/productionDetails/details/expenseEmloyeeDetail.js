import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { Table, Checkbox, Tooltip } from 'antd';
import { setSelectedProductionEmployeeExpense } from 'store/actions/sales-operation';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

const math = require('exact-math');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong>{quantity}</strong>
        <strong style={{ marginRight: '5%' }}>{secondary}</strong>
    </div>
);
function ExpenseEmployeeDetail({
    mainCurrencyCode,
    selectedProductionEmployeeExpense,
}) {
    const componentRef = useRef();

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 50,
            render: (value, row, index) => index + 1,
        },
        {
            title: 'Tarix',
            dataIndex: 'date',
            width: 120,
        },
        {
            title: 'Ştat növü',
            dataIndex: 'staffEmployeeId',
            width: 110,
            align: 'left',
            render: value => (value !== null ? 'Ştat' : 'Ştatdankənar'),
        },
        {
            title: 'Əməkdaşın adı',
            dataIndex: 'employeeName',
            width: 200,
            className: styles.employeeTd,
            ellipsis: {
                showTitle: false,
            },
            align: 'left',
            render: (value, row) =>
                row?.staffEmployeeId !== null ? (
                    <Tooltip
                        placement="topLeft"
                        title={`${
                            row.staffEmployeeName
                        } ${row.staffEmployeeSurname ||
                            ''}  ${row.staffEmployeePatronymic || ''}`}
                    >
                        <span>{`${
                            row.staffEmployeeName
                        } ${row.staffEmployeeSurname ||
                            ''}  ${row.staffEmployeePatronymic || ''}`}</span>
                    </Tooltip>
                ) : (
                    <Tooltip placement="topLeft" title={value}>
                        <span>{value}</span>
                    </Tooltip>
                ),
        },
        {
            title: 'Tip',
            dataIndex: 'type',
            width: 110,
            align: 'center',
            render: value => (value === 1 ? 'Vaxtamuzd' : 'İşəmuzd'),
        },
        {
            title: 'Saat',
            dataIndex: 'hours',
            width: 80,
            align: 'center',
            render: value =>
                value ? formatNumberToLocale(defaultNumberFormat(value)) : '-',
        },
        {
            title: `Məbləğ (${mainCurrencyCode})`,
            dataIndex: 'price',
            align: 'center',
            width: 120,
            render: value =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value || 0)
                )} ${mainCurrencyCode}`,
        },
        {
            title: 'ƏH tətbiq olunsun',
            dataIndex: 'applyToSalary',
            width: 80,
            align: 'left',
            render: (value, row) =>
                row.staffEmployeeId !== null ? (
                    <Checkbox disabled checked={value} />
                ) : (
                    '-'
                ),
        },
        {
            title: `Toplam (${mainCurrencyCode})`,
            dataIndex: 'hours',
            align: 'center',
            width: 120,
            render: (value, row) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(
                        value
                            ? Number(value) > 0 && Number(row.price) > 0
                                ? math.mul(Number(value), Number(row.price))
                                : 0
                            : row.price || 0
                    )
                )} ${mainCurrencyCode}`,
        },
    ];

    return (
        <div ref={componentRef} style={{ width: '100%', padding: '20px' }}>
            <div className={styles.exportBox}>
                <span
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginRight: '50px',
                    }}
                >
                    İşçilik
                </span>
            </div>

            <div
                className={styles.opInvTable}
                style={{
                    marginTop: 32,
                    maxHeight: 600,
                    paddingRight: 8,
                    overflowY: 'auto',
                }}
            >
                <Table
                    scroll={{ x: 'max-content' }}
                    dataSource={selectedProductionEmployeeExpense}
                    className={styles.opInvoiceContentTable}
                    columns={columns}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />
            </div>
            <FooterRow
                primary="Toplam"
                secondary={`${formatNumberToLocale(
                    defaultNumberFormat(
                        selectedProductionEmployeeExpense.reduce(
                            (total, { price, hours }) =>
                                math.add(
                                    total,
                                    math.mul(
                                        Number(price),
                                        Number(hours || 1)
                                    ) || 0
                                ),
                            0
                        )
                    )
                )} ${mainCurrencyCode} `}
            />
        </div>
    );
}
const mapStateToProps = state => ({
    selectedProductionEmployeeExpense:
        state.salesOperation.selectedProductionEmployeeExpense,
});

export default connect(
    mapStateToProps,
    {
        setSelectedProductionEmployeeExpense,
    }
)(ExpenseEmployeeDetail);
