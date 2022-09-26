import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { MdDesktopWindows, MdPhoneAndroid } from 'react-icons/all';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchUsers } from 'store/actions/users';
import { getContact } from 'store/actions/contacts-new';
import {
	fetchSalesInvoiceInfo,
	fetchSalesInvoiceList,
} from 'store/actions/salesAndBuys';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { fetchContract, fetchContracts } from 'store/actions/contracts';
import { Row, Col, Tooltip } from 'antd';
import {
	Table,
	ProPagination,
	ProPageSelect,
	DetailButton,
	ProModal,
} from 'components/Lib';
import moment from 'moment';
import { allModules, filterQueryResolver } from 'utils';
import {
	fetchLogsCount,
	fetchFilteredLogs,
	getPartner,
} from 'store/actions/profile/auditLogs';
import { fetchOrders, setSelectedOrder } from 'store/actions/orders';
import { fetchFinanceOperation } from 'store/actions/finance/operations';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
	fetchEmployeeBonuses,
	fetchSelectedEmployeeBonus,
} from 'store/actions/finance/salesBonus';
import { fetchCreditPayments } from 'store/actions/finance/paymentTable';
import { useOrderPermissions } from 'hooks';
import { toast } from 'react-toastify';
import UserMoreDetail from 'containers/Users/MoreDetails';
import ContactMoreDetails from 'containers/Relations/Contacts/MoreDetails';
import PartnerMoreDetails from 'containers/Relations/Partners/MoreDetails';
import ProductDetails from 'containers/Warehouse/Products/productDetails';
import BronDetails from 'containers/Warehouse/Bron/bronDetails';
import OperationsDetails from 'containers/SalesBuys/Operations/operationsDetails';
import ContractDetail from 'containers/SalesBuys/Contracts/contractDetail';
import OrderDetails from 'containers/Orders/Orders/MoreDetails';
import EmployeeBonusDetail from 'containers/Finance/SalesBonus/EmployeeBonus/MoreDetails';
import { MoreDetails as FinanceDetail } from 'containers/Finance/Operations/components/MoreDetails';
import ProductionsDetails from 'containers/SalesBuys/Production/productionsDetails';
import BusinessUnitDetail from 'containers/BusinessUnit/BusinessUnitTab/businessUnitDetail';
import CreditOperationsDetails from 'containers/Finance/PaymentTable/operationsDetails';
import InitialWarehouseDetails from 'containers/Settings/initialRemains/warehouse/initialRemainsWarehouse/initialWarehouseDetails';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import AuditSideBar from './sidebar';

import styles from './styles.module.scss';

