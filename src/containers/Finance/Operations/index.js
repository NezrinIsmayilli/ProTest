/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useLayoutEffect,
} from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { cookies } from 'utils/cookies';
import {
    operationNames,
    groupByKey,
    getAvaliableTab,
    filterQueryResolver,
    formatNumberToLocale,
    defaultNumberFormat,
    getHighestPermissionKey,
    round,
    roundToDown,
} from 'utils';
import { Row, Col, Dropdown, Menu, Tooltip } from 'antd';
import {
    Table,
    TableFooter,
    ExcelButton,
    NewButton,
    Can,
    ProPagination,
    ProPageSelect,
    TableConfiguration,
} from 'components/Lib';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
    fetchOperationsList,
    fetchTransactionsCount,
    transactionsFilterHandle,
    setInfoCardData,
    fetchTransactionCatalog,
    deleteTransaction,
    exportOperationsList,
} from 'store/actions/finance/operations';
import { fetchAllTransactionList } from 'store/actions/export-to-excel/financeModule';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchCurrencies } from 'store/actions/contact';
import { fetchExpenseItemByCatalogId } from 'store/actions/expenseItem';
import { fetchContacts } from 'store/actions/relations';
import { fetchAllCashboxNames } from 'store/actions/settings/kassa';
import { fetchEmployees, fetchHrmEmployees } from 'store/actions/employees';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { useTotalCalculateByCurrency,useExcelTotalCalculateByCurrency } from 'hooks/useTotalCalculateByCurrency';
import { useSearch, useQuery } from 'hooks';
import { Link, useHistory, useLocation } from 'react-router-dom';
import {
    FaCaretUp,
    FaCaretDown,
    AiOutlineDown,
    BiUnite,
} from 'react-icons/all';
import {
    fetchProductionInfo,
    editTransferProduction,
    editProductionCost,
} from 'store/actions/sales-operation';
import { accessTypes } from 'config/permissions';
import OperationsSidebar from './Sidebar';
import { TableAction } from './components/TableAction';
import { financePermissionsHelper } from './components/FinanceTabs';
import styles from './styles.module.scss';
import queryString from 'query-string';
import { TRANSACTION_LIST_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';
import { toast } from 'react-toastify';

const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

function Operations(props) {
    const {
        filteredList,
        transactionsCount,
        tableConfiguration,
        fetchAllTransactionList,
        isLoading,
        allCashBoxNames,
        cashboxLoading,
        contacts,
        contactsLoading,
        createTableConfiguration,
        fetchTableConfiguration,
        fetchOperationsList,
        fetchTransactionsCount,
        fetchAllCashboxNames,
        setInfoCardData,
        fetchContacts,
        expenseCatalogs,
        fetchTransactionCatalog,
        fetchExpenseItemByCatalogId,
        fetchSalesInvoiceList,
        productionInvoices,
        expenseItems,
        expenseItemsLoading,
        fetchEmployees,
        employees,
        employeesLoading,
        fetchHrmEmployees,
        hrmEmployees,
        deleteTransaction,
        fetchCurrencies,
        currencies,
        permissionsList,
        permissionsByKeyValue,
        tenant,
        profile,
        fetchBusinessUnitList,
        businessUnits,
        fetchProductionInfo,
        editTransferProduction,
        editProductionCost,
    } = props;

    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

    const { tab: tabFromUrl } = useQuery();
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [visible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
      TRANSACTION_LIST_TABLE_SETTING_DATA 
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exInvoices, setExInvoices] = useState([]);
    const [exInv, setExInv] = useState(false);

    const highestFinanceOperationKey = getHighestPermissionKey(
        permissionsList.filter(
            ({ group_key, sub_group_key }) =>
                group_key === 'transaction' && sub_group_key === 'operations'
        )
    );
    const handleMenuClick = ({ key }) => {
        if (key === 'null') {
            cookies.set('_TKN_UNIT_', 0);
        } else {
            cookies.set('_TKN_UNIT_', key);
        }
    };
    const menu = (
        <Menu
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            onClick={handleMenuClick}
        >
            {profile.businessUnits?.length === 0
                ? businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <Link
                              to="/finance/operations/add"
                              style={{ width: '100%' }}
                          >
                              <BiUnite style={{ marginRight: '5px' }} />
                              {item.name}
                          </Link>
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <Link
                              to="/finance/operations/add"
                              style={{ width: '100%' }}
                          >
                              <BiUnite style={{ marginRight: '5px' }} />
                              {item.name}
                          </Link>
                      </Menu.Item>
                  ))}
        </Menu>
    );
    // get static data from msk
    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
        fetchSalesInvoiceList({
            filters: {
                invoiceTypes: [11],
                allProduction: 1,
                limit: 10000,
            },
        });
        fetchTransactionCatalog();
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
        fetchCurrencies();
        fetchTableConfiguration({ module: 'Finance-Operations' })
    }, []);

    // active sub tab handle
    const [tab, setTab] = useState(undefined);
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
    useLayoutEffect(() => {
        if (tabFromUrl) {
            setTab(+tabFromUrl);
        } else {
            const tab = getAvaliableTab(
                operationNames,
                financePermissionsHelper
            );

            setTab(tab);
        }
    }, [tabFromUrl]);

    // search handle
    const { result, handleSearch } = useSearch(filteredList, [
        'serialNumber',
        'receiverName',
        'receiverSurname',
        'senderName',
    ]);
    const [mainCurrency, setMainCurrency] = useState('');
    // const [amountSort, setDataSort] = useState('');
    // Filters handle
    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            contacts: params.contacts ? params.contacts : undefined,
            tenantPersons: params.tenantPersons
                ? params.tenantPersons
                : undefined,
            employees: params.employees ? params.employees : undefined,
            cashboxes: params.cashboxes ? params.cashboxes : undefined,
            receiverContact: params.receiverContact
                ? params.receiverContact
                : undefined,
            receiverCashbox: params.receiverCashbox
                ? params.receiverCashbox
                : undefined,
            dateOfTransactionStart: params.dateOfTransactionStart
                ? params.dateOfTransactionStart
                : undefined,
            dateOfTransactionEnd: params.dateOfTransactionEnd
                ? params.dateOfTransactionEnd
                : undefined,
            contrParty: params.contrParty ? params.contrParty : undefined,
            account: params.account ? params.account : undefined,
            typeOfOperations: params.typeOfOperations
                ? params.typeOfOperations
                : undefined,
            transactionCatalogs: params.transactionCatalogs
                ? params.transactionCatalogs
                : undefined,
            transactionItems: params.transactionItems
                ? params.transactionItems
                : undefined,
            paymentTypes: params.paymentTypes ? params.paymentTypes : undefined,
            createdByIds: params.createdByIds ? params.createdByIds : undefined,
            transactionTypes: params.transactionTypes
                ? params.transactionTypes
                : undefined,
            isDeleted: params.isDeleted ? params.isDeleted : undefined,
            description: params.description ? params.description : undefined,
            orderBy: params.orderBy ? params.orderBy : undefined,
            order: params.order ? params.order : undefined,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
            limit: pageSize,
            page: currentPage,
            bypass: params.bypass ? params.bypass : 0,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters['history'] == 'undefined') {
                history.push({
                    search: query,
                });
            }
            // setDataSort('');
            fetchOperationsList({ filters });
            fetchTransactionsCount({ filters });
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

    useEffect(() => {
        if (tab) {
            setInfoCardData(undefined);
            // onFilter('tab', tab);
            // addQueryStringToURL('tab', tab);
        }
    }, [tab]);
    useEffect(() => {
        if (filters?.businessUnitIds) {
            fetchAllCashboxNames({ businessUnitIds: filters?.businessUnitIds });
            fetchEmployees({
                filters: {
                    businessUnitIds: filters?.businessUnitIds,
                },
            });
            fetchContacts({
                filters: {
                    businessUnitIds: filters?.businessUnitIds,
                },
            });
            fetchHrmEmployees({
                filters: {
                    businessUnitIds: filters?.businessUnitIds,
                },
            });
        } else {
            fetchAllCashboxNames();
            fetchEmployees();
            fetchContacts();
            fetchHrmEmployees({});
        }
    }, [filters.businessUnitIds]);
    useEffect(() => {
        currencies.forEach(currency => {
            if (currency.isMain === true) setMainCurrency(currency.code);
        });
    }, [currencies]);

    useEffect(() => {
        setInfoCardData(undefined);
    }, [result.length, filteredList.length]);

    const overallPrice = useTotalCalculateByCurrency([
        ...filteredList.map(
            ({ currencyCode, amount, operationDirectionId }) => ({
                currencyCode,
                amount: operationDirectionId === -1 ? `-${amount}` : amount, // check if cash in or cash out
            })
        ),
    ]);

 const excelOverallPrice=useExcelTotalCalculateByCurrency(exInv?[
        ...exInv.map(
            ({ currencyCode, amount, operationDirectionId }) => 
            ({
                currencyCode:currencyCode,
                amount: operationDirectionId === -1 ? `-${amount}` : amount, // check if cash in or cash out
            })
        ),
    ]:[]);

