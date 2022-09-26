/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProModal, ProSelect, ProAsyncSelect } from 'components/Lib';
import {
    setSelectedProducts,
    clearProductsFromCatalog,
    clearSearchedCatalogs,
    fetchSalesPrices,
} from 'store/actions/sales-operation';
import { Button } from 'antd';
import math from 'exact-math';
import styles from '../../styles.module.scss';

const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const AddFromCatalogModal = ({
    summaries,
    isVisible,
    form = {},
    priceTypesLoading = false,
    filteredProducts,
    products,
    catalogs,
    fetchCatalogs,
    selectedProducts,
    setSelectedProducts,
    toggleModal,
    catalogsLoading,
    clearProductsFromCatalog,
    setSelectedCatalog = () => null,
    fetchProductFromCatalogs = () => null,
    productionInfo,
}) => {
    const dispatch = useDispatch();
    const { getFieldValue } = form;
    const [newSelectedProducts, setNewSelectedProducts] = useState([]);
    const [selectedCatalogId, setSelectedCatalogId] = useState(undefined);
    const [selectedChildCatalogId, setSelectedChildCatalogId] = useState(
        undefined
    );

    const handleModal = () => {
        toggleModal();
    };

    const handleCatalogSelect = selectedCatalogId => {
        setSelectedCatalogId(selectedCatalogId);
        setSelectedCatalog(selectedCatalogId);
        setSelectedChildCatalogId(undefined);
        if (catalogs.children[selectedCatalogId].length > 0) {
            return;
        }
        fetchProductFromCatalogs(selectedCatalogId, 1, 20, '', 1);
    };

    const handleChildCatalogSelect = selectedChildCatalogId => {
        setSelectedChildCatalogId(selectedChildCatalogId);
        setSelectedCatalog(selectedChildCatalogId);
        fetchProductFromCatalogs(selectedChildCatalogId, 1, 20, '', 1);
    };

    const clearModal = () => {
        setNewSelectedProducts([]);
        setSelectedCatalog(undefined);
        setSelectedCatalogId(undefined);
        setSelectedChildCatalogId(undefined);
        dispatch(clearProductsFromCatalog);
    };
    useEffect(() => {
        if (isVisible) {
            fetchCatalogs(1, 20, '', 1);
        } else {
            clearModal();
        }
    }, [isVisible]);

    const handleConfirmClick = () => {
        const totalQuantity = [
            ...newSelectedProducts,
            ...selectedProducts,
        ].reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(total_amount, Number(invoiceQuantity) || 0),
            0
        );
        const total = [...newSelectedProducts, ...selectedProducts].reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(
                    total_amount,
                    math.mul(
                        summaries.find(item => item.label === 'Cəmi').value > 0
                            ? math.div(
                                  Number(
                                      summaries.find(
                                          item => item.label === 'Cəmi'
                                      ).value
                                  ) || 0,
                                  math.add(Number(totalQuantity), 1) || 1
                              )
                            : 0,
                        Number(invoiceQuantity || 1)
                    ) || 0
                ),
            0
        );
        const cost =
            summaries.find(item => item.label === 'Cəmi').value > 0
                ? math.div(
                      Number(
                          summaries.find(item => item.label === 'Cəmi').value
                      ) || 0,
                      math.add(Number(totalQuantity), 1) || 1
                  )
                : 0;

        const notRoundedCost =
            summaries.find(item => item.label === 'Cəmi').value > 0
                ? new BigNumber(
                      summaries.find(item => item.label === 'Cəmi').value
                  ).dividedBy(
                      new BigNumber(totalQuantity).plus(new BigNumber(1)) || 1
                  )
                : 0;

        const cost_percentage =
            cost > 0
                ? math.div(math.mul(Number(cost), 100), Number(total) || 1)
                : 0;
        dispatch(
            setSelectedProducts({
                newSelectedProducts: [
                    ...newSelectedProducts,
                    ...selectedProducts,
                ].map(product => ({
                    ...product,
                    cost_percentage: roundTo(Number(cost_percentage), 2),
                    cost: roundTo(Number(cost), 4),
                    total_price: Number(notRoundedCost),
                    plannedCost: product.plannedCost ? product.plannedCost : 0,
                    plannedPrice: product.plannedPrice
                        ? product.plannedPrice
                        : 0,
                    invoiceQuantity: product.invoiceQuantity
                        ? product.invoiceQuantity
                        : product.catalog.isWithoutSerialNumber ||
                          !productionInfo ||
                          (productionInfo && productionInfo.stockToId === null)
                        ? 1
                        : null,
                })),
            })
        );
        toggleModal();
    };

    const addProduct = productIds => {
        const [productId] = productIds;
        const newProduct = products.find(product => product.id === productId);
        setNewSelectedProducts(prevNewSelectedProducts => [
            newProduct,
            ...prevNewSelectedProducts,
        ]);
    };
    const handleSelectedProductsChange = productIds => {
        const newProducts = newSelectedProducts.filter(product =>
            productIds.includes(product.id)
        );
        setNewSelectedProducts(newProducts);
    };

    return (
        <ProModal
            maskClosable
            width={400}
            isVisible={isVisible}
            customStyles={styles.AddSerialNumbersModal}
            handleModal={handleModal}
        >
            <div className={styles.AddFromCatalog}>
                <h2>Kataloqdan seç</h2>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Kataloqlar</span>
                    <ProAsyncSelect
                        allowClear={false}
                        selectRequest={fetchCatalogs}
                        data={catalogs.root || []}
                        value={selectedCatalogId}
                        valueOnChange={e => {
                            handleCatalogSelect(e);
                        }}
                    />
                    {/* <ProSelect
                    allowClear={false}
                    loading={catalogsLoading}
                    data={catalogs.root || []}
                    value={selectedCatalogId}
                    onChange={handleCatalogSelect}
                  /> */}
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Alt kataloqlar</span>
                    <ProSelect
                        loading={catalogsLoading}
                        value={selectedChildCatalogId}
                        data={
                            selectedCatalogId
                                ? catalogs.children[selectedCatalogId]
                                : []
                        }
                        onChange={handleChildCatalogSelect}
                        disabled={!selectedCatalogId}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>Məhsullar</span>
                    <ProAsyncSelect
                        mode="multiple"
                        keys={['name', 'quantityLabel']}
                        selectRequest={(
                            page,
                            limit,
                            search,
                            stateReset,
                            onSuccessCallback
                        ) => {
                            if (selectedCatalogId) {
                                fetchProductFromCatalogs(
                                    catalogs.children[selectedCatalogId]
                                        .length > 0
                                        ? selectedChildCatalogId
                                        : selectedCatalogId,
                                    page,
                                    limit,
                                    search,
                                    stateReset,
                                    onSuccessCallback
                                );
                            }
                        }}
                        data={
                            [...selectedProducts, ...newSelectedProducts]
                                .length > 0
                                ? filteredProducts.filter(
                                      product =>
                                          ![
                                              ...selectedProducts.map(
                                                  selectedProduct =>
                                                      selectedProduct?.id
                                              ),
                                              ...newSelectedProducts.map(
                                                  newSelectedProduct =>
                                                      newSelectedProduct?.id
                                              ),
                                          ].includes(product?.id)
                                  )
                                : filteredProducts
                        }
                        disabled={
                            !selectedCatalogId ||
                            (catalogs.children[selectedCatalogId].length > 0 &&
                                !selectedChildCatalogId)
                        }
                        value={undefined}
                        valueOnChange={e => {
                            addProduct(e);
                        }}
                    />
                </div>
                <div className={styles.selectBox}>
                    <span className={styles.selectLabel}>
                        Seçilmiş məhsullar
                    </span>
                    <ProSelect
                        mode="multiple"
                        data={newSelectedProducts}
                        value={newSelectedProducts.map(
                            newSelectedProduct => newSelectedProduct?.id
                        )}
                        onChange={handleSelectedProductsChange}
                    />
                </div>
                <div className={styles.button}>
                    <Button
                        type="primary"
                        className={styles.confirmButton}
                        onClick={handleConfirmClick}
                        loading={priceTypesLoading}
                    >
                        Təsdiq et
                    </Button>
                    <Button
                        className={styles.cancelButton}
                        type="danger"
                        onClick={clearModal}
                    >
                        Sıfırla
                    </Button>
                </div>
            </div>
        </ProModal>
    );
};

const mapStateToProps = state => ({
    products: state.salesOperation.productsFromCatalog,
    selectedProducts: state.salesOperation.selectedProducts,
    catalogsLoading: state.loadings.fetchCatalogsByInvoiceType,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    productsLoading: state.loadings.fetchProductsFromCatalog,
    priceTypesLoading: state.loadings.fetchSalesPricesFromCatalog,
});

export const AddFromCatalog = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        clearProductsFromCatalog,
        clearSearchedCatalogs,
        fetchSalesPrices,
    }
)(AddFromCatalogModal);
