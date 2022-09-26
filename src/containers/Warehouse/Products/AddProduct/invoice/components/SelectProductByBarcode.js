import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { ProSearch } from 'components/Lib';
import {
	clearProductsByName,
	setSelectedProducts,
} from 'store/actions/sales-operation';
import styles from '../../styles.module.scss'

const SelectProductByBarcodeComponent = props => {
	const {
		isLoading = false,
		disabled = false,
		barcodeInput,
		handleChangeSearch,
		handleProductBarcodeChange,
	} = props;

	return (
		<div className={styles.productSelectionSelect}>
			<span style={{ fontSize: ' 14px' }}>Barkod:</span>
			<ProSearch
				allowClear={false}
				value={barcodeInput}
				disabled={disabled || isLoading}
				onSearch={handleProductBarcodeChange}
				onChange={event => handleChangeSearch(event.target.value)}
			/>
		</div>
	);
};

const mapStateToProps = state => ({
	isLoading: state.loadings.fetchProductsListByBarcode,
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
