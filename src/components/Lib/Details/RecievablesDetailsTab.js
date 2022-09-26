/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'antd';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { fetchOperationsList } from 'store/actions/finance/operations';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
    getCreditPayment,
    fetchCreditPayments,
} from 'store/actions/finance/paymentTable';
import PaymentTableTab from 'containers/Finance/PaymentTable/operationDetails/paymentTableTab';
import ReFinOpTab from './ReFinOpTab';
import ReInvoiceContent from './ReInvoiceContent';

function RecievablesDetailsTab(props) {
    const {
        detailsTab,
        setDetailsTab,
        setDetails,
        invoiceId,
        fetchMainCurrency,
        fetchSalesInvoiceInfo,
        fetchOperationsList,
        operationsList,
        row,
        getCreditPayment,
        fetchCreditPayments,
        creditPayments,
        creditPaymentsLoading,
        forImport,
    } = props;
    const { invoiceNumber, contractNo, creditId, invoiceType, endPrice } = row;

    const [tableDatas, setTableDatas] = useState([]);
    const [invoiceLength, setInvoiceLength] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [restInvoiceData, setRestInvoiceData] = useState(undefined);
    const [creditPayment, setCreditPayment] = useState([]);

    useEffect(() => {
        fetchMainCurrency();
        fetchCreditPayments({ filters: { limit: 1000 } });
    }, []);

    useEffect(() => {
        if (invoiceId) {
            fetchOperationsList({ filters: { invoices: [invoiceId], vat: 0 } });
        }
    }, [invoiceId, fetchOperationsList]);

    useEffect(() => {
        if (invoiceId) {
            setIsLoading(true);
            fetchSalesInvoiceInfo({
                id: invoiceId,
                onFailure: err => setIsLoading(false),
                onSuccess: res => {
                    setIsLoading(false);
                    if (res.data.creditId !== null) {
                        getCreditPayment({
                            id: res.data.creditId,
                            onSuccess: ({ data }) => {
                                setCreditPayment(data);
                            },
                        });
                    }
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
                    setRestInvoiceData(res.data);
                },
            });
        }
    }, [invoiceId, fetchSalesInvoiceInfo]);
    const getRecievablesDetailsTabContent = invoiceId => {
        // eslint-disable-next-line default-case
        switch (detailsTab) {
            case 0:
                return (
                    <ReFinOpTab
                        invoiceNumber={invoiceNumber}
                        operationsList={operationsList}
                        contractNo={contractNo}
                        restInvoiceData={restInvoiceData}
                        forImport={forImport}
                    />
                );
            case 1:
                return (
                    <ReInvoiceContent
                        setInvoiceLength={setInvoiceLength}
                        tableDatas={tableDatas}
                        isLoading={isLoading}
                        restInvoiceData={restInvoiceData}
                    />
                );
            case 2:
                return (
                    <PaymentTableTab
                        details={restInvoiceData || {}}
                        creditRow={creditPayments.find(
                            creditPayment =>
                                creditPayment.creditId ===
                                restInvoiceData?.creditId
                        )}
                        creditPayment={creditPayment}
                        loading={creditPaymentsLoading}
                    />
                );
        }
    };
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                alignItems: 'center',
            }}
        >
            <Button
                onClick={() => setDetails(false)}
                type="link"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#464A4B',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '16px',
                }}
            >
                <MdKeyboardArrowLeft size={20} style={{ marginRight: 8 }} />
                Qaimə Siyahısına qayıt
            </Button>
            {(invoiceType !== 12 && invoiceType !== 13 &&  Number(endPrice) > 0) || creditId ? (
                <Row style={{ width: '100%', marginTop: 16 }}>
                    {Number(endPrice) > 0 ? <Col span={8} offset={creditId ? 0 : 4}>
                        <Button
                            onClick={() => setDetailsTab(0)}
                            style={{
                                width: '100%',
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                            size="large"
                            type={detailsTab === 0 ? 'primary' : ''}
                        >
                            Maliyyə əməliyyatları ({operationsList.length})
                        </Button>
                    </Col> : null}
                    {invoiceType !== 12 && invoiceType !== 13 ? (
                        <Col span={8}>
                            <Button
                                onClick={() => setDetailsTab(1)}
                                style={{
                                    width: '100%',
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                }}
                                size="large"
                                type={detailsTab === 1 ? 'primary' : ''}
                            >
                                Qaimənin tərkibi (
                                {invoiceLength ||
                                    tableDatas.reduce(
                                        (total, { quantity }) =>
                                            total + Number(quantity),
                                        0
                                    )}
                                )
                            </Button>
                        </Col>
                    ) : null}
                    {creditId ? (
                        <Col span={8}>
                            <Button
                                size="large"
                                type={detailsTab === 2 ? 'primary' : ''}
                                onClick={() => setDetailsTab(2)}
                                style={{
                                    width: '100%',
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                }}
                            >
                                Ödəniş cədvəli ({creditPayment?.length})
                            </Button>
                        </Col>
                    ) : null}
                </Row>
            ) : null}

            {getRecievablesDetailsTabContent(invoiceId)}
        </div>
    );
}

const mapStateToProps = state => ({
    operationsList: state.financeOperationsReducer.operationsList,
    creditPayments: state.paymentTableReducer.creditPayments,
    creditPaymentsLoading: state.loadings.fetchCreditPayments,
});

export default connect(
    mapStateToProps,
    {
        fetchMainCurrency,
        fetchSalesInvoiceInfo,
        fetchOperationsList,
        getCreditPayment,
        fetchCreditPayments,
    }
)(RecievablesDetailsTab);
