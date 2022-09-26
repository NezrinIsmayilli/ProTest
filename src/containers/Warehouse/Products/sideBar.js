/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
	Sidebar,
	ProSelect,
	ProSearch,
	ProSidebarItem,
	ProTypeFilterButton,
	ProInput,
	ProAsyncSelect,
} from 'components/Lib';
import { Row, Col, Select, Icon } from 'antd';
import { useDebounce } from 'use-debounce';
import { connect } from 'react-redux';
import { fetchCatalogs, fetchFilteredCatalogs } from 'store/actions/catalog';
import { fetchContacts } from 'store/actions/contact';
import { fetchMeasurements } from 'store/actions/measurements';
import { productTypes } from 'utils';
import { useCatalog } from 'hooks';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { filter } from 'lodash';
import styles from '../styles.module.scss';

const { Option } = Select;
const ProductsSideBar = props => {
	const {
		parentCatalogs,
		childCatalogs,
		handleParentCatalogsChange,
		handleChildCatalogsChange,
	} = useCatalog();
	const [componentIsMounted, setComponentIsMounted] = useState(false);

	const {
		fetchContacts,
		fetchMeasurements,
		fetchCatalogs,
		fetchFilteredCatalogs,
		onFilter,
		filters,
		setCurrentPage,
		handlePaginationChange,
		openedSidebar,
		setOpenedSidebar,
	} = props;

	const [quantityFromValue, setQuantityFromValue] = useState(
		filters.quantityFrom
	);
	const [quantityToValue, setQuantityToValue] = useState(filters.quantityTo);

	const [quantityFrom] = useDebounce(quantityFromValue, 600);
	const [quantityTo] = useDebounce(quantityToValue, 600);
	const [productName, setProductName] = useState(
		filters.q ? filters.q : undefined
	);
	const [productCode, setProductCode] = useState(
		filters.product_code ? filters.product_code : undefined
	);
	const [barCode, setbarCode] = useState(
		filters.barcode ? filters.barcode : undefined
	);
	const [description, setDescription] = useState(
		filters.description ? filters.description : undefined
	);
	const [manufacturers, setManufacturers] = useState([]);
	const [
		filterSelectedManufacturers,
		setFilterSelectedManufacturers,
	] = useState([]);
	const [catalogs, setCatalogs] = useState({ root: [], children: {} });
	const [category, setCategory] = useState(null);
	const [subcategory, setSubCategory] = useState(null);
	const [selectedCatalogs, setSelectedCatalogs] = useState([]);
	const [filterSelectedCatalog, setFilterSelectedCatalog] = useState({
		root: [],
	});
	const [filtered, setFiltered] = useState(false);
	const [measurements, setMeasurements] = useState([]);
	const [
		filterSelectedMeauserments,
		setFilterSelectedMeauserments,
	] = useState([]);
	useEffect(() => {
		if (quantityFrom !== filters.quantityFrom) {
			onFilter('quantityFrom', quantityFrom);
		}
	}, [quantityFrom, filters.quantityFrom]);

	useEffect(() => {
		if (quantityTo !== filters.quantityTo) {
			onFilter('quantityTo', quantityTo);
		}
	}, [quantityTo, filters.quantityTo]);

	const handleQuantity = (value, setValue, returnValue) => {
		const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
		if (re.test(value) && value <= 10000000) {
			setValue(value);
			return value;
		}
		if (value === '') {
			setValue(null);
			return null;
		}
		return returnValue;
	};

	const handleSerialNumber = type => {
		handlePaginationChange(1);
		onFilter('serialNumber', type);
	};

	const handleStock = type => {
		handlePaginationChange(1);
		onFilter('inStock', type);
	};

	const handleSearchFilter = value => {
		handlePaginationChange(1);
		onFilter('q', value);
	};
	const handleSearchCodeFilter = value => {
		handlePaginationChange(1);
		onFilter('product_code', value);
	};

	const handleDefaultFilter = (type, value) => {
		handlePaginationChange(1);
		onFilter(type, value);
	};

	useEffect(() => {
		if (
			filters.parentCatalogIds &&
			catalogs.root?.length &&
			filterSelectedCatalog.root?.length &&
			!filtered
		) {
			const catalogOptions = filterSelectedCatalog.root?.filter(catalog =>
				filters.parentCatalogIds
					.map(id => Number(id))
					.includes(catalog.id)
			);
			const Options = catalogOptions.map(catalog => ({
				props: { catalog },
			}));
			handleParentCatalogsChange(
				filters.parentCatalogIds.map(Number),
				Options
			);
			setFiltered(true);
		}
	}, [catalogs.root, filterSelectedCatalog]);

	useEffect(() => {
		if (componentIsMounted) {
			onFilter(
				'parentCatalogIds',
				parentCatalogs.map(parentCatalog => parentCatalog.id)
			);
			if (category) {
				handlePaginationChange(1);
			}
		} else {
			setComponentIsMounted(true);
		}
	}, [parentCatalogs]);

	useEffect(() => {
		if (componentIsMounted) {
			onFilter(
				'catalogIds',
				childCatalogs.map(childCatalog => childCatalog.id)
			);
			if (subcategory) {
				handlePaginationChange(1);
			}
		} else {
			setComponentIsMounted(true);
		}
	}, [childCatalogs]);

	useEffect(() => {
		const subCatalogs = [];
		parentCatalogs.map(parentCategory =>
			catalogs.children[parentCategory.id]?.map(subCategory => {
				subCatalogs.push(subCategory);
			})
		);

		if (filters.catalogIds && subCatalogs.length) {
			const sub = subCatalogs.filter(subCat =>
				filters.catalogIds.map(Number).includes(subCat.id)
			);
			const subOptions = sub.map(catalog => ({ props: { catalog } }));
			handleChildCatalogsChange(
				filters.catalogIds.map(Number),
				subOptions
			);
		}
	}, [catalogs.children]);

	const handleSearchBarcodeFilter = value => {
		handlePaginationChange(1);
		if (value) {
			onFilter('barcode', value);
		} else {
			onFilter('barcode', null);
		}
	};

	const handleChange = (value, field) => {
		console.log(value);
		if (value === '') {
			onFilter(field, undefined);
			setCurrentPage(1);
			onFilter('page', 1);
		}
	};

	const handleStatus = value => {
		handlePaginationChange(1);
		if (!value) {
			onFilter('status', 1);
		} else {
			onFilter('status', 0);
		}
		onFilter('isDeleted', value);
	};

	useEffect(() => {
		if (filters.parentCatalogIds) {
			fetchFilteredCatalogs(
				{ ids: filters.parentCatalogIds.map(Number) },
				data => {
					let appendList = {};
					if (data.data) {
						appendList = data.data;
					}
					setFilterSelectedCatalog(appendList);
				}
			);
		}
		if (filters.manufacturers) {
			const filter = {
				ids: filters.manufacturers.map(Number),
				categories: [8],
			};
			fetchContacts(filter, data => {
				const appendList = [];

				if (data.data) {
					data.data.forEach(element => {
						appendList.push({
							id: element.id,
							name: element.name,
							...element,
						});
					});
				}
				setFilterSelectedManufacturers(appendList);
			});
		}

		if (filters.unitOfMeasurementIds) {
			const filter = {
				ids: filters.unitOfMeasurementIds.map(Number),
			};
			fetchMeasurements(filter, data => {
				let appendList = {};
				if (data.data) {
					appendList = data.data;
				}
				setFilterSelectedMeauserments(appendList);
			});
		}
	}, []);

	const ajaxCatalogsSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const defaultFilters = { limit, page, name: search };
		fetchFilteredCatalogs(defaultFilters, data => {
			let appendList = {};
			if (data.data) {
				appendList = data.data;
			}
			if (onSuccessCallback !== undefined) {
				onSuccessCallback(!Object.keys(appendList).length);
			}
			if (stateReset) {
				setCatalogs(appendList);
			} else {
				setCatalogs({
					...appendList,
					root: catalogs.root.concat(appendList.root),
				});
			}
		});
	};

	const ajaxManufacturersSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const filters = {
			limit,
			page,
			categories: [8],
			name: search,
		};
		fetchContacts(filters, data => {
			const appendList = [];
			if (data.data) {
				data.data.forEach(element => {
					appendList.push({
						id: element.id,
						name: element.name,
						...element,
					});
				});
			}
			if (onSuccessCallback !== undefined) {
				onSuccessCallback(!appendList.length);
			}
			if (stateReset) {
				setManufacturers(appendList);
			} else {
				setManufacturers(manufacturers.concat(appendList));
			}
		});
	};

	const ajaxMeasurementSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const defaultFilters = { limit, page, q: search };
		fetchMeasurements(defaultFilters, data => {
			const appendList = [];
			if (data.data) {
				data.data.forEach(element => {
					appendList.push({
						id: element.id,
						name: element.name,
						...element,
					});
				});
			}
			if (onSuccessCallback !== undefined) {
				onSuccessCallback(!appendList.length);
			}
			if (stateReset) {
				setMeasurements(appendList);
			} else {
				setMeasurements(measurements.concat(appendList));
			}
		});
	};
	return (
		<Sidebar
			title="Məhsullar"
			openedSidebar={openedSidebar}
			setOpenedSidebar={setOpenedSidebar}
		>
			<ProSidebarItem label="Məhsul növü">
				<ProSelect
					allowClear
					onChange={value => {
						onFilter(
							'type',
							value === 1
								? 'service'
								: value === 2
									? 'product'
									: undefined
						);
						handlePaginationChange(1);
					}}
					value={
						filters.type
							? filters.type == 'product'
								? 'Məhsul'
								: 'Xidmət'
							: undefined
					}
					data={productTypes}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Anbarda">
				<Row>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hamısı"
							isActive={filters.inStock === undefined}
							onClick={() => handleStock(undefined)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hə"
							isActive={filters.inStock == 1 ? 'primary' : ''}
							onClick={() => handleStock(1)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Yox"
							onClick={() => handleStock(0)}
							isActive={filters.inStock == 0 ? 'primary' : ''}
						/>
					</Col>
				</Row>
			</ProSidebarItem>

			<ProSidebarItem label="Seriya nömrə">
				<Row>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hamısı"
							isActive={filters.serialNumber === undefined}
							onClick={() => handleSerialNumber(undefined)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hə"
							isActive={
								filters.serialNumber == 1 ? 'primary' : ''
							}
							onClick={() => handleSerialNumber(1)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Yox"
							onClick={() => handleSerialNumber(0)}
							isActive={
								filters.serialNumber == 0 ? 'primary' : ''
							}
						/>
					</Col>
				</Row>
			</ProSidebarItem>

			<ProSidebarItem label="Kateqoriya">
				<ProAsyncSelect
					mode="multiple"
					selectRequest={ajaxCatalogsSelectRequest}
					valueOnChange={newCatalogs => {
						setCategory(newCatalogs);
						setSelectedCatalogs([
							...selectedCatalogs,
							...catalogs.root
								?.filter(catalog =>
									newCatalogs.includes(catalog.id)
								)
								.filter(
									d =>
										!new Set(
											selectedCatalogs.map(de => de.id)
										).has(d.id)
								),
						]);
						filterSelectedCatalog.root.length > 0
							? handleParentCatalogsChange(
								newCatalogs,
								[
									...filterSelectedCatalog.root,
									...catalogs.root.filter(
										item =>
											!filterSelectedCatalog.root
												.map(({ id }) => id)
												?.includes(item.id)
									),
								]
									?.filter(catalog =>
										newCatalogs.includes(catalog.id)
									)
									.map(catalog => ({ props: { catalog } }))
							)
							: handleParentCatalogsChange(
								newCatalogs,
								[
									...selectedCatalogs,
									...catalogs.root?.filter(
										d =>
											!new Set(
												selectedCatalogs.map(
													de => de.id
												)
											).has(d.id)
									),
								]
									?.filter(catalog =>
										newCatalogs.includes(catalog.id)
									)
									.map(catalog => ({ props: { catalog } }))
							);
					}}
					data={
						filterSelectedCatalog.root.length > 0
							? [
								...filterSelectedCatalog.root,
								...catalogs.root.filter(
									item =>
										!filterSelectedCatalog.root
											.map(({ id }) => id)
											?.includes(item.id)
								),
							]
							: catalogs.root || []
					}
					// data={catalogs.root || []}
					value={
						filters.parentCatalogIds
							? filters.parentCatalogIds.map(Number)
							: parentCatalogs.map(
								parentCatalog => parentCatalog.id
							)
					}
				/>
			</ProSidebarItem>

			<ProSidebarItem label="Alt kateqoriya">
				<Select
					// loading={isLoading}
					value={
						filters.catalogIds
							? filters.catalogIds.map(Number)
							: childCatalogs.map(childCatalog => childCatalog.id)
					}
					onChange={(newCatalogs, options) => {
						setSubCategory(newCatalogs);
						handleChildCatalogsChange(newCatalogs, options);
					}}
					mode="multiple"
					placeholder="Seçin"
					suffixIcon={<Icon component={DownArrow} />}
					showArrow
					disabled={!parentCatalogs.length}
					className={styles.select}
					size="large"
					allowClear
					filterOption={(input, option) =>
						option.props.children
							.replace('İ', 'I')
							.toLowerCase()
							.includes(input.replace('İ', 'I').toLowerCase())
					}
				>
					{parentCatalogs.map(parentCatalog =>
						catalogs.children[parentCatalog.id]?.map(subCatalog => (
							<Option
								key={subCatalog.id}
								value={subCatalog.id}
								id={subCatalog.id}
								className={styles.dropdown}
								catalog={subCatalog}
							>
								{subCatalog.name}
							</Option>
						))
					)}
				</Select>
			</ProSidebarItem>

			<ProSidebarItem label="Məhsul adı">
				<ProSearch
					allowClear
					onChange={e => {
						setProductName(e.target.value);
						if (e.target.value === '') {
							handleDefaultFilter('q', undefined);
						}
					}}
					onSearch={value => handleSearchFilter(value)}
					value={productName}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Məhsul kodu">
				<ProSearch
					onChange={e => {
						setProductCode(e.target.value);
						handleChange(e.target.value, 'product_code');
					}}
					allowClear
					onSearch={value => handleSearchCodeFilter(value)}
					value={productCode}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Anbar qalığı">
				<Row gutter={2} style={{ marginTop: '8px' }}>
					<Col span={12}>
						<ProInput
							value={quantityFromValue}
							onChange={event =>
								handleQuantity(
									event.target.value,
									setQuantityFromValue,
									quantityFromValue
								)
							}
							placeholder="Başlanğıc"
						/>
					</Col>
					<Col span={12}>
						<ProInput
							value={quantityToValue}
							onChange={event =>
								handleQuantity(
									event.target.value,
									setQuantityToValue,
									quantityToValue
								)
							}
							placeholder="Son"
						/>
					</Col>
				</Row>
			</ProSidebarItem>
			<ProSidebarItem label="Barkod">
				<ProSearch
					allowClear
					value={barCode}
					onChange={e => {
						setbarCode(e.target.value);
						handleChange(e.target.value, 'barcode');
					}}
					onSearch={value => handleSearchBarcodeFilter(value)}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="İstehsalçı">
				<ProAsyncSelect
					selectRequest={ajaxManufacturersSelectRequest}
					mode="multiple"
					valueOnChange={value =>
						handleDefaultFilter('manufacturers', value)
					}
					value={
						filters.manufacturers
							? filters.manufacturers.map(Number)
							: undefined
					}
					data={
						filterSelectedManufacturers.length > 0
							? [
								...filterSelectedManufacturers,
								...manufacturers.filter(
									item =>
										!filterSelectedManufacturers
											.map(({ id }) => id)
											?.includes(item.id)
								),
							]
							: manufacturers
					}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Ölçü vahidi">
				<ProAsyncSelect
					valueOnChange={value =>
						handleDefaultFilter('unitOfMeasurementIds', value)
					}
					mode="multiple"
					selectRequest={ajaxMeasurementSelectRequest}
					value={
						filters.unitOfMeasurementIds
							? filters.unitOfMeasurementIds.map(Number)
							: undefined
					}
					data={
						filterSelectedMeauserments.length > 0
							? [
								...filterSelectedMeauserments,
								...measurements.filter(
									item =>
										!filterSelectedMeauserments
											.map(({ id }) => id)
											?.includes(item.id)
								),
							]
							: measurements
					}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Status">
				<Row>
					<Col span={8}>
						<ProTypeFilterButton
							label="Aktiv"
							isActive={filters.isDeleted == 0}
							onClick={() => handleStatus(0)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Silinib"
							isActive={filters.isDeleted == 1}
							onClick={() => handleStatus(1)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hamısı"
							onClick={() => handleStatus(undefined)}
							isActive={filters.isDeleted == undefined}
						/>
					</Col>
				</Row>
			</ProSidebarItem>
			<ProSidebarItem label="Əlavə məlumat">
				<ProSearch
					onSearch={value =>
						handleDefaultFilter('description', value)
					}
					onChange={e => {
						setDescription(e.target.value);
						handleChange(e.target.value, 'description');
					}}
					value={description}
				/>
			</ProSidebarItem>
		</Sidebar>
	);
};
const mapStateToProps = state => ({
	measurementsLoading: state.loadings.fetchMeasurements,
	catalogs: state.catalogsReducer.catalogs,
	measurements: state.measurementsReducer.measurements,
});

export default connect(
	mapStateToProps,
	{
		fetchCatalogs,
		fetchFilteredCatalogs,
		fetchContacts,
		fetchMeasurements,
	}
)(ProductsSideBar);
