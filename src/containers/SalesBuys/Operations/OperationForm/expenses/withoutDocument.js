import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    setExpenses,
    setSelectedImportProducts,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import { Button, Row, Col } from 'antd';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    re_amount,
    roundToDown,
} from 'utils';
import { Table, ProModal } from 'components/Lib';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';

import math from 'exact-math';
import AddWithoutDocument from './AddWithoutDocument';
import Summary from './Summary';
import styles from '../styles.module.scss';
import EditModal from './editModal/index';

export const PopContent = ({ editClick, deleteClick, id, data }) => (
    <div className={styles.popContent}>
        {editClick && (
            <Button
                style={{ padding: '5px' }}
                className={styles.editIcon}
                type="button"
                onClick={() => editClick(id, data)}
            >
                <FaPencilAlt />
            </Button>
        )}
        {deleteClick && (
            <Button
                style={{ padding: '5px' }}
                type="button"
                className={styles.trashIconExpense}
                onClick={() => deleteClick(id)}
            >
                <FaTrash />
            </Button>
        )}
    </div>
);

const WithoutDocument = props => {
    const {
        form,
        id,
        selectedImportProducts,
        setSelectedImportProducts,
        invoiceCurrencyCode,
        rates,
        currencies,
        expenseRates,
        setSelectedProducts,
        selectedProducts,
    } = props;

    const [invoiceModalIsVisible, setInvoiceModalIsVisible] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(
        undefined
    );
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    const toggleCatalogModal = () => {
        setInvoiceModalIsVisible(prevValue => !prevValue);
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
                    endPrice: total,
                },
            ];
        }
        return [];
    }

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 50,
            render: (_, row, index) => (row.isTotal ? null : index + 1),
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 130,
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'name',
            ellipsis: true,
            width: 120,
            align: 'left',
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Valyuta',
            dataIndex: 'currencyCode',
            width: 100,
            align: 'left',
            render: (value, { isTotal }) => (isTotal ? null : value),
        },
        {
            title: 'Məbləğ',
            dataIndex: 'endPrice',
            width: 150,
            align: 'center',
            render: (value, { isTotal }) =>
                isTotal
                    ? null
                    : formatNumberToLocale(defaultNumberFormat(value)),
        },
        {
            title: `Məbləğ (${invoiceCurrencyCode})`,
            dataIndex: 'endPrice',
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
            dataIndex: 'id',
            key: 'trashIcon',
            align: 'center',
            width: 80,
            render: (value, row, index) =>
                row?.isTotal ? null : (
                    <PopContent
                        id={index}
                        data={row}
                        editClick={editClick}
                        deleteClick={deleteClick}
                    />
                ),
        },
    ];

    const editClick = (id, row) => {
        setEditModal(!editModal);
        setSelectedRow(row);
        setSelectedItemForUpdate(id);
    };

    const deleteClick = id => {
        setSelectedProducts({
            newSelectedProducts: selectedProducts.map(selectedProduct => ({
                ...selectedProduct,
                fromEdit: false,
            })),
        });
        const newSelectedProductionExpense = selectedImportProducts
            ?.filter(({ expenseInvoiceId }) => expenseInvoiceId === null)
            ?.filter((selectedProduct, index) => index !== id);
        const invoiceData = selectedImportProducts?.filter(
            ({ expenseInvoiceId }) => expenseInvoiceId !== null
        );
        setSelectedImportProducts([
            ...newSelectedProductionExpense,
            ...invoiceData,
        ]);
    };
    const onSuccessAddModal = () => {};
    return (
        <>
            <EditModal
                isVisible={editModal}
                setIsVisible={setEditModal}
                onSuccessAddModal={onSuccessAddModal}
                row={selectedRow}
                selectedItemForUpdate={selectedItemForUpdate}
                currencies={currencies}
                setSelectedImportProducts={setSelectedImportProducts}
                selectedImportProducts={selectedImportProducts}
            />
            <ProModal
                maskClosable
                padding
                width={1100}
                handleModal={() => setInvoiceModalIsVisible(false)}
                isVisible={invoiceModalIsVisible}
            >
                <AddWithoutDocument
                    visible={invoiceModalIsVisible}
                    toggleModal={toggleCatalogModal}
                    setVisible={setInvoiceModalIsVisible}
                    setSelectedInvoices={setSelectedInvoices}
                    rates={rates}
                />
            </ProModal>
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

                    <div className={styles.Header}>
                        <span className={styles.newOperationTitle}>
                            Sənədsiz ödənişlər
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
                                        title="Əlavə et"
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
                                    expenseInvoiceId === null
                            )
                        )}
                        className={styles.customTable}
                        columns={columns}
                        pagination={false}
                        rowKey={record => record.id}
                    />

                    <Summary rates={rates} expenseRates={expenseRates} />
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    selectedImportProducts: state.salesOperation.selectedImportProducts,
    invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
    currencies: state.kassaReducer.currencies,
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        setExpenses,
        setSelectedImportProducts,
        setSelectedProducts,
    }
)(WithoutDocument);
