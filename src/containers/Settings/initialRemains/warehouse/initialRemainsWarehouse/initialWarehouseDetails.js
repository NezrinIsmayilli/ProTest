/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import {
    fetchSalesInvoiceInfo,
    fetchSalesInvoiceProducts,
    fetchSalesInvoiceProductsCount,
} from 'store/actions/salesAndBuys';
import { Button } from 'antd';
import { convertCurrency } from 'store/actions/settings/kassa';
import styles from './styles.module.scss';
import MoreDetail from './details/moreDetail';
import ProductsDetail from './details/productsDetail';

function OperationsDetails(props) {
    const {
        isDeletedForLog,
        loadingForLogs = false,
        activeTab,
        setActiveTab,
        visible,
        row,
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceProducts,
        fetchSalesInvoiceProductsCount,
        isLoading,
        tenant,
        allBusinessUnits,
        profile,
    } = props;

    const [detailsData, setDetailsData] = useState([]);
    const [tableDatas, setTableDatas] = useState([]);
    const [invoiceLength, setInvoiceLength] = useState(undefined);
    const [total, setTotal] = useState(0);
    const [filters, onFilter] = useFilterHandle(
        {
            limit: 8,
            page: 1,
        },
        ({ filters }) => {}
    );
    const handleChangeTab = value => setActiveTab(value);

    const getTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <MoreDetail
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
                    <ProductsDetail
                        setInvoiceLength={setInvoiceLength}
                        details={detailsData}
                        visible={visible}
                        isLoading={isLoading}
                        tableDatas={tableDatas}
                        row={row}
                        total={total}
                        onFilter={onFilter}
                        filter={filters}
                    />
                );
            default:
        }
    };

    useEffect(() => {
        if (!visible) {
            setDetailsData([]);
            setInvoiceLength(undefined);
        }
    }, [visible]);

    useEffect(() => {
        if (row.id) {
            fetchSalesInvoiceInfo({
                id: row.id,
                withoutProducts: 1,
                onSuccess: res => {
                    setDetailsData(res.data);
                },
            });
        }
    }, [row.id]);

    useEffect(() => {
        if (row.id) {
            fetchSalesInvoiceProducts({
                id: row.id,
                filters,
                onSuccess: res => {
                    if (res.data && res.data.content)
                        setTableDatas([
                            ...Object.keys(res.data.content).map(
                                index => res.data.content[index]
                            ),
                        ]);
                },
            });
            fetchSalesInvoiceProductsCount({
                id: row.id,
                filters,
                onSuccess: res => {
                    setTotal(res.data);
                },
            });
        }
    }, [filters, row.id]);
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
                    Məhsullar (
                    {invoiceLength ||
                        tableDatas.reduce(
                            (total, { quantity }) => total + Number(quantity),
                            0
                        )}
                    )
                </Button>
            </div>

            {getTabContent()}
        </div>
    );
}

const mapStateToProps = state => ({
    isLoading: state.financeOperationsReducer.isLoading,
    filteredList: state.financeOperationsReducer.filteredList,
    tenant: state.tenantReducer.tenant,
    profile: state.profileReducer.profile,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceInfo,
        fetchSalesInvoiceProducts,
        fetchSalesInvoiceProductsCount,
        convertCurrency,
    }
)(OperationsDetails);
