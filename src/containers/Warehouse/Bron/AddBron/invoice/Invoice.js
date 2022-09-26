import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import { Spin } from 'antd';
import styles from '../styles.module.scss';
import { Header, ActionButtons, AddDescription, AddProducts } from './index';

const InvoicePaper = props => {
	const {
		form,
		columns,
		invoiceInfoLoading = false,
		catalogModalIsDisabled,
		selectProductIsDisabled,
		priceTypesLoading = false,
		toggleCatalogModal,
		selectedProducts,
		handleProductNameChange,
		handleProductBarcodeChange,
		barcodeInput,
		productSelectLoading,
		handleChangeSearch,
		handleNewInvoice,
		productQuantitiesLoading,
	} = props;

	const [descriptionModal, setDescriptionModal] = useState(false);

	const toggleDecsriptionModal = () => {
		setDescriptionModal(prevDescriptionModal => !prevDescriptionModal);
	};
	return (
		<div className={styles.parentBox}>
			<div className={styles.paper}>
				<Spin spinning={invoiceInfoLoading}>
					<AddDescription
						isVisible={descriptionModal}
						toggleModal={toggleDecsriptionModal}
					/>
					<Header
						disabled={catalogModalIsDisabled}
						toggleDecsriptionModal={toggleDecsriptionModal}
						toggleCatalogModal={toggleCatalogModal}
						productSelectLoading={productSelectLoading}
					/>
					<AddProducts
						handleProductBarcodeChange={handleProductBarcodeChange}
						handleChangeSearch={handleChangeSearch}
						barcodeInput={barcodeInput}
						selectProductIsDisabled={selectProductIsDisabled}
						handleProductNameChange={handleProductNameChange}
						catalogModalIsDisabled={catalogModalIsDisabled}
						toggleCatalogModal={toggleCatalogModal}
					/>
					<Table
						columns={columns}
						rowKey={row => row.id}
						scroll={{ x: 'max-content' }}
						loading={productQuantitiesLoading || priceTypesLoading}
						dataSource={selectedProducts}
					/>

					<ActionButtons
						form={form}
						handleNewInvoice={handleNewInvoice}
					/>
				</Spin>
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	productQuantitiesLoading: state.loadings.fetchEditProductsFromCatalog,
	priceTypesLoading: state.loadings.fetchSalesPrices,
	invoiceInfoLoading: state.loadings.invoicesInfo,
	selectedProducts: state.salesOperation.selectedProducts,
});
export const Invoice = connect(
	mapStateToProps,
	null
)(InvoicePaper);
