/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { Col, Row } from 'antd';
import {
	Table,
	ProPageSelect,
	ProPagination,
	ProFilterButton,
	ExcelButton,
	TableConfiguration,
	ProModal,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
	createStock,
	editStock,
	fetchStockStatics,
	fetchStockStaticsCount,
	fetchStockInfo,
	setStockStaticsInfo,
} from 'store/actions/stock';
import { fetchSuppliers } from 'store/actions/contacts-new';
import { fetchProduct } from 'store/actions/product';
import { fetchStockTypes } from 'store/actions/settings/anbar';
import { fetchUsers } from 'store/actions/users';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks';
import math from 'exact-math';
import styles from '../styles.module.scss';
import WarehouseSideBar from './sideBar';
import { AddFormModal } from '../../Settings/#shared';
import WarehouseDetails from './warehouseDetails';
import { getTurnoverColumns } from './columns';
import queryString from 'query-string';
import {
	defaultNumberFormat,
	filterQueryResolver,
	formatNumberToLocale,
} from 'utils';
import { fetchAllStockStatics } from 'store/actions/export-to-excel/stocksModule';
import {
	fetchTableConfiguration,
	createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { STOCKTURNOVER_TABLE_SETTING_DATA } from 'utils/table-config/stocksModule';
import BarcodeDetails from '../Products/barcodeDetails';
import { cookies } from 'utils/cookies';
import { IoFilterCircleOutline } from 'react-icons/io5';
function WarehouseList(props) {
	const {
		tableConfiguration,
		fetchTableConfiguration,
		fetchStockStatics,
		fetchProduct,
		fetchStockStaticsCount,
		fetchAllStockStatics,
		fetchSuppliers,
		isLoading,
		stocks,
		stockCount,
		fetchUsers,
		fetchStockTypes,
		mainCurrencyCode,
		permissionsByKeyValue,
		createTableConfiguration,
		fetchBusinessUnitList,
		businessUnits,
		profile,
	} = props;
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const params = queryString.parse(location.search, {
		arrayFormat: 'bracket',
	});
	const tabs = {
		1: { id: 1, label: 'Aktiv məhsullar' },
		2: { id: 2, label: 'Bron olunmuş məhsullar' },
	};
	const baseURL =
		process.env.NODE_ENV === 'production'
			? process.env.REACT_APP_API_URL
			: process.env.REACT_APP_DEV_API_URL;
	const token = cookies.get('_TKN_');
	const tenantId = cookies.get('__TNT__');
	const [modalIsVisible, setModalIsVisible] = useState(false);
	const [currencyRate, setCurrencyRate] = useState(
		params.currencyRate
			? {
				rate: Number(params.currencyRate),
				code: params.currencyRateCode,
			}
			: { rate: 1 }
	);
	const [selectedRow, setSelectedRow] = useState(undefined);
	const [pageSize, setPageSize] = useState(
		params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
	);
	const [currentPage, setCurrentPage] = useState(
		params.page && !isNaN(params.page) ? parseInt(params.page) : 1
	);
	const [activeTab, setActiveTab] = useState(params.activeTab == 2 ? 2 : 1);
	const [detailActiveTab, setDetailActiveTab] = useState(2);
	const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
	const [visible, toggleVisible] = useState(false);
	const [exStockTurnover, setExStockTurnover] = useState([]);
	const [visibleColumns, setVisibleColumns] = useState([]);
	const [tableSettingData, setTableSettingData] = useState(
		STOCKTURNOVER_TABLE_SETTING_DATA
	);
	const [excelData, setExcelData] = useState([]);
	const [excelColumns, setExcelColumns] = useState([]);
	const [filters, onFilter, setFilters] = useFilterHandle(
		{
			limit: pageSize,
			page: currentPage,
			currencyRate: params.currencyRate ? params.currencyRate : undefined,
			currencyRateCode: params.currencyRateCode
				? params.currencyRateCode
				: undefined,
			suppliers: params.suppliers ? params.suppliers : undefined,
			businessUnitIds: params.businessUnitIds
				? params.businessUnitIds
				: businessUnits?.length === 1
					? businessUnits[0]?.id !== null
						? [businessUnits[0]?.id]
						: undefined
					: undefined,
			invoiceTypes: params.invoiceTypes
				? params.invoiceTypes
				: [1, 3, 5, 7, 10, 11],
			attachedInvoiceTypes: params.attachedInvoiceTypes
				? params.attachedInvoiceTypes
				: undefined,
			activeTab: params.activeTab ? params.activeTab : undefined,
			invoiceValue: params.invoiceValue ? params.invoiceValue : null,
			stocks: params.stocks ? params.stocks : null,
			rootCatalogs: params.rootCatalogs ? params.rootCatalogs : null,
			productCatalogs: params.productCatalogs
				? params.productCatalogs
				: null,
			products: params.products ? params.products : null,
			daysCountInStockFrom: params.daysCountInStockFrom
				? params.daysCountInStockFrom
				: undefined,
			daysCountInStockTo: params.daysCountInStockTo
				? params.daysCountInStockTo
				: undefined,
			isSerialNumber: params.isSerialNumber
				? params.isSerialNumber
				: undefined,
			productCode: params.productCode ? params.productCode : null,
			serialNumber: params.serialNumber ? params.serialNumber : null,
			unitOfMeasurements: params.unitOfMeasurements
				? params.unitOfMeasurements
				: undefined,
			barcode: params.barcode ? params.barcode : null,
		},
		({ filters }) => {
			const query = filterQueryResolver({ ...filters });
			if (typeof filters.history === 'undefined') {
				history.push({
					search: query,
				});
			}
			fetchStockStatics({ filters });
			fetchStockStaticsCount({ filters });
		}
	);

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
			parmas['history'] = 1;

			if (parmas.page && !isNaN(parmas.page)) {
				setCurrentPage(parseInt(parmas.page));
			}
			setFilters({ ...parmas });
		}
	}, [rerender]);

	const handleSaveSettingModal = column => {
		let tableColumn = column
			.filter(col => col.visible === true)
			.map(col => col.dataIndex);
		let filterColumn = column.filter(col => col.dataIndex !== 'id');
		let data = JSON.stringify(filterColumn);
		getTurnoverColumns({
			baseURL,
			tenantId,
			token,
			column: tableColumn,
			mainCurrencyCode,
			currencyRate,
			filters,
			handleDetailClick,
			handleSoldClick,
			handleTransferClick,
			permissions: permissionsByKeyValue,
			openBarcodeModal,
		});
		createTableConfiguration({
			moduleName: 'stockTurnover',
			columnsOrder: data,
		});
		setVisibleColumns(tableColumn);
		setTableSettingData(column);
		toggleVisible(false);
		getExcelColumns();
	};


	const getExcelColumns = (currencyRate, mainCurrencyCode) => {
		let columnClone = [...visibleColumns];
		columnClone.indexOf('attachmentName') !== -1 &&
			columnClone.splice(columnClone.indexOf('attachmentName'), 1);

		let columns = [];
		columns[columnClone.indexOf('stock_name')] = {
			title: 'Anbar',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('isServiceType')] = {
			title: 'Məhsul tipi',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('isWithoutSerialNumber')] = {
			title: 'Seriya nömrəsi',
			width: { wpx: 100 },
		};

		columns[columnClone.indexOf('catalog_name')] = {
			title: 'Kataloq',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('subcatalog_name')] = {
			title: 'Alt kataloq',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('quantity')] = {
			title: 'Say',
			width: { wpx: 200 },
		};
		columns[columnClone.indexOf('pricePerUnit')] = {
			title: 'Satış qiyməti',
			width: { wpx: 200 },
		};

		columns[columnClone.indexOf('product_name')] = {
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
  columns[columnClone.indexOf('customPrice')] = {
    title: `Orta dəyər (${currencyRate?.code || mainCurrencyCode})`,
    width: { wpx: 200 },
  };
  columns[columnClone.indexOf('mainPrice')] = {
    title: `Orta dəyər (${mainCurrencyCode})`,
    width: { wpx: 200 },
  };
  columns[columnClone.indexOf('totalPrice')] = {
    title: `Toplam (${mainCurrencyCode})`,
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
    width: { wpx: 90 },
  });
  setExcelColumns(columns)
}

