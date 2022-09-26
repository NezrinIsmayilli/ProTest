import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    Table,
    ProModal,
    ProButton,
    ProInput,
    DetailButton,
    ProSelect,
} from 'components/Lib';
import { cookies } from 'utils/cookies';
import { defaultNumberFormat, formatNumberToLocale, customRound } from 'utils';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import OperationsDetails from 'containers/SalesBuys/Operations/operationsDetails';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { Checkbox, Input } from 'antd';
import { AddFormModal } from 'containers/Settings/#shared';
import { getInvoiceList } from './actions';

import styles from '../styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong></strong>
        <strong>{quantity}</strong>
        <strong style={{ marginRight: '7%' }}>{secondary}</strong>
        <strong></strong>
    </div>
);

const AddInvoice = props => {
    const {
        editId,
        isVisible,
        fetchSalesInvoiceList,
        fetchBusinessUnitList,
        setIsVisible,
        invoiceInfo,
        counterparty,
        type,
        selectedInvoices,
        setSelectedInvoices,
        checkList,
        setCheckList,
        invoices,
        mainCurrency,
        operationsList,
        Voices,
        paymentAmount,
        invoiceData,
        setInvoiceData,
        setFieldsValue,
        currencies,
        invoiceLoading,
        setUseAdvance,
    } = props;

    const [invoice, setInvoice] = useState([]);
    const [allInvoice, setAllInvoice] = useState([]);
    const [filters, setFilters] = useState([]);
    const [details, setDetails] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [vatChecked, setVatChecked] = useState(false);

    const handleCreateInvoice = () => {
        if (checkList.checkedListAll.length > 1) {
            setUseAdvance(false);
        }
        if (!checkList.checkedListAll.includes(invoiceData?.invoice?.id)) {
            setInvoiceData(prevData => ({
                ...prevData,
                invoice: undefined,
            }));
            setFieldsValue({ invoice: undefined, paymentAmount: undefined });
        }
        setInvoiceData(prevData => ({
            ...prevData,
            currency: currencies?.find(
                ({ id }) =>
                    id ===
                    checkList.checkedListAll.map(items => ({
                        ...invoices.find(
                            inv =>
                                inv.id ===
                                    Number(String(items).split('-')?.[0]) &&
                                inv.isTax ===
                                    (String(items).split('-')?.[1] === 'vat')
                        ),
                        id: items,
                    }))?.[0]?.currencyId
            ),
        }));
        setFieldsValue({
            currency: checkList.checkedListAll.map(items => ({
                ...invoices.find(
                    inv =>
                        inv.id === Number(String(items).split('-')?.[0]) &&
                        inv.isTax === (String(items).split('-')?.[1] === 'vat')
                ),
                id: items,
            }))?.[0]?.currencyId,
        });
        setSelectedInvoices(
            checkList.checkedListAll
                .map(items => ({
                    ...invoices.find(
                        inv =>
                            inv.id === Number(String(items).split('-')?.[0]) &&
                            inv.isTax ===
                                (String(items).split('-')?.[1] === 'vat')
                    ),
                    id: items,
                }))
                ?.map(item => {
                    if (
                        invoice.find(inv => inv.id === item.id).creditId !==
                        null
                    ) {
                        return {
                            creditId: invoice.find(inv => inv.id === item.id)
                                ?.creditId,
                            mustPay: Number(
                                invoice.find(inv => inv.id === item.id)?.mustPay
                            ),
                            ...item,
                        };
                    }
                    return item;
                })
        );
        setIsVisible(false);
    };

    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow({ ...row, id: Number(String(row.id).split('-')?.[0]) });
    };

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, [fetchBusinessUnitList]);

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = invoice;

            setCheckList(prevState => ({
                checkedListAll: [...prevState.checkedListAll, row.id],
                ItemsChecked:
                    collection.length === prevState.checkedListAll.length + 1,
            }));
        } else {
            setCheckList(prevState => ({
                checkedListAll: prevState.checkedListAll.filter(
                    item => item !== row.id
                ),
                ItemsChecked: false,
            }));
        }
    };
    useEffect(() => {
        if (isVisible) {
            setInvoice(
                vatChecked
                    ? getInvoiceList(invoices, type, editId, operationsList)
                          .filter(
                              invoice =>
                                  (Number(invoice.debtAmount) ||
                                      invoice.fromEdit) &&
                                  invoice.isTax
                          )
                          .map(item => ({
                              ...item,
                              mustPay:
                                  selectedInvoices?.length === 1 &&
                                  item.id === selectedInvoices?.[0]?.id
                                      ? item.currencyId ===
                                        selectedInvoices?.[0]?.currencyId
                                          ? Number(paymentAmount) ===
                                            customRound(
                                                selectedInvoices?.[0]
                                                    ?.remainingInvoiceDebtWithCredit,
                                                1,
                                                2
                                            )
                                              ? roundTo.down(
                                                    Number(
                                                        selectedInvoices?.[0]
                                                            ?.remainingInvoiceDebtWithCredit
                                                    ),
                                                    2
                                                )
                                              : roundTo(
                                                    math.mul(
                                                        Number(
                                                            invoiceData.rate ||
                                                                1
                                                        ),
                                                        Number(
                                                            paymentAmount || 0
                                                        )
                                                    ),
                                                    2
                                                )
                                          : Number(paymentAmount)
                                      : roundTo.down(
                                            Number(
                                                item.remainingInvoiceDebtWithCredit
                                            ),
                                            2
                                        ),
                          }))
                    : getInvoiceList(invoices, type, editId, operationsList)
                          .filter(
                              invoice =>
                                  (Number(invoice.debtAmount) ||
                                      invoice.fromEdit) &&
                                  !invoice.isTax
                          )
                          .map(item => ({
                              ...item,
                              mustPay:
                                  selectedInvoices?.length === 1 &&
                                  item.id === selectedInvoices?.[0].id
                                      ? item.currencyId ===
                                        selectedInvoices?.[0]?.currencyId
                                          ? Number(paymentAmount) ===
                                            customRound(
                                                selectedInvoices?.[0]
                                                    ?.remainingInvoiceDebtWithCredit,
                                                1,
                                                2
                                            )
                                              ? roundTo.down(
                                                    Number(
                                                        selectedInvoices?.[0]
                                                            ?.remainingInvoiceDebtWithCredit
                                                    ),
                                                    2
                                                )
                                              : roundTo(
                                                    math.mul(
                                                        Number(
                                                            invoiceData.rate ||
                                                                1
                                                        ),
                                                        Number(
                                                            paymentAmount || 0
                                                        )
                                                    ),
                                                    2
                                                )
                                          : Number(paymentAmount)
                                      : roundTo.down(
                                            Number(
                                                item.remainingInvoiceDebtWithCredit
                                            ),
                                            2
                                        ),
                          }))
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        editId,
        invoices,
        operationsList,
        type,
        vatChecked,
        isVisible,
        selectedInvoices,
        paymentAmount,
    ]);

    useEffect(() => {
        if (counterparty && !invoiceLoading) {
            fetchSalesInvoiceList({
                filters: {
                    contacts: [counterparty],
                    invoiceTypes: type === 1 ? [2, 4, 13] : [1, 3, 10, 12],
                    isDeleted: 0,
                    limit: 1000,
                    businessUnitIds: editId
                        ? invoiceInfo?.businessUnitId === null ||
                          invoiceInfo?.businessUnitId === undefined
                            ? [0]
                            : [invoiceInfo?.businessUnitId]
                        : cookies.get('_TKN_UNIT_') &&
                          cookies.get('_TKN_UNIT_') !== 'undefined'
                        ? [cookies.get('_TKN_UNIT_')]
                        : undefined,
                },
                onSuccess: res => {
                    setAllInvoice(
                        res.data?.filter(inv => inv.paymentStatus !== 3)
                    );
                },
            });
        } else {
            setInvoice([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [counterparty, editId, type, invoiceLoading]);

    const onChange = (productId, newPrice, limit = 100000000) => {
        const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
        if (
            (re.test(Number(newPrice)) && Number(newPrice) <= Number(limit)) ||
            newPrice === ''
        ) {
            const newInvoices = invoice?.map(item => {
                if (item.id === productId) {
                    return {
                        ...item,
                        mustPay: newPrice,
                    };
                }
                return item;
            });

            setInvoice(newInvoices);
        }
    };

    const getColumns = () => [
        {
            title: (
                <Checkbox
                    disabled={
                        !invoice?.every(
                            v => v.currencyId === invoice[0]?.currencyId
                        ) && checkList.checkedListAll?.length === 0
                    }
                    onChange={event => handleCheckbox(event.target.checked)}
                    checked={checkList.ItemsChecked}
                    style={
                        checkList.ItemsChecked
                            ? { border: '1px solid #d9d9d9', display: 'inline' }
                            : {}
                    }
                />
            ),
            width: 50,
            dataIndex: 'id',
            render(val, row) {
                return (
                    <Checkbox
                        disabled={
                            checkList.checkedListAll.length > 0 &&
                            invoice.find(
                                ({ id }) => checkList.checkedListAll?.[0] === id
                            )?.currencyId !== row.currencyId
                        }
                        checked={checkList.checkedListAll?.includes(val)}
                        onChange={event => handleCheckboxes(row, event)}
                    />
                );
            },
        },
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 60,
            render: (_, row, index) => index + 1,
        },
        {
            title: 'Tarix',
            dataIndex: 'operationDate',
            width: 150,
            render: value => value,
        },
        {
            title: 'Qaimə',
            dataIndex: 'invoiceNumber',
            width: 100,
            align: 'left',
            render: value => value,
        },
        {
            title: 'Qalıq borc',
            dataIndex: 'remainingInvoiceDebtWithCredit',
            width: 150,
            align: 'center',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.currencyCode
                }`,
        },
        {
            title: 'Ödəniləcək məbləğ',
            dataIndex: 'mustPay',
            width: 220,
            render: (value, row) =>
                row?.isTotal ? null : (
                    <div style={{ display: 'flex' }}>
                        <ProInput
                            style={{
                                width: '55%',
                                marginRight: '10px',
                                textAlign: 'right',
                            }}
                            size="default"
                            value={value}
                            onChange={e =>
                                onChange(
                                    row.id,
                                    e.target.value,
                                    row.remainingInvoiceDebtWithCredit
                                )
                            }
                            className={styles.tableInput}
                        />
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            {row.currencyCode}
                        </span>
                    </div>
                ),
        },
        {
            title: 'Seç',
            dataIndex: 'id',
            width: 50,
            align: 'right',
            render: (value, row) => (
                <DetailButton onClick={() => handleDetailsModal(row)} />
            ),
        },
    ];

    useEffect(() => {
        if (isVisible) {
            if (selectedInvoices.length > 0) {
                setCheckList({
                    checkedListAll: selectedInvoices.map(({ id }) => id),
                    ItemsChecked:
                        selectedInvoices.length ===
                        invoice?.filter(
                            item =>
                                item.currencyId ===
                                selectedInvoices?.[0]?.currencyId
                        ).length,
                });
                setVatChecked(selectedInvoices[0]?.isTax);
            } else {
                setCheckList({
                    checkedListAll: [],
                    ItemsChecked: false,
                });
                setVatChecked(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInvoices, isVisible, setCheckList]);

    const handleCheckbox = checked => {
        let collection = [];

        if (checked) {
            collection = getAllItems();
        }
        setCheckList({
            checkedListAll: collection,
            ItemsChecked: checked,
        });
    };

    const getAllItems = () => {
        const collection = [];

        if (checkList.checkedListAll.length > 0) {
            for (const item of invoice) {
                if (
                    !item.isDeleted &&
                    invoice.find(
                        ({ id }) => checkList.checkedListAll?.[0] === id
                    ).currencyId === item.currencyId
                ) {
                    collection.push(item.id);
                }
            }
        } else {
            collection.push(...invoice.map(({ id }) => id));
        }

        return collection;
    };

    return (
        <>
            <AddFormModal
                width={
                    selectedRow.invoiceTypeNumber !== 10 ||
                    selectedRow.statusOfOperation === 3
                        ? activeTab === 0
                            ? 760
                            : 1200
                        : 1400
                }
                withOutConfirm
                onCancel={handleDetailsModal}
                visible={details}
            >
                <OperationsDetails
                    row={selectedRow}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={details}
                    allBusinessUnits={allBusinessUnits}
                />
            </AddFormModal>
            <ProModal
                maskClosable
                padding
                width={1100}
                handleModal={() => {
                    setIsVisible(false);
                    setCheckList({ checkedListAll: [], ItemsChecked: false });
                }}
                isVisible={isVisible}
            >
                <div
                    id="recievablesActionDropDownModal"
                    className={styles.exportBox}
                    style={{ marginBottom: '20px' }}
                >
                    <span
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginRight: '50px',
                        }}
                    >
                        {allInvoice.find(({ id }) => id === invoice?.[0]?.id)
                            ?.counterparty || allInvoice?.[0]?.counterparty}
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        margin: '40px 0 20px 0',
                        justifyContent: 'space-between',
                    }}
                >
                    <Input.Group style={{ marginLeft: '5px', width: '30%' }}>
                        <span className={styles.filterName}>Qaimə</span>

                        <ProSelect
                            mode="multiple"
                            keys={['invoiceNumber']}
                            value={filters}
                            data={allInvoice}
                            onChange={values => setFilters(values)}
                        />
                    </Input.Group>
                    <Input.Group
                        style={{
                            marginRight: '5px',
                            width: '30%',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <span
                            className={styles.filterName}
                            style={{ marginRight: '15px' }}
                        >
                            ƏDV qaimələri
                        </span>

                        <Checkbox
                            checked={vatChecked}
                            onChange={event => {
                                setVatChecked(event.target.checked);
                            }}
                            disabled={selectedInvoices.length > 0}
                        />
                    </Input.Group>
                </div>
                {/* <div
                    style={{
                        display: 'flex',
                        width: '70%',
                        margin: '40px 0 20px 20px',
                    }}
                >
                    <Checkbox
                        disabled={
                            !invoice?.every(
                                v => v.currencyId === invoice[0]?.currencyId
                            ) && checkList.checkedListAll?.length === 0
                        }
                        onChange={event => handleCheckbox(event.target.checked)}
                        checked={checkList.ItemsChecked}
                    />
                </div> */}
                <Table
                    columns={getColumns()}
                    rowKey={row => row.id}
                    dataSource={
                        filters?.length > 0
                            ? invoice?.filter(inv => filters.includes(inv.id))
                            : invoice
                    }
                />
                <FooterRow
                    primary="Toplam"
                    secondary={`${formatNumberToLocale(
                        defaultNumberFormat(
                            invoice
                                .filter(({ id }) =>
                                    checkList.checkedListAll.includes(id)
                                )
                                .reduce(
                                    (total, { mustPay }) =>
                                        math.add(total, Number(mustPay) || 0),
                                    0
                                )
                        )
                    )} ${invoice.filter(({ id }) =>
                        checkList.checkedListAll.includes(id)
                    )?.[0]?.currencyCode || ''} `}
                />
                <ProButton
                    style={{ marginTop: '20px' }}
                    // disabled={selectedPriceTypes.length === 0}
                    onClick={handleCreateInvoice}
                >
                    Təsdiq et
                </ProButton>
            </ProModal>
        </>
    );
};

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchBusinessUnitList,
    }
)(AddInvoice);
