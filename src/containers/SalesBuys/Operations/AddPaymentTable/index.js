/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { ProWrapper } from 'components/Lib';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Tabs, Row, Col, Form, Button } from 'antd';
import { dateFormat, fullDateTimeWithSecond, today } from 'utils';
import swal from '@sweetalert/with-react';
import {
    fetchCreditTypes,
    fetchCreditType,
} from 'store/actions/settings/credit';
import {
    createCreditPayments,
    getCreditPayment,
    fetchCreditPayments,
    editCreditPayments,
} from 'store/actions/finance/paymentTable';
import { fetchOperationsList } from 'store/actions/finance/operations';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { fetchProducts } from 'store/actions/product';
import { useHistory, useParams, Link } from 'react-router-dom';
import moment from 'moment';
import GeneralInfo from './generalInfo';
import CreditTerms from './creditTerms';
import styles from './styles.module.scss';

const { TabPane } = Tabs;
const returnUrl = `/sales/operations`;
const math = require('exact-math');

const summary_types = [
    {
        label: 'Əsas məbləğ',
        key: 1,
    },
    {
        label: 'Ödənilib',
        key: 2,
    },
    {
        label: 'Gecikən ödənişlər',
        key: 3,
    },
    {
        label: 'Cari borc',
        key: 4,
    },
];

