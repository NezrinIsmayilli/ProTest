/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
    setOperationsList,
    fetchOperationsList,
} from 'store/actions/finance/operations';
import { Button } from 'antd';
import { convertCurrency } from 'store/actions/settings/kassa';
import { getCreditPayment } from 'store/actions/finance/paymentTable';
import moment from 'moment';
import { dateFormat } from 'utils';
import styles from './styles.module.scss';
import OpDetailTab from './operationDetails/opDetailTab';
import OpFinOpInvoiceTab from './operationDetails/opFinOpInvoiceTab';
import OpInvoiceContentTab from './operationDetails/opInvoiceContentTab';
import PaymentTableTab from './operationDetails/paymentTableTab';

function OperationsDetails(props) {
    const {
        fromInvoice,
        fromTable,
        isDeletedForLog,
        loadingForLogs = false,
        activeTab,
        setActiveTab,
        visible,
        row,
        fetchSalesInvoiceInfo,
        fetchOperationsList,
        isLoading,
        mainCurrencyCode,
        setOperationsList,
        tenant,
        allBusinessUnits,
        profile,
        getCreditPayment,
    } = props;
    const dispatch = useDispatch();
    const [detailsData, setDetailsData] = useState([]);
    const [tableDatas, setTableDatas] = useState([]);
    const [invoiceLength, setInvoiceLength] = useState(undefined);
    const [creditPayment, setCreditPayment] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    const handleChangeTab = value => setActiveTab(value);
    const getTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <OpDetailTab
                        fromTable={fromTable}
                        profile={profile}
                        isDeletedForLog={isDeletedForLog}
                        isLoading={isLoading || loadingForLogs}
                        allBusinessUnits={allBusinessUnits}
                        details={detailsData}
                        tenant={tenant}
                        row={row}
                    />
                );
            case 1:
                return (
                    <OpFinOpInvoiceTab
                        isDeletedForLog={isDeletedForLog}
                        row={row}
                        mainCurrencyCode={mainCurrencyCode}
                        details={detailsData}
                        filteredList={filteredList}
                    />
                );
            case 2:
                return (
                    <OpInvoiceContentTab
                        setInvoiceLength={setInvoiceLength}
                        details={detailsData}
                        visible={visible}
                        isLoading={isLoading}
                        tableDatas={tableDatas}
                        row={row}
                    />
                );
            case 3:
                return (
                    <PaymentTableTab
                        setInvoiceLength={setInvoiceLength}
                        details={detailsData}
                        visible={visible}
                        isLoading={isLoading}
                        tableDatas={tableDatas}
                        creditRow={row}
                        creditPayment={creditPayment}
                    />
                );
            default:
        }
    };

    useEffect(() => {
        if (!visible) {
            setDetailsData([]);
            setInvoiceLength(undefined);
            setFilteredList([]);
        }
    }, [visible]);

    useEffect(() => {
        if (!fromInvoice) {
            setActiveTab(0);
        }
        if (row.invoiceId) {
            fetchSalesInvoiceInfo({
                id: row.invoiceId,
                onSuccess: res => {
                    if (
                        res.data.invoiceProducts &&
                        res.data.invoiceProducts.content
                    )
                        setTableDatas([
                            ...Object.keys(
                                res.data.invoiceProducts.content
                            ).map(
                                index => res.data.invoiceProducts.content[index]
                            ),
                        ]);
                    setDetailsData(res.data);
                },
            });

            fetchOperationsList({
                filters: {
                    invoices: [row.invoiceId],
                    vat: 0,
                    transactionTypes: [9],
                    dateOfTransactionStart: moment(
                        row.createdAt,
                        dateFormat
                    ).format(dateFormat),
                },
                setOperations: false,
                onSuccessCallback: ({ data }) => setFilteredList(data),
            });

            getCreditPayment({
                id: row.creditId,
                onSuccess: ({ data }) => {
                    setCreditPayment(data);
                },
            });
        }
    }, [row.invoiceId]);
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                alignItems: 'center',
            }}
        >
            <div className={styles.detailsTab}>
                <Button
                    size="large"
                    type={activeTab === 0 ? 'primary' : ''}
                    onClick={() => handleChangeTab(0)}
                    disabled={isLoading}
                >
                    Əlavə məlumat
                </Button>
                <Button
                    size="large"
                    type={activeTab === 1 ? 'primary' : ''}
                    onClick={() => handleChangeTab(1)}
                    disabled={isLoading}
                >
                    Ödəniş əməliyyatları ({filteredList.length})
                </Button>
                <Button
                    style={
                        row?.invoiceTypeNumber === 10
                            ? { borderRadius: 0 }
                            : { borderRadius: '0 4px 4px 0' }
                    }
                    size="large"
                    type={activeTab === 2 ? 'primary' : ''}
                    onClick={() => handleChangeTab(2)}
                    disabled={isLoading}
                >
                    Qaimənin tərkibi (
                    {invoiceLength ||
                        tableDatas.reduce(
                            (total, { quantity }) => total + Number(quantity),
                            0
                        )}
                    )
                </Button>
                <Button
                    size="large"
                    type={activeTab === 3 ? 'primary' : ''}
                    onClick={() => handleChangeTab(3)}
                    disabled={isLoading}
                >
                    Ödəniş cədvəli ({creditPayment?.length})
                </Button>
            </div>

            {getTabContent()}
        </div>
    );
}

const mapStateToProps = state => ({
    isLoading: state.financeOperationsReducer.isLoading,
    tenant: state.tenantReducer.tenant,
    profile: state.profileReducer.profile,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceInfo,
        fetchOperationsList,
        setOperationsList,
        convertCurrency,
        getCreditPayment,
    }
)(OperationsDetails);
