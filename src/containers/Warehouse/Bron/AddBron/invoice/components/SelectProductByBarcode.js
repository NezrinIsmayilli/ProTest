import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ProSearch } from 'components/Lib';
import {
	clearProductsByName,
	setSelectedProducts,
} from 'store/actions/sales-operation';
import { Input } from 'antd';

const SelectProductByBarcodeComponent = props => {
	const {
		disabled = false,
		barcodeInput,
		handleProductBarcodeChange,
		handleChangeSearch,
	} = props;

	return (
		<div
			style={{
				marginBottom: '25px',
			}}
		>
			<span style={{ fontSize: ' 14px' }}>Barkod:</span>
			<ProSearch
				allowClear={false}
				value={barcodeInput}
				disabled={disabled}
				onSearch={handleProductBarcodeChange}
				onChange={event => handleChangeSearch(event.target.value)}
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
export const SelectProductByBarcode = connect(
	mapStateToProps,
	{
		setSelectedProducts,
		clearProductsByName,
	}
)(SelectProductByBarcodeComponent);
