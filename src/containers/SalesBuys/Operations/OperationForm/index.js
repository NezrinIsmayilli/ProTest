/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { cookies } from 'utils/cookies';
import onScan from 'onscan.js';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { ProWrapper } from 'components/Lib';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Tabs, Row, Col } from 'antd';
import {
    fetchSalesInvoiceInfo,
    fetchSalesInvoiceList,
} from 'store/actions/salesAndBuys';
import { handleResetInvoiceFields } from 'store/actions/sales-operation';
import { useHistory, useParams, Link } from 'react-router-dom';
import { getFirstSuitableKey } from 'utils';
import styles from './styles.module.scss';
import {
    Sales,
    Purchase,
    ImportPurchase,
    ReturnToSupplier,
    ReturnFromCustomer,
    Transfer,
    WritingOff,
} from './tabs';

const { TabPane } = Tabs;
const returnUrl = `/sales/operations`;

const tabs = {
    purchase_invoice: {
        label: 'Alış',
        component: Purchase,
        key: '1',
    },
    import_purchase: {
        label: 'İdxal alışı',
        component: ImportPurchase,
        key: '10',
    },
    sales_invoice: {
        label: 'Satış',
        component: Sales,
        key: '2',
    },
    return_from_customer_invoice: {
        label: 'Geri alma',
        component: ReturnFromCustomer,
        key: '3',
    },
    return_to_supplier_invoice: {
        label: 'Geri qaytarma',
        component: ReturnToSupplier,
        key: '4',
    },
    transfer_invoice: {
        label: 'Transfer',
        component: Transfer,
        key: '5',
    },
    remove_invoice: {
        label: 'Silinmə',
        component: WritingOff,
        key: '6',
    },
};

const UpdateOperation = props => {
    const {
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceList,
        permissionsByKeyValue,
        handleResetInvoiceFields,
    } = props;
    const { invoiceType, id } = useParams();
    const [activeTab, setActiveTab] = useState(null);
    const [invoiceInfo, setInvoiceInfo] = useState(undefined);
    const [scrolled, setScrolled] = useState(false);

    const history = useHistory();
    const { location } = history;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tab = urlParams.get('goback');

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
    const handleFirstAccessibleTab = () => {
        const firstTab = getFirstSuitableKey(
            Object.values(permissionsByKeyValue).filter(
                ({ group_key, sub_group_key, permission }) =>
                    group_key === 'sales' &&
                    sub_group_key === 'operations' &&
                    permission === 2
            )
        );
        setActiveTab(firstTab ? tabs[firstTab].key : null);
    };
    useEffect(() => {
        fetchSalesInvoiceList({
            filters: {
                invoiceTypes: [11],
                allProduction: 1,
                isDeleted: 0,
                limit: 10000,
            },
        });
    }, []);

    useEffect(() => {
        if (id) {
            setActiveTab(invoiceType);
            fetchSalesInvoiceInfo({
                id,
                onSuccess: ({ data }) => {
                    if (
                        !data.canEdit &&
                        data.invoiceType !== 2 &&
                        data.invoiceType !== 1 &&
                        data.invoiceType !== 3 &&
                        data.invoiceType !== 4 &&
                        data.invoiceType !== 5 &&
                        data.invoiceType !== 10
                    ) {
                        toast.error('Bu qaimədə düzəliş oluna bilməz.');
                        history.goBack();
                    } else {
                        setInvoiceInfo(data);
                    }
                },
            });
        } else {
            handleResetInvoiceFields();
            handleFirstAccessibleTab();
        }
    }, [id]);

    // React.useEffect(() => {
    //     window.history.pushState(null, document.title, window.location.href);
    //     window.addEventListener('popstate', function() {
    //         window.history.pushState(
    //             null,
    //             document.title,
    //             window.location.href
    //         );
    //     });
    // }, []);

    const onScroll = e => setScrolled(true);

    return (
        <ProWrapper onScroll={onScroll}>
            <div className={styles.newOperationContainer}>
                <Row>
                    <Col span={16} offset={4}>
                        <a
                            onClick={() =>
                                tab !== null
                                    ? history.push('/sales/operations')
                                    : history.goBack()
                            }
                            className={styles.returnBackButton}
                        >
                            <MdKeyboardArrowLeft
                                size={24}
                                style={{ marginRight: 4 }}
                            />
                            Əməliyyatlar Siyahısı
                        </a>
                        <h3 className={styles.title}>
                            {id ? 'Düzəliş et' : 'Yeni əməliyyat'}
                        </h3>
                        <p className={styles.tabsHeader}>Əməliyyat növü</p>

                        <Tabs
                            className={styles.tabs}
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
                                            ?.permission !== 2 || invoiceType
                                            ? String(invoiceType) !==
                                            tabs[tab].key
                                            : false
                                    }
                                >
                                    {activeTab === tabs[tab].key &&
                                        React.createElement(
                                            tabs[tab].component,
                                            {
                                                id,
                                                returnUrl,
                                                invoiceType,
                                                invoiceInfo,
                                                onScan,
                                                scrolled,
                                                setScrolled,
                                            }
                                        )}
                                </TabPane>
                            ))}
                        </Tabs>
                    </Col>
                </Row>
            </div>
        </ProWrapper>
    );
};

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceList,
        handleResetInvoiceFields,
    }
)(UpdateOperation);
