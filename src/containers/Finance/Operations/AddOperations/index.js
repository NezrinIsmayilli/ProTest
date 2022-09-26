/* eslint-disable react-hooks/exhaustive-deps */
import React, { lazy, useState, useEffect, useRef } from 'react';
import { cookies } from 'utils/cookies';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { ProWrapper } from 'components/Lib';
import {
    fetchSalesInvoiceList,
    fetchSalesInvoiceInfo,
} from 'store/actions/salesAndBuys';
import { fetchOperationsList } from 'store/actions/finance/operations';
import { Tabs, Row, Col, Form } from 'antd';
import { connect } from 'react-redux';
import { getFirstSuitableKey } from 'utils';
import styles from './styles.module.scss';

const { TabPane } = Tabs;

const Invoice = lazy(() => import('./Invoice'));
const Payment = lazy(() => import('./Payment'));
const Transfer = lazy(() => import('./Transfer'));
const SalaryPayment = lazy(() => import('./SalaryPayment'));
const AdvancePayment = lazy(() => import('./Advance'));
const TenantPayment = lazy(() => import('./Tenant'));
const BalancePayment = lazy(() => import('./Balance'));
const Exchange = lazy(() => import('./Exchange'));

function AddOperation(props) {
    const history = useHistory();
    const location = useLocation();
    const {
        permissionsByKeyValue,
        fetchSalesInvoiceList,
        fetchSalesInvoiceInfo,
        fetchOperationsList,
        productionInvoices,
        contracts,
        form,
        tenant,
    } = props;
    const returnUrl = `/finance/operations`;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const { id: editId } = useParams();
    const id = urlParams.get('id');
    const tab = urlParams.get('tab');
    const [activeTab, setActiveTab] = useState();
    const tabVal = useRef(null);

    const handleActiveTabChange = (newTab, isVat = false) => {
        history.push({
            pathname: location.pathName,
            search: `?tab=${newTab}${isVat? '&isVat=true' :''}`,
        });
        setActiveTab(newTab);
    };

    const tabs = {
        transaction_invoice_payment: {
            label: 'Qaimə',
            component: Invoice,
            key: '1',
        },
        transaction_expense_payment: {
            label: 'Xərclər',
            component: Payment,
            key: '2',
        },
        salary_payment: {
            label: 'Əməkhaqqı ödənişi',
            component: SalaryPayment,
            key: '3',
        },
        transaction_advance_payment: {
            label: 'Avans',
            component: AdvancePayment,
            key: '4',
        },
        transaction_balance_creation_payment: {
            label: 'Təsisçi',
            component: BalancePayment,
            key: '5',
        },
        transaction_tenant_person_payment: {
            label: 'Təhtəl hesab',
            component: TenantPayment,
            key: '6',
        },
        money_transfer: {
            label: 'Transfer',
            component: Transfer,
            key: '7',
        },
        transaction_exchange: {
            label: 'Valyuta mübadiləsi',
            component: Exchange,
            key: '8',
        },
    };

    useEffect(() => {
        if (editId) {
            fetchOperationsList({
                filters: { ids: [editId] },
                onSuccessCallback: ({ data }) => {
                    let tabId = 0;
                    let isVat = false;
                    switch (data?.[0]?.transactionType) {
                        case 9:
                            tabId = 1;
                            break;
                        case 10:
                            tabId = 1;
                            isVat = true;
                            break;
                        case 8:
                            tabId = 2;
                            break;
                        case 6:
                            tabId = 3;
                            break;
                        case 11:
                            tabId = 4;
                            break;
                        case 7:
                            tabId = 5;
                            break;
                        case 12:
                            tabId = 6;
                            break;
                        case 4:
                            tabId = 7;
                            break;
                        case 13:
                            tabId = 8;
                            break;
                        default:
                    }
                    handleActiveTabChange(`${tabId}`, isVat);
                },
            });
        }
    }, [editId]);

    const { setFieldsValue, getFieldValue } = form;

    useEffect(() => {
        const permissionTab = Object.keys(tabs).filter(
            key => tabs[key].key == tab
        )[0];

        tabVal.current =
            permissionsByKeyValue[permissionTab] &&
            permissionsByKeyValue[permissionTab].permission === 2
                ? Object.keys(tabs).filter(key => tabs[key].key == tab)[0]
                : null;
    }, [tab]);

    useEffect(() => {
        if (id) {
            fetchSalesInvoiceInfo({
                id,
                onSuccess: data => {
                    const { businessUnitId } = data.data;
                    if (businessUnitId === null) {
                        cookies.set('_TKN_UNIT_', 0);
                    } else {
                        cookies.set('_TKN_UNIT_', businessUnitId);
                    }
                },
            });
            setActiveTab('1');
        } else if (!editId) {
            let firstTab = null;
            if (tabVal.current) {
                firstTab = tabVal.current;
                tabVal.current = null;
            } else {
                firstTab = getFirstSuitableKey(
                    Object.values(permissionsByKeyValue).filter(
                        ({ group_key, sub_group_key, permission }) =>
                            group_key === 'transaction' &&
                            sub_group_key === 'operations' &&
                            permission === 2
                    )
                );
            }
            setActiveTab(firstTab ? tabs[firstTab].key : null);
        }
    }, [id]);

    return (
        <ProWrapper>
            <section className="operationsWrapper">
                <div className={styles.containerFluid}>
                    <Row>
                        <Col span={16} offset={4}>
                            <Link
                                to="/finance/operations"
                                className={styles.backBtn}
                            >
                                <MdKeyboardArrowLeft
                                    size={24}
                                    style={{ marginRight: 4 }}
                                />
                                Əməliyyatlar Siyahısı
                            </Link>
                            <h3 className={styles.title}>
                                {editId ? 'Düzəliş et' : 'Yeni əməliyyat'}
                            </h3>
                            <p className={styles.tabLabel}>Əməliyyat növü</p>

                            <Tabs
                                className={styles.customTabs}
                                type="card"
                                activeKey={activeTab}
                                onTabClick={handleActiveTabChange}
                            >
                                {Object.keys(tabs).map(tab => (
                                    <TabPane
                                        tab={tabs[tab].label}
                                        key={tabs[tab].key}
                                        disabled={
                                            permissionsByKeyValue[tab]
                                                ?.permission !== 2 ||
                                            (editId &&
                                                activeTab !== tabs[tab].key)
                                        }
                                    >
                                        {activeTab === tabs[tab].key &&
                                            React.createElement(
                                                tabs[tab].component,
                                                {
                                                    ...props,
                                                    returnUrl,
                                                    editId,
                                                }
                                            )}
                                    </TabPane>
                                ))}
                            </Tabs>
                        </Col>
                    </Row>
                </div>
            </section>
        </ProWrapper>
    );
}

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    productionInvoices: state.salesAndBuysReducer.invoices,
    contracts: state.contractsReducer.contracts,
    tenant: state.tenantReducer.tenant,
});
export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchSalesInvoiceInfo,
        fetchOperationsList,
    }
)(Form.create({ name: 'AddOperation' })(AddOperation));