// Create Excel data
const getExcelData = () => {
  let columnClone = [...visibleColumns];
  columnClone.indexOf('attachmentName') !== -1 && columnClone.splice(columnClone.indexOf('attachmentName'), 1);
  const columnFooterStyle = {
    font: { color: { rgb: 'FFFFFF' }, bold: true },
    fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
};
  const data = exStockTurnover.map((item, index) => {
    let arr = []
 
    let mainPrice=formatNumberToLocale(defaultNumberFormat(math.div(Number(item.price), Number(item.quantity))));
    let customPrice=formatNumberToLocale(defaultNumberFormat(math.div(math.div(Number(item.price), Number(item.quantity)),Number(currencyRate.rate))));
    let totalPrice=formatNumberToLocale(defaultNumberFormat(item.price))
    columnClone.includes('isServiceType') && (arr[columnClone.indexOf('isServiceType')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.isServiceType ? 'Xidmət' : 'Məhsul' || '-', })
    columnClone.includes('isWithoutSerialNumber') && (arr[columnClone.indexOf('isWithoutSerialNumber')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.isWithoutSerialNumber ? "Yox" : "Hə" || '-', })
    columnClone.includes('catalog_name') && (arr[columnClone.indexOf('catalog_name')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.catalog_name || '-', })
    columnClone.includes('subcatalog_name') && (arr[columnClone.indexOf('subcatalog_name')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.subcatalog_name || '-', })
    columnClone.includes('product_name') && (arr[columnClone.indexOf('product_name')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.product_name || '-' })
    columnClone.includes('manufacturerName') && (arr[columnClone.indexOf('manufacturerName')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.manufacturerName || '-' })
    columnClone.includes('productCode') && (arr[columnClone.indexOf('productCode')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.productCode || '-', })
    // columnClone.includes('attachmentName') && (arr[columnClone.indexOf('attachmentName')] = { value: item.attachmentName || '-', })
    columnClone.includes('stock_name') && (arr[columnClone.indexOf('stock_name')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.stock_name || '-', })
    columnClone.includes('quantity') && (arr[columnClone.indexOf('quantity')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.quantity))} ${item.unit_of_measurement || ''}` ||'-',style:item?.isLastRow?columnFooterStyle:'' });
    columnClone.includes('pricePerUnit') && (arr[columnClone.indexOf('pricePerUnit')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: `${formatNumberToLocale(defaultNumberFormat( Number(item.pricePerUnit||0)))} ${item.currencyCode  || ''}` || '-' })
    columnClone.includes('customPrice') && (arr[columnClone.indexOf('customPrice')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:Number(customPrice.replaceAll(",",'')) })
    columnClone.includes('mainPrice') && (arr[columnClone.indexOf('mainPrice')] =item?.isLastRow? {value:'',style:columnFooterStyle}:{ value:Number(mainPrice.replaceAll(",",''))})
    columnClone.includes('totalPrice') && (arr[columnClone.indexOf('totalPrice')] = { value:Number(totalPrice.replaceAll(",",'')) || '-' ,style:item?.isLastRow?columnFooterStyle:''})
    columnClone.includes('barcode') && (arr[columnClone.indexOf('barcode')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.barcode || '-', })
    columnClone.includes('description') && (arr[columnClone.indexOf('description')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.description || '-', })
    
    
   arr.unshift( item.isLastRow?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
    return arr;
   
  })
  setExcelData(data);
}


	useEffect(() => {
		getExcelColumns(currencyRate, mainCurrencyCode);
	}, [visibleColumns,currencyRate,mainCurrencyCode]);

	useEffect(() => {
		getExcelData();
	}, [exStockTurnover]);

	useEffect(() => {
		// get Table Configuration data
		fetchTableConfiguration({ module: 'stockTurnover' });
	}, []);

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
			const column = STOCKTURNOVER_TABLE_SETTING_DATA.filter(
				column => column.visible === true
			).map(column => column.dataIndex);
			setVisibleColumns(column);
			setTableSettingData(STOCKTURNOVER_TABLE_SETTING_DATA);
		}
	}, [tableConfiguration]);

	const handlePageSizeChange = (_, size) => {
		setCurrentPage(1);
		setPageSize(size);
		onFilter('page', 1);
		onFilter('limit', size);
	};

	const handleChange = value => {
		onFilter('page', value);
		return (() => setCurrentPage(value))();
	};

	const getStocksWithTotalAmount = stocks => {
		const totalPrice = stocks.reduce(
			(totalValue, currentValue) =>
				math.add(totalValue, Number(currentValue.price)),
			0
		);
		const totalQuantity = stocks.reduce(
			(totalValue, currentValue) =>
				math.add(totalValue, Number(currentValue.quantity)),
			0
		);

		return [
			...stocks,
			{
				isLastRow: true,
				price: totalPrice,
				quantity: totalQuantity,
			},
		];
	};

	const openBarcodeModal = id => {
		setBarcodeModalVisible(!barcodeModalVisible);
		if (!barcodeModalVisible) {
			fetchProduct({ id });
		}
	};

	const handleSoldClick = row => {
		history.push({
			pathname: '/sales/operations/add',
			state: { data: row, from: 'sales' },
		});
	};

	const handleDetailClick = row => {
		setModalIsVisible(true);
		setSelectedRow(row);
	};

	const handleCurrencyChange = currency => {
		onFilter('currencyRate', currency.rate);
		onFilter('currencyRateCode', currency.code);
		setCurrencyRate({ rate: currency.rate || 1, code: currency.code });
	};

	const handleTransferClick = row => {
		history.push({
			pathname: '/sales/operations/add',
			state: { data: row, from: 'migration' },
		});
	};
	const handleDirectionChange = newTab => {
		setActiveTab(newTab);
		handleChange(1);
		if (params.invoiceValue == 1) {
			if (newTab === 2) {
				setFilters({
					...filters,
					invoiceTypes: [9],
					attachedInvoiceTypes: [11],
					activeTab: newTab,
				});
			} else {
				setFilters({
					...filters,
					invoiceTypes: [11],
					attachedInvoiceTypes: undefined,
					activeTab: newTab,
				});
			}
		} else if (params.invoiceValue == 2) {
			if (newTab === 2) {
				setFilters({
					...filters,
					invoiceTypes: [9],
					attachedInvoiceTypes: [1, 3, 5, 7, 10],
					activeTab: newTab,
				});
			} else {
				setFilters({
					...filters,
					invoiceTypes: [1, 3, 5, 7, 10],
					attachedInvoiceTypes: undefined,
					activeTab: newTab,
				});
			}
		} else if (newTab === 2) {
			setFilters({
				...filters,
				invoiceTypes: [9],
				attachedInvoiceTypes: undefined,
				activeTab: newTab,
			});
		} else {
			setFilters({
				...filters,
				invoiceTypes: [1, 3, 5, 7, 10, 11],
				attachedInvoiceTypes: undefined,
				activeTab: newTab,
			});
		}
	};
	useEffect(() => {
		if (!modalIsVisible) {
			setSelectedRow(undefined);
			dispatch(
				setStockStaticsInfo({
					payload: {
						data: [],
					},
				})
			);
		}
	}, [modalIsVisible]);

	useEffect(() => {
		if (mainCurrencyCode && !filters.currencyRate) {
			setCurrencyRate({ rate: 1, code: mainCurrencyCode });
		}
	}, [mainCurrencyCode]);

	useEffect(() => {
		fetchSuppliers();
		fetchStockTypes();
		fetchUsers({});
		fetchBusinessUnitList({
			filters: {
				isDeleted: 0,
				businessUnitIds: profile.businessUnits?.map(({ id }) => id),
			},
		});
	}, []);

	const [openedSidebar, setOpenedSidebar] = React.useState(false);

	return (
		<div>
			<TableConfiguration
				saveSetting={handleSaveSettingModal}
				visible={visible}
				AllStandartColumns={STOCKTURNOVER_TABLE_SETTING_DATA}
				setVisible={toggleVisible}
				columnSource={tableSettingData}
			/>
			<WarehouseSideBar
				filters={filters}
				onFilter={onFilter}
				businessUnits={businessUnits}
				currencyRate={currencyRate}
				handleChange={handleChange}
				handleCurrencyChange={handleCurrencyChange}
				profile={profile}
				activeTableTab={activeTab}
				openedSidebar={openedSidebar}
				setOpenedSidebar={setOpenedSidebar}
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
				width={detailActiveTab === 2 ? 1280 : 800}
				withOutConfirm
				onCancel={() => setModalIsVisible(false)}
				visible={modalIsVisible}
			>
				<WarehouseDetails
					activeTab={detailActiveTab}
					setActiveTab={setDetailActiveTab}
					activeTableTab={activeTab}
					row={selectedRow}
					modalIsVisible={modalIsVisible}
					suppliers={filters.suppliers}
					onCancel={() => setModalIsVisible(false)}
					visible={modalIsVisible}
					filters={filters}
					{...props}
				/>
			</AddFormModal>
			<section className="scrollbar aside" style={{ padding: '0 32px' }}>
				<Row style={{ margin: '20px 0' }}></Row>
				<Row gutter={16} className={styles.pageToolsContainer}>
					<Col span={24}>
						<Row style={{ marginBottom: '20px' }}>
							<Col xs={24} sm={24} md={24} lg={12}>
								<div
									className={styles.pageTabs}
								>
									{Object.values(tabs).map(tab => (
										<ProFilterButton
											onClick={() =>
												handleDirectionChange(tab.id)
											}
											active={activeTab === tab.id}
											key={tab.id}
										>
											{tab.label}
										</ProFilterButton>
									))}
								</div>
							</Col>
							<Col xs={24} sm={24} md={24} lg={12}>
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
											fetchAllStockStatics({
												filters: {
													...filters,
													limit: 5000,
													page: undefined,
												},
												onSuccessCallback: data => {
													setExStockTurnover(
														getStocksWithTotalAmount(
															data.data
														)
													);
												},
											})
										}
										data={excelData}
										columns={excelColumns}
										excelTitle="Anbar Hesabatı"
										excelName="Anbar Hesabatı"
										filename="Anbar Hesabatı"
										// loading={exProductsIsLoading}
										count={stockCount}
									/>
								</div>
							</Col>
						</Row>
						<Table
							loading={isLoading}
							className={styles.tableFooter}
							dataSource={getStocksWithTotalAmount(stocks)}
							style={{ marginTop: '20px' }}
							columns={getTurnoverColumns({
								baseURL,
								tenantId,
								token,
								column: visibleColumns,
								mainCurrencyCode,
								currencyRate,
								filters,
								handleDetailClick,
								handleSoldClick,
								handleTransferClick,
								permissions: permissionsByKeyValue,
								openBarcodeModal,
							})}
							rowKey={record => record.id}
							pagination={false}
						/>
					</Col>
				</Row>
				<Row className={styles.paginationRow}>
					<Col xs={24} sm={24} md={18}>
						<ProPagination
							isLoading={isLoading}
							current={currentPage}
							pageSize={pageSize}
							onChange={handleChange}
							total={stockCount}
						/>
					</Col>
					<Col xs={24} sm={24} md={6} align="end">
						<ProPageSelect
							pageSize={pageSize}
							total={stockCount}
							onChange={newPageSize =>
								handlePageSizeChange(1, newPageSize)
							}
						/>
					</Col>
				</Row>
			</section>
		</div>
	);
}

const mapStateToProps = state => ({
	isLoading: state.loadings.fetchStockStatics,
	mainCurrencyCode: state.stockReducer.mainCurrencyCode,
	stockTypes: state.anbarReducer.data,
	stocks: state.stockReducer.stocksStatics,
	stockCount: state.stockReducer.stockStaticsCount,
	tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
	permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
	profile: state.profileReducer.profile,
	businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
	mapStateToProps,
	{
		createStock,
		fetchStockStatics,
		fetchStockStaticsCount,
		fetchProduct,
		fetchAllStockStatics,
		fetchTableConfiguration,
		createTableConfiguration,
		fetchStockTypes,
		fetchStockInfo,
		fetchUsers,
		editStock,
		fetchSuppliers,
		fetchBusinessUnitList,
	}
)(WarehouseList);
