/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Spin } from 'antd';
import { fetchUsers } from 'store/actions/users';
import { fetchClients } from 'store/actions/contacts-new';
import { fetchContracts } from 'store/actions/contracts';
import {
	defaultNumberFormat,
	formatNumberToLocale,
	fullDateTimeWithSecond,
	round,
	roundToDown
} from 'utils';
import {
	fetchPurchaseProductsByName,
	fetchPurchaseBarcodesByName,
	fetchPurchaseCatalogs,
	fetchPurchaseProductsFromCatalog,
	clearProductsByName,
	handlePlannedCostChange,
	handlePlannedPriceChange,
	handleResetInvoiceFields,
	handleEditInvoice,
	setSelectedProducts,
	fetchSalesProductsFromCatalog,
	setTotalPrice,
	setTotalCost,
} from 'store/actions/sales-operation';
import { deleteInvoice } from 'store/actions/operations';
import moment from 'moment';
import styles from '../../../../styles.module.scss';
import { Invoice, Quantity, Trash, AddFromCatalog } from '../../invoice';

const math = require('exact-math');
const roundTo = require('round-to');

const ProductComposition = props => {
	const {
		// States
		id,
		onScan,
		form,
		summaries,
		dataComp,
		selectedProducts,
		// Actions
		handleResetInvoiceFields,
		handleEditInvoice,
		setSelectedProducts,
		setTotalPrice,
		setTotalCost,

		// Loadings
		productsListByNameLoading,
		invoiceInfoLoading = false,

		// DATA
		contracts,

		// API

		fetchUsers,
		fetchClients,
		fetchContracts,

		clearProductsByName,
		fetchPurchaseCatalogs,
		fetchPurchaseProductsByName,
		fetchPurchaseProductsFromCatalog,
		fetchPurchaseBarcodesByName,
	} = props;
	const dispatch = useDispatch();
	const newProductNameRef = useRef(null);
	const newTotalPriceRef = useRef(null);
	const newTotalCostRef = useRef(null);
	const [barcodeInput, setBarcodeInput] = useState(null);
	const { setFieldsValue } = form;
	const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
	const [order, setOrder] = useState(false);
	const handleOrderCheckbox = checked => {
		if (checked) {
			setOrder(true);
			setFieldsValue({ client: undefined, contract: undefined });
		} else {
			setOrder(false);
		}
	};
	const handleTotalCostChange = selectedProducts => {
		let newTotalCost = 0;
		if (selectedProducts?.length > 0) {
			newTotalCost = selectedProducts.reduce(
				(totalCost, { invoiceQuantity, plannedCost }) =>
					math.add(
						totalCost,
						math.mul(
							Number(invoiceQuantity) || 0,
							Number(plannedCost) || 0
						)
					),
				0
			);
		}
		setTotalCost({ newTotalCost: roundTo(newTotalCost, 2) });
	};
	const handleTotalPriceChange = selectedProducts => {
		let newTotalPrice = 0;
		if (selectedProducts?.length > 0) {
			newTotalPrice = selectedProducts.reduce(
				(totalPrice, { invoiceQuantity, plannedPrice }) =>
					math.add(
						totalPrice,
						math.mul(
							Number(invoiceQuantity) || 0,
							Number(plannedPrice) || 0
						)
					),
				0
			);
		}
		setTotalPrice({ newTotalPrice: roundTo(newTotalPrice, 2) });
	};
	useEffect(() => {
		clearTimeout(newTotalPriceRef.current);
		newTotalPriceRef.current = setTimeout(
			() => handleTotalPriceChange(selectedProducts),
			600
		);
		clearTimeout(newTotalCostRef.current);
		newTotalCostRef.current = setTimeout(
			() => handleTotalCostChange(selectedProducts),
			600
		);
	}, [selectedProducts]);

	const columns = [
		{
			title: '№',
			dataIndex: 'id',
			width: 90,
			render: (_value, row, index) => index + 1,
		},
		{
			title: 'Material',
			dataIndex: 'name',
			width: 150,
			align: 'left',
			ellipsis: true,
			render: (value, row) => value,
		},
		{
			title: 'Say',
			dataIndex: 'invoiceQuantity',
			align: 'center',
			width: 120,
			render: (value, row) => (
				<Quantity
					row={row}
					value={value}
					handleQuantityChange={handleQuantityChange}
				/>
			),
		},
		{
			title: 'Ölçü vahidi',
			dataIndex: 'unitOfMeasurementName',
			align: 'center',
			width: 130,
			render: (value, row) => value || '-',
		},

		{
			title: 'Sil',
			dataIndex: 'id',
			key: 'trashIcon',
			align: 'center',
			width: 70,
			render: (value, row) => (
				<Trash
					value={value}
					handleProductRemove={handleProductRemove}
				/>
			),
		},
	];
	useEffect(() => {
		onScan.attachTo(document, {
			onScan(sCode, iQty) {
				if (document.activeElement) {
					document.activeElement.blur();
				}
				fetchPurchaseBarcodesByName({
					label: 'fetchProductsListByBarcode',
					filters: {
						q: sCode,
						serviceType: 1,
					},
					onSuccessCallback: ({ data }) => {
						if (data && data.length !== 0) {
							const hasProduct = selectedProducts?.find(
								product => product.id === data.id
							);
							if (hasProduct) {
								handleQuantityChange(
									data.id,
									Number(hasProduct.invoiceQuantity) + 1
								);
							} else {
								const totalQuantity = selectedProducts.reduce(
									(total_amount, { invoiceQuantity }) =>
										math.add(
											total_amount,
											Number(invoiceQuantity) || 0
										),
									0
								);
								const total = selectedProducts.reduce(
									(total_amount, { invoiceQuantity }) =>
										math.add(
											total_amount,
											math.mul(
												summaries.find(
													item =>
														item.label === 'Cəmi'
												).value > 0
													? math.div(
														Number(
															summaries.find(
																item =>
																	item.label ===
																	'Cəmi'
															).value
														) || 0,
														math.add(
															Number(
																totalQuantity
															),
															1
														)
													)
													: 0,
												Number(invoiceQuantity || 1)
											) || 0
										),
									0
								);
								const cost =
									summaries.find(
										item => item.label === 'Cəmi'
									).value > 0
										? math.div(
											Number(
												summaries.find(
													item =>
														item.label === 'Cəmi'
												).value
											) || 0,
											totalQuantity + 1
										)
										: 0;

								const cost_percentage =
									cost > 0
										? math.div(
											math.mul(Number(cost), 100),
											Number(total) || 1
										)
										: 0;
								dispatch(
									setSelectedProducts({
										newSelectedProducts: [
											...selectedProducts,
											{
												...data,
												cost_percentage: roundTo(
													Number(cost_percentage),
													2
												),
												cost: roundTo(Number(cost), 2),
												invoiceQuantity: 1,
											},
										],
									})
								);
							}
						}
						setBarcodeInput(null);
					},
				});
			},
		});
		return () => {
			onScan.detachFrom(document);
		};
	}, [selectedProducts]);

	const handleQuantityChange = (productId, newQuantity) => {
		const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
		if (
			(re.test(Number(newQuantity)) && newQuantity <= 100000000) ||
			newQuantity === ''
		) {
			const totalQuantity = selectedProducts.reduce(
				(total_amount, { invoiceQuantity }) =>
					math.add(total_amount, Number(invoiceQuantity) || 0),
				0
			);
			const selectedQuantity = selectedProducts.find(
				item => item.id === productId
			).invoiceQuantity;
			const cost =
				summaries.find(item => item.label === 'Cəmi').value > 0
					? newQuantity > 0
						? math.div(
							Number(
								summaries.find(item => item.label === 'Cəmi')
									.value
							) || 0,
							math.add(
								Number(totalQuantity),
								math.sub(
									Number(newQuantity),
									Number(selectedQuantity)
								)
							) || 1
						)
						: 0
					: 0;
			const total = selectedProducts.reduce(
				(total_amount, { invoiceQuantity }) =>
					math.add(
						total_amount,
						math.mul(
							Number(cost) || 0,
							Number(invoiceQuantity || 0)
						) || 0
					),
				0
			);

			const cost_percentage =
				cost > 0
					? math.div(
						math.mul(Number(cost), 100),
						math.add(
							Number(total || 0),
							math.mul(Number(cost), Number(newQuantity))
						)
					)
					: 0;
			const newSelectedProducts = selectedProducts.map(
				selectedProduct => {
					if (selectedProduct.id === productId) {
						return {
							...selectedProduct,
							cost_percentage: roundTo(
								Number(cost_percentage),
								2
							),
							cost: roundTo(Number(cost), 2),
							invoiceQuantity: newQuantity,
						};
					}
					return {
						...selectedProduct,
						cost_percentage: roundTo(Number(cost_percentage), 2),
						cost: roundTo(Number(cost), 2),
					};
				}
			);
			setSelectedProducts({ newSelectedProducts });
		}
	};
	// Toggle Add Catalog Modal
	const toggleCatalogModal = () => {
		setCatalogModalIsVisible(
			prevCatalogModalIsVisible => !prevCatalogModalIsVisible
		);
	};

	// Fetch products by product name
	const handleProductNameChange = productName => {
		clearTimeout(newProductNameRef.current);
		if (productName.length > 2) {
			newProductNameRef.current = setTimeout(
				() =>
					fetchPurchaseProductsByName({
						label: 'fetchProductsListByName',
						filters: {
							q: productName,
							serviceType: 1,
						},
					}),
				600
			);
		} else {
			dispatch(clearProductsByName());
		}
	};
	// Fetch products by product barcode
	const handleChangeSearch = productBarcode => {
		setBarcodeInput(productBarcode);
	};
	const handleProductBarcodeChange = productBarcode => {
		fetchPurchaseBarcodesByName({
			label: 'fetchProductsListByBarcode',
			filters: {
				q: productBarcode,
				serviceType: 1,
			},
			onSuccessCallback: ({ data }) => {
				if (data && data.length !== 0) {
					const hasProduct = selectedProducts?.find(
						product => product.id === data.id
					);
					if (hasProduct) {
						handleQuantityChange(
							data.id,
							Number(hasProduct.invoiceQuantity) + 1
						);
					} else if (data.id !== Number(id)) {
						dispatch(
							setSelectedProducts({
								newSelectedProducts: [
									...selectedProducts,
									{
										...data,
										invoiceQuantity: 1,
									},
								],
							})
						);
					}
				}
				setBarcodeInput(null);
			},
		});
	};

	// Fetch product catalogs by invoice type
	const fetchCatalogs = () => {
		const type = 'purchase';
		fetchPurchaseCatalogs({
			type,
			label: 'fetchCatalogsByInvoiceType',
			filters: { serviceType: 1 },
		});
	};

	// Fetch purchase products by catalog id
	const fetchProductsFromCatalog = catalogId => {
		fetchPurchaseProductsFromCatalog({
			label: 'fetchProductsFromCatalog',
			catalogId,
		});
	};

	const handleProductRemove = productId => {
		const newSelectedProducts = selectedProducts.filter(
			selectedProduct => selectedProduct.id !== productId
		);
		dispatch(setSelectedProducts({ newSelectedProducts }));
	};

	const updateEditInvoice = selectedContract => {
		const {
			clientId,
			salesmanId,
			startDate,
			description,
			contractId,
			endDate,
		} = dataComp;

		const selectedProducts = {};
		dataComp.forEach(({ productId, quantity, serialNumber, product }) => {
			if (selectedProducts[productId]) {
				selectedProducts[productId] = {
					...selectedProducts[productId],
					invoiceQuantity: math.add(
						roundToDown(Number(quantity)),
						selectedProducts[productId].invoiceQuantity
					),
				};
			} else {
				selectedProducts[product.id] = {
					id: product.id,
					name: product.name,
					barcode: undefined,
					unitOfMeasurementName: product.unitOfMeasurement?.name,
					serialNumbers: serialNumber ? [serialNumber] : undefined,

					invoiceQuantity: roundToDown(Number(quantity)),
				};
			}
		});

		handleEditInvoice({
			selectedProducts: Object.values(selectedProducts),
			description: description || undefined,
			contractDetails: selectedContract
				? {
					isContractSelected: true,
					contractAmount: Number(selectedContract.amount),
					contractBalance: Number(selectedContract.rest),
				}
				: {
					isContractSelected: false,
					contractAmount: undefined,
					contractBalance: undefined,
				},
		});
		if (clientId === null) {
			handleOrderCheckbox(true);
		} else {
			handleOrderCheckbox(false);
		}
		setFieldsValue({
			dateFrom: moment(
				startDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
				fullDateTimeWithSecond
			),
			dateTo: moment(
				endDate?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
				fullDateTimeWithSecond
			),
			client: clientId,
			salesman: salesmanId,
			contract: contractId || undefined,
			// currency: currencyId,
		});
	};
	useEffect(() => {
		if (dataComp) {
			const { contractId } = dataComp;
			if (contractId && contracts.length > 0) {
				const selectedContract = contracts.find(
					({ id }) => id === contractId
				);
				updateEditInvoice(selectedContract);
			} else if (!contractId) {
				updateEditInvoice(undefined);
			}
		}
	}, [dataComp, contracts]);

	useEffect(() => {
		fetchClients();
		return () => {
			handleResetInvoiceFields();
		};
	}, []);
	useEffect(() => {
		if (id) {
			if (dataComp) {
				fetchUsers({});
				fetchContracts({
					limit: 1000,
					status: 1,
					invoiceId: id,
					directions: [2],
				});
			}
		} else if (cookies.get('_TKN_UNIT_')) {
			fetchContracts({
				limit: 1000,
				status: 1,
				directions: [2],
			});
		} else {
			fetchUsers({});
			fetchContracts({ limit: 1000, status: 1, directions: [2] });
		}
	}, [cookies.get('_TKN_UNIT_'), id, dataComp]);

	return (
		<>
			<AddFromCatalog
				id={id}
				summaries={summaries}
				isVisible={catalogModalIsVisible}
				toggleModal={toggleCatalogModal}
				fetchProducts={fetchProductsFromCatalog}
				fetchCatalogs={fetchCatalogs}
			/>
			<div className={styles.parentBox}>
				<div className={styles.paper}>
					<Spin spinning={invoiceInfoLoading}>
						<Invoice
							form={form}
							columns={columns}
							summaries={summaries}
							id={id}
							dataComp={dataComp}
							toggleCatalogModal={toggleCatalogModal}
							productSelectLoading={productsListByNameLoading}
							handleProductNameChange={handleProductNameChange}
							handleChangeSearch={handleChangeSearch}
							handleProductBarcodeChange={
								handleProductBarcodeChange
							}
							setBarcodeInput={setBarcodeInput}
							barcodeInput={barcodeInput}
							catalogModalIsDisabled={false}
						/>
					</Spin>
				</div>
			</div>
		</>
	);
};