const AddPaymentTable = props => {
    const {
        form,
        fetchSalesInvoiceInfo,
        fetchProducts,
        fetchCreditTypes,
        fetchCreditType,
        getCreditPayment,
        createCreditPayments,
        editCreditPayments,
        invoicePaymentDetails,
        fetchCreditPayments,
        creditPayments,
        createOperationInvoice,
        fetchOperationsList,
        selectedProducts,

        createCreditLoading,
        createInvoicePaymentLoading,
        editCreditPaymentsLoadings,
    } = props;

    const {
        validateFields,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
        setFields,
        submit,
    } = form;

    const { invoiceId, id } = useParams();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const invoiceType = urlParams.get('invoiceType');

    const { rate } = invoicePaymentDetails;
    const [activeTab, setActiveTab] = useState(null);
    const [invoiceInfo, setInvoiceInfo] = useState(undefined);
    const [creditPayment, setCreditPayment] = useState(undefined);
    const [initialPayment, setInitialPayment] = useState(undefined);
    const [
        initialPaymentTransactions,
        setInitialPaymentTransactions,
    ] = useState([]);
    const [initialRemainingDebt, setInitialRemainingDebt] = useState(undefined);
    const [checked, setChecked] = useState(false);
    const [selectedCreditType, setSelectedCreditType] = useState([]);
    const [debtResult, setDebtResult] = useState(1);
    const [summaries, setSummaries] = useState(summary_types);

    const history = useHistory();
    const { location } = history;
    const handleActiveTabChange = newTab => {
        setActiveTab(newTab);
    };
    useEffect(() => {
        if (location?.state?.data) {
            const { businessUnitId } = location?.state?.data;
            if (businessUnitId === null) {
                cookies.set('_TKN_UNIT_', 0);
            } else {
                cookies.set('_TKN_UNIT_', businessUnitId);
            }
        }
    }, [location?.state?.data]);

    useEffect(() => {
        const debt = math.sub(
            Number(selectedProducts?.[0]?.remainingDebt || 0),
            Number(
                math.mul(
                    Number(rate || 1),
                    Number(initialPayment?.[0]?.initialPayment || 0)
                )
            )
        );
        setDebtResult(debt);
    }, [selectedProducts, rate, initialPayment?.[0]?.initialPayment]);

    useEffect(() => {
        if (!checked) {
            setInitialPayment([{ initialPayment: 0 }]);
        } else {
            setInitialPayment([
                { initialPayment: getFieldValue('paymentAmount') },
            ]);
        }
    }, [checked]);

    useEffect(() => {
        fetchOperationsList({
            filters: {
                creditPayment: 0,
                limit: 10000,
                invoices: [Number(invoiceId)],
                vat: 0
            },
            setOperations: false,
            onSuccessCallback: ({ data }) => {
                setInitialPaymentTransactions(data);
            },
        });
        fetchCreditPayments({
            filters: { limit: 1000 },
            onSuccessCallback: response => {
                if (id) {
                    getCreditPayment({
                        id,
                        onSuccess: ({ data }) => {
                            setCreditPayment(data);
                            if (id && response.data?.length > 0) {
                                const creditPaymentData = response.data?.find(
                                    ({ creditId }) => creditId === Number(id)
                                );
                                setInitialRemainingDebt(
                                    creditPaymentData?.initialInvoiceAmount
                                );
                                const totalMonthlyPaymentAmount = data?.reduce(
                                    (total, { monthlyPaymentAmount }) =>
                                        total + Number(monthlyPaymentAmount),
                                    0
                                );
                                if (
                                    creditPaymentData?.creditTypeId &&
                                    creditPaymentData?.creditTypeId !== null
                                ) {
                                    fetchCreditType({
                                        id: Number(
                                            creditPaymentData?.creditTypeId
                                        ),
                                        onSuccessCallback: ({ data }) => {
                                            const concatData = data;
                                            if (
                                                data
                                                    ?.map(({ month }) => month)
                                                    ?.includes(
                                                        response.data?.find(
                                                            ({ creditId }) =>
                                                                creditId ===
                                                                Number(id)
                                                        )?.numberOfMonths
                                                    )
                                            ) {
                                                setSelectedCreditType(data);
                                            } else {
                                                setSelectedCreditType([
                                                    {
                                                        id: response.data?.find(
                                                            ({ creditId }) =>
                                                                creditId ===
                                                                Number(id)
                                                        )?.numberOfMonths,
                                                        monthlyCreditAmount:
                                                            creditPaymentData?.totalCreditAmount,
                                                        monthlyDepositAmount:
                                                            creditPaymentData?.totalDepositAmount,
                                                        month: response.data?.find(
                                                            ({ creditId }) =>
                                                                creditId ===
                                                                Number(id)
                                                        )?.numberOfMonths,
                                                        creditPercentage: math
                                                            .div(
                                                                math.mul(
                                                                    Number(
                                                                        creditPaymentData?.totalCreditAmount ||
                                                                            0
                                                                    ),
                                                                    100
                                                                ),
                                                                Number(
                                                                    totalMonthlyPaymentAmount ||
                                                                        1
                                                                )
                                                            )
                                                            .toFixed(2),
                                                        depositPercentage: math
                                                            .div(
                                                                math.mul(
                                                                    Number(
                                                                        creditPaymentData?.totalDepositAmount ||
                                                                            0
                                                                    ),
                                                                    100
                                                                ),
                                                                Number(
                                                                    totalMonthlyPaymentAmount ||
                                                                        1
                                                                )
                                                            )
                                                            .toFixed(2),
                                                        monthlyPayment: Number(
                                                            data?.[0]
                                                                ?.totalMonthlyPaymentAmount ||
                                                                0
                                                        ),
                                                    },
                                                    ...data,
                                                ]);
                                                concatData.push({
                                                    id: response.data?.find(
                                                        ({ creditId }) =>
                                                            creditId ===
                                                            Number(id)
                                                    )?.numberOfMonths,
                                                    month: response.data?.find(
                                                        ({ creditId }) =>
                                                            creditId ===
                                                            Number(id)
                                                    )?.numberOfMonths,
                                                    monthlyCreditAmount:
                                                        creditPaymentData?.totalCreditAmount,
                                                    monthlyDepositAmount:
                                                        creditPaymentData?.totalDepositAmount,
                                                    creditPercentage: math
                                                        .div(
                                                            math.mul(
                                                                Number(
                                                                    creditPaymentData?.totalCreditAmount ||
                                                                        0
                                                                ),
                                                                100
                                                            ),
                                                            Number(
                                                                totalMonthlyPaymentAmount ||
                                                                    1
                                                            )
                                                        )
                                                        .toFixed(2),
                                                    depositPercentage: math
                                                        .div(
                                                            math.mul(
                                                                Number(
                                                                    creditPaymentData?.totalDepositAmount ||
                                                                        0
                                                                ),
                                                                100
                                                            ),
                                                            Number(
                                                                totalMonthlyPaymentAmount ||
                                                                    1
                                                            )
                                                        )
                                                        .toFixed(2),
                                                    monthlyPayment: Number(
                                                        data?.[0]
                                                            ?.totalMonthlyPaymentAmount ||
                                                            0
                                                    ),
                                                });
                                            }
                                            if (concatData.length === 1) {
                                                setFieldsValue({
                                                    time: concatData[0].id,
                                                });
                                            } else {
                                                setFieldsValue({
                                                    time: concatData.find(
                                                        time =>
                                                            time.month ===
                                                            creditPaymentData?.numberOfMonths
                                                    )?.id,
                                                });
                                            }
                                        },
                                    });
                                } else {
                                    setFieldsValue({
                                        time:
                                            creditPaymentData?.numberOfMonths ||
                                            1,
                                        creditPercentage: 0,
                                        creditAmount: 0,
                                        depositAmount: 0,
                                        depositPercentage: 0,
                                        monthlyDepositAmount: id
                                            ? Number(initialRemainingDebt || 0)
                                            : math.sub(
                                                  Number(
                                                      selectedProducts?.[0]
                                                          ?.remainingDebt || 0
                                                  ),
                                                  Number(
                                                      math.mul(
                                                          Number(rate || 1),
                                                          Number(
                                                              initialPayment?.[0]
                                                                  ?.initialPayment ||
                                                                  0
                                                          )
                                                      )
                                                  )
                                              ),
                                    });
                                }
                                setFieldsValue({
                                    creditType:
                                        creditPaymentData?.creditTypeId === null
                                            ? 0
                                            : creditPaymentData?.creditTypeId,
                                    creditAmount: Number(
                                        creditPaymentData?.totalCreditAmount
                                    ).toFixed(2),
                                    depositAmount: Number(
                                        creditPaymentData?.totalDepositAmount
                                    ).toFixed(2),
                                    creditPercentage: math
                                        .div(
                                            math.mul(
                                                Number(
                                                    creditPaymentData?.totalCreditAmount ||
                                                        0
                                                ),
                                                100
                                            ),
                                            Number(
                                                totalMonthlyPaymentAmount || 1
                                            )
                                        )
                                        .toFixed(2),
                                    depositPercentage: math
                                        .div(
                                            math.mul(
                                                Number(
                                                    creditPaymentData?.totalDepositAmount ||
                                                        0
                                                ),
                                                100
                                            ),
                                            Number(
                                                totalMonthlyPaymentAmount || 1
                                            )
                                        )
                                        .toFixed(2),
                                    monthlyPayment: Number(
                                        data?.[0]?.totalMonthlyPaymentAmount ||
                                            0
                                    ),
                                    date: moment(creditPaymentData?.startDate),
                                });
                            }
                        },
                    });
                }
            },
        });
        fetchCreditTypes();
        fetchProducts({ filters: { isDeleted: 0 } });
    }, []);

    useEffect(() => {
        setActiveTab('2');
        if (!id) {
            setFieldsValue({ date: moment(today, dateFormat) });
        }
        if (invoiceId) {
            fetchSalesInvoiceInfo({
                id: invoiceId,
                onSuccess: ({ data }) => {
                    setInvoiceInfo(data);
                },
            });
        }
    }, [invoiceId]);

    const handleCreateCredit = () => {
        validateFields((errors, values) => {
            const errorArr = Object.keys(errors || {});
            if (!errors) {
                if (
                    id &&
                    Number(getFieldValue('monthlyPayment') || 0) >
                        Number(
                            math.add(
                                Number(initialRemainingDebt || 0),
                                Number(getFieldValue('creditAmount') || 0),
                                Number(getFieldValue('depositAmount') || 0)
                            ) || 0
                        )
                ) {
                    setFields({
                        monthlyPayment: {
                            name: 'monthlyPayment',
                            value: getFieldValue('monthlyPayment'),
                            errors: ['Aylıq ödəniş borcdan çox ola bilməz.'],
                        },
                    });
                } else if (
                    Number(getFieldValue('monthlyPayment') || 0) >
                    math.add(
                        math.sub(
                            Number(initialRemainingDebt || 0),
                            Number(
                                math.mul(
                                    Number(rate || 1),
                                    Number(
                                        initialPayment?.[0]?.initialPayment || 0
                                    )
                                )
                            )
                        ),
                        Number(getFieldValue('creditAmount') || 0),
                        Number(getFieldValue('depositAmount') || 0)
                    )
                ) {
                    if (checked && debtResult <= 0) {
                        handleCreateInvoice(values);
                    }
                    setFields({
                        monthlyPayment: {
                            name: 'monthlyPayment',
                            value: getFieldValue('monthlyPayment'),
                            errors: ['Aylıq ödəniş borcdan çox ola bilməz.'],
                        },
                    });
                } else {
                    handleCreateInvoice(values);
                }
            } else if (
                errorArr.includes('paymentAmount') ||
                errorArr.includes('paymentType') ||
                errorArr.includes('paymentCurrency') ||
                errorArr.includes('paymentAccount')
            ) {
                setActiveTab('1');
            } else {
                setActiveTab('2');
            }
        });
    };

    const handleCreateInvoice = values => {
        const {
            creditType,
            creditAmount,
            monthlyPayment,
            depositAmount,
            date,
            paymentCurrency,
            client,
            paymentAmount,
            paymentAccount,
            paymentType,
        } = values;
        let newPurchaseInvoice = {};
        newPurchaseInvoice = {
            invoice: Number(invoiceId),
            creditType: creditType === 0 ? null : creditType,
            creditAmount: Number(creditAmount),
            depositAmount: Number(depositAmount),
            monthlyPaymentAmount: Number(monthlyPayment),
            startDate: date.format(dateFormat),
        };

        const data = {
            type: [1, 3, 10].includes(invoiceInfo.invoiceType) ? -1 : 1,
            dateOfTransaction: moment().format(fullDateTimeWithSecond),
            cashbox: paymentAccount,
            typeOfPayment: paymentType,
            useAdvance: false,
            amounts_ul: [Number(paymentAmount)],
            invoices_ul: [Number(invoiceId)],
            rate,
            currencies_ul: [paymentCurrency],
        };

        if (id) {
            editCreditPayments({
                id: Number(id),
                data: newPurchaseInvoice,
                onSuccessCallback: ({ data }) => {
                    toast.success('Əməliyyat uğurla tamamlandı.');
                    history.goBack()
                },
            });
        } else if (checked && initialPayment && initialPayment?.length > 0) {
            if (debtResult > 0) {
                createOperationInvoice(data, () => {
                    createCreditPayments({
                        data: newPurchaseInvoice,
                        onSuccessCallback: ({ data }) => {
                            toast.success('Əməliyyat uğurla tamamlandı.');
                            history.goBack()
                        },
                        onFailureCallback: ({ error }) => {
                            if (
                                error.response.data.error.message ===
                                'Credit was already created'
                            ) {
                                toast.error(
                                    'Bu qaiməyə ödəniş cədvəli artıq qurulub.'
                                );
                            }
                        },
                    });
                });
            } else {
                swal({
                    title: 'Diqqət!',
                    text: `Qaimə üzrə borc olmadıqda ödəniş cədvəli qurula bilməz. Əməliyyatı davam etdirsəniz, ödəniş həyata keçirilərək borc bağlanacaq.`,
                    buttons: {
                        cancel: {
                            text: 'İmtina',
                            value: null,
                            visible: true,
                            closeModal: true,
                        },
                        confirm: {
                            text: 'Davam et',
                            value: true,
                            visible: true,
                            className: `${styles.swalButtons}`,
                            closeModal: true,
                        },
                    },
                }).then(confirm => {
                    if (confirm) {
                        createOperationInvoice(data, () => {
                            history.goBack()
                        });
                    }
                });
            }
        } else if (debtResult <= 0) {
            toast.error(
                'Qalıq borc olmadıqda, qaiməyə kredit tətbiq edilə bilməz.'
            );
            history.goBack()
        } else {
            createCreditPayments({
                data: newPurchaseInvoice,
                onSuccessCallback: ({ data }) => {
                    toast.success('Əməliyyat uğurla tamamlandı.');
                    history.goBack()
                },
                onFailureCallback: ({ error }) => {
                    if (
                        error.response.data.error.message ===
                        'Credit was already created'
                    ) {
                        toast.error('Bu qaiməyə ödəniş cədvəli artıq qurulub.');
                    }
                },
            });
        }
    };

    return (
        <ProWrapper>
            <div className={styles.newOperationContainer}>
                <Row>
                    <Col span={20} offset={2}>
                        <Form>
                            {
                                id?
                                <a
                                onClick={history.goBack}
                                className={styles.returnBackButton}>
                                <MdKeyboardArrowLeft
                                    size={24}
                                    style={{ marginRight: 4 }}
                                />
                                Ödəniş cədvəllərinin siyahısı
                                </a>
                            :
                            <Link
                                to={ returnUrl}
                                className={styles.returnBackButton}
                            >
                                <MdKeyboardArrowLeft
                                    size={24}
                                    style={{ marginRight: 4 }}
                                />
                                Ödəniş cədvəllərinin siyahısı
                            </Link>}
                            <h3 className={styles.title}>
                                {id ? 'Düzəliş et' : 'Yeni ödəniş cədvəli'}
                            </h3>

                            <Tabs
                                className={styles.tabs}
                                type="card"
                                activeKey={activeTab}
                                onTabClick={handleActiveTabChange}
                            >
                                <TabPane
                                    tab="Ümumi məlumat"
                                    key="1"
                                    forceRender
                                >
                                    <GeneralInfo
                                        checked={checked}
                                        setChecked={setChecked}
                                        initialPaymentTransactions={
                                            initialPaymentTransactions
                                        }
                                        id={invoiceId}
                                        edit={id}
                                        form={form}
                                        returnUrl={returnUrl}
                                        invoiceInfo={invoiceInfo}
                                        summaries={summaries}
                                        summary_types={summary_types}
                                        rate={rate}
                                        initialPayment={initialPayment}
                                        setInitialPayment={setInitialPayment}
                                        setDebtResult={setDebtResult}
                                        setInitialRemainingDebt={
                                            setInitialRemainingDebt
                                        }
                                    />
                                </TabPane>
                                <TabPane
                                    tab="Kredit şərtləri"
                                    key="2"
                                    disabled={checked && debtResult <= 0}
                                    forceRender
                                >
                                    <CreditTerms
                                        disabled={checked && debtResult <= 0}
                                        form={form}
                                        summaries={summaries}
                                        setSummaries={setSummaries}
                                        summary_types={summary_types}
                                        creditPayment={creditPayment}
                                        setCreditPayment={setCreditPayment}
                                        rate={rate}
                                        initialPayment={initialPayment}
                                        creditPayments={creditPayments}
                                        id={id}
                                        invoiceId={invoiceId}
                                        selectedCreditType={selectedCreditType}
                                        setSelectedCreditType={
                                            setSelectedCreditType
                                        }
                                        initialRemainingDebt={
                                            initialRemainingDebt
                                        }
                                        initialPaymentTransactions={
                                            initialPaymentTransactions
                                        }
                                    />
                                </TabPane>
                            </Tabs>
                            <div className={styles.ActionButtons}>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        submit(() => {
                                            handleCreateCredit();
                                        });
                                    }}
                                    loading={
                                        createCreditLoading ||
                                        createInvoicePaymentLoading ||
                                        editCreditPaymentsLoadings
                                    }
                                    disabled={
                                        createCreditLoading ||
                                        createInvoicePaymentLoading ||
                                        editCreditPaymentsLoadings
                                    }
                                    style={{ marginRight: '10px' }}
                                >
                                    Təsdiq et
                                </Button>

                                <Button
                                    onClick={() =>
                                       history.goBack()
                                           
                                    }
                                    style={{ marginLeft: '10px' }}
                                >
                                    İmtina et
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>
        </ProWrapper>
    );
};

const mapStateToProps = state => ({
    invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    creditPayments: state.paymentTableReducer.creditPayments,
    createCreditLoading: state.loadings.createCreditPayments,
    createInvoicePaymentLoading: state.loadings.createInvoicePayment,
    editCreditPaymentsLoadings: state.loadings.editCreditPayments,
    selectedProducts: state.salesOperation.selectedProducts,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceInfo,
        fetchProducts,
        fetchCreditTypes,
        createCreditPayments,
        editCreditPayments,
        getCreditPayment,
        fetchCreditPayments,
        createOperationInvoice,
        fetchOperationsList,
        fetchCreditType,
    }
)(
    Form.create({
        name: 'PaymentTableForm',
    })(AddPaymentTable)
);
