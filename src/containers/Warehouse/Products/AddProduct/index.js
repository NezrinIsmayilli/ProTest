/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import onScan from 'onscan.js';
import { connect } from 'react-redux';
import { Button, Form, Row, Col, Tabs, Spin } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { ProWrapper } from 'components/Lib';
import {
	fetchCatalogs,
	createCatalog,
	fetchFilteredCatalogs,
} from 'store/actions/catalog';
import { fetchManufacturers } from 'store/actions/relations';
import { downloadFileUrl } from 'store/actions/attachment';
import {
	fetchUnitOfMeasurements,
	createUnitOfMeasurements,
	fetchProductPriceTypes,
	fetchFreeBarcodTypes,
} from 'store/actions/settings/mehsul';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import {
	createProduct,
	editProduct,
	getProduct,
	fetchProducts,
	getProductComposition,
} from 'store/actions/product';
import { fetchMeasurements } from 'store/actions/measurements';
import errorMessages from 'utils/errors';
import { toast } from 'react-toastify';
import { re_percent, re_amount, roundToDown } from 'utils';
import { MdKeyboardArrowLeft } from 'react-icons/md';

import { fetchStockStatics } from 'store/actions/stock';
import {
	editCompositon,
	createCompositon,
	createProductionExpense,
	createProductionEmployeeExpense,
	createProductionMaterialExpense,
	fetchProductionInfo,
	fetchProductionMaterialExpense,
	fetchProductionEmployeeExpense,
	fetchProductionExpense,
	handleResetInvoiceFields,
	fetchMaterialList,
	fetchProductionExpensesList,
} from 'store/actions/sales-operation';
import AddCatalog from '../../../../components/Lib/AddCatalog/AddCatalog';

import ProductItem from './Tabs/productInfo/ProductItem';

import styles from '../../styles.module.scss';
import ProductComposition from './Tabs/productComposition';
import ProductInfo from './Tabs/productInfo';

import AddMeasurement from './Tabs/productInfo/AddMeasurement';
import ContactAdd from './ContactAdd';

const { TabPane } = Tabs;

const roundTo = require('round-to');
const math = require('exact-math');

const summary_types = [
	{
		label: 'Cəmi',
		key: 1,
	},
	{
		label: 'Xərclər',
		key: 2,
	},
	{
		label: 'Materiallar',
		key: 3,
	},
	{
		label: 'İşçilik',
		key: 4,
	},
];

