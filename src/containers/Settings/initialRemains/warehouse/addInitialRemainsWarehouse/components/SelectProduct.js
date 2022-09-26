import React from 'react';
import { connect, useDispatch } from 'react-redux';
import {
    clearProductsByName,
    setSelectedProducts,
} from 'store/actions/sales-operation';
import { ProSelect } from 'components/Lib';
import { Spin } from 'antd';
import math from 'exact-math';
import { roundToDown } from 'utils';

const SelectProductComponent = props => {
    const {
        isLoading = false,
        disabled = false,
        priceTypesLoading = false,
        products,
        selectedProducts,
        handleProductNameChange,
        invoice_expense_rate,
        selectedExpenses,
        clearProductsByName,
        setSelectedProducts,
    } = props;
    const dispatch = useDispatch();

    const handleProductSelect = productId => {
        const newProduct = products.find(product => product.id === productId);

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
        const invoice_amount = [...selectedProducts, newProduct].reduce(
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

        dispatch(
            setSelectedProducts({
                newSelectedProducts: [...selectedProducts, newProduct].map(
                    product => {
                        const expense_amount = math.div(
                            math.mul(
                                Number(product.invoicePrice) || 0,
                                Number(expense_amount_in_percentage) || 0
                            ),
                            100
                        );
                        return {
                            ...product,
                            expense_amount_in_percentage: roundToDown(
                                expense_amount_in_percentage
                            ),
                            expense_amount: roundToDown(expense_amount),
                            invoiceQuantity: product.invoiceQuantity
                                ? product.invoiceQuantity
                                : product.catalog.isWithoutSerialNumber
                                ? 1
                                : null,
                            cost: roundToDown(
                                math.add(
                                    Number(expense_amount) || 0,
                                    Number(product.invoicePrice) || 0
                                )
                            ),
                        };
                    }
                ),
            })
        );
    };

    const handleDropdownClose = open => {
        if (!open) {
            dispatch(clearProductsByName());
        }
    };

    return (
        <div style={{ width: '25%', minWidth: '300px', marginBottom: '20px' }}>
            <span style={{ fontSize: ' 14px' }}>Məhsul axtar:</span>
            <ProSelect
                isSearch
                mode="multiple"
                value={[]}
                allowClear={false}
                disabled={disabled}
                keys={['name', 'codeLabel', 'quantityLabel']}
                data={
                    selectedProducts.length > 0
                        ? products.filter(
                              ({ id }) =>
                                  !selectedProducts
                                      .map(({ id }) => id)
                                      .includes(id)
                          )
                        : products
                }
                onDropdownVisibleChange={handleDropdownClose}
                notFoundContent={
                    isLoading || priceTypesLoading ? (
                        <Spin size="small" />
                    ) : null
                }
                onSearch={productName => handleProductNameChange(productName)}
                onSelect={productId => handleProductSelect(productId)}
            />
        </div>
    );
};

const mapStateToProps = state => ({
    isLoading: state.loadings.fetchProductsListByName,
    priceTypesLoading: state.loadings.fetchSalesPricesByName,
    selectedExpenses: state.salesOperation.selectedExpenses,
    invoice_expense_rate: state.salesOperation.invoice_expense_rate,
    selectedProducts: state.salesOperation.selectedProducts,
    products: state.salesOperation.productsByName,
});
export const SelectProduct = connect(
    mapStateToProps,
    {
        setSelectedProducts,
        clearProductsByName,
    }
)(SelectProductComponent);
