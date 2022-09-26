import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { setSelectedProducts } from 'store/actions/sales-operation';
import { clearProductsByName } from 'store/actions/bron';
import { ProSelect } from 'components/Lib';
import { Spin } from 'antd';

const SelectProductComponent = props => {
	const {
		isLoading = false,
		disabled = false,
		products,
		selectedProducts,
		handleProductNameChange,
		clearProductsByName,
		setSelectedProducts,
	} = props;
	const dispatch = useDispatch();

	const handleProductSelect = productId => {
		const newProduct = products.find(product => product.id === productId);
		dispatch(
			setSelectedProducts({
				newSelectedProducts: [...selectedProducts, newProduct].map(product => ({
					...product,
					invoiceQuantity: product.invoiceQuantity
						? product.invoiceQuantity
						: product.catalog.isWithoutSerialNumber
							? 1
							: null,
				})),
			})
		);
	};

	const handleDropdownClose = open => {
		if (!open) {
			dispatch(clearProductsByName());
		}
	};

	return (
		<div style={{ marginBottom: '20px' }}>
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
				notFoundContent={isLoading ? <Spin size="small" /> : null}
				onSearch={productName => handleProductNameChange(productName)}
				onSelect={productId => handleProductSelect(productId)}
			/>
		</div>
	);
};

const mapStateToProps = state => ({
	isLoading: state.loadings.fetchProductsListByName,
	selectedProducts: state.salesOperation.selectedProducts,
	products: state.bronReducer.productsByName,
});
export const SelectProduct = connect(
	mapStateToProps,
	{
		setSelectedProducts,
		clearProductsByName,
	}
)(SelectProductComponent);
