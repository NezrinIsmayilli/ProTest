/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { DeleteTwoTone } from '@ant-design/icons';
import { Table, ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import OpFinOpInvoiceMoreDetails from 'components/Lib/Modals/Details/opFinOpInvoiceMoreDetails';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { Row, Col } from 'antd';
import styles from '../../../styles.module.scss';
import ExpenseAdd from './expenseAdd';

const math = require('exact-math');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong></strong>
        <strong style={{ marginLeft: '50px' }}>{quantity}</strong>
        <strong>{secondary}</strong>
    </div>
);
const ExpenseTable = props => {
    const {
        mainCurrency,
        selectedProductionExpense,
        productionExpensesListLoading,
        deleteFinanceOperationsLoading,
        isLoading,
        productionExpensesList,
        changeCost,
        setFinanceDeleteVisible,
        setSelectedRow,
        selectedRow,
        disabledDate,
    } = props;

    const [visible, setVisible] = useState(false);
    const [modalIsVisible, setModalIsVisible] = useState(false);

    useEffect(() => {
        if (!visible) {
            setSelectedRow(undefined);
        }
    }, [visible]);

    const handleDetailsModal = row => {
        setVisible(!visible);
        setSelectedRow(row);
    };
    const setFinanceDelete = row => {
        setFinanceDeleteVisible(true);
        setSelectedRow(row);
    };
    const columns = [
        {
            title: '№',
            width: 30,
            render: (val, row, index) => index + 1,
        },
        {
            title: 'Tarix',
            dataIndex: 'dateOfTransaction',
            key: 'dateOfTransaction',
            render: value => value || '-',
        },
        {
            title: 'Sənəd',
            dataIndex: 'documentNumber',
            render: value => value || 'Sənədsiz',
        },
        {
            title: 'Xərc maddəsi',
            dataIndex: 'categoryName',
            render: (value, row) =>
                row.id !== 'default'
                    ? row.transactionCatalogName !== null
                        ? row.transactionCatalogName
                        : value || '-'
                    : '-',
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'subCategoryName',
            render: (value, row) =>
                row.id !== 'default'
                    ? row.transactionCatalogName !== null
                        ? row.transactionItemName
                        : value || '-'
                    : '-',
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'contactOrEmployee',
            render: (value, row) =>
                row.id !== 'default'
                    ? row.transactionCatalogName !== null
                        ? `${row.employeeName} ${row.employeeSurname || ''}`
                        : value || '-'
                    : '-',
        },
        {
            title: 'Məbləğ',
            dataIndex: 'amount',
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`,
        },
        {
            title: `Məbləğ (${mainCurrency?.code})`,
            dataIndex: 'amountConvertedToMainCurrency',
            align: 'center',
            render: value =>
                ` ${formatNumberToLocale(defaultNumberFormat(value))} ${
                    mainCurrency?.code
                }`,
        },
        {
            title: 'Seç',
            align: 'center',
            render: row => (
                <div>
                    <DetailButton
                        style={
                            productionExpensesList.length > 0 &&
                            row.id === 'default'
                                ? { marginRight: '17px' }
                                : {}
                        }
                        onClick={() =>
                            row.id === 'default'
                                ? setModalIsVisible(true)
                                : handleDetailsModal(row)
                        }
                    />
                    {row.id !== 'default' ? (
                        <DeleteTwoTone
                            style={{ fontSize: '16px', cursor: 'pointer' }}
                            onClick={() => setFinanceDelete(row)}
                            twoToneColor="#eb2f96"
                        />
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <>
            <ProModal
                maskClosable
                padding
                width={1000}
                handleModal={() => setModalIsVisible(false)}
                isVisible={modalIsVisible}
            >
                <ExpenseAdd
                    visible={modalIsVisible}
                    setVisible={setModalIsVisible}
                    mainCurrency={mainCurrency}
                    changeCost={changeCost}
                    disabledDate={disabledDate}
                />
            </ProModal>
            <ProModal
                maskClosable
                padding
                width={800}
                handleModal={handleDetailsModal}
                isVisible={visible}
            >
                <OpFinOpInvoiceMoreDetails
                    onCancel={handleDetailsModal}
                    visible={visible}
                    row={selectedRow || []}
                />
            </ProModal>

            <Row style={{ margin: '20px 0' }}>
                <Col span={24}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <ButtonGreen
                            onClick={() => setModalIsVisible(true)}
                            title="Əlavə et"
                            styleAddOns={{ padding: '6px 16px' }}
                            icon={
                                <FaPlus
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        marginRight: '5px',
                                    }}
                                />
                            }
                        />
                    </div>
                </Col>
            </Row>
            <Table
                scroll={{ x: 'max-content' }}
                loading={
                    isLoading ||
                    productionExpensesListLoading ||
                    deleteFinanceOperationsLoading
                }
                dataSource={
                    selectedProductionExpense.length > 0
                        ? [
                              {
                                  id: 'default',
                                  amount: selectedProductionExpense.reduce(
                                      (total, { price }) =>
                                          math.add(total, Number(price) || 0),
                                      0
                                  ),
                                  amountConvertedToMainCurrency: selectedProductionExpense.reduce(
                                      (total, { price }) =>
                                          math.add(total, Number(price) || 0),
                                      0
                                  ),
                                  currencyCode: mainCurrency?.code,
                              },
                              ...productionExpensesList.filter(
                                  item =>
                                      item.transactionType === 8 ||
                                      item.transactionType === 9
                              ),
                          ]
                        : productionExpensesList.filter(
                              item =>
                                  item.transactionType === 8 ||
                                  item.transactionType === 9
                          )
                }
                rowKey={record => record.id}
                columns={columns}
            />
            <FooterRow
                primary="Toplam"
                quantity={`${formatNumberToLocale(
                    defaultNumberFormat(
                        math.add(
                            selectedProductionExpense.reduce(
                                (total, { price }) =>
                                    math.add(total, Number(price) || 0),
                                0
                            ),
                            productionExpensesList
                                .filter(
                                    item =>
                                        item.transactionType === 8 ||
                                        item.transactionType === 9
                                )
                                .reduce(
                                    (
                                        total,
                                        { amountConvertedToMainCurrency }
                                    ) =>
                                        math.add(
                                            total,
                                            Number(
                                                amountConvertedToMainCurrency
                                            ) || 0
                                        ),
                                    0
                                )
                        )
                    )
                )} ${mainCurrency?.code} `}
            />
        </>
    );
};

const mapStateToProps = state => ({
    isLoading: state.loadings.fetchProductionExpense,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
    productionExpensesList: state.salesOperation.productionExpensesList,
    productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
    deleteFinanceOperationsLoading: state.loadings.deleteFinanceOperations,
});

export default connect(
    mapStateToProps,
    {}
)(ExpenseTable);