const mapStateToProps = state => ({
	creatingInvoice: state.loadings.createInvoiceOperation,

	users: state.usersReducer.users,
	clients: state.contactsReducer.clients,
	contracts: state.contractsReducer.contracts,
	currencies: state.kassaReducer.currencies,
	endPrice: state.salesOperation.endPrice,
	contractDetails: state.salesOperation.contractDetails,
	selectedProducts: state.salesOperation.selectedProducts,

	profile: state.profileReducer.profile, // used for operator id

	invoiceInfoLoading: state.loadings.invoicesInfo,
	totalPrice: state.salesOperation.totalPrice,
	totalCost: state.salesOperation.totalCost,
});

export default connect(
	mapStateToProps,
	{
		setTotalPrice,
		setTotalCost,
		clearProductsByName,
		handleResetInvoiceFields,
		handlePlannedPriceChange,
		handlePlannedCostChange,
		deleteInvoice,
		handleEditInvoice,
		// API
		fetchUsers,
		fetchContracts,
		fetchClients,
		fetchPurchaseProductsByName,
		fetchPurchaseCatalogs,
		fetchPurchaseProductsFromCatalog,
		fetchSalesProductsFromCatalog,

		fetchPurchaseBarcodesByName,
		setSelectedProducts,
	}
)(ProductComposition);
