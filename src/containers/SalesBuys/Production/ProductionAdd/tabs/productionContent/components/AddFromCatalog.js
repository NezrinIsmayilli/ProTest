/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { ProModal, ProSelect } from 'components/Lib';
import {
    clearProductsFromCatalog,
    clearSearchedCatalogs,
    fetchSalesPrices,
} from 'store/actions/sales-operation';
import { Button } from 'antd';
import math from 'exact-math';
import { roundToDown } from 'utils';
import styles from '../../../styles.module.scss';

const AddFromCatalogModal = ({
    isVisible,
    form = {},
    priceTypesLoading = false,
    products,
    catalogs,
    fetchCatalogs,
    selectedProducts,
    selectedExpenses,
    invoice_expense_rate,
    setSelectedProducts,
    fetchProducts,
    toggleModal,
    catalogsLoading,
    productsLoading,
    clearProductsFromCatalog,
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
        setSelectedChildCatalogId(undefined);
        if (catalogs.children[selectedCatalogId].length > 0) {
            return;
        }
        fetchProducts(selectedCatalogId);
    };

    const handleChildCatalogSelect = selectedChildCatalogId => {
        setSelectedChildCatalogId(selectedChildCatalogId);
        fetchProducts(selectedChildCatalogId);
    };

    const clearModal = () => {
        setNewSelectedProducts([]);
        setSelectedCatalogId(undefined);
        setSelectedChildCatalogId(undefined);
        dispatch(clearProductsFromCatalog);
    };
    useEffect(() => {
        if (isVisible) {
            fetchCatalogs();
        } else {
            clearModal();
        }
    }, [isVisible]);

    const handleConfirmClick = () => {
        const total_expense_amount = selectedExpenses.reduce(
            (total_amount, { expense_amount }) =>
                math.add(
                    total_amount,
                    math.mul(
                        Number(expense_amount) || 0,
                        Number(invoice_expense_rate)
                    )
                ),
            0
        );
        const invoice_amount = [
            ...selectedProducts,
            newSelectedProducts,
        ].reduce(
            (totalPrice, { invoiceQuantity, invoicePrice }) =>
                math.add(
                    totalPrice,
                    math.mul(
                        Number(invoiceQuantity) || 0,
                        Number(invoicePrice) || 0
                    )
                ),
            0
        );

        const expense_amount_in_percentage = math.div(
            math.mul(Number(total_expense_amount), 100),
            Number(invoice_amount) || 1
        );
        setSelectedProducts(
            [...newSelectedProducts, ...selectedProducts].map(product => {
                const expense_amount = math.div(
                    math.mul(
                        Number(product.invoicePrice) || 0,
                        Number(expense_amount_in_percentage) || 0
                    ),
                    100
                );

                return {
                    ...product,
                    invoiceQuantity: product.invoiceQuantity
                        ? product.invoiceQuantity
                        : product.catalog.isWithoutSerialNumber
                        ? 1
                        : null,
                    expense_amount_in_percentage: roundToDown(
                        expense_amount_in_percentage
                    ),
                    expense_amount: roundToDown(expense_amount),
                    cost: roundToDown(
                        math.add(
                            Number(expense_amount) || 0,
                            Number(product.invoicePrice) || 0
                        )
                    ),
                };
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
                    <ProSelect
                        allowClear={false}
                        loading={catalogsLoading}
                        data={catalogs.root || []}
                        value={selectedCatalogId}
                        onChange={handleCatalogSelect}
                    />
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
                    <ProSelect
                        mode="multiple"
                        loading={productsLoading}
                        keys={['name', 'quantityLabel']}
                        data={
                            [...selectedProducts, ...newSelectedProducts]
                                .length > 0
                                ? products.filter(
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
                                : products
                        }
                        value={undefined}
                        onChange={addProduct}
                        disabled={!selectedCatalogId}
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
    catalogs: state.salesOperation.catalogs,
    products: state.salesOperation.productsFromCatalog,
    catalogsLoading: state.loadings.fetchCatalogsByInvoiceType,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    productsLoading: state.loadings.fetchProductsFromCatalog,
    priceTypesLoading: state.loadings.fetchSalesPricesFromCatalog,
});

export const AddFromCatalog = connect(
    mapStateToProps,
    {
        clearProductsFromCatalog,
        clearSearchedCatalogs,
        fetchSalesPrices,
    }
)(AddFromCatalogModal);
