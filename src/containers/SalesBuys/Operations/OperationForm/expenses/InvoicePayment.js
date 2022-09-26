import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    setExpenses,
    setSelectedImportProducts,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import { Row, Col } from 'antd';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    re_amount,
    roundToDown,
} from 'utils';
import { Table, ProInput, CustomTag } from 'components/Lib';
import RecievablesInvoiceAction from 'components/Lib/Details/RecievablesInvoiceAction';
import { FaPlus } from 'react-icons/fa';
import math from 'exact-math';
import AddInvoice from './AddInvoice';
import { Trash } from '../invoice';
import styles from '../styles.module.scss';

const InvoicePayment = props => {
    const {
        form,
        id,
        selectedImportProducts,
        setSelectedImportProducts,
        invoiceCurrencyCode,
        rates,
        invoiceInfo,
        setSelectedProducts,
        selectedProducts,
    } = props;

    const [invoiceModalIsVisible, setInvoiceModalIsVisible] = useState(false);

    const toggleCatalogModal = () => {
        setInvoiceModalIsVisible(prevValue => !prevValue);
    };

    const handleExpenseRemove = expenseId => {
        const newExpenses = selectedImportProducts?.filter(
            ({ expenseInvoiceId }) => expenseInvoiceId !== expenseId
        );
        setSelectedImportProducts(newExpenses);
    };

    const onChange = (productId, newPrice, limit = 100000000) => {
        if (
            (re_amount.test(Number(newPrice)) &&
                Number(newPrice) <= Number(limit)) ||
            newPrice === ''
        ) {
            setSelectedProducts({
                newSelectedProducts: selectedProducts?.map(selectedProduct => ({
                    ...selectedProduct,
                    fromEdit: false,
                })),
            });
            const newSelectedProducts = selectedImportProducts?.map(
                (selectedProduct, index) => {
                    if (selectedProduct.id === productId) {
                        return {
                            ...selectedProduct,
                            usedPrice: newPrice,
                        };
                    }
                    return selectedProduct;
                }
            );

            setSelectedImportProducts(newSelectedProducts);
        }
    };

    function addTotals(data) {
        if (data.length > 0) {
            const total = roundToDown(
                data.reduce(
                    (total, { usedPrice, currencyId }) =>
                        math.add(
                            total,
                            Number(
                                math.mul(
                                    Number(
                                        rates[
                                            [
                                                ...new Set(
                                                    selectedImportProducts.map(
                                                        ({ currencyId }) =>
                                                            Number(currencyId)
                                                    )
                                                ),
                                            ].indexOf(currencyId)
                                        ]?.rate || 1
                                    ),
                                    Number(usedPrice || 0)
                                )
                            ) || 0
                        ),
                    0
                )
            );
            return [
                ...data,
                {
                    isTotal: true,
                    usedPrice: total,
                },
            ];
        }
        return [];
    }

    const getStatusLabel = invoiceType =>
        invoiceType === 1
            ? 'Açıq'
            : invoiceType === 2
            ? 'Qismən ödənilib'
            : 'Ödənilib';
    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (_, row, index) => (row.isTotal ? null : index + 1),
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 150,
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'counterparty',
            ellipsis: true,
            width: 120,
            align: 'left',
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 130,
            align: 'left',
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Status',
            dataIndex: 'statusOfOperation',
            align: 'center',
            width: 130,
            render: (value, { isTotal }) =>
                isTotal ? null : <CustomTag label={getStatusLabel(value)} />,
        },
        {
            title: 'Məbləğ',
            dataIndex: 'endPrice',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row?.isTotal
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row?.currencyCode
                      }`,
        },
        {
            title: 'Tədbiq olunan qiymət',
            dataIndex: 'usedPrice',
            width: 150,
            align: 'center',
            render: (value, row, index) =>
                row?.isTotal ? null : (
                    <ProInput
                        size="default"
                        value={value}
                        onChange={e =>
                            onChange(row.id, e.target.value, row.endPrice)
                        }
                        className={`${
                            Number(value || 0) > 0 ? {} : styles.inputError
                        } ${styles.tableInput}`}
                    />
                ),
        },
        {
            title: `Məbləğ (${invoiceCurrencyCode})`,
            dataIndex: 'usedPrice',
            width: 150,
            align: 'center',
            render: (value, row) =>
                row?.isTotal
                    ? formatNumberToLocale(defaultNumberFormat(value))
                    : formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  Number(
                                      rates[
                                          [
                                              ...new Set(
                                                  selectedImportProducts.map(
                                                      ({ currencyId }) =>
                                                          Number(currencyId)
                                                  )
                                              ),
                                          ].indexOf(row.currencyId)
                                      ]?.rate || 1
                                  ),
                                  Number(value)
                              ) || 0
                          )
                      ),
        },
        {
            title: 'Seç',
            dataIndex: 'expenseInvoiceId',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: (value, row) =>
                row?.isTotal ? null : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RecievablesInvoiceAction
                            row={row}
                            invoiceId={value}
                            forImport
                        />
                        <Trash
                            value={value}
                            handleProductRemove={handleExpenseRemove}
                        />
                    </div>
                ),
        },
    ];

    return (
        <>
            <AddInvoice
                isVisible={invoiceModalIsVisible}
                toggleModal={toggleCatalogModal}
                invoiceInfo={invoiceInfo}
                id={id}
            />
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    {/* <Modal
                    visible={financeDeleteVisible}
                    footer={null}
                    className={styles.customDeleteModal}
                    onCancel={() => setFinanceDeleteVisible(false)}
                >
                    <div style={{ padding: 24, paddingBottom: 12 }}>
                        <h6 className={styles.modalTitle}>
                            Silinmə səbəbini qeyd edin
                        </h6>
                        <TextArea
                            rows={4}
                            onChange={e => {
                                setDescription(e.target.value);
                            }}
                            value={description}
                        />

                        <Divider style={{ marginBottom: 0 }} />
                    </div>
                    <div className={styles.modalAction}>
                        <Button
                            type="primary"
                            onClick={handleDelete}
                            style={{ marginRight: 6 }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <MdCheckCircle
                                    size={18}
                                    style={{ marginRight: 4 }}
                                />
                                Təsdiq et
                            </div>
                        </Button>
                        <Button
                            type="primary"
                            className={styles.rejectButton}
                            onClick={() => setFinanceDeleteVisible(false)}
                            style={{ marginRight: 6 }}
                        >
                            <MdClose size={18} style={{ marginRight: 4 }} />
                            İmtina
                        </Button>
                    </div>
                </Modal> */}

                    <div
                        id="recievablesActionDropDown"
                        className={styles.Header}
                    >
                        <span className={styles.newOperationTitle}>
                            Qaimə üzrə ödənişlər
                        </span>
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
                                        onClick={() =>
                                            setInvoiceModalIsVisible(true)
                                        }
                                        title="Qaimə əlavə et"
                                        styleAddOns={{
                                            padding: '6px 16px',
                                        }}
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
                    </div>
                    <Table
                        scroll={{ x: 'max-content', y: 500 }}
                        dataSource={addTotals(
                            selectedImportProducts?.filter(
                                ({ expenseInvoiceId }) =>
                                    expenseInvoiceId !== null
                            )
                        )}
                        className={styles.customTable}
                        columns={columns}
                        pagination={false}
                        rowKey={record => record.id}
                    />
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    selectedImportProducts: state.salesOperation.selectedImportProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        setExpenses,
        setSelectedImportProducts,
        setSelectedProducts,
    }
)(InvoicePayment);
