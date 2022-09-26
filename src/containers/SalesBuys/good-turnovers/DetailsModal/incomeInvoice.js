/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, DetailButton, ProModal } from 'components/Lib';
import { Tooltip } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import math from 'exact-math';
import InitialWarehouseDetails from 'containers/Settings/initialRemains/warehouse/initialRemainsWarehouse/initialWarehouseDetails';
import InvoiceMoreDetails from './invoiceDetail';
import styles from './styles.module.scss';
import ProductionsDetails from '../../Production/productionsDetails';

const IncomeInvoice = props => {
    const { details, isLoading, mainCurrency, fetchBusinessUnitList } = props;
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedRow, setSelectedRow] = useState({});
    const getInvoice = data => {
        if (data.length > 0) {
            const endPriceInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.endPriceInMainCurrency)
                    ),
                0
            );

            return endPriceInMainCurrency;
        }
        return data;
    };
    const handleDetailClick = row => {
        setVisible(!visible);
        setSelectedRow(row);
    };

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, []);

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 60,
            render: (value, row, index) => (row.totalRow ? null : index + 1),
        },
        {
            title: 'Tarix',
            width: 155,
            dataIndex: 'operationDate',
            render: (value, row) =>
                row.totalRow
                    ? 'Toplam:'
                    : `${value?.split(' ')[0]} ${value?.split(' ')[1]}` || '-',
        },
        {
            title: 'Qarşı tərəf',
            width: 140,
            dataIndex: 'counterparty',
            ellipsis: true,
            render: (value, row) =>
                row.totalRow ? null : row.invoiceType === 11 ? (
                    'İSTEHSALAT'
                ) : row.invoiceType === 7 ? (
                    'İlkin qalıq'
                ) : (
                    <Tooltip placement="topLeft" title={value || ''}>
                        <span>{value || '-'}</span>
                    </Tooltip>
                ),
        },
        {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 120,
            render: (value, row) => (row.totalRow ? null : value || '-'),
        },
        {
            title: 'Müqavilə',
            dataIndex: 'contractNo',
            width: 120,
            render: (value, row) => (row.totalRow ? null : value || '-'),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'endPrice',
            width: 130,
            align: 'right',
            render: (value, row) =>
                row.totalRow
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row.currencyCode !== null
                              ? row.currencyCode
                              : mainCurrency?.code
                      }`,
        },
        {
            title: `Məbləğ (${mainCurrency?.code})`,
            dataIndex: 'endPriceInMainCurrency',
            width: 130,
            align: 'right',
            render: value =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    mainCurrency?.code
                }`,
        },
        {
            title: 'Satış meneceri',
            dataIndex: 'salesmanName',
            align: 'left',
            width: 130,
            render: (value, row) =>
                row.totalRow ? null : row.invoiceType === 7 ? (
                    '-'
                ) : `${value} ${row.salesmanLastName}`.length > 10 ? (
                    <Tooltip title={`${value} ${row.salesmanLastName}`}>
                        {`${value} ${row.salesmanLastName}`.substring(0, 10)}...
                    </Tooltip>
                ) : (
                    `${value} ${row.salesmanLastName}` || '-'
                ),
        },
        {
            title: 'Seç',
            width: 60,
            key: 'detailButton',
            align: 'center',
            render: row =>
                row.totalRow ? null : (
                    <DetailButton onClick={() => handleDetailClick(row)} />
                ),
        },
    ];

    return (
        <>
            {selectedRow?.invoiceType === 11 ? (
                <ProModal
                    maskClosable
                    padding
                    width={selectedRow.stockToId === null ? 1000 : 1200}
                    handleModal={handleDetailClick}
                    isVisible={details}
                >
                    <ProductionsDetails
                        row={selectedRow}
                        mainCurrencyCode={mainCurrency?.code}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onCancel={handleDetailClick}
                        visible={details}
                        fromGoods
                        {...props}
                    />
                </ProModal>
            ) : selectedRow?.invoiceType === 7 ? (
                <ProModal
                    maskClosable
                    padding
                    width={selectedRow.stockToId === null ? 1000 : 1200}
                    handleModal={handleDetailClick}
                    isVisible={details}
                >
                    <InitialWarehouseDetails
                        row={selectedRow}
                        mainCurrencyCode={mainCurrency}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onCancel={handleDetailClick}
                        visible={visible}
                        allBusinessUnits={allBusinessUnits}
                        {...props}
                    />
                </ProModal>
            ) : (
                <ProModal
                    maskClosable
                    padding
                    width={1000}
                    handleModal={handleDetailClick}
                    visible={visible}
                >
                    <InvoiceMoreDetails
                        row={selectedRow}
                        mainCurrencyCode={mainCurrency}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onCancel={handleDetailClick}
                        visible={visible}
                        {...props}
                    />
                </ProModal>
            )}{' '}
            <div style={{ marginTop: '30px' }}>
                <Table
                    scroll={{ x: 'max-content', y: 500 }}
                    dataSource={details}
                    className={styles.invoiceTable}
                    columns={columns}
                    pagination={false}
                    isLoading={isLoading}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />
                <div
                    style={{
                        width: 'calc(100% + 36px)',
                        fontSize: 14,
                        color: '#7c7c7c',
                        lineHeight: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 6,
                    }}
                >
                    <div
                        style={{ width: 97, paddingLeft: '15px' }}
                        className={styles.tdPadding}
                    >
                        <strong>Toplam:</strong>
                    </div>
                    <div style={{ width: 183 }} className={styles.tdPadding} />
                    <div style={{ width: 183 }} className={styles.tdPadding} />
                    <div style={{ width: 183 }} className={styles.tdPadding} />
                    <div style={{ width: 183 }} className={styles.tdPadding} />
                    <div style={{ width: 183 }} className={styles.tdPadding} />
                    <div style={{ width: 190 }} className={styles.tdPadding}>
                        <strong>
                            {defaultNumberFormat(getInvoice(details))} AZN
                        </strong>
                    </div>
                    <div style={{ width: 177 }} className={styles.tdPadding} />
                    <div style={{ width: 120 }} className={styles.tdPadding} />
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    isLoading: state.salesAndBuysReducer.isLoading,
});
export default connect(
    mapStateToProps,
    {
        fetchBusinessUnitList,
    }
)(IncomeInvoice);
