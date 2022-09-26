/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchProduct } from 'store/actions/product';
import { Button } from 'antd';
import { fetchStockStaticsInfo } from 'store/actions/stock';
import ProductInvoice from './details/productInvoice';
import MoreDetails from './details/moreDetails';
import BarcodeDetails from './details/barcode';
import styles from '../styles.module.scss';

function ProductDetails(props) {
    const {
        row,
        modalIsVisible,
        suppliers,
        activeTableTab,
        stockInfo,
        fetchStockStaticsInfo,
        product,
        filters,
        activeTab,
        setActiveTab,
        fetchProduct,
    } = props;

    useEffect(() => {
        if (row) {
            fetchStockStaticsInfo({
                filters: {
                    suppliers,
                    invoiceTypes:
                        activeTableTab === 1 ? filters.invoiceTypes : [9],
                    daysCountInStockFrom: filters.daysCountInStockFrom,
                    daysCountInStockTo: filters.daysCountInStockTo,
                    serialNumber: filters.serialNumber,
                    attachedInvoiceTypes: filters.attachedInvoiceTypes,
                },
                stockId: row?.stock_id,
                productId: row?.product_id,
            });
        }
    }, [row]);

    useEffect(() => row?.product_id && fetchProduct({ id: row.product_id }), [
        row,
    ]);

    useEffect(() => {
        if (modalIsVisible) {
            setActiveTab(2);
        }
    }, [modalIsVisible]);

    const handleChangeTab = value => setActiveTab(value);

    const getTabContent = () => {
        switch (activeTab) {
            case 0:
                return <MoreDetails row={row} />;
            case 1:
                return <BarcodeDetails />;
            case 2:
                return <ProductInvoice row={row} />;
            default:
        }
    };

    return (
        <div>
            <div className={styles.detailsTab}>
                {product?.barcode === null && stockInfo?.length === 0 ? null : (
                    <>
                        <Button
                            size="large"
                            type={activeTab === 0 ? 'primary' : ''}
                            onClick={() => handleChangeTab(0)}
                        >
                            Əlavə məlumat
                        </Button>
                        {product?.barcode !== null && (
                            <Button
                                style={{
                                    borderRadius: 0,
                                    borderLeft: 'none',
                                }}
                                size="large"
                                type={activeTab === 1 ? 'primary' : ''}
                                onClick={() => handleChangeTab(1)}
                            >
                                Barkod
                            </Button>
                        )}
                        <Button
                            size="large"
                            type={activeTab === 2 ? 'primary' : ''}
                            onClick={() => handleChangeTab(2)}
                        >
                            Qaimələr ({stockInfo?.length || 0})
                        </Button>
                    </>
                )}
            </div>

            {getTabContent()}
        </div>
    );
}

const mapStateToProps = state => ({
    stockInfo: state.stockReducer.stockStaticsInfo,
    mainCurrencyCode: state.stockReducer.mainCurrencyCode,
    stockStatisticInfoLoading: state.loadings.fetchStockStaticsInfo,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    product: state.productReducer.product,
});

export default connect(
    mapStateToProps,
    {
        fetchStockStaticsInfo,
        fetchProduct,
    }
)(ProductDetails);