const overAllMainCurrency=[...filteredList].reduce((a, b) => (
        a+Number(
                   b.operationDirectionName === 'Cash out'?
                   (mainCurrency === b.invoiceCurrencyCode
                       ? -b.invoicePaymentAmountConvertedToInvoiceCurrency
                       : -b.amountConvertedToMainCurrency):
                   (mainCurrency === b.invoiceCurrencyCode
                       ? b.invoicePaymentAmountConvertedToInvoiceCurrency
                       : b.amountConvertedToMainCurrency)
               )), 0);
           
 
    const getTransactWithTotalAmount= filteredList => { 
        let arr=[];
        const excelOverAllMainCurrency=[...filteredList].reduce((a, b) => (
            a+Number(
                       b.operationDirectionName === 'Cash out'?
                       (mainCurrency === b.invoiceCurrencyCode
                           ? -b.invoicePaymentAmountConvertedToInvoiceCurrency
                           : -b.amountConvertedToMainCurrency):
                       (mainCurrency === b.invoiceCurrencyCode
                           ? b.invoicePaymentAmountConvertedToInvoiceCurrency
                           : b.amountConvertedToMainCurrency)
                   )), 0);

                   arr=[ ...filteredList,
                    {
                      isLastRow: true,
                      excelOverallPrice,
                      mainCurrencyTotal: Number(formatNumberToLocale(
                        defaultNumberFormat(excelOverAllMainCurrency))?.replaceAll(',',""))
                    },
                   ];
 
                   setExInvoices(arr)
      };

    const sectionRef = useRef(null);

    // group by type all cashboxnames and memoize
    const groupedByTypeCashboxNames = useMemo(
        () => groupByKey(allCashBoxNames, 'type'),
        [allCashBoxNames]
    );

    const handleSortTable = (orderBy, order) => {
        onFilter('order', order);
        onFilter('orderBy', orderBy);
    };

    const getColumns = ({column}) => {
        const columns = [];

        columns[column.indexOf('cashboxName')]={
                title: 'Hesab',
                align: 'left',
                width: 100,
                dataIndex: 'cashboxName',
                ellipsis: true,
                render: (value,row) =>
                (
                    <Tooltip placement="topLeft" title={value || ''}>
                        <span>{value || '-'}</span>
                    </Tooltip>
                ),
            };
        columns[column.indexOf('createdAt')]={
                title: 'İcra tarixi',
                dataIndex: 'createdAt',
                render: (date,row) =>date?.split('  '),
                width: 180,
            };
        columns[column.indexOf('dateOfTransaction')]={
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>Əməliyyat tarixi</span>
                        <div className={styles.buttonSortIcon}>
                            <FaCaretUp
                                color={
                                    filters.orderBy === 'dateOfTransaction' &&
                                    filters.order === 'asc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() =>
                                    handleSortTable('dateOfTransaction', 'asc')
                                }
                            />
                            <FaCaretDown
                                color={
                                    filters.orderBy === 'dateOfTransaction' &&
                                    filters.order === 'desc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() =>
                                    handleSortTable('dateOfTransaction', 'desc')
                                }
                            />
                        </div>
                    </div>
                ),
                dataIndex: 'dateOfTransaction',
                key: 'dateOfTransaction',
                // sorter: true,
                // render: value => {
                //   let date = value;
                //   date =
                //     date &&
                //     date
                //       .split('-')
                //       .reverse()
                //       .join('-');
                //   return date;
                // },
                render: date => date,
                width: 180,
            };
        columns[column.indexOf('documentNumber')]={
                title: 'Sənəd',
                width: 150,
                dataIndex: 'documentNumber',
            };
        columns[column.indexOf('operationDirectionId')]={
                title: 'Növ',
                width: 100,
                dataIndex: 'operationDirectionId',
                render: (value,row) =>
             
                    value === -1
                        ? `Məxaric`
                        : value === 1
                        ? 'Mədaxil'
                        : value === 2
                        ? 'Balans'
                        : '-',
            };
        columns[column.indexOf('categoryName')]={
                title: 'Kateqoriya',
                dataIndex: 'categoryName',
                ellipsis: true,
                width: 150,
                render: (value, row) =>
                    row.transactionType === 14 ? 'İlkin qalıq' : value,
            };
        columns[column.indexOf('subCategoryName')]={
                title: 'Alt kateqoriya',
                dataIndex: 'subCategoryName',
                ellipsis: true,
                width: 150,
                render: (value, row) =>
              (row.transactionType === 14 ? 'Hesab' : value || '-'),
            };
        columns[column.indexOf('contactOrEmployee')]={
                title: 'Qarşı tərəf',
                dataIndex: 'contactOrEmployee',
                width: 150,
                ellipsis: true,
                render: (value, row) =>
                (
                    <Tooltip placement="topLeft" title={value || ''}>
                        <span>{value || '-'}</span>
                    </Tooltip>
                ),
            };
        columns[column.indexOf('amount')]={
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>Məbləğ</span>
                        <div className={styles.buttonSortIcon}>
                            <FaCaretUp
                                color={
                                    filters.orderBy === 'amount' &&
                                    filters.order === 'asc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() => handleSortTable('amount', 'asc')}
                            />
                            <FaCaretDown
                                color={
                                    filters.orderBy === 'amount' &&
                                    filters.order === 'desc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() =>
                                    handleSortTable('amount', 'desc')
                                }
                            />
                        </div>
                    </div>
                ),
                dataIndex: 'amount',
                width: 150,
                align: 'left',
                render: (value, row) =>
              
                    `${
                        row.operationDirectionName === 'Cash out' ? '-' : ''
                    } ${formatNumberToLocale(
                        defaultNumberFormat(
                            mainCurrency === row.invoiceCurrencyCode &&
                                mainCurrency === row.currencyCode
                                ? row.invoicePaymentAmountConvertedToInvoiceCurrency
                                : value
                        )
                    )} ${row.currencyCode}`,
            };
        columns[column.indexOf('amountConvertedToMainCurrency')]={
                title: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span> Əsas valyuta {mainCurrency}</span>
                        <div className={styles.buttonSortIcon}>
                            <FaCaretUp
                                color={
                                    filters.orderBy ===
                                        'amountConvertedToMainCurrency' &&
                                    filters.order === 'asc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() =>
                                    handleSortTable(
                                        'amountConvertedToMainCurrency',
                                        'asc'
                                    )
                                }
                            />
                            <FaCaretDown
                                color={
                                    filters.orderBy ===
                                        'amountConvertedToMainCurrency' &&
                                    filters.order === 'desc'
                                        ? '#fff'
                                        : '#ccc'
                                }
                                onClick={() =>
                                    handleSortTable(
                                        'amountConvertedToMainCurrency',
                                        'desc'
                                    )
                                }
                            />
                        </div>
                    </div>
                ),
                dataIndex: 'amountConvertedToMainCurrency',
                width: 150,
                align: 'right',
                render: (value, row) => 
              
                {
                    const roundedValue = formatNumberToLocale(
                        defaultNumberFormat(
                            mainCurrency === row.invoiceCurrencyCode
                                ? row.invoicePaymentAmountConvertedToInvoiceCurrency
                                : value
                        )
                    );
                    const data =
                        row.operationDirectionName === 'Cash out'
                            ? `-${roundedValue} ${mainCurrency}`
                            : `${roundedValue} ${mainCurrency}`;
                    return   row.isLastRow ? `${row.mainCurrencyTotal} ${mainCurrency}`: (
                        <span
                            className={
                                row.operationDirectionName === 'Cash out'
                                    ? styles.red
                                    : ''
                            }
                        >
                            {data}
                        </span>
                    );
                },
            };
        columns[column.indexOf('status')]={
                title: 'Status',
                dataIndex: 'status',
                width: 100,
                key: 'status',
                render: value =>
                    value && (
                        <span
                            className={
                                value === 'active' ? styles.green : styles.red
                            }
                        >
                            {value === 'active'
                                ? 'aktiv'
                                : value === 'silinib'
                                ? 'silinib'
                                : 'silinib'}
                        </span>
                    ),
            };
        columns[column.indexOf('createdByName')]={
              title: 'Məsul şəxs',
              dataIndex: 'createdByName',
              width: 150,
              ellipsis: true,
              render: (value, row) =>
   
              `${value} ${row.createdByLastname}`.length > 10 ? (
                <Tooltip placement="topLeft" title={`${value} ${row.createdByLastname}`|| ''}>
                    {`${value} ${row.createdByLastname}`.substring(
                        0,
                        10
                    )}
                    ...
                </Tooltip>
            ) : (
                `${value} ${row.createdByLastname}` || '-'
            ),
          };
        columns[column.indexOf('paymentTypeName')]={
              title: 'Ödəniş növü',
              dataIndex: 'paymentTypeName',
              width: 140,
              align: 'center',
              render: (value,row) =>
           
                value === 'Nəğd'
                  ? 'Nəğd'
                  : value === 'Bank'
                  ? 'Bank Transferi'
                  : value === 'Kart'
                  ? 'Kart ödənişi'
                  : value === 'Digər'
                  ? 'Digər'
                  : '-',
            };

        columns[column.indexOf('description')] = {
              title: 'Əlavə məlumat',
              dataIndex: 'description',
              align: 'center',
              ellipsis: true,
              width: 120,
              render: (value,row) =>
            
                value ? <Tooltip
                  placement="topLeft"
                  title={value}
                >
                  {value}
                </Tooltip> : '-',
            };
            columns.push({
                title: 'Seçimlər',
                align: 'center',
                width: 100,
                render: (value,row) =>
               
                    value && (
                        <TableAction
                            allBusinessUnits={allBusinessUnits}
                            profile={profile}
                            productionInvoices={productionInvoices}
                            permissionsList={permissionsList}
                            permissionsByKeyValue={permissionsByKeyValue}
                            deleteTransaction={handleDeleteTransaction}
                            highestFinanceOperationKey={
                                highestFinanceOperationKey
                            }
                            row={value}
                            tenant={tenant}
                        />
                    ),
            });

        if (
            allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1
        ) {
            
          columns[column.indexOf('businessUnitId')]={
              title: 'Biznes blok',
              dataIndex: 'businessUnitId',
              align: 'center',
              width: 130,
              ellipsis: true,
              render: (value, row) =>
           (
                  <Tooltip
                      placement="topLeft"
                      title={
                          allBusinessUnits?.find(({ id }) => id === value)
                              ?.name || ''
                      }
                  >
                      <span>
                          {allBusinessUnits?.find(({ id }) => id === value)
                              ?.name || '-'}
                      </span>
                  </Tooltip>
              ),
          };
        }

        
        columns.unshift( {
          title: '№',
          dataIndex: 'id',
          align: 'left',
          width: 80,
          render: (value, row, index) =>
            (currentPage - 1) * pageSize + index + 1,
      });

        return columns;

    };
    function toFixed(x) {
        if (Math.abs(x) < 1.0) {
            var e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10, e - 1);
                x = '0.' + new Array(e).join('0') + x.toString().substring(2);
            }
        } else {
            var e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10, e);
                x += new Array(e + 1).join('0');
            }
        }
        return x;
    }
    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Finance-Operations',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };

useEffect(()=>{
    if(mainCurrency){
    getExcelColumns(mainCurrency);}
},[mainCurrency])
    // Excel table columns
    const getExcelColumns = (mainCurrency) => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('cashboxName')] = {
            title: 'Hesab',
            width: { wpx: 100 },
        };
        columns[columnClone.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('dateOfTransaction')] = {
            title: 'Əməliyyat tarixi',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('documentNumber')] = {
            title: 'Sənəd',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('operationDirectionId')] = {
            title: 'Növ',
            width: { wpx: 100 },
        };

        columns[columnClone.indexOf('categoryName')] = {
            title: 'Kateqoriya',
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('subCategoryName')] = {
            title: 'Alt kateqoriya',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('contactOrEmployee')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('amount')] = {
            title: 'Məbləğ',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('amountConvertedToMainCurrency')] = {
            title: `Əsas valyuta (${mainCurrency})`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('businessUnitId')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Status',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('createdByName')] = {
            title: 'Məsul şəxs',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('paymentTypeName')] = {
            title: 'Ödəniş növü',
            width: { wpx: 140 },
        };

        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 180 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 90 },
        });
        setExcelColumns(columns);
    };
    const getExcelPaymentStatus = paymentTypeName => {
      switch (paymentTypeName) {
          case 'Nəğd':
              return 'Nəğd';
              
          case 'Bank':
              return 'Bank Transferi';
          case 'Kart':
              return 'Kart ödənişi';
          case 'Digər':
              return 'Digər';
          default:
              break;
      }
  };


    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const columnFooterStyle = {
            font: { color: { rgb: 'FFFFFF' }, bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
        };
        const data = exInvoices?.map((item, index) => {
            let arr = [];
          let amountConvertedToMainCurrency=formatNumberToLocale(defaultNumberFormat( mainCurrency === item.invoiceCurrencyCode? item.invoicePaymentAmountConvertedToInvoiceCurrency:item.amountConvertedToMainCurrency)).replaceAll(',','')
          columnClone.includes('cashboxName') && (arr[columnClone.indexOf('cashboxName')] = item?.isLastRow? {value:'',style:columnFooterStyle}:{ value:( item.cashboxName || '-'), })
          columnClone.includes('createdAt') && (arr[columnClone.indexOf('createdAt')] = item?.isLastRow? {value:'',style:columnFooterStyle}:{ value:item.createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1')|| '-', })
          columnClone.includes('dateOfTransaction') && (arr[columnClone.indexOf('dateOfTransaction')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:item.dateOfTransaction || '-', })
          columnClone.includes('documentNumber') && (arr[columnClone.indexOf('documentNumber')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.documentNumber || '-', })
          columnClone.includes('operationDirectionId') && (arr[columnClone.indexOf('operationDirectionId')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:item.operationDirectionId==-1? 'Məxaric':item.operationDirectionId==1? 'Mədaxil':item.operationDirectionId==2? 'Balans':'-'})
          columnClone.includes('categoryName') && (arr[columnClone.indexOf('categoryName')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:item .transactionType === 14 ? 'İlkin qalıq' : item.categoryName || '-' });
          columnClone.includes('subCategoryName') && (arr[columnClone.indexOf('subCategoryName')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item .transactionType === 14 ? 'Hesab' : item.subCategoryName || '-' });
          columnClone.includes('contactOrEmployee') && (arr[columnClone.indexOf('contactOrEmployee')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.contactOrEmployee || '-', })
          columnClone.includes('amount') && (arr[columnClone.indexOf('amount')] =item?.isLastRow? {value:item.excelOverallPrice,style:columnFooterStyle}: { value:`${ item.operationDirectionName === 'Cash out' ? '-' : ''} ${formatNumberToLocale(defaultNumberFormat( mainCurrency === item.invoiceCurrencyCode && mainCurrency === item.currencyCode? item.invoicePaymentAmountConvertedToInvoiceCurrency: item.amount))} ${item.currencyCode || item.mainCurrencyCode}` || '-', });
          columnClone.includes('amountConvertedToMainCurrency') && (arr[columnClone.indexOf('amountConvertedToMainCurrency')] =item?.mainCurrencyTotal? {value:item.mainCurrencyTotal,style:columnFooterStyle}: { value:Number(item.operationDirectionName === 'Cash out' ? -amountConvertedToMainCurrency : amountConvertedToMainCurrency) || '-', });
          columnClone.includes('businessUnitId') && (arr[columnClone.indexOf('businessUnitId')] =item?.isLastRow? {value:'',style:columnFooterStyle}:{ value:`${allBusinessUnits?.find(({ id }) => id === item.businessUnitId)?.name}`|| '-', });
          columnClone.includes('status') && (arr[columnClone.indexOf('status')] =item?.isLastRow? {value:'',style:columnFooterStyle}:{ value: item.status=='active'? 'aktiv':'silinib' || '-' ,});
          columnClone.includes('createdByName') && (arr[columnClone.indexOf('createdByName')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:`${item.createdByName} ${item.createdByLastname}`|| '-' ,});
          columnClone.includes('paymentTypeName') && (arr[columnClone.indexOf('paymentTypeName')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value:getExcelPaymentStatus(item.paymentTypeName) || '-' ,});
          columnClone.includes('description') && (arr[columnClone.indexOf('description')] =item?.isLastRow? {value:'',style:columnFooterStyle}: { value: item.description || '-', })
            arr.unshift(item.isLastRow?{value:'Ümumi məbləğ:',style:columnFooterStyle}:{ value: index + 1 });
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns(mainCurrency);
    }, [visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exInvoices]);

    useEffect(() => {
        if(exInv){
        getTransactWithTotalAmount(exInv);}
    }, [exInv]);
    


    // set Table Configuration data and set visible columns
    useEffect(() => {
    
      if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
        let parseData = JSON.parse(tableConfiguration)
        let columns = parseData.filter(column => column.visible === true)
          .map(column => column.dataIndex);
        setVisibleColumns(columns)
        setTableSettingData(parseData)
      }
      else if(tableConfiguration== null){
        const column = TRANSACTION_LIST_TABLE_SETTING_DATA 
        .filter(column => column.visible === true)
        .map(column => column.dataIndex);
      setVisibleColumns(column);
      setTableSettingData(TRANSACTION_LIST_TABLE_SETTING_DATA );
      }
    }, [tableConfiguration])

    const getInvoiceProducts = (
        rows,
        productionInfo,
        positiveCost,
        totalExpense,
        totalQuantity
    ) => {
        const totalExpenseWithoutLastRow = rows
            .slice(0, -1)
            .reduce(
                (total_amount, { invoiceQuantity }) =>
                    math.add(
                        total_amount,
                        math.mul(Number(invoiceQuantity), positiveCost) || 0
                    ),
                0
            );
        const costForLastRow = math.div(
            math.sub(Number(totalExpense), Number(totalExpenseWithoutLastRow)),
            Number(rows.pop().invoiceQuantity || totalQuantity)
        );

        if (productionInfo?.stockToId !== null) {
            let arr = productionInfo.invoiceProducts?.content.map(
                ({ planned_cost, planned_price, invoiceProductId }, index) => {
                    if (
                        index ===
                        productionInfo.invoiceProducts?.content.length - 1
                    ) {
                        return {
                            id: invoiceProductId,
                            plannedCost: Number(planned_cost),
                            plannedPrice: Number(planned_price),
                            itemCost:
                                toFixed(costForLastRow) === 0
                                    ? 0
                                    : toFixed(costForLastRow) || 0,
                        };
                    }
                    return {
                        id: invoiceProductId,
                        plannedCost: Number(planned_cost),
                        plannedPrice: Number(planned_price),
                        itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
                    };
                }
            );
            return arr;
        } else {
            let arr = productionInfo.invoiceProducts?.content.map(
                ({ invoiceProductId }, index) => {
                    if (
                        index ===
                        productionInfo.invoiceProducts?.content.length - 1
                    ) {
                        return {
                            id: invoiceProductId,
                            itemCost:
                                toFixed(costForLastRow) === 0
                                    ? 0
                                    : toFixed(costForLastRow) || 0,
                        };
                    }
                    return {
                        id: invoiceProductId,
                        itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
                    };
                }
            );
            return arr;
        }
    };

    const changeCost = (row, id, data, productionInfo) => {
        const totalQuantity = row.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(total_amount, Number(invoiceQuantity) || 0),
            0
        );

        const cost =
            productionInfo.cost > 0 || data.price > 0
                ? new BigNumber(
                      new BigNumber(productionInfo.cost).plus(
                          new BigNumber(data.price)
                      )
                  ).dividedBy(new BigNumber(totalQuantity || 1))
                : 0;

        const positiveCost =
            toFixed(cost) < 0 || toFixed(cost) === -0 ? 0 : toFixed(cost);

        const totalExpense = row.reduce(
            (total_amount, { invoiceQuantity }) =>
                math.add(
                    total_amount,
                    math.mul(
                        Number(invoiceQuantity) || 0,
                        Number(positiveCost) || 0
                    )
                ),
            0
        );

        if (productionInfo?.stockToId !== null) {
            let newTransferData = {};
            newTransferData = {
                operationDate: productionInfo.operationDate,
                stock: productionInfo.stockToId,
                invoiceProducts_ul: getInvoiceProducts(
                    row,
                    productionInfo,
                    roundToDown(positiveCost),
                    totalExpense,
                    totalQuantity
                ),
            };
            editTransferProduction({
                data: newTransferData,
                id: Number(id),
            });
        } else {
            let newData = {};
            newData = {
                invoiceProducts_ul: getInvoiceProducts(
                    row,
                    productionInfo,
                    roundToDown(positiveCost),
                    totalExpense,
                    totalQuantity
                ),
            };

            editProductionCost({ data: newData, id: Number(id) });
        }

        fetchOperationsList({ filters });
    };

    const handleDeleteTransaction = (item, reason, row) => {
        if (
            (row.transactionType === 6 ||
                row.transactionType === 8 ||
                row.transactionType === 9) &&
            row.paymentInvoiceType === 11
        ) {
            deleteTransaction(item, reason, () => {
                if (
                    (transactionsCount - 1) % pageSize == 0 &&
                    currentPage > 1
                ) {
                    handlePaginationChange(currentPage - 1);
                } else {
                    fetchProductionInfo({
                        id: row.paymentInvoiceId,
                        onSuccess: ({ data }) => {
                            if (Object.keys(data).length > 0) {
                                const { invoiceProducts } = data;
                                const { content } = invoiceProducts;
                                const selectedProducts = {};

                                content.forEach(
                                    ({
                                        invoiceProductId,
                                        productId,
                                        productName,
                                        quantity,
                                        pricePerUnit,
                                        unitOfMeasurementName,
                                        serialNumber,
                                        cost,
                                        planned_cost,
                                        planned_price,
                                    }) => {
                                        if (selectedProducts[productId]) {
                                            selectedProducts[productId] = {
                                                ...selectedProducts[productId],
                                                invoiceQuantity: math.add(
                                                    round(quantity),
                                                    selectedProducts[productId]
                                                        .invoiceQuantity
                                                ),
                                            };
                                        } else {
                                            selectedProducts[productId] = {
                                                id: productId,
                                                invoiceProductId: invoiceProductId,
                                                name: productName,
                                                barcode: undefined,
                                                unitOfMeasurementName,
                                                serialNumbers: serialNumber
                                                    ? [serialNumber]
                                                    : undefined,
                                                invoiceQuantity: round(
                                                    quantity
                                                ),
                                                invoicePrice: round(
                                                    pricePerUnit
                                                ),
                                                cost: Number(cost),
                                                plannedCost: Number(
                                                    planned_cost
                                                ),
                                                plannedPrice: Number(
                                                    planned_price
                                                ),
                                            };
                                        }
                                    }
                                );

                                changeCost(
                                    Object.values(selectedProducts),
                                    row.paymentInvoiceId,
                                    {
                                        price: math.mul(
                                            Number(
                                                row.amountConvertedToMainCurrency ||
                                                    0
                                            ),
                                            -1
                                        ),
                                    },
                                    data,
                                    item,
                                    reason,
                                    row
                                );
                            }
                        },
                    });
                }
            },
            onDeleteFail);
        } else {
            deleteTransaction(item, reason, onDeleteOperation, onDeleteFail);
        }
    };
    const onDeleteOperation = () => {
        if ((transactionsCount - 1) % pageSize == 0 && currentPage > 1) {
            handlePaginationChange(currentPage - 1);
        } else {
            fetchOperationsList({ filters });
            fetchTransactionsCount({ filters });
        }
    };

    const onDeleteFail = ({error}) => {
        let errData= error?.response?.data?.error;
        if(errData?.code === "advance_transaction_constraint" || errData?.code === "employee_payment_transaction_constraint") {
            toast.error(errData?.message)
        }
        else {
        const cashboxName =
            errData?.errorData?.cashbox.length > 15
                ? `${errData?.errorData?.cashbox.substring(0, 15)} ...`
                : errData?.errorData?.cashbox;
        toast.error(`Bu əməliyyat hesabda kifayət qədər vəsait olmadığından silinə bilməz. ${cashboxName} hesabına ən az ${math.mul(Number(errData?.errorData.amount || 0), -1)} ${errData?.errorData?.currencyCode} əlavə olunmalıdır. Tarix: ${errData?.errorData?.date}`)
    }
};

    return (
        <>
            <section>
                <OperationsSidebar
                    {...{
                        businessUnits,
                        handleSearch,
                        isLoading,
                        contactsLoading,
                        contacts,
                        filters,
                        onFilter,
                        cashboxLoading,
                        groupedByTypeCashboxNames,
                        expenseCatalogs,
                        fetchExpenseItemByCatalogId,
                        expenseItems,
                        expenseItemsLoading,
                        employees,
                        employeesLoading,
                        hrmEmployees,
                        fetchOperationsList,
                        setCurrentPage,
                        profile,
                        handlePaginationChange,
                    }}
                />
                <TableConfiguration
                    saveSetting={handleSaveSettingModal}
                    visible={visible}
                    AllStandartColumns={TRANSACTION_LIST_TABLE_SETTING_DATA }
                    setVisible={toggleVisible}
                    columnSource={tableSettingData}
                />

                <section className="scrollbar aside" ref={sectionRef}>
                    <div className="container" style={{ marginTop: 30 }}>
                        {/* <Tabs tab={tab} setTab={setTab}/> */}

                        {/* table and infobox */}
                        <Row style={{ margin: '20px 0' }}>
                            <Col span={24}>
                                <Can
                                    I={accessTypes.manage}
                                    a={highestFinanceOperationKey}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <SettingButton
                                            onClick={toggleVisible}
                                        />
                                        <ExportToExcel
                                            getExportData={() =>
                                              fetchAllTransactionList({
                                                    filters: {
                                                        ...filters,
                                                        limit: 5000,
                                                        page: undefined,
                                                    },
                                                    onSuccessCallback: data => {
                                                        setExInv(data.data) 
                                                    },
                                                })
                                            }
                                            data={excelData}
                                            columns={excelColumns}
                                            excelTitle="Əməliyyatlar"
                                            disable={!allBusinessUnits&&!mainCurrency}
                                            excelName="Əməliyyatlar"
                                            filename="Əməliyyatlar"
                                            count={transactionsCount}
                                        />
                                        {profile.businessUnits?.length > 1 ? (
                                            <Dropdown
                                                className={
                                                    styles.newDropdownBtn
                                                }
                                                overlay={menu}
                                            >
                                                <NewButton
                                                    label="Yeni əməliyyat"
                                                    style={{
                                                        marginLeft: '15px',
                                                    }}
                                                    icon={
                                                        <AiOutlineDown
                                                            style={{
                                                                marginLeft:
                                                                    '5px',
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Dropdown>
                                        ) : profile.businessUnits?.length ===
                                          1 ? (
                                            <Link to="/finance/operations/add">
                                                <NewButton
                                                    label="Yeni əməliyyat"
                                                    style={{
                                                        marginLeft: '15px',
                                                    }}
                                                />
                                            </Link>
                                        ) : businessUnits?.length === 1 ? (
                                            <Link to="/finance/operations/add">
                                                <NewButton
                                                    label="Yeni əməliyyat"
                                                    style={{
                                                        marginLeft: '15px',
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <Dropdown
                                                className={
                                                    styles.newDropdownBtn
                                                }
                                                overlay={menu}
                                            >
                                                <NewButton
                                                    label="Yeni əməliyyat"
                                                    style={{
                                                        marginLeft: '15px',
                                                    }}
                                                    icon={
                                                        <AiOutlineDown
                                                            style={{
                                                                marginLeft:
                                                                    '5px',
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Dropdown>
                                        )}
                                    </div>
                                </Can>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xl={24} xxl={24}>
                                {/* go to add new operations */}

                                <Table
                                    loading={isLoading}
                                    // dataSource={searchTouched ? result : filteredList}
                                    dataSource={ filteredList}
                                    columns={getColumns({column: visibleColumns})}
                                    rowKey={record => record.id}
                                    pagination={false}
                                    footer={
                                        <TableFooter 
                                        mebleg={overallPrice} 
                                        totalMainCurrency={ formatNumberToLocale(defaultNumberFormat(overAllMainCurrency))}
                                        mainCurrency={mainCurrency} />
                                    }
                                />
                                {/* <p className={styles.footerCount}>Nəticə sayı: {stocks.length}</p> */}
                            </Col>
                            {/* <Col xl={6} xxl={4}> */}
                            {/*  <DetailsBox sectionRef={sectionRef} /> */}
                            {/* </Col> */}
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
                                    total={transactionsCount}
                                />
                            </Col>
                            <Col span={6} offset={2} align="end">
                                <ProPageSelect
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    total={transactionsCount}
                                    onChange={e =>
                                        handlePageSizeChange(currentPage, e)
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                </section>
            </section>
            {/* action fab button */}

            {/* <ProFab data={fabItems} /> */}
        </>
    );
}

const mapStateToProps = state => ({
    isLoading: state.financeOperationsReducer.isLoading,
    filteredList: state.financeOperationsReducer.filteredList,
    transactionsCount: state.financeOperationsReducer.transactionsCount,
    allCashBoxNames: state.kassaReducer.allCashBoxNames,
    cashboxLoading: state.kassaReducer.isLoading,
    contacts: state.contactsReducer.contacts,
    contactsLoading: state.contactsReducer.isLoading,

    expenseCatalogs: state.transactionCatalog.catalog,
    expenseCatalogsLoading: state.transactionCatalog.isLoading,

    expenseItems: state.expenseItemsByCatalogId.expenseItems,
    expenseItemsLoading: state.expenseItemsByCatalogId.isLoading,

    employees: state.employeesReducer.employees,
    employeesLoading: state.employeesReducer.isLoading,

    hrmEmployees: state.hrmEmployeesReducer.hrmEmployees,
    currencies: state.currenciesReducer.currencies,
    permissionsList: state.permissionsReducer.permissions,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    tenant: state.tenantReducer.tenant,
    productionInvoices: state.salesAndBuysReducer.invoices,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        createTableConfiguration,
        fetchTableConfiguration,
        fetchAllTransactionList,
        fetchOperationsList,
        fetchTransactionsCount,
        fetchAllCashboxNames,
        transactionsFilterHandle,
        fetchContacts,
        setInfoCardData,
        fetchCurrencies,
        fetchBusinessUnitList,

        fetchTransactionCatalog,
        fetchExpenseItemByCatalogId,
        fetchEmployees,
        deleteTransaction,
        exportOperationsList,
        fetchSalesInvoiceList,
        fetchHrmEmployees,
        fetchProductionInfo,
        editTransferProduction,
        editProductionCost,
    }
)(Operations);
