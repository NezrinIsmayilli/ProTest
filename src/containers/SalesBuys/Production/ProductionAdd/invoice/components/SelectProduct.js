import React from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  clearProductsByName,
  setSelectedProducts,
} from 'store/actions/sales-operation';
import { ProSelect } from 'components/Lib';
import { Spin } from 'antd';
import math from 'exact-math';

const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const SelectProductComponent = props => {
  const {
    isLoading = false,
    disabled = false,
    priceTypesLoading = false,
    summaries,
    products,
    selectedProducts,
    handleProductNameChange,
    clearProductsByName,
    setSelectedProducts,
    productionInfo,
  } = props;
  const dispatch = useDispatch();

  const handleProductSelect = productId => {
    const newProduct = products.find(product => product.id === productId);
    const totalQuantity = selectedProducts.reduce(
      (total_amount, { invoiceQuantity }) =>
        math.add(total_amount, Number(invoiceQuantity) || 0),
      0
    );
    const total = [...selectedProducts, newProduct].reduce(
      (total_amount, { invoiceQuantity }) =>
        math.add(
          total_amount,
          math.mul(
            summaries.find(item => item.label === 'Cəmi').value > 0
              ? math.div(
                  Number(summaries.find(item => item.label === 'Cəmi').value) ||
                    0,
                  math.add(Number(totalQuantity), 1) || 1
                )
              : 0,
            Number(invoiceQuantity || 1)
          ) || 0
        ),
      0
    );
    dispatch(
      setSelectedProducts({
        newSelectedProducts: [...selectedProducts, newProduct].map(product => {
          const cost =
            summaries.find(item => item.label === 'Cəmi').value > 0
              ? math.div(
                  Number(summaries.find(item => item.label === 'Cəmi').value) ||
                    0,
                  math.add(Number(totalQuantity), 1)
                )
              : 0;

          const notRoundedCost =
            summaries.find(item => item.label === 'Cəmi').value > 0
              ? new BigNumber(
                  summaries.find(item => item.label === 'Cəmi').value
                ).dividedBy(new BigNumber(totalQuantity).plus(new BigNumber(1)))
              : 0;

          const cost_percentage =
            cost > 0 ? math.div(math.mul(Number(cost), 100), total || 1) : 0;
          return {
            ...product,
            cost_percentage: roundTo(Number(cost_percentage), 2),
            cost: roundTo(Number(cost), 4),
            total_price: Number(notRoundedCost),
            plannedCost: product.plannedCost
              ? product.plannedCost
              : 0,
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
          };
        }),
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
                ({ id }) => !selectedProducts.map(({ id }) => id).includes(id)
              )
            : products
        }
        onDropdownVisibleChange={handleDropdownClose}
        notFoundContent={
          isLoading || priceTypesLoading ? <Spin size="small" /> : null
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