function AddProduct(props) {
	const {
		catalogs,
		fetchFilteredCatalogs,
		manufacturers,
		unitOfMeasurements,
		currencies,
		productPriceTypes,
		fetchMeasurements,
		filteredProductPriceTypes,
		fetchUnitOfMeasurements,
		fetchManufacturers,
		fetchCatalogs,
		fetchCurrencies,
		fetchProductPriceTypes,
		createProduct,
		editProduct,
		actionLoading,
		getProduct,
		getProductComposition,
		fetchFreeBarcodTypes,
		isLoading,

		form,
		fetchProducts,

		selectedProducts,
		editCompositon,
		createCompositon,
		selectedProductionExpense,
		selectedProductionEmployeeExpense,
		selectedProductionMaterial,

		materialInvoices,
		productionExpensesList,
		freeBarcodTypes,
		downloadFileUrl,
	} = props;

	const {
		getFieldDecorator,
		getFieldError,
		getFieldValue,
		validateFields,
		setFieldsValue,
		setFields,
	} = form;

	const [formData, setFormData] = useState({});
	const history = useHistory();
	const [autoGenerate, setAutoGenerate] = useState(false);
	const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
	const [isServiceType, setIsServiceType] = useState(true);
	const [measurementModalIsVisible, setMeasurementModalIsVisible] = useState(
		false
	);
	const [catalogModalType, setCatalogModalType] = useState('catalog');
	const [parentCatalogName, setParentCatalogName] = useState(null);
	const [productItem, setProductItem] = useState(false);
	const [priceTypeData, setPriceTypeData] = useState({ dataPrice: [] });
	// ------------------
	const [data, setData] = useState(null);
	const [dataComp, setDataComp] = useState(null);
	const [activeTab, setActiveTab] = useState('1');
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const id = urlParams.get('id');
	const returnUrl = '/warehouse/products';
	const [summaries, setSummaries] = useState(summary_types);
	const [contactItem, setContactItem] = useState(false);
	const [contactData, setContactData] = useState(undefined);
	const [attachment, setAttachment] = useState(null);
	const [
		filterSelectedMeauserments,
		setFilterSelectedMeauserments,
	] = useState([]);
	const [addedCatalog, setAddedCatalog] = useState({
		root: [],
		children: {},
	});
	const [ProductPriceTypesSelect, setProductPriceTypesSelect] = useState([]);
	const getData = data => {
		setData(data.data);
	};

	const getData2 = data => {
		setDataComp(data.data);
	};

	useEffect(() => {
		if (id) {
			getProduct(id, getData);
			getProductComposition(id, getData2);
		}
	}, [id]);

	const handleActiveTabChange = newTab => {
		setActiveTab(newTab);
	};

	useEffect(() => {
		// fetchProducts({ filters: {} });
		fetchFreeBarcodTypes();
	}, []);

	// useEffect(() => {
	// }, [getFieldValue('catao')]);

	useEffect(() => {
		const totalExpencePrice = selectedProductionExpense.reduce(
			(total, { price }) => math.add(total || 0, Number(price) || 0),
			0
		);
		const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
			(total, { price, hours }) =>
				math.add(
					total || 0,
					math.mul(Number(price), Number(hours || 1)) || 0
				),
			0
		);
		const totalMaterialPrice = selectedProductionMaterial.reduce(
			(total, { price, quantity }) =>
				math.add(
					total || 0,
					math.mul(Number(price), Number(quantity)) || 0
				),
			0
		);
		const totaInvoicelMaterialPrice = materialInvoices?.reduce(
			(total, { amountInMainCurrency }) =>
				math.add(total || 0, Number(amountInMainCurrency) || 0),
			0
		);
		const totalProductionEmployeeExpensesList = productionExpensesList
			?.filter(item => item.transactionType === 6)
			.reduce(
				(total, { amountConvertedToMainCurrency }) =>
					math.add(
						total || 0,
						Number(amountConvertedToMainCurrency) || 0
					),
				0
			);
		const totalProductionExpensesList = productionExpensesList
			?.filter(
				item => item.transactionType === 8 || item.transactionType === 9
			)
			.reduce(
				(total, { amountConvertedToMainCurrency }) =>
					math.add(
						total || 0,
						Number(amountConvertedToMainCurrency) || 0
					),
				0
			);
		const totalAllExpense = math.add(
			totalExpencePrice,
			totalEmployeePrice,
			totalMaterialPrice,
			totaInvoicelMaterialPrice,
			totalProductionEmployeeExpensesList,
			totalProductionExpensesList
		);
		const expensePercent =
			totalAllExpense > 0
				? math.mul(
					math.div(
						math.add(
							totalExpencePrice,
							totalProductionExpensesList
						),
						totalAllExpense
					),
					100
				)
				: 0;
		const employeePercent =
			totalAllExpense > 0
				? math.mul(
					math.div(
						math.add(
							totalEmployeePrice,
							totalProductionEmployeeExpensesList
						),
						totalAllExpense
					),
					100
				)
				: 0;
		const materialPercent =
			totalAllExpense > 0
				? math.mul(
					math.div(
						math.add(
							totalMaterialPrice,
							totaInvoicelMaterialPrice
						),
						totalAllExpense
					),
					100
				)
				: 0;
		const totalPercent = totalAllExpense > 0 ? 100 : 0;
		const totals = [];
		summary_types.forEach(({ label, key }) =>
			totals.push({
				label,
				value:
					key === 2
						? math.add(
							totalExpencePrice,
							totalProductionExpensesList
						)
						: key === 3
							? math.add(
								totalMaterialPrice,
								totaInvoicelMaterialPrice
							)
							: key === 4
								? math.add(
									totalEmployeePrice,
									totalProductionEmployeeExpensesList
								)
								: totalAllExpense || 0,
				percent:
					key === 2
						? expensePercent
						: key === 3
							? materialPercent
							: key === 4
								? employeePercent
								: totalPercent || 0,
			})
		);
		setSummaries(totals);
	}, [
		selectedProductionExpense,
		selectedProductionEmployeeExpense,
		selectedProductionMaterial,
		materialInvoices,
		productionExpensesList,
	]);
	useEffect(() => {
		if (id) {
			setActiveTab('1');
		} else {
			setActiveTab('1');
		}
	}, [id]);

	// Create production invoice
	const handleCreateInvoice = values => {
		let newPurchaseInvoice = {};
		newPurchaseInvoice = {
			products_ul: handleSelectedProducts(selectedProducts),
		};
		if (id) {
			editCompositon({
				data: newPurchaseInvoice,
				type: 'production',
				id: Number(id),
				onSuccessCallback: ({ data }) => {
					toast.success('Əməliyyat uğurla tamamlandı.');
					history.goBack();
				},
			});
		} else {
			createCompositon({
				data: newPurchaseInvoice,
				type: 'production',
				id: values,
				onSuccessCallback: ({ data }) => {
					toast.success('Əməliyyat uğurla tamamlandı.');
					history.push('/warehouse/products');
				},
			});
		}
	};

	// Manipulate selected products to api required form.
	const handleSelectedProducts = selectedProducts =>
		selectedProducts.map(
			({ id, invoiceQuantity, serialNumbers, cost }) => ({
				product: id,
				quantity: Number(invoiceQuantity),
				price: Number(cost),
				serialNumber_ul: serialNumbers || [],
			})
		);

	const validateSelectedProducts = selectedProducts => {
		let errorMessage = '';
		let isValid = true;
		if (
			selectedProducts.some(
				({ invoiceQuantity }) => Number(invoiceQuantity || 0) === 0
			)
		) {
			errorMessage = 'Say qeyd edilməyən məhsul mövcuddur.';
			isValid = false;
		}
		return {
			isValid,
			errorMessage,
		};
	};
	// ------------------------------
	const constPriceData = [];
	productPriceTypes.forEach(element => {
		if (element.isDeletable === false) {
			constPriceData.push(element);
		}
	});

	const editData = [];
	// eslint-disable-next-line no-unused-expressions
	productPriceTypes.length > 0
		? data?.productPrices.map(priceType =>
			priceType.amount !== null || priceType.is_deletable === false
				? editData.push(priceType)
				: null
		)
		: null;

	const priceTypeFromMsk = priceTypeData?.dataPrice;

	const pricesDataConcat = constPriceData.concat(priceTypeFromMsk);

	const [removeData, setRemoveData] = useState(pricesDataConcat);
	const [allDataPriceEdit, setAllDataPriceEdit] = useState(editData);
	useEffect(() => {
		setRemoveData(pricesDataConcat);
	}, [priceTypeFromMsk]);

	useEffect(() => {
		setAllDataPriceEdit(editData);
	}, [data, productPriceTypes]);

	const handleProductItem = () => {
		setProductPriceTypesSelect([]);
		setProductItem(true);
	};
	const handleNewCatalogClick = type => {
		setCatalogModalType(type);
		setCatalogModalIsVisible(true);
	};

	const handleAddExpenseClick = (
		clickType = 'add',
		selectedIndex,
		selectedId
	) => {
		if (clickType === 'remove') {
			setFieldsValue({
				[`prices[${selectedIndex}].percentage`]: null,
				[`prices[${selectedIndex}].amount`]: null,
			});

			setFieldsValue({
				prices: getFieldValue('prices').filter(
					(_, index) => index !== selectedIndex
				),
			});
			setAllDataPriceEdit(prev =>
				prev.filter((element, index) => index !== selectedIndex)
			);
			setPriceTypeData(prevState => ({
				dataPrice: prevState.dataPrice.filter(
					(element, index) => element.id !== selectedId
				),
			}));
			setRemoveData(prev =>
				prev.filter((element, index) => index !== selectedIndex)
			);
		}
	};
	const handleDefaultPriceChange = event => {
		const prices = getFieldValue('prices');

		if (event.target.value === '') {
			setFieldsValue({
				prices: prices?.map(() => ({
					amount: undefined,
				})),
			});
			return undefined;
		}
		if (
			re_amount.test(event.target.value) &&
			Number(event.target.value) <= 10000000
		) {
			setFieldsValue({
				prices: prices?.map(value => {
					if (value.percentage) {
						const discountValue =
							(Number(event.target.value) *
								Number(value.percentage)) /
							100;
						return {
							...value,
							amount: roundTo(
								Number(event.target.value) -
								Number(discountValue),
								4
							),
						};
					}
					return value;
				}),
			});
			return event.target.value;
		}
		return getFieldValue('price');
	};

	const handlePriceTypePercentageChange = (event, index) => {
		const prices = getFieldValue('prices');

		if (event.target.value === '') {
			// If value is empty
			setFieldsValue({
				prices: prices.map((value, priceIndex) => {
					if (priceIndex === index) {
						return {
							percentage: undefined,
							amount: undefined,
						};
					}
					return value;
				}),
			});
			return undefined;
		}
		if (
			// If value is >= 0
			re_percent.test(event.target.value) &&
			Number(event.target.value) <= 100
		) {
			const price = getFieldValue('price');
			const discountAmount =
				(Number(price) * Number(event.target.value)) / 100;
			setFieldsValue({
				prices: prices.map((value, priceIndex) => {
					if (priceIndex === index) {
						return {
							percentage: event.target.value,
							amount: price
								? roundToDown(Number(price) - discountAmount)
								: undefined,
						};
					}
					return value;
				}),
			});

			return event.target.value;
		}
		return getFieldValue('prices')[index].percentage;
	};

	const handlePriceTypeValueChange = (event, index) => {
		const prices = getFieldValue('prices');
		const price = getFieldValue('price');
		if (event.target.value === '') {
			// If value is empty
			setFieldsValue({
				prices: prices.map((value, priceIndex) => {
					if (priceIndex === index) {
						return {
							percentage: undefined,
							amount: undefined,
						};
					}
					return value;
				}),
			});
			return undefined;
		}
		if (
			// If value is >= 0
			re_percent.test(event.target.value) &&
			Number(event.target.value) <= Number(price)
		) {
			const discountPercentage =
				((Number(price) - Number(event.target.value)) * 100) /
				Number(price);
			setFieldsValue({
				prices: prices.map((value, priceIndex) => {
					if (priceIndex === index) {
						return {
							percentage: roundTo(Number(discountPercentage), 4),
							amount: event.target.value,
						};
					}
					return value;
				}),
			});

			return event.target.value;
		}
		return getFieldValue('prices')[index].amount;
	};

	useEffect(() => {
		fetchProductPriceTypes();
	}, []);

	useEffect(() => {
		fetchCurrencies();
		if (data && id && productPriceTypes.length > 0) {
			const fullEditdata = [];
			data.productPrices.map(priceType =>
				priceType.amount !== null || priceType.is_deletable === false
					? fullEditdata.push(priceType)
					: null
			);
			const priceTypes = fullEditdata.map(priceType => ({
				id: priceType.price_type_id,
				percentage: priceType.amount
					? roundToDown(
						((Number(data.salesPrice) -
							Number(priceType.amount)) *
							100) /
						Number(data.salesPrice)
					)
					: undefined,
				amount: priceType.amount
					? roundToDown(Number(priceType.amount))
					: undefined,
			}));
			setIsServiceType(data.isServiceType);
			setFieldsValue({
				productCode: data.productCode || undefined,
				barcode: data.barcode || undefined,
				barcodeType: data.barcodeConfigurationType || 1,
				currency: data.currencyId || undefined,
				catalog: data.parentCatalogId || undefined,
				subCatalog:
					data.catalogId === data.parentCatalogId
						? undefined
						: data.catalogId,
				productName: data.name || undefined,
				manufacturer: data.manufacturerId || undefined,
				measurement: data.unitOfMeasurementId || undefined,
				price: roundToDown(Number(data.salesPrice), 4) || undefined,
				description: data.description || undefined,
				prices: priceTypes,
			});
			setParentCatalogName(data.parentCatalogName);
			if (data.attachmentId !== null) {
				downloadFileUrl(data.attachmentId, fileData => {
					setAttachment([
						{
							thumbUrl: fileData.url,
							id: data.attachmentId,
							uid: -1,
							response: { data: { id: data.attachmentId } },
						},
					]);
				});
			} else {
				setAttachment(null);
			}

			setFormData({
				currency: {
					id: data.currencyId,
					code: data.currencyCode,
				},
			});
			if (data.barcodeConfigurationType === 2) {
				setAutoGenerate(true);
			}
		}
	}, [data, productPriceTypes]);

	useEffect(() => {
		if (currencies.length > 0 && !id && !getFieldValue('currency')) {
			setFieldsValue({
				currency: currencies[0].id,
				currencyCode: currencies[0].code,
			});
			setFormData({
				currency: currencies[0],
			});
		}
	}, [currencies]);

	const createNewProduct = event => {
		event.preventDefault();

		validateFields((errors, values) => {
			if (!errors) {
				const {
					catalog,
					subCatalog,
					productName,
					barcode,
					productCode,
					manufacturer,
					price,
					measurement,
					currency,
					prices,
					description,
					barcodeType,
				} = values;
				const { isValid, errorMessage } = validateSelectedProducts(
					selectedProducts
				);
				if (!isValid) {
					if (errorMessage) {
						return toast.error(errorMessage);
					}
				} else {
					const priceTypes = {};

					prices.forEach((price, index) => {
						// eslint-disable-next-line no-unused-expressions
						id
							? allDataPriceEdit
								? (priceTypes[
									allDataPriceEdit[index].price_type_id
								] = price.amount)
								: (priceTypes[constPriceData[index].id] =
									price.amount)
							: priceTypeFromMsk
								? (priceTypes[pricesDataConcat[index].id] =
									price.amount)
								: (priceTypes[pricesDataConcat[index].id] =
									price.amount);
					});
					const newProduct = {
						isExcluded: null,
						isVatFree: null,
						vat: '',
						isVatIncluded: null,
						productParams_ul: [],
						productCodeType: '',
						discount: '',
						name: productName || null,
						barcode: barcode || null,
						barcodeConfiguration:
							barcodeType === 1
								? freeBarcodTypes.length > 0
									? barcodeType
									: null
								: barcodeType,
						productCode: productCode || null,
						catalog: subCatalog || catalog,
						manufacturer: manufacturer || null,
						unitOfMeasurement: measurement || null,
						description: description || null,
						currency: currency || null,
						salesPrice: Number(price) || null,
						productPrices_ul: priceTypes,
						attachment: attachment?.[0].response.data.id,
					};

					return id
						? editProduct(
							newProduct,
							id,
							data => {
								handleCreateInvoice(id);
							},
							error => {
								const errorKey =
									error?.error?.response?.data?.error?.messageKey;
								if (errorKey) {
									if (errorKey === 'this_product_is_used.') {
										const errorData = error?.error?.response?.data?.error?.errors?.data
										const type = errorData.isServiceType ? 'Xidmət' : 'Fiziki';
										const withSerial = errorData.isWithoutSerialNumber ? 'seriya nömrəsi olmayan' : 'seriya nömrəsi olan';
										toast.error(`Bu məhsul ilə əməliyyat edildiyi üçün, yalnız ${type} növlü və ${withSerial} kataloq seçmək mümkündür`,
											{ autoClose: 8000 });
									}
									else {
										setFields({
											productCode: {
												value: getFieldValue('productCode'),
												errors: [new Error(errorMessages[errorKey])],
											},
										});
									}
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This barcode is already exists.'
								) {
									setFields({
										barcode: {
											value: getFieldValue('barcode'),
											errors: [new Error('Bu barkod artıq təyin edilib')],
										},
									});
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This product is already exists.'
								) {
									setFields({
										productName: {
											value: getFieldValue('productName'),
											errors: [new Error('Bu məhsul adı artıq təyin edilib')],
										},
									});
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This product is used.'
								) {
									toast.error(
										'Bu məhsul ilə əməliyyat edildiyi üçün məhsulun kataloqunu dəyişmək mümkün deyil.'
									);
								} else {
									toast.error('Xəta baş verdi.');
								}
							},

						)
						: createProduct(
							newProduct,
							data => {
								handleCreateInvoice(data?.data.id);
							},
							error => {
								const errorKey =
									error?.error?.response?.data?.error?.messageKey;
								if (errorKey) {
									setFields({
										productCode: {
											value: getFieldValue('productCode'),
											errors: [new Error(errorMessages[errorKey])],
										},
									});
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This barcode is already exists.'
								) {
									setFields({
										barcode: {
											value: getFieldValue('barcode'),
											errors: [new Error('Bu barkod artıq təyin edilib')],
										},
									});
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This product is already exists.'
								) {
									setFields({
										productName: {
											value: getFieldValue('productName'),
											errors: [new Error('Bu məhsul adı artıq təyin edilib')],
										},
									});
								} else if (
									error?.error?.response?.data?.error?.message ===
									'This product is used.'
								) {
									toast.error(
										'Bu məhsul ilə əməliyyat edildiyi üçün məhsulun kataloqunu dəyişmək mümkün deyil.'
									);
								}
							},

						);
				}
			}
			setActiveTab('1');
		});
	};

	const onSuccessAddModal = data => {

		let addedID = catalogModalType === 'sub-catalog' ? getFieldValue('catalog') : data.id;
		const defaultFilters = { limit: 10, page: 1, ids: [addedID] };
		fetchFilteredCatalogs(defaultFilters, data => {
			if (data.data) {
				setAddedCatalog(data.data);
				setIsServiceType(data.data.root[0].isServiceType)
			}
		});
		setFieldsValue({
			[catalogModalType === 'catalog' ? 'catalog' : 'subCatalog']: data.id,
		});
		if (catalogModalType === 'catalog') {
			setFieldsValue({ subCatalog: undefined })
		}
	};

	const onSuccessAddMeasurementModal = data => {
		const filter = {
			ids: [data.id],
		};
		fetchMeasurements(filter, data => {
			if (data.data) {
				setFilterSelectedMeauserments(data.data);
			}
		});
	};

	return (
		<>
			<AddCatalog
				isVisible={catalogModalIsVisible}
				setIsVisible={setCatalogModalIsVisible}
				type={catalogModalType}
				parentCatalogId={getFieldValue('catalog')}
				parentCatalogName={parentCatalogName}
				onSuccessAddModal={onSuccessAddModal}
				setParentCatalogName={setParentCatalogName}
			/>

			<ProductItem
				visible={productItem}
				setIsVisible={setProductItem}
				priceTypeData={priceTypeData}
				allDataPriceEdit={allDataPriceEdit}
				setPriceTypeData={setPriceTypeData}
				setAllDataPriceEdit={setAllDataPriceEdit}
				ProductPriceTypesSelect={ProductPriceTypesSelect}
				setProductPriceTypesSelect={setProductPriceTypesSelect}
				id={id}
				removeData={removeData}
				editData={editData}
				constPriceData={constPriceData}
			/>

			<AddMeasurement
				isVisible={measurementModalIsVisible}
				setIsVisible={setMeasurementModalIsVisible}
				setMainFormValues={setFieldsValue}
				onSuccessAddMeasurementModal={onSuccessAddMeasurementModal}
			/>

			<ContactAdd
				visible={contactItem}
				toggleVisible={setContactItem}
				setData={setContactData}
			/>

			<ProWrapper>
				<>
					<div className={styles.containerFluid}>
						<Row>
							<Col
								xs={{ span: 20, offset: 2 }}
								sm={{ span: 22, offset: 2 }}
								md={{ span: 16, offset: 4 }}
							// style={{ minWidth: 'fit-content' }}
							>
								<Spin spinning={isLoading}>
									<Form
										scrollToFirstError
										onSubmit={event =>
											createNewProduct(event)
										}
									>
										<a
											onClick={history.goBack}
											className={styles.returnBackButton}
										>
											<MdKeyboardArrowLeft
												size={24}
												style={{ marginRight: 4 }}
											/>
											Məhsul Siyahısına Qayıt
										</a>
										<div style={{ margin: '10px 0' }}></div>
										<Tabs
											className={styles.tabs}
											type="card"
											activeKey={activeTab}
											onTabClick={handleActiveTabChange}
										>
											<TabPane
												tab="Əsas məlumat"
												key="1"
												forceRender
											>
												<ProductInfo
													setIsServiceType={
														setIsServiceType
													}
													setAttachment={
														setAttachment
													}
													attachment={attachment}
													form={form}
													id={id}
													filterSelectedMeauserments={
														filterSelectedMeauserments
													}
													setFilterSelectedMeauserments={
														setFilterSelectedMeauserments
													}
													addedCatalog={addedCatalog}
													setAddedCatalog={
														setAddedCatalog
													}
													allDataPriceEdit={
														allDataPriceEdit
													}
													editData={editData}
													constPriceData={
														constPriceData
													}
													currencies={currencies}
													pricesDataConcat={
														pricesDataConcat
													}
													handleNewCatalogClick={
														handleNewCatalogClick
													}
													setParentCatalogName={
														setParentCatalogName
													}
													setMeasurementModalIsVisible={
														setMeasurementModalIsVisible
													}
													handleDefaultPriceChange={
														handleDefaultPriceChange
													}
													handlePriceTypeValueChange={
														handlePriceTypeValueChange
													}
													handlePriceTypePercentageChange={
														handlePriceTypePercentageChange
													}
													handleProductItem={
														handleProductItem
													}
													handleAddExpenseClick={
														handleAddExpenseClick
													}
													setFormData={setFormData}
													formData={formData}
													setAutoGenerate={
														setAutoGenerate
													}
													autoGenerate={autoGenerate}
													product={data || {}}
													data={contactData}
													setContactItem={
														setContactItem
													}
												/>
											</TabPane>

											{isServiceType ? (
												<TabPane
													tab="Tərkib"
													key="2"
													disabled
													forceRender
												></TabPane>
											) : (
												<TabPane
													tab="Tərkib"
													key="2"
													forceRender
												>
													<ProductComposition
														summaries={summaries}
														form={form}
														id={id}
														returnUrl={returnUrl}
														onScan={onScan}
														dataComp={dataComp}
													/>
												</TabPane>
											)}
										</Tabs>
										<Button
											htmlType="submit"
											loading={actionLoading}
											type="primary"
										>
											Əlavə et
										</Button>
										<Button
											onClick={() => history.goBack()}
											style={{ marginLeft: '10px' }}
										>
											Imtina et
										</Button>
									</Form>
								</Spin>
							</Col>
						</Row>
					</div>
				</>
			</ProWrapper>
		</>
	);
}

