/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import {
	deleteProduct,
	fetchProducts,
	fetchProductCount,
	fetchProduct,
} from 'store/actions/product';
import { fetchAllProducts } from 'store/actions/export-to-excel/stocksModule';

import {
	fetchTableConfiguration,
	createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { fetchManufacturers } from 'store/actions/contacts-new';
import {
	Table,
	NewButton,
	ProPageSelect,
	ProPagination,
	ExportButton,
	ExcelButton,
	ProModal,
} from 'components/Lib';
import { Col, Row } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import swal from '@sweetalert/with-react';
import { toast } from 'react-toastify';
import { permissions, accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import _ from 'lodash';
import { TableConfiguration } from 'components/Lib/TableConfiguration';
import ProductsSideBar from './sideBar';
import styles from '../styles.module.scss';
import { getProductsColumns } from './columns';
import { AddFormModal } from '../../Settings/#shared';
import DetailsTab from './DetailsTab';
import queryString from 'query-string';
import {
	defaultNumberFormat,
	filterQueryResolver,
	formatNumberToLocale,
} from 'utils';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { PRODUCT_TABLE_SETTING_DATA } from 'utils/table-config/stocksModule';
import BarcodeDetails from './barcodeDetails';

import { IoFilterCircleOutline } from 'react-icons/io5';

function Products(props) {
	const {
		fetchProducts,
		products,
		// exProducts,
		fetchAllProducts,
		exProductsIsLoading,
		productCount,
		fetchProductCount,
		fetchManufacturers,
		productsLoading,
		deleteProduct,
		fetchTableConfiguration,
		createTableConfiguration,
		tableConfiguration,
		fetchProduct,
	} = props;

	const [exProducts, setExProducts] = useState([]);

	const history = useHistory();
	const location = useLocation();
	const params = queryString.parse(location.search, {
		arrayFormat: 'bracket',
	});
	const [pageSize, setPageSize] = useState(
		params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
	);
	const [currentPage, setCurrentPage] = useState(
		params.page && !isNaN(params.page) ? parseInt(params.page) : 1
	);
	const [productModalIsVisible, setProductModalIsVisible] = useState(false);
	const [selectedRow, setSelectedRow] = useState({});
	const [activeTab, setActiveTab] = useState(0);
	const [visible, toggleVisible] = useState(false);
	const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
	const [visibleColumns, setVisibleColumns] = useState([]);
	const [tableSettingData, setTableSettingData] = useState(
		PRODUCT_TABLE_SETTING_DATA
	);
	const [excelData, setExcelData] = useState([]);
	const [excelColumns, setExcelColumns] = useState([]);

	const [filters, onFilter, setFilters] = useFilterHandle(
		{
			type: params.type ? params.type : undefined,
			serialNumber: params.serialNumber ? params.serialNumber : undefined,
			catalogId: undefined,
			parentCatalogIds: params.parentCatalogIds
				? params.parentCatalogIds
				: undefined,
			catalogIds: params.catalogIds ? params.catalogIds : undefined,
			manufacturers: params.manufacturers
				? params.manufacturers
				: undefined,
			status: params.status ? params.status : undefined,
			limit: undefined,
			page: undefined,
			barcode: params.barcode ? params.barcode : null,
			product_code: params.product_code ? params.product_code : null,
			q: params.q ? params.q : undefined,
			inStock: params.inStock ? params.inStock : undefined,
			unitOfMeasurementIds: params.unitOfMeasurementIds
				? params.unitOfMeasurementIds
				: undefined,
			description: params.description ? params.description : undefined,
			quantityFrom: params.quantityFrom ? params.quantityFrom : undefined,
			quantityTo: params.quantityTo ? params.quantityTo : undefined,
			isDeleted: params.isDeleted
				? params.isDeleted
				: params.status == 1
					? undefined
					: 0,
		},
		({ filters }) => {
			let filter = {
				...filters,
				limit: pageSize,
				page: currentPage,
			};
			const query = filterQueryResolver({ ...filter });
			if (typeof filter.history === 'undefined') {
				history.push({
					search: query,
				});
			}
			fetchProducts({ filters: getFilters() });
			fetchProductCount({ filter: getFilters() });
		}
	);

	function getFilters() {
		let filter = {
			...filters,
			limit: pageSize,
			page: currentPage,
			// isDeleted: params.isDeleted ? params.isDeleted : params.status == 1 ? undefined : 0,
		};
		return filter;
	}

	const [rerender, setRerender] = useState(0);
	const popstateEvent = () => {
		setRerender(rerender + 1);
	};

	useEffect(() => {
		window.addEventListener('popstate', popstateEvent);
		return () => window.removeEventListener('popstate', popstateEvent);
	}, [rerender]);

	useEffect(() => {
		const parmas = queryString.parse(location.search, {
			arrayFormat: 'bracket',
		});

		if (rerender > 0) {
			parmas.history = 1;

			if (parmas.page && !isNaN(parmas.page)) {
				setCurrentPage(parseInt(parmas.page));
			}
			setFilters({ ...parmas });
		}
	}, [rerender]);

	const handlePageSizeChange = (_, size) => {
		setCurrentPage(1);
		setPageSize(size);
		onFilter('page', 1);
		onFilter('limit', size);
	};

	const handlePaginationChange = value => {
		onFilter('page', value);
		return (() => setCurrentPage(value))();
	};

	const handleChange = value => {
		onFilter('page', value);
		return (() => setCurrentPage(value))();
	};

	const handleDetailClick = row => {
		setSelectedRow(row);
		setProductModalIsVisible(true);
		setActiveTab(0);
	};

	const handleDeleteClick = row => {
		swal({
			title: 'Diqqət!',
			text: 'Silmək istədiyinizə əminsiniz?',
			buttons: ['Ləğv et', 'Sil'],
			dangerMode: true,
		}).then(willDelete => {
			if (willDelete) {
				deleteProduct(
					row.id,
					undefined,
					() => {
						if (
							(productCount - 1) % pageSize == 0 &&
							currentPage > 1
						) {
							handlePaginationChange(currentPage - 1);
						} else {
							fetchProducts({ filters: getFilters() });
							fetchProductCount({ filter: getFilters() });
							toast.success('Əməliyyat uğurla tamamlandı.');
						}
					},
					({ error }) => {
						toast.error(error.response.data.message);
					}
				);
			}
		});
	};

	useEffect(() => {
		if (productCount === undefined) fetchProductCount({ filter: {} });
		fetchManufacturers();
		fetchTableConfiguration({ module: 'product' });
		// get Table Configuration data
	}, []);

	const openBarcodeModal = id => {
		setBarcodeModalVisible(!barcodeModalVisible);
		if (!barcodeModalVisible) {
			fetchProduct({ id });
		}
	};

	// Table Configuration actions

	const handleSaveSettingModal = column => {
		let tableColumn = column
			.filter(col => col.visible === true)
			.map(col => col.dataIndex);
		let filterColumn = column.filter(col => col.dataIndex !== 'id');
		let data = JSON.stringify(filterColumn);
		getProductsColumns({
			column: tableColumn,
			currentPage,
			pageSize,
			handleDetailClick,
			handleDeleteClick,
			openBarcodeModal,
		});
		createTableConfiguration({ moduleName: 'product', columnsOrder: data });
		setVisibleColumns(tableColumn);
		setTableSettingData(column);
		toggleVisible(false);
		getExcelColumns();
	};

	// set Table Configuration data and set visible columns
	useEffect(() => {
		if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
			let parseData = JSON.parse(tableConfiguration);
			let columns = parseData
				.filter(column => column.visible === true)
				.map(column => column.dataIndex);
			setVisibleColumns(columns);
			setTableSettingData(parseData);
		} else if (tableConfiguration == null) {
			const column = PRODUCT_TABLE_SETTING_DATA.filter(
				column => column.visible === true
			).map(column => column.dataIndex);
			setVisibleColumns(column);
			setTableSettingData(PRODUCT_TABLE_SETTING_DATA);
		}
	}, [tableConfiguration]);

	// Excel table columns
	const getExcelColumns = () => {
		let columnClone = [...visibleColumns];
		columnClone.indexOf('attachmentName') !== -1 &&
			columnClone.splice(columnClone.indexOf('attachmentName'), 1);

		let columns = [];
		columns[columnClone.indexOf('isServiceType')] = {
			title: 'Məhsul tipi',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('isWithoutSerialNumber')] = {
			title: 'Seriya nömrəsi',
			width: { wpx: 100 },
		};

		columns[columnClone.indexOf('parentCatalogName')] = {
			title: 'Kataloq',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('catalogName')] = {
			title: 'Alt kataloq',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('name')] = {
			title: 'Məhsul adı',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('manufacturerName')] = {
			title: 'İstehsalçı',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('productCode')] = {
			title: 'Məhsul kodu',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('quantity')] = {
			title: 'Anbar qalığı',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('unitOfMeasurementName')] = {
			title: 'Ölçü vahidi',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('pricePerUnit')] = {
			title: 'Qiymət',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('isDeleted')] = {
			title: 'Status',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('barcode')] = {
			title: 'Barkod',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('description')] = {
			title: 'Əlavə məlumat',
			width: { wpx: 200 },
		};
		columns.unshift({
			title: '№',
			width: { wpx: 50 },
		});
		setExcelColumns(columns);
	};

	// Create Excel data
	const getExcelData = () => {
		let columnClone = [...visibleColumns];
		columnClone.indexOf('attachmentName') !== -1 &&
			columnClone.splice(columnClone.indexOf('attachmentName'), 1);

		const data = exProducts.map((item, index) => {
			let arr = [];
			columnClone.includes('isServiceType') &&
				(arr[columnClone.indexOf('isServiceType')] = {
					value: item.isServiceType ? 'Xidmət' : 'Məhsul' || '-',
				});
			columnClone.includes('isWithoutSerialNumber') &&
				(arr[columnClone.indexOf('isWithoutSerialNumber')] = {
					value: item.isWithoutSerialNumber ? 'Yox' : 'Hə' || '-',
				});
			columnClone.includes('parentCatalogName') &&
				(arr[columnClone.indexOf('parentCatalogName')] = {
					value: item.parentCatalogName || '-',
				});
			columnClone.includes('catalogName') &&
				(arr[columnClone.indexOf('catalogName')] = {
					value: item.catalogName || '-',
				});
			columnClone.includes('name') &&
				(arr[columnClone.indexOf('name')] = {
					value: item.name || '-',
				});
			columnClone.includes('manufacturerName') &&
				(arr[columnClone.indexOf('manufacturerName')] = {
					value: item.manufacturerName || '-',
				});
			columnClone.includes('productCode') &&
				(arr[columnClone.indexOf('productCode')] = {
					value: item.productCode || '-',
				});
			// columnClone.includes('attachmentName') && (arr[columnClone.indexOf('attachmentName')] = { value: item.attachmentName || '-', })
			columnClone.includes('unitOfMeasurementName') &&
				(arr[columnClone.indexOf('unitOfMeasurementName')] = {
					value: item.unitOfMeasurementName || '-',
				});
			columnClone.includes('pricePerUnit') &&
				(arr[columnClone.indexOf('pricePerUnit')] = {
					value:
						formatNumberToLocale(
							defaultNumberFormat(item.pricePerUnit)
						) + ` ${item.currencyCode || '-'}` || '-',
				});
			columnClone.includes('quantity') &&
				(arr[columnClone.indexOf('quantity')] = {
					value: Number(item.quantity).toFixed(4) || '-',
				});
			columnClone.includes('isDeleted') &&
				(arr[columnClone.indexOf('isDeleted')] = {
					value: item.isDeleted ? 'Silinib' : 'Aktiv' || '-',
				});
			columnClone.includes('barcode') &&
				(arr[columnClone.indexOf('barcode')] = {
					value: item.barcode || '-',
				});
			columnClone.includes('description') &&
				(arr[columnClone.indexOf('description')] = {
					value: item.description || '-',
				});
			arr.unshift({ value: index + 1 });
			return arr;
		});
		setExcelData(data);
	};

	useEffect(() => {
		getExcelColumns();
	}, [visibleColumns]);

	useEffect(() => {
		getExcelData();
	}, [exProducts]);

	const [openedSidebar, setOpenedSidebar] = React.useState(false);

	return (
		<div>
			<TableConfiguration
				saveSetting={handleSaveSettingModal}
				visible={visible}
				AllStandartColumns={PRODUCT_TABLE_SETTING_DATA}
				setVisible={toggleVisible}
				columnSource={tableSettingData}
			/>
			<ProductsSideBar
				{...{
					filters,
					onFilter,
					setCurrentPage,
					handlePaginationChange,
					openedSidebar,
					setOpenedSidebar,
				}}
			/>
			<ProModal
				maskClosable
				padding
				width={1100}
				handleModal={openBarcodeModal}
				isVisible={barcodeModalVisible}
			>
				<BarcodeDetails fromTable />
			</ProModal>
			<AddFormModal
				width={760}
				style={{ minWidth: 'fit-content' }}
				withOutConfirm
				onCancel={() => setProductModalIsVisible(false)}
				visible={productModalIsVisible}
			>
				<DetailsTab
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					onCancel={() => setProductModalIsVisible(false)}
					visible={productModalIsVisible}
					row={selectedRow}
					{...props}
				/>
			</AddFormModal>
			<section className="scrollbar aside" style={{ padding: '0 32px' }}>
				<Row className={styles.pageToolsContainer}>
					<Col span={24} align="end">
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							<div className={styles.responsiveFilterButton}>
								<button
									type="button"
									onClick={() =>
										setOpenedSidebar(!openedSidebar)
									}
								>
									<IoFilterCircleOutline />
								</button>
							</div>
							<SettingButton onClick={toggleVisible} />
							<ExportToExcel
								getExportData={() =>
									fetchAllProducts({
										filters: {
											...filters,
											limit: 5000,
											page: undefined,
										},
										onSuccessCallback: data => {
											setExProducts(data.data);
										},
									})
								}
								data={excelData}
								columns={excelColumns}
								excelTitle="Məhsullar"
								excelName="Məhsullar"
								filename="Məhsullar"
								loading={exProductsIsLoading}
								count={productCount}
							/>
							<Can
								I={accessTypes.manage}
								a={permissions.stock_product}
							>
								<Link to="/warehouse/product/add">
									<NewButton
										label="Yeni məhsul"
										style={{ marginLeft: '15px' }}
									/>
								</Link>
							</Can>
						</div>
					</Col>
				</Row>
				<Row style={{ marginBottom: '15px' }}>
					<Table
						loading={productsLoading}
						footerClassName={styles.productTableFooter}
						dataSource={products}
						columns={getProductsColumns({
							column: visibleColumns,
							currentPage,
							pageSize,
							handleDetailClick,
							handleDeleteClick,
							openBarcodeModal,
						})}
						rowKey={record => record.id}
					/>
				</Row>
				<Row className={styles.paginationRow}>
					<Col xs={24} sm={24} md={18}>
						<ProPagination
							currentPage={currentPage}
							pageSize={pageSize}
							total={productCount || 0}
							onChange={handleChange}
						/>
					</Col>
					<Col xs={24} sm={24} md={6} align="end">
						<ProPageSelect
							total={productCount || 0}
							onChange={newPageSize =>
								handlePageSizeChange(1, newPageSize)
							}
							value={pageSize}
						/>
					</Col>
				</Row>
			</section>
		</div>
	);
}

const mapStateToProps = state => ({
	products: state.productReducer.products,
	productsLoading: state.loadings.products,
	productCount: state.productReducer.productCount,
	exportProducstLoading: state.loadings.exportProducts,
	permissionsList: state.permissionsReducer.permissionsByKeyValue,
	tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
	// exProducts: state.allStocksModuleReducer.exProducts,
	exProductsIsLoading: state.allStocksModuleReducer.exProductsIsLoading,
});

export default connect(
	mapStateToProps,
	{
		deleteProduct,
		fetchProducts,
		fetchManufacturers,
		fetchProductCount,
		fetchTableConfiguration,
		createTableConfiguration,
		fetchAllProducts,
		fetchProduct,
	}
)(Products);
