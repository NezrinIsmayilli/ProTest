import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { ProButton, ProCollapse, ProPanel } from 'components/Lib';
import { Button, Input, Modal, Divider } from 'antd';
import {
    fetchAllCashboxNames,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { fetchExpenseCatalogs } from 'store/actions/expenseItem';
import { fullDateTimeWithSecond } from 'utils';
import {
    fetchAccountBalance,
    deleteTransaction,
} from 'store/actions/finance/operations';
import { setExpenses } from 'store/actions/sales-operation';
import { fetchContracts } from 'store/actions/contracts';
import { fetchFilteredWorkers } from 'store/actions/hrm/workers';
import { connect } from 'react-redux';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import styles from '../styles.module.scss';
import { AddFromCatalog } from './AddFromCatalog';
import GeneralFields from './GeneralFields';
import ExpensesTable from './ExpensesTable';
import Summary from './Summary';
import InvoicePayment from './InvoicePayment';
import WithoutDocument from './withoutDocument';

const { TextArea } = Input;

const Expenses = props => {
    const {
        form,
        id,
        invoiceInfo,
        contracts,
        currencies,
        rates,
        allCashBoxNames,
        fetchFilteredWorkers,
        fetchExpenseCatalogs,
        fetchContracts,
        fetchAllCashboxNames,
        fetchAccountBalance,
        fetchCurrencies,
        selectedExpenses,
        deleteTransaction,
        setExpenses,
        expenseRates,
        operationsList,
        cashbox,
        financeInfo,
    } = props;

    const { getFieldValue } = form;

    const [financeDeleteVisible, setFinanceDeleteVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [description, setDescription] = useState();
    const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
    const [modalIsVisible, setModalIsVisible] = useState(false);

    const toggleCatalogModal = () => {
        setCatalogModalIsVisible(prevValue => !prevValue);
    };
    const handleDelete = () => {
        deleteTransaction(
            operationsList.find(
                operation => operation.transactionItemId === selectedRow
            )?.cashboxTransactionId,
            description,
            onDeleteOperation
        );
        setFinanceDeleteVisible(false);
    };
    const onDeleteOperation = () => {
        const newExpenses = selectedExpenses.filter(
            ({ id }) => id !== selectedRow
        );
        setExpenses({ newExpenses });
    };
    useEffect(() => {
        if (contracts?.length === 0) fetchContracts();
        fetchCurrencies();
        fetchExpenseCatalogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCurrencies({
            dateTime: getFieldValue('date')?.format(fullDateTimeWithSecond),
            withRatesOnly: 1,
        });
    }, [fetchCurrencies, getFieldValue]);
    useEffect(() => {
        if (id) {
            if (invoiceInfo) {
                fetchAllCashboxNames({
                    businessUnitIds:
                        invoiceInfo?.businessUnitId === null
                            ? [0]
                            : [invoiceInfo?.businessUnitId],
                });
                // fetchFilteredWorkers({
                //     filters: {
                //         businessUnitIds:
                //             invoiceInfo?.businessUnitId === null
                //                 ? [0]
                //                 : [invoiceInfo?.businessUnitId],
                //         lastEmployeeActivityType: 1,
                //     },
                // });
            }
        } else if (cookies.get('_TKN_UNIT_')) {
            fetchAllCashboxNames({
                businessUnitIds: [cookies.get('_TKN_UNIT_')],
            });
            // fetchFilteredWorkers({
            //     filters: {
            //         businessUnitIds: [cookies.get('_TKN_UNIT_')],
            //         lastEmployeeActivityType: 1,
            //     },
            // });
        } else {
            // fetchFilteredWorkers({ filters: { lastEmployeeActivityType: 1 } });
            fetchAllCashboxNames();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);

    return (
        <ProCollapse
            className={styles.customCollapse}
            style={{ border: 'none' }}
            defaultActiveKey="1"
        >
            <ProPanel
                header={
                    <div
                        style={{
                            fontWeight: 'bold',
                            fontSize: '22px',
                        }}
                    >
                        Əlavə xərclər
                    </div>
                }
                className="expense_header"
                key="1"
                style={{ padding: 0 }}
            >
                <div className={styles.parentBox}>
                    <div className={styles.paper}>
                        <Modal
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
                                    onClick={() =>
                                        setFinanceDeleteVisible(false)
                                    }
                                    style={{ marginRight: 6 }}
                                >
                                    <MdClose
                                        size={18}
                                        style={{ marginRight: 4 }}
                                    />
                                    İmtina
                                </Button>
                            </div>
                        </Modal>

                        <AddFromCatalog
                            isVisible={catalogModalIsVisible}
                            toggleModal={toggleCatalogModal}
                        />

                        <div className={styles.Header}>
                            <span className={styles.newOperationTitle}>
                                Hesablar üzrə ödənişlər
                            </span>
                        </div>
                        <GeneralFields
                            form={form}
                            id={id}
                            invoiceInfo={invoiceInfo}
                            financeInfo={financeInfo}
                        />
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginBottom: '20px',
                            }}
                        >
                            <ProButton
                                className={styles.catalogButton}
                                onClick={toggleCatalogModal}
                                type="primary"
                            >
                                Kataloqdan seç
                            </ProButton>
                        </div>
                        <ExpensesTable
                            form={form}
                            id={id}
                            setFinanceDeleteVisible={setFinanceDeleteVisible}
                            setSelectedRow={setSelectedRow}
                            allCashBoxNames={allCashBoxNames}
                            expenseRates={expenseRates}
                            cashbox={cashbox}
                        />
                    </div>
                </div>
                <InvoicePayment
                    form={form}
                    id={id}
                    rates={rates}
                    invoiceInfo={invoiceInfo}
                />
                <WithoutDocument rates={rates} expenseRates={expenseRates} />
            </ProPanel>
        </ProCollapse>
    );
};

const mapStateToProps = state => ({
    workers: state.workersReducer.workers,
    workersLoading: state.workersReducer.isLoading,
    contracts: state.contractsReducer.contracts,
    currencies: state.kassaReducer.currencies,
    tenant: state.tenantReducer.tenant,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashBoxBalance: state.cashBoxBalanceReducer.cashBoxBalance,
    expenseCatalogs: state.expenseItems.expenseCatalogs,
    selectedExpenses: state.salesOperation.selectedExpenses,
    operationsList: state.financeOperationsReducer.operationsList,
    // Loadings
    balanceLoading: state.loadings.accountBalance,
    tenantBalanceLoading: state.loadings.tenantBalance,
});

export default connect(
    mapStateToProps,
    {
        setExpenses,
        deleteTransaction,
        fetchFilteredWorkers,
        fetchExpenseCatalogs,
        fetchContracts,
        fetchAllCashboxNames,
        fetchAccountBalance,
        fetchCurrencies,
    }
)(Expenses);
