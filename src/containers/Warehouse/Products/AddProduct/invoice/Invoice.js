import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Header, AddProducts } from './index';
import styles from '../styles.module.scss';

const InvoicePaper = props => {
	const {
		id,
		summaries,
		columns,
		priceTypesLoading = false,
		toggleCatalogModal,
		selectedProducts,
		handleProductNameChange,
		handleProductBarcodeChange,
		handleChangeSearch,
		barcodeInput,
		productQuantitiesLoading,
	} = props;

	return (
		<>
			<Header />
			<AddProducts
				ids={id}
				summaries={summaries}
				handleChangeSearch={handleChangeSearch}
				handleProductBarcodeChange={handleProductBarcodeChange}
				barcodeInput={barcodeInput}
				handleProductNameChange={handleProductNameChange}
				toggleCatalogModal={toggleCatalogModal}
			/>
			<Table
				className={styles.productTable}
				columns={columns}
				rowKey={row => row.id}
				loading={productQuantitiesLoading || priceTypesLoading}
				dataSource={
					selectedProducts?.length > 0
						? [...selectedProducts]
						: selectedProducts
				}
			/>
		</>
	);
};

const mapStateToProps = state => ({
	productQuantitiesLoading: state.loadings.fetchEditProductsFromCatalog,
	priceTypesLoading: state.loadings.fetchSalesPrices,
	invoiceInfoLoading: state.loadings.invoicesInfo,
	activePayments: state.salesOperation.activePayments,
	selectedProducts: state.salesOperation.selectedProducts,
});
export const Invoice = connect(
	mapStateToProps,
	null
)(InvoicePaper);
