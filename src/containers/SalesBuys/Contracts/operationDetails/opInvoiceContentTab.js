/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Table } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import { connect } from 'react-redux';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import math from 'exact-math';
import { DetailButton, ProModal } from 'components/Lib';

import OperationsDetails from './operationsDetails';
import styles from '../AddContract/forms/#shared/styles.module.scss';

function OpInvoiceContentTab(props) {
    const {
        isLoading,
        invoices,
        contractName,
        currencyCode,
        permissionsList,
        mainCurrency,
        fetchBusinessUnitList,
        fetchCreditPayments,
    } = props;

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 80,
            render: (value, row, index) => !row.isTotal && index + 1,
        },
        {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 140,
            render: (value, row) => !row.isTotal && value,
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 140,
            align: 'left',
            render: (value, row) => !row.isTotal && value?.split('  '),
        },
        {
            title: 'Status',
            dataIndex: 'paymentStatus',
            width: 150,
            render: (value, row) =>
                !row.isTotal &&
                (row.paymentStatus !== 3 && Number(row.endPrice) !== 0) ? (
                    <span
                        className={styles.chip}
                        style={
                            value === 3
                                ? {
                                      color: '#55AB80',
                                      background: '#EBF5F0',
                                  }
                                : value === 1
                                ? {
                                      color: '#4E9CDF',
                                      background: '#EAF3FB',
                                  }
                                : {
                                      color: '#F3B753',
                                      background: '#FDF7EA',
                                  }
                        }
                    >
                        {value === 3
                            ? 'Ödənilib'
                            : value === 2
                            ? 'Qismən ödənilib'
                            : ' Açıq'}
                    </span>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'endPrice',
            align: 'right',
            width: 130,
            render: (value, row) =>
                row?.invoiceType === 3 || row?.invoiceType === 4 ? (
                    <span style={{ color: '#FF716A' }}>
                        {formatNumberToLocale(
                            defaultNumberFormat(math.mul(value, -1))
                        )}{' '}
                        {currencyCode}
                    </span>
                ) : (
                    `${formatNumberToLocale(
                        defaultNumberFormat(value)
                    )} ${currencyCode}`
                ),
        },
        {
            title: 'Ödənilib',
            dataIndex: 'paidAmount',
            align: 'right',
            width: 130,
            render: (value, row) =>
                row?.invoiceType === 3 || row?.invoiceType === 4 ? (
                    <span style={{ color: '#FF716A' }}>
                        {formatNumberToLocale(
                            defaultNumberFormat(math.mul(Number(value), -1))
                        )}{' '}
                        {currencyCode}
                    </span>
                ) : (
                    `${formatNumberToLocale(
                        defaultNumberFormat(value)
                    )} ${currencyCode}`
                ),
        },
        {
            title: 'Ödənilib(%)',
            align: 'right',
            width: 130,
            render: (row, { endPrice, paidAmount }) =>
                row?.invoiceType === 3 || row?.invoiceType === 4 ? (
                    <span style={{ color: '#FF716A' }}>
                        {formatNumberToLocale(
                            defaultNumberFormat(
                                (Number(paidAmount) * 100) / Number(endPrice)
                            )
                        )}
                        %
                    </span>
                ) : Number(endPrice) === 0 ? (
                    '0.00%'
                ) : (
                    `${formatNumberToLocale(
                        defaultNumberFormat(
                            (Number(paidAmount) * 100) / Number(endPrice)
                        )
                    )}%`
                ),
        },
        {
            title: 'Ödənilməlidir',
            align: 'right',
            width: 130,
            render: (row, { endPrice, paidAmount }) =>
                row?.invoiceType === 3 || row?.invoiceType === 4 ? (
                    <span style={{ color: '#FF716A' }}>
                        -
                        {formatNumberToLocale(
                            defaultNumberFormat(
                                Number(endPrice) - Number(paidAmount)
                            )
                        )}{' '}
                        {currencyCode}
                    </span>
                ) : (
                    `${formatNumberToLocale(
                        defaultNumberFormat(
                            Number(endPrice) - Number(paidAmount)
                        )
                    )} ${currencyCode}`
                ),
        },
        {
            title: 'Seç',
            dataIndex: 'id',
            width: 100,
            align: 'center',
            render: (value, row) => 
                row.isTotal ? (
                    ''
                ) : (
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <DetailButton
                            disabled={
                                row.invoiceType === 1
                                    ? permissionsList.purchase_invoice
                                          .permission === 0
                                    : row.invoiceType === 2
                                    ? permissionsList.sales_invoice
                                          .permission === 0
                                    : row.invoiceType === 3
                                    ? permissionsList
                                          .return_from_customer_invoice
                                          .permission === 0
                                    : permissionsList.return_to_supplier_invoice
                                          .permission === 0
                            }
                            onClick={() => handleDetailsModal(row)}
                        />
                    </div>
                ),
        },
    ];
    const componentRef = useRef();
    const [details, setDetails] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [credits, setCredits] = useState([]);

    const getTotalAmounts = invoices => {
        const totalEndPrices = invoices.reduce(
            (all, current) =>
                math.add(
                    all || 0,
                    current.invoiceType === 3 || current.invoiceType === 4
                        ? Number(math.mul(current.endPrice, -1))
                        : Number(current.endPrice)
                ),
            0
        );

        const totalPaidAmount = invoices.reduce(
            (all, current) =>
                math.add(
                    all || 0,
                    current.invoiceType === 3 || current.invoiceType === 4
                        ? Number(math.mul(Number(current.paidAmount), -1))
                        : Number(current.paidAmount)
                ),
            0
        );

        return [
            {
                isTotal: true,
                endPrice: totalEndPrices,
                paidAmount: totalPaidAmount,
            },
        ];
    };

    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
    };

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
        fetchCreditPayments({
            filters: { limit: 1000 },
            onSuccessCallback: response => {
                setCredits(response.data);
            },
        });
    }, []);
    return (
        <>
            <ProModal
                maskClosable
                padding
                isVisible={details}
                handleModal={handleDetailsModal}
                width={activeTab === 0 ? 760 : 1200}
            >
                <OperationsDetails
                    row={selectedRow}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={details}
                    allBusinessUnits={allBusinessUnits}
                    credits={credits}
                    {...props}
                />
            </ProModal>

            <div
                ref={componentRef}
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div
                    className={styles.exportBox}
                    style={{
                        justifyContent: 'space-between',
                        width: '100%',
                        marginTop: 40,
                    }}
                >
                    <div className={styles.exportBox}>
                        <div
                            className={styles.columnDetailItem}
                            style={{ marginBottom: 6 }}
                        >
                            <label
                                style={{
                                    fontWeight: 600,
                                    fontSize: 24,
                                    lineHeight: '24px',
                                    marginBottom: 10,
                                    color: '#373737',
                                }}
                            >
                                {contractName}
                            </label>

                            <span
                                style={{
                                    fontSize: 18,
                                    lineHeight: '16px',

                                    color: '#CBCBCB',
                                }}
                            >
                                Qaimə
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            className={styles.customSquareButton}
                            shape="circle"
                            icon="file-excel"
                        />
                    </div>
                </div>

                <div
                    className={styles.opInvTable}
                    style={{
                        width: 'calc(100% + 30px)',
                        marginTop: 32,
                        maxHeight: 600,
                        paddingRight: 8,
                        overflowY: 'auto',
                        marginRight: -16,
                    }}
                >
                    <Table
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        dataSource={invoices}
                        className={styles.opInvoiceContentTable}
                        columns={columns}
                        pagination={false}
                        rowKey={record => record.id}
                        rowClassName={styles.row}
                    />
                    {invoices?.length > 0 && (
                        <Table
                            scroll={{ x: 'max-content' }}
                            dataSource={getTotalAmounts(invoices)}
                            className={styles.totalTable}
                            columns={columns}
                            pagination={false}
                            rowKey={record => record.id}
                            rowClassName={styles.row}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

const mapStateToProps = state => ({
    isLoading: state.salesAndBuysReducer.isLoading,
    mainCurrency: state.kassaReducer.mainCurrency,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
});
export default connect(
    mapStateToProps,
    { fetchSalesInvoiceList, fetchBusinessUnitList, fetchCreditPayments }
)(OpInvoiceContentTab);