const mapStateToProps = state => ({
	actionLoading: state.productReducer.actionLoading,
	catalogs: state.catalogsReducer.catalogs,
	unitOfMeasurements: state.mehsulReducer.unitOfMeasurements,
	manufacturers: state.contactsReducer.manufacturers,
	productPriceTypes: state.mehsulReducer.productPriceTypes,
	filteredProductPriceTypes: state.mehsulReducer.filteredProductPriceTypes,
	currencies: state.kassaReducer.currencies,

	isLoading: state.productReducer.isLoading,

	permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
	description: state.salesOperation.description,
	selectedProducts: state.salesOperation.selectedProducts,
	selectedProductionExpense: state.salesOperation.selectedProductionExpense,
	selectedProductionEmployeeExpense:
		state.salesOperation.selectedProductionEmployeeExpense,
	selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
	materialInvoices: state.salesOperation.materialList,
	productionExpensesList: state.salesOperation.productionExpensesList,
	stocks: state.stockReducer.stocksStatics,
	freeBarcodTypes: state.mehsulReducer.freeBarcodTypes,
});

export default connect(
	mapStateToProps,
	{
		fetchFilteredCatalogs,
		fetchCatalogs,
		fetchMeasurements,
		fetchUnitOfMeasurements,
		fetchManufacturers,
		fetchCurrencies,
		fetchProductPriceTypes,

		createProduct,
		createUnitOfMeasurements,
		createCatalog,
		editProduct,
		getProduct,
		getProductComposition,

		createProductionExpense,
		createProductionEmployeeExpense,
		createProductionMaterialExpense,
		editCompositon,
		createCompositon,
		fetchProductionInfo,
		fetchProductionMaterialExpense,
		fetchProductionEmployeeExpense,
		fetchProductionExpense,
		fetchFreeBarcodTypes,

		fetchStockStatics,
		fetchMaterialList,
		fetchProductionExpensesList,
		fetchProducts,
		handleResetInvoiceFields,
		downloadFileUrl,
	}
)(Form.create({ name: 'AddProduct' })(AddProduct));
