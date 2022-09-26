import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import {
  defaultNumberFormat,
  formatNumberToLocale,
  re_amount,
  getPriceValue,
} from 'utils';
import { setSelectedProducts } from 'store/actions/sales-operation';
import math from 'exact-math';
import { Price } from '../invoice';

const BigNumber = require('bignumber.js');

const CostTable = props => {
  const { selectedProducts, invoiceCurrencyCode, setSelectedProducts } = props;

  const updatePercentage = (productId, newPrice) => {
    const newSelectedProducts = selectedProducts.map(selectedProduct => {
      if (selectedProduct.id === productId) {
        const expense_amount = new BigNumber(
          new BigNumber(selectedProduct.invoicePrice || 1).multipliedBy(
            new BigNumber(newPrice || 0)
          )
        ).dividedBy(100);
        return {
          ...selectedProduct,
          expense_amount_in_percentage: newPrice,
          expense_amount,
          cost: getPriceValue(
            new BigNumber(selectedProduct.invoicePrice || 0).plus(
              new BigNumber(expense_amount)
            )
          ),
        };
      }
      return selectedProduct;
    });

    setSelectedProducts({ newSelectedProducts });
  };
  const handleExpenseAmountInPercentage = (productId, newPrice) => {
    if (re_amount.test(newPrice) && newPrice <= 10000) {
      updatePercentage(productId, newPrice);
    }
    if (newPrice === '') {
      updatePercentage(productId, undefined);
    }
  };

  const updatePrice = (productId, newPrice) => {
    const newSelectedProducts = selectedProducts.map(selectedProduct => {
      if (selectedProduct.id === productId) {
        const expense_percentage = new BigNumber(
          new BigNumber(
            new BigNumber(newPrice || 0).minus(
              new BigNumber(selectedProduct.invoicePrice)
            )
          ).multipliedBy(100)
        ).dividedBy(new BigNumber(selectedProduct.invoicePrice || 1));
        return {
          ...selectedProduct,
          expense_amount_in_percentage: getPriceValue(expense_percentage || 0),
          expense_amount: new BigNumber(newPrice || 0).minus(
            new BigNumber(selectedProduct.invoicePrice)
          ),
          cost: newPrice,
        };
      }
      return selectedProduct;
    });

    setSelectedProducts({ newSelectedProducts });
  };
  const handlePriceChange = (productId, newPrice) => {
    if (re_amount.test(newPrice) && newPrice <= 10000) {
      updatePrice(productId, newPrice);
    }
    if (newPrice === '') {
      updatePrice(productId, undefined);
    }
  };

  const getColumns = () => {
    return [
      {
        title: '№',
        dataIndex: 'id',
        width: 80,
        render: (_value, _row, index) => index + 1,
      },
      {
        title: 'Məhsul adı',
        dataIndex: 'name',
        width: 120,
        align: 'left',
        render: value => value,
      },
      {
        title: 'Vahidin qiyməti',
        dataIndex: 'invoicePrice',
        width: 120,
        align: 'center',
        render: value =>
          `${formatNumberToLocale(
            defaultNumberFormat(value || 0)
          )} ${invoiceCurrencyCode}`,
      },
      {
        title: 'Əlavə xərc(%)',
        dataIndex: 'expense_amount_in_percentage',
        width: 150,
        align: 'center',
        render: (value, row) => (
          <Price
            row={row}
            value={value || 0}
            handlePriceChange={handleExpenseAmountInPercentage}
          />
        ),
      },
      {
        title: 'Artan məbləğ',
        dataIndex: 'expense_amount',
        width: 120,
        render: value =>
          `${formatNumberToLocale(
            defaultNumberFormat(value || 0)
          )} ${invoiceCurrencyCode}`,
      },
      {
        title: 'Maya dəyəri',
        dataIndex: 'cost',
        width: 150,
        align: 'center',
        render: (value, row) => (
          <Price
            row={row}
            value={value}
            handlePriceChange={handlePriceChange}
          />
        ),
      },
      {
        title: 'Say',
        dataIndex: 'invoiceQuantity',
        width: 100,
        render: value => formatNumberToLocale(defaultNumberFormat(value)),
      },
      {
        title: 'Toplam',
        dataIndex: 'total_price',
        width: 120,
        render: (_, { cost, invoiceQuantity }) =>
          `${formatNumberToLocale(
            defaultNumberFormat(
              math.mul(Number(cost || 0), Number(invoiceQuantity || 0))
            )
          )} ${invoiceCurrencyCode}`,
      },
    ];
  };

  return (
    <div>
      <Table
        columns={getColumns()}
        rowKey={row => row.id}
        dataSource={selectedProducts}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  employee: state.salesOperation.employee,
  expenseDirection: state.salesOperation.expenseDirection,
  currencies: state.kassaReducer.currencies,
  expenseCurrency: state.salesOperation.expenseCurrency,
  expenseCashbox: state.salesOperation.expenseCashbox,
  expenseCashboxType: state.salesOperation.expenseCashboxType,
  expenseCashboxBalance: state.salesOperation.expenseCashboxBalance,
  selectedProducts: state.salesOperation.selectedProducts,
  selectedExpenses: state.salesOperation.selectedExpenses,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
});

export default connect(
  mapStateToProps,
  {
    setSelectedProducts,
  }
)(CostTable);