function AuditLog(props) {
	const {
		fetchSalesInvoiceList,
		fetchOrders,
		selectedOrder,
		setSelectedOrder,
		fetchEmployeeBonuses,
		fetchSelectedEmployeeBonus,
		fetchSalesInvoiceInfo,
		fetchUsers,
		fetchMainCurrency,
		mainCurrency,
		getContact,
		employeeLoading,
		fetchLogsCount,
		fetchFilteredLogs,
		fetchFinanceOperation,
		getPartner,
		contract,
		contracts,
		fetchContract,
		fetchContracts,
		fetchCreditPayments,
		creditPayments,
		isLoading,
		contactLoading,
		salesLoading,
		orderLoading,
		contractLoading,
		financeOperationsIsLoading,
		filteredLogs,
		selectedEmployeeBonuses,
		total,
		tenant,
		productionInvoices,
		profile,
		fetchBusinessUnitList,
		businessUnits,
		businessUnitLoading,
		creditLoading,
	} = props;

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
	const [permissions, handlePermissionsChange] = useOrderPermissions();
	const [activeTab, setActiveTab] = useState(0);
	const [orders, setOrders] = useState([]);
	const [users, setUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [contractInfo, setContractInfo] = useState({});
	const [financeData, setFinanceData] = useState({});
	const [selectedOrderId, setSelectedOrderId] = useState(undefined);
	const [viewIsVisible, setViewIsVisible] = useState(false);
	const [selectedRow, setSelectedRow] = useState(undefined);
	const [selectedRowDate, setSelectedRowDate] = useState(undefined);
	const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
	const [employeeBonus, setEmployeeBonus] = useState(undefined);
	const [detailData, setDetailData] = useState({});
	const [description, setDescription] = useState(undefined);
	const [contactId, setContactId] = useState(undefined);
	const [activeBronTab, setActiveBronTab] = useState(0);
	const [activeSalesTab, setActiveSalesTab] = useState(0);
	const [activeContractTab, setActiveContractTab] = useState(0);
	const [activeBusinessTab, setActiveBusinessTab] = useState(0);
	const [activeCreditTab, setActiveCreditTab] = useState(0);
	const [tab, setTab] = useState(undefined);
	const [
    filterSelectedUsers,
    setFilterSelectedUsers,
] = useState([]);
	const [filters, onFilter, setFilters] = useFilterHandle(
		{
			types: params.types ? params.types : null,
			operators: params.operators ? params.operators : null,
			modules: params.modules ? params.modules : null,
			parentModule: params.parentModule ? params.parentModule : null,
			childModule: params.childModule ? params.childModule : null,
			dateFrom: params.dateFrom ? params.dateFrom : undefined,
			dateTo: params.dateTo ? params.dateTo : undefined,
			businessUnitIds: params.businessUnitIds
				? params.businessUnitIds
				: businessUnits?.length === 1
					? businessUnits[0]?.id !== null
						? [businessUnits[0]?.id]
						: undefined
					: undefined,
			limit: pageSize, // number
			page: currentPage, // number
		},
		({ filters }) => {
			const query = filterQueryResolver({ ...filters });
			if (typeof filters.history === 'undefined') {
				history.push({
					search: query,
				});
			}
			fetchFilteredLogs(filters);
			fetchLogsCount(filters);
		}
	);
	const [rerender, setRerender] = useState(0);
	const popstateEvent = () => {
		setRerender(rerender + 1);
	};

	useEffect(() => {
		window.addEventListener('popstate', popstateEvent);
		return () => window.removeEventListener('popstate', popstateEvent);
	}, [popstateEvent, rerender]);

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
	}, [location.search, rerender, setFilters]);

	const getStatusType = (isDeleted, bronEndDate) => {
		const bronDate = moment(bronEndDate, 'DD-MM-YYYY HH:mm:ss').format(
			'YYYY-MM-DD HH:mm:ss'
		);
		const operationDate = moment(
			selectedRow?.created_at,
			'DD-MM-YYYY HH:mm:ss'
		).format('YYYY-MM-DD HH:mm:ss');
		if (isDeleted && selectedRow?.operation_type === 3) {
			return (
				<span
					style={{
						color: '#C4C4C4',
						background: '#F8F8F8',
					}}
					className={styles.chip}
				>
					Silinib
				</span>
			);
		}
		if (bronEndDate && moment(bronDate) < moment(operationDate)) {
			return (
				<span
					style={{
						color: '#B16FE4',
						background: '#F6EEFC',
					}}
					className={styles.chip}
				>
					Bitib
				</span>
			);
		}

		if (!bronEndDate || moment(bronDate) > moment(operationDate)) {
			return (
				<span
					className={styles.chip}
					style={{
						color: '#F3B753',
						background: '#FDF7EA',
					}}
				>
					Aktiv
				</span>
			);
		}
	};
	const handleDetailClick = row => {
		setSelectedRowDate(row.created_at.split(' ')[0].split('-'));
		setSelectedRow(row);
		setViewIsVisible(true);
	};
	useEffect(() => {
		if (selectedOrder?.id) {
			handlePermissionsChange(
				selectedOrder,
				tenant?.id === selectedOrder?.tenantId
			);
		}
	}, [handlePermissionsChange, selectedOrder, tenant.id]);

	useEffect(() => {
		if (selectedRow) {
			let moreData = [];
			let tab;
			switch (selectedRow.module_name) {
				case 'user':
					moreData = allUsers.find(
						user => user.id === selectedRow.row_id
					);
					tab = 1;
					break;
				case 'contact':
					getContact(
						{ ids: [selectedRow.row_id], includeDeleted: 1 },
						({ data }) => {
							setDetailData(data[0]);
						}
					);
					tab = 2;
					break;
				case 'partner':
					getPartner(selectedRow.row_id, ({ data }) => {
						setContactId(data[0]?.contactId);
					});
					tab = 3;
					break;
				case 'product':
					moreData = selectedRow.row_id;
					tab = 4;
					break;
				case 'invoice_bron':
					tab = 5;
					break;
				case 'invoice_purchase':
				case 'invoice_sales':
				case 'invoice_return_from_customer':
				case 'invoice_return_to_supplier':
				case 'invoice_draft':
				case 'invoice_transfer':
				case 'invoice_removed':
					fetchSalesInvoiceInfo({
						id: selectedRow.row_id,
						onSuccess: res => {
							if (
								res.data.invoiceProducts &&
								res.data.invoiceProducts.content
							)
								setDetailData(res.data);
						},
					});
					tab = 6;
					break;
				case 'invoice_contract_purchase':
				case 'invoice_contract_sales':
					tab = 7;
					break;
				case 'transaction_invoice':
				case 'transaction_payment':
				case 'transaction_salary':
				case 'transaction_advance':
				case 'transaction_balance_creation':
				case 'transaction_employee_payment':
				case 'transaction_invoice_tax':
					fetchFinanceOperation({
						filters: {
							cashboxTransactionId: selectedRow.row_id,
							isDeleted: [1, 0],
							isHidden: [1, 0],
						},
						onSuccessCallback: ({ data }) => {
							setFinanceData(Object.assign(...data));
						},
					});
					tab = 8;
					break;
				case 'transaction_transfer':
					fetchFinanceOperation({
						filters: {
							cashboxTransactionId: selectedRow.row_id,
							isDeleted: [1, 0],
							isHidden: [1, 0],
						},
						onSuccessCallback: ({ data }) => {
							const cashOut = data.filter(
								item => item.cashInOrCashOut === -1
							);
							const cashIn = data
								.filter(item => item.cashInOrCashOut === 1)
								.map(result => ({
									toCashboxName: result.cashboxName,
								}));
							setFinanceData(
								Object.assign(...cashOut, ...cashIn)
							);
						},
					});
					tab = 8;
					break;
				case 'transaction_exchange':
					fetchFinanceOperation({
						filters: {
							cashboxTransactionId: selectedRow.row_id,
							isDeleted: [1, 0],
							isHidden: [1, 0],
						},
						onSuccessCallback: ({ data }) => {
							const cashOut = data.filter(
								item => item.cashInOrCashOut === -1
							);
							const cashIn = data
								.filter(item => item.cashInOrCashOut === 1)
								.map(result => ({
									toAmount: result.amount,
									toCurrency: result.currencyCode,
								}));
							setFinanceData(
								Object.assign(...cashOut, ...cashIn)
							);
						},
					});
					tab = 8;
					break;
				case 'transaction_employee_sales_bonus_configuration':
					if (selectedRowDate) {
						fetchEmployeeBonuses({
							filters: { includeDeleted: 1 },
							year: selectedRowDate[2],
							month: selectedRowDate[1],
							onSuccessCallback: ({ data }) => {
								setEmployeeBonus(
									data.find(
										({ id }) => id === selectedRow?.row_id
									)
								);
							},
						});
						fetchSelectedEmployeeBonus({
							filters: { includeDeleted: 1 },
							id: selectedRow.row_id,
							year: selectedRowDate[2],
							month: selectedRowDate[1],
							onFailureCallback: ({ error }) => {
								if (
									error.response.data.error.message ===
									'Employee is not found.'
								) {
									toast.error('Əməkdaş mövcud deyil');
								}
							},
						});
					}
					tab = 9;
					break;
				case 'order_incoming':
				case 'order_outgoing':
					setSelectedOrderId(selectedRow.row_id);
					tab = 10;
					break;
				case 'invoice_production_in':
				case 'invoice_production_out':
				case 'invoice_production_transfer':
					tab = 11;
					break;
				case 'business_unit':
					tab = 12;
					break;
				case 'transaction_credit_sales':
				case 'transaction_credit_purchase':
				case 'transaction_credit_return_from_customer':
				case 'transaction_credit_return_to_supplier':
				case 'transaction_credit_import_purchase':
					tab = 13;
					break;
				case 'invoice_init':
					fetchSalesInvoiceInfo({
						id: selectedRow.row_id,
						onSuccess: res => {
							setDetailData(res.data);
						},
					});
					tab = 14;
					break;
				default:
					setTab(undefined);
					setDetailData({});
					break;
			}
			setTab(tab);
			setDetailData(moreData);
		}
	}, [
		allUsers,
		fetchEmployeeBonuses,
		fetchFinanceOperation,
		fetchSalesInvoiceInfo,
		fetchSelectedEmployeeBonus,
		getContact,
		getPartner,
		selectedRow,
		selectedRowDate,
	]);

	const handlePrintOperation = () => {
		setViewIsVisible(false);
	};
	useEffect(() => {
		if (selectedOrderId && orders.length !== 0) {
			setSelectedOrder(
				orders.filter(order => order.id === selectedOrderId)[0]
			);
		}
	}, [orders, selectedOrderId, setSelectedOrder]);
	useEffect(() => {
		if (!viewIsVisible) {
			setContactId(undefined);
			setSelectedOrderId(undefined);
			setSelectedRow(undefined);
			setTab(undefined);
		}
	}, [viewIsVisible]);
	useEffect(() => {
		if (
			selectedRow?.module_name === 'invoice_contract_purchase' ||
			selectedRow?.module_name === 'invoice_contract_sales'
		) {
			fetchContract(selectedRow.row_id);
			if (contracts) {
				setContractInfo(
					...contracts.filter(({ id }) => id === selectedRow?.row_id)
				);
			}
		}
	}, [contracts, fetchContract, selectedRow]);
	useEffect(() => {
		if (contract) {
			setDescription(contract?.description);
		}
	}, [contract]);
	useEffect(() => {
		fetchUsers({
			filters: { includeDeleted: 1 },
			onSuccessCallback: ({ data }) => {
				setAllUsers(data);
			},
		});
		fetchBusinessUnitList({
			filters: {
				isDeleted: 0,
				businessUnitIds: profile.businessUnits?.map(({ id }) => id),
			},
		});
		fetchBusinessUnitList({
			filters: {},
			onSuccess: res => {
				setAllBusinessUnits(res.data);
			},
		});
		if (contracts.length === 0) fetchContracts({ limit: 1000 });
		if (orders.length === 0) {
			fetchOrders({ limit: 10000 }, ({ data }) => {
				setOrders(data);
			});
		}
		if (!mainCurrency.id) fetchMainCurrency();
		fetchSalesInvoiceList({
			filters: {
				invoiceTypes: [11],
				allProduction: 1,
				limit: 1000,
			},
		});
		fetchCreditPayments({ filters: { limit: 1000, statuses: [1, 2, 3] } });
	}, [
		contracts.length,
		fetchBusinessUnitList,
		fetchContracts,
		fetchCreditPayments,
		fetchMainCurrency,
		fetchOrders,
		fetchSalesInvoiceList,
		fetchUsers,
		mainCurrency.id,
		orders.length,
		profile.businessUnits,
	]);

	useEffect(()=>{
		if (params.operators) {
			fetchUsers({
					filters: { ids: filters.operators.map(Number) },
					onSuccessCallback: data => {
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
							setFilterSelectedUsers(appendList);
					},
			});
		}
	},[])
	useEffect(() => {
		if (filters?.businessUnitIds) {
			fetchUsers({
				filters: {
					includeDeleted: 1,
					businessUnitIds: filters?.businessUnitIds,
				},
				onSuccessCallback: ({ data }) => {
					setUsers(data);
				},
			});
		} else {
			fetchUsers({
				filters: { includeDeleted: 1 },
				onSuccessCallback: ({ data }) => {
					setUsers(data);
				},
			});
		}
	}, [fetchUsers, filters.businessUnitIds]);

	const handlePaginationChange = value => {
		onFilter('page', value);
		return (() => setCurrentPage(value))();
	};

	const handlePageSizeChange = (_, size) => {
		setCurrentPage(1);
		setPageSize(size);
		onFilter('page', 1);
		onFilter('limit', size);
	};

	const columns = [
		{
			title: '№',
			dataIndex: 'id',
			align: 'left',
			width: 60,
			render: (value, row, index) =>
				(currentPage - 1) * pageSize + index + 1,
		},
		{
			title: 'Tarix',
			align: 'left',
			width: 150,
			dataIndex: 'created_at',
			render: value => value,
		},
		{
			title: 'İstifadəçi',
			dataIndex: 'name',
			width: 180,
			ellipsis: true,
			render: (value, row) =>
				row.last_name ? (
					<Tooltip
						placement="topLeft"
						title={`${value} ${row.last_name}`}
					>
						<span>{`${value} ${row.last_name}`}</span>
					</Tooltip>
				) : (
					<Tooltip placement="topLeft" title={value}>
						<span>{value}</span>
					</Tooltip>
				),
		},
		{
			title: 'Modul',
			width: 130,
			dataIndex: 'module_name',
			render: (value, row) =>
				allModules.find(modul => modul.moduleName === value)?.module ||
				value,
		},
		{
			title: 'Alt modul',
			width: 170,
			dataIndex: 'module_name',
			render: (value, row) =>
				allModules.find(modul => modul.moduleName === value)
					?.subModule || '-',
		},
		{
			title: 'Kateqoriya',
			dataIndex: 'module_name',
			align: 'center',
			width: 150,
			render: (value, row) =>
				allModules.find(modul => modul.moduleName === value)
					?.category || '-',
		},
		{
			title: 'Əməliyyat növü',
			dataIndex: 'operation_type',
			width: 150,
			align: 'center',
			render: (value, row) =>
				value === 1
					? 'Əlavə etmə'
					: value === 2 || value === 4
						? 'Düzəliş'
						: value === 3
							? 'Silinmə'
							: value === 5
								? 'Sənəd ixracı'
								: '-',
		},
		{
			title: 'Ətraflı',
			align: 'center',
			dataIndex: 'data',
			width: 100,
			render: (value, row) => (
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					{allModules.find(
						modul => modul.moduleName === row?.module_name
					)?.isDetail && !row?.isDeleted ? (
						!(
							(row?.operation_type === 3 &&
								allModules.find(
									modul =>
										modul.moduleName === row?.module_name
								)?.isDeleted) ||
							row?.operation_type === 5
						) ? (
							<DetailButton
								onClick={() => handleDetailClick(row)}
								style={{ marginRight: '5px' }}
							/>
						) : (
							<span
								style={{
									padding: '7px 14px',
									marginRight: '5px',
								}}
							>
								-
							</span>
						)
					) : (
						<span
							style={{ padding: '7px 14px', marginRight: '5px' }}
						>
							-
						</span>
					)}
					<Tooltip
						placement="top"
						title={
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<span>IP:{value?.ip}</span>
								<span>Brauzer:{value?.browser?.name}</span>
								<span>
									Əməliyyat sistemi:{value?.os?.name}{' '}
									{value?.os?.version}
								</span>
								<span>
									Qurğu:{value?.os?.brand} {value?.os?.model}
								</span>
							</div>
						}
					>
						{value?.os?.type === 'desktop' ? (
							<MdDesktopWindows
								fontSize="18px"
								style={{ verticalAlign: 'bottom' }}
							/>
						) : (
							<MdPhoneAndroid
								fontSize="18px"
								style={{ verticalAlign: 'bottom' }}
							/>
						)}{' '}
					</Tooltip>
				</div>
			),
		},
	];

	return (
		<>
			{tab === 1 ? (
				<UserMoreDetail
					visible={viewIsVisible}
					row={detailData}
					setIsVisible={setViewIsVisible}
					allBusinessUnits={allBusinessUnits}
				/>
			) : tab === 2 &&
				detailData &&
				Object.keys(detailData).length !== 0 ? (
				<ProModal
                    width={760}
                    maskClosable
                    handleModal={() => setViewIsVisible(false)}
                    isVisible={viewIsVisible}
					centered
					padding
                >
				<ContactMoreDetails
					visible={viewIsVisible}
					row={detailData}
					setIsVisible={setViewIsVisible}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
				/>
				</ProModal>
			) : tab === 3 && contactId ? (
				<PartnerMoreDetails
					visible={viewIsVisible}
					id={contactId}
					partnerId={selectedRow.row_id}
					setIsVisible={setViewIsVisible}
				/>
			) : tab === 4 ? (
				<ProModal
					maskClosable
					isVisible={viewIsVisible}
					handleModal={() => setViewIsVisible(false)}
					width={760}
					centered
					padding
				>
					<ProductDetails
						visible={viewIsVisible}
						row={{ id: detailData }}
					/>
				</ProModal>
			) : tab === 5 ? (
				<ProModal
					maskClosable
					padding
					width={activeBronTab === 0 ? 760 : 1200}
					handleModal={() => setViewIsVisible(false)}
					visible={viewIsVisible}
				>
					<BronDetails
						isDeletedForLog={selectedRow.operation_type !== 3}
						row={{ id: selectedRow?.row_id }}
						getStatusType={getStatusType}
						activeTab={activeBronTab}
						setActiveTab={setActiveBronTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
						allBusinessUnits={allBusinessUnits}
					/>
				</ProModal>
			) : tab === 6 ? (
				<ProModal
					maskClosable
					padding
					width={
						detailData.invoiceTypeNumber !== 10 ||
							detailData.statusOfOperation === 3
							? activeSalesTab === 0
								? 760
								: 1200
							: 1400
					}
					handleModal={() => setViewIsVisible(false)}
					visible={viewIsVisible}
				>
					<OperationsDetails
						isDeletedForLog={selectedRow.operation_type !== 3}
						loadingForLogs={salesLoading}
						row={detailData}
						mainCurrencyCode={mainCurrency}
						activeTab={activeSalesTab}
						setActiveTab={setActiveSalesTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
						allBusinessUnits={allBusinessUnits}
					/>
				</ProModal>
			) : tab === 7 ? (
				<ProModal
					maskClosable
					padding
					width={activeContractTab === 0 ? 900 : 1200}
					handleModal={() => setViewIsVisible(false)}
					visible={viewIsVisible}
				>
					<ContractDetail
						row={contractInfo}
						description={description}
						activeTab={activeContractTab}
						setActiveTab={setActiveContractTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
						contract={contract}
						allBusinessUnits={allBusinessUnits}
					/>
				</ProModal>
			) : tab === 8 && Object.keys(financeData).length !== 0 ? (
				<FinanceDetail
					isLogTransfer={
						selectedRow.module_name === 'transaction_transfer'
					}
					isLog={selectedRow.module_name === 'transaction_exchange'}
					isDeletedForLog={selectedRow.operation_type !== 3}
					details={viewIsVisible}
					handlePrintOperation={handlePrintOperation}
					setDetails={setViewIsVisible}
					productionInvoices={productionInvoices}
					data={financeData}
					tenant={tenant}
				/>
			) : tab === 9 && employeeBonus ? (
				<EmployeeBonusDetail
					visible={viewIsVisible}
					row={employeeBonus}
					selectedEmployeeBonuses={selectedEmployeeBonuses}
					setIsVisible={setViewIsVisible}
				/>
			) : tab === 10 ? (
				selectedOrder?.id &&
				viewIsVisible && (
					<OrderDetails
						permissions={permissions}
						visible={viewIsVisible}
						setIsVisible={setViewIsVisible}
						isView
					/>
				)
			) : tab === 11 ? (
				<ProModal
					maskClosable
					padding
					width={1200}
					handleModal={() => setViewIsVisible(false)}
					isVisible={viewIsVisible}
				>
					<ProductionsDetails
						isDeletedForLog={selectedRow.operation_type !== 3}
						row={{
							...selectedRow,
							id: selectedRow?.row_id,
							stockToId:
								selectedRow.module_name ===
									'invoice_production_transfer'
									? true
									: null,
							businessUnitId: selectedRow?.business_unit_id,
						}}
						mainCurrencyCode={mainCurrency?.code}
						activeTab={activeSalesTab}
						setActiveTab={setActiveSalesTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
						allBusinessUnits={allBusinessUnits}
						{...props}
					/>
				</ProModal>
			) : tab === 12 ? (
				<ProModal
					maskClosable
					padding
					width={900}
					handleModal={() => setViewIsVisible(false)}
					isVisible={viewIsVisible}
				>
					<BusinessUnitDetail
						isDeletedForLog={selectedRow.operation_type !== 3}
						row={allBusinessUnits?.find(
							({ id }) => id === selectedRow?.row_id
						)}
						activeTab={activeBusinessTab}
						setActiveTab={setActiveBusinessTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
					/>
				</ProModal>
			) : tab === 13 ? (
				<ProModal
					maskClosable
					padding
					isVisible={viewIsVisible}
					handleModal={() => setViewIsVisible(false)}
					width={1200}
				>
					<CreditOperationsDetails
						isDeletedForLog={selectedRow.operation_type !== 3}
						fromTable
						row={creditPayments.find(
							creditPayment =>
								creditPayment.creditId === selectedRow?.row_id
						)}
						mainCurrencyCode={mainCurrency}
						activeTab={activeCreditTab}
						setActiveTab={setActiveCreditTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
					/>
				</ProModal>
			) : tab === 14 ? (
				<ProModal
					maskClosable
					padding
					width={
						detailData.statusOfOperation === 3
							? activeSalesTab === 0
								? 760
								: 1200
							: 1400
					}
					handleModal={() => setViewIsVisible(false)}
					visible={viewIsVisible}
				>
					<InitialWarehouseDetails
						isDeletedForLog={selectedRow.operation_type !== 3}
						loadingForLogs={salesLoading}
						row={detailData}
						mainCurrencyCode={mainCurrency}
						activeTab={activeSalesTab}
						setActiveTab={setActiveSalesTab}
						onCancel={() => setViewIsVisible(false)}
						visible={viewIsVisible}
						allBusinessUnits={allBusinessUnits}
					/>
				</ProModal>
			) : null}
			<AuditSideBar
				users={users}
				onFilter={onFilter}
				handlePaginationChange={handlePaginationChange}
				filters={filters}
				businessUnits={businessUnits}
				profile={profile}
				fetchUsers={fetchUsers}
				filterSelectedUsers={filterSelectedUsers}
				{...props}
			/>
			<section className="aside-without-navigation scrollbar">
				<div className={styles.content}>
					<Row gutter={16}>
						<Col xl={24} xxl={24}>
							{/* go to add new operations */}

							<Table
								loading={
									isLoading ||
									contactLoading ||
									contractLoading ||
									financeOperationsIsLoading ||
									employeeLoading ||
									businessUnitLoading ||
									creditLoading ||
									(selectedOrderId && orderLoading)
								}
								scroll={{ x: 'max-content' }}
								dataSource={filteredLogs}
								columns={columns}
								rowKey={record => record.id}
								pagination={false}
							/>
						</Col>
					</Row>
					<Row
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginTop: '20px',
						}}
					>
						<Col span={16}>
							<ProPagination
								loading={isLoading}
								currentPage={currentPage}
								pageSize={pageSize}
								onChange={handlePaginationChange}
								total={total}
							/>
						</Col>
						<Col span={6} offset={2} align="end">
							<ProPageSelect
								currentPage={currentPage}
								pageSize={pageSize}
								total={total}
								onChange={e =>
									handlePageSizeChange(currentPage, e)
								}
							/>
						</Col>
					</Row>
				</div>
			</section>
		</>
	);
}

const mapStateToProps = state => ({
	filteredLogs: state.logsReducer.filteredLogs,
	total: state.logsReducer.logsCount,
	salesLoading: state.salesAndBuysReducer.isLoading,
	isLoading: state.logsReducer.isLoading,
	contactLoading: state.loadings.partners,
	mainCurrency: state.kassaReducer.mainCurrency,
	contract: state.contractsReducer.contractInfo,
	contracts: state.contractsReducer.contracts,
	tenant: state.tenantReducer.tenant,
	financeOperationsIsLoading: state.loadings.fetchFinanceOperation,
	selectedOrder: state.ordersReducer.selectedOrder,
	creditPayments: state.paymentTableReducer.creditPayments,
	orderLoading: state.ordersReducer.isLoading,
	contractLoading: state.contractsReducer.isLoading,
	selectedEmployeeBonuses:
		state.bonusConfigurationReducer.selectedEmployeeBonuses,
	employeeLoading: state.loadings.fetchSelectedEmployeeBonus,
	productionInvoices: state.salesAndBuysReducer.invoices,
	profile: state.profileReducer.profile,
	businessUnits: state.businessUnitReducer.businessUnits,
	businessUnitLoading: state.businessUnitReducer.isLoading,
	creditLoading: state.loadings.fetchCreditPayments,
});
export default connect(
	mapStateToProps,
	{
		fetchSalesInvoiceList,
		fetchOrders,
		fetchFilteredLogs,
		fetchLogsCount,
		fetchUsers,
		getContact,
		fetchMainCurrency,
		fetchContract,
		fetchContracts,
		setSelectedOrder,
		fetchEmployeeBonuses,
		fetchSelectedEmployeeBonus,
		fetchSalesInvoiceInfo,
		fetchFinanceOperation,
		getPartner,
		fetchBusinessUnitList,
		fetchCreditPayments,
	}
)(AuditLog);
