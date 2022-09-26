/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Spin, Tooltip, Col, Row } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import {
  fetchVatInvoices,
  fetchVatOperations,
  fetchVatInvoicesCount,
} from 'store/actions/vat-invoices';
import { fetchUsers } from 'store/actions/users';
import { accessTypes, permissions } from 'config/permissions';
import moment from 'moment';
import {
    Table,
    Can,
    DetailButton,
    ProPagination,
    ProPageSelect,
    TableConfiguration,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import { fetchUsedCurrencies } from 'store/actions/settings/kassa';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import VatSidebar from './Sidebar';
import styles from './styles.module.scss';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
// Modals
import OperationsModal from './Modals/OperationsModal';
import { fetchAllVatInvoices } from 'store/actions/export-to-excel/financeModule';
import { VAT_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';

const roundTo = require('round-to');
const math = require('exact-math');

const Vat = props => {
  const {
    usedCurrencies,
    fetchAllVatInvoices,
    fetchTableConfiguration,
    createTableConfiguration,
    tableConfiguration,
    isBalanceLoading,
    vatInvoices,
    vatInvoicesCount,
    fetchVatInvoices,
    fetchVatInvoicesCount,
    fetchVatOperations,
    isVatLoading,
    fetchUsedCurrencies,
    fetchUsers,
    salesman,
    profile,
    businessUnits,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});

  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [changeCurrency, setChangeCurrency] = useState(null);
  const [operationsModalIsVisible, setOperationsModalIsVisible] = useState(
    false
  );
  const [salesmansExcel, setSalesmansExcel] = useState('Hamısı');
  const [selectedRow, setSelectedRow] = useState(null);
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(VAT_TABLE_SETTING_DATA );
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exVatInvoices, setExVatInvoices] = useState([]);
  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      type:params.type ? params.type :  'recievables', // NEED FOR CORRECT API URL
      currencyId:params.currencyId ? params.currencyId :  null,
      contrparty:params.contrparty ? params.contrparty : null, // String
      salesmans:params.salesmans ? params.salesmans : null,
      vat:params.vat ? params.vat : 1, // VAT - 1 || NON-VAT - 0 (DEFAULT IS 0)
      dateOfTransactionFrom: params.dateOfTransactionFrom ? params.dateOfTransactionFrom : null,
      dateOfTransactionTo:params.dateOfTransactionTo ? params.dateOfTransactionTo : null,
      daysFrom:params.daysFrom ? params.daysFrom : null,
      daysTo:params.daysTo ? params.daysTo : null,
      amountToBePaidFrom:params.amountToBePaidFrom ? params.amountToBePaidFrom : null,
      amountToBePaidTo:params.amountToBePaidTo ? params.amountToBePaidTo : null,
      borrow:params.borrow ? params.borrow : undefined,
      withDebt:params.withDebt ? params.withDebt : params.borrow? undefined: 1,
      description:params.description ? params.description : undefined,
      isDeleted: 0,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
       ( businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined),
      orderBy:params.orderBy ? params.orderBy: undefined,
      order: params.order ? params.order : undefined,
      limit: pageSize,
      page: currentPage,
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      if (filters.currencyId) fetchVatInvoices(filters);
      if (filters.currencyId) fetchVatInvoicesCount(filters);
    }
  );

  const [rerender, setRerender] = useState(0);
  const popstateEvent = () => {
      setRerender(rerender+1);
  }

  useEffect(() => {
    window.addEventListener('popstate', popstateEvent );
    return (() => window.removeEventListener('popstate',popstateEvent));
}, [rerender]);

useEffect(() => {
  const parmas = queryString.parse(location.search, {
      arrayFormat: 'bracket',
  });
  
  if(rerender>0){
      parmas['history'] = 1;

      if(parmas.page && !isNaN(parmas.page)) {
          setCurrentPage(parseInt(parmas.page));
      }
      setFilters({ ...parmas });
  }
  
}, [rerender]);

  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };

  useEffect(() => {
    if (filters?.businessUnitIds) {
      fetchUsers({
        filters: {
          businessUnitIds: filters?.businessUnitIds,
        },
      });
    } else {
      fetchUsers({});
    }
  }, [filters.businessUnitIds]);
  // useEffect(() => {
  //   const columnFooterStyle = {
  //     font: { color: { rgb: 'FFFFFF' }, bold: true },
  //     fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
  //   };
  //   const data = getVatInvoicesWithTotal(vatInvoices).map((item, index) => [
  //     item.isLastField
  //       ? { value: 'Toplam', style: columnFooterStyle }
  //       : { value: index + 1 },
  //     item.isLastField
  //       ? { value: '', style: columnFooterStyle }
  //       : { value: salesmansExcel },
  //     item.isLastField
  //       ? { value: '', style: columnFooterStyle }
  //       : { value: item.contactFullName },
  //     item.isLastField
  //       ? {
  //           value: Number(defaultNumberFormat(item.invoiceDebtAmount)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.invoiceDebtAmount)),
  //         },
  //     item.isLastField
  //       ? {
  //           value: Number(defaultNumberFormat(item.convertedPaidAmount)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.convertedPaidAmount)),
  //         },
  //     item.isLastField
  //       ? {
  //           value: Number(defaultNumberFormat(item.paidInPercentage)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(
  //             defaultNumberFormat(
  //               (Number(item.convertedPaidAmount || 0) * 100) /
  //                 Number(item.invoiceDebtAmount || 1),
  //               2
  //             )
  //           ),
  //         },
  //     item.isLastField
  //       ? {
  //           value: Number(defaultNumberFormat(item.amountToBePaid)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(
  //             defaultNumberFormat(
  //               Number(item.invoiceDebtAmount) -
  //                 Number(item.convertedPaidAmount)
  //             )
  //           ),
  //         },
  //     item.isLastField
  //       ? { value: '', style: columnFooterStyle }
  //       : {
  //           value: Number(defaultNumberFormat(item.lastPaymentAmount)),
  //         },
  //     item.isLastField
  //       ? { value: '', style: columnFooterStyle }
  //       : {
  //           value: item.dateOfTransaction || '-',
  //         },
  //     item.isLastField
  //       ? { value: '', style: columnFooterStyle }
  //       : { value: Number(item.daysNum) || '-' },
  //   ]);
  //   setExcelData(data);
  // }, [vatInvoices]);
  useEffect(() => {
    if (filters.salesmans?.length > 0) {
      if (filters.salesmans?.length === salesman.length) {
        setSalesmansExcel('Hamısı');
      } else {
        const salemans = salesman
          .filter(item => filters.salesmans.includes(item.id))
          .map(({ name, lastName }) => `${name} ${lastName || ''}`)
          .join();
        setSalesmansExcel(salemans);
      }
    } else {
      setSalesmansExcel('Hamısı');
    }
  }, [filters.salesmans]);

  useEffect(()=>{
    fetchTableConfiguration({ module: 'Finance-Vat' })
  },[]);

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
      const column = VAT_TABLE_SETTING_DATA
      .filter(column => column.visible === true)
      .map(column => column.dataIndex);
    setVisibleColumns(column);
    setTableSettingData(VAT_TABLE_SETTING_DATA );
    }
  }, [tableConfiguration]);

  const handleSaveSettingModal = column => {
    let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({column: tableColumn})
    createTableConfiguration({ moduleName: "Finance-Vat", columnsOrder: data })
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns(usedCurrencies,selectedCurrency)
  };

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
  const getColumns = ({column}) => {

    const columns = [];
    
       
    columns[column.indexOf('contactFullName')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'contactFullName',
            align: 'left',
            width: 150,
            ellipsis: true,
            render: (value, { isLastField }) =>
            isLastField
                    ? ''
                    : (
                          <Tooltip placement="topLeft" title={value || ''}>
                              <span>{value || '-'}</span>
                          </Tooltip>
                      ) || '-',
        };
    columns[column.indexOf('invoiceDebtAmount')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Toplam Borc</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'invoiceDebtAmount' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('invoiceDebtAmount', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'invoiceDebtAmount' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('invoiceDebtAmount', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'invoiceDebtAmount',
            width: 180,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`,
        };
    columns[column.indexOf('convertedPaidAmount')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Ödənilib</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'convertedPaidAmount' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('convertedPaidAmount', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'convertedPaidAmount' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('convertedPaidAmount', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'convertedPaidAmount',
            width: 180,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`,
        };
    columns[column.indexOf('paidAmountPercentage')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Ödənilib(%)</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'paidAmountPercentage' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('paidAmountPercentage', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'paidAmountPercentage' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('paidAmountPercentage', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'paidAmountPercentage',
            width: 180,
            align: 'center',
            render: value =>
                `${formatNumberToLocale(defaultNumberFormat(value))}%`,
        };
    columns[column.indexOf('amountToBePaid')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Ödənilməlidir</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'amountToBePaid' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('amountToBePaid', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'amountToBePaid' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('amountToBePaid', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'amountToBePaid',
            width: 150,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`,
        };
    columns[column.indexOf('lastPaymentAmount')] ={
            title: 'Son ödəniş',
            dataIndex: 'lastPaymentAmount',
            width: 150,
            align: 'right',
            render: (value, { isLastField, currencyCode }) =>
            isLastField
                    ? ''
                    : `${formatNumberToLocale(
                          defaultNumberFormat(value)
                      )} ${currencyCode}`,
        };
    columns[column.indexOf('dateOfTransaction')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Son ödəniş tarixi</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy ===
                                    'dateOfTransactionTimestamp' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable(
                                    'dateOfTransactionTimestamp',
                                    'asc'
                                )
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy ===
                                    'dateOfTransactionTimestamp' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable(
                                    'dateOfTransactionTimestamp',
                                    'desc'
                                )
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'dateOfTransaction',
            width: 150,
            align: 'center',
            render: (value, { isLastField }) => (isLastField ? '' : value || '-'),
        };
    columns[column.indexOf('daysNum')] ={
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Günlərin sayı</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'daysNum' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('daysNum', 'asc')}
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'daysNum' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('daysNum', 'desc')}
                        />
                    </div>
                </div>
            ),
            dataIndex: 'daysNum',
            width: 140,
            align: 'center',
            render: (daysNum, { isLastField }) => (isLastField ? '' : daysNum || '-'),
        };
        columns.push({
            title: 'Seç',
            width: 60,
            align: 'center',
            render: (row, { isLastField }) =>
                !isLastField ? (
                    <DetailButton onClick={() => handleDetailsClick(row)} />
                ) : null,
        });

        columns.unshift( {
          title: '№',
          dataIndex: 'id',
          key: 'id',
          width: 100,
          render: (value, row, index) => (row.isLastField ? 'Toplam ' : (filters.page - 1) * filters.limit + index + 1),
        });
    return columns;
    }

    const getExcelColumns = (usedCurrencies,selectedCurrency) => {
      let columnClone = [...visibleColumns];
      let columns = []
      columns[columnClone.indexOf('contactFullName')] = {
        title: 'Qarşı tərəf',
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('invoiceDebtAmount')] = {
        title: `Toplam Borc (${usedCurrencies?.find(currency =>currency.id ===selectedCurrency?.id)?.code})`,
        width: { wpx: 200 },
      };
    
      columns[columnClone.indexOf('convertedPaidAmount')] = {
        title: `Ödənilib  (${usedCurrencies?.find(currency =>currency.id ===selectedCurrency?.id)?.code})`,
        width: { wpx: 150 },
      };
      
      columns[columnClone.indexOf('paidAmountPercentage')] = {
        title: 'Ödənilib(%)',
        width: { wpx: 200 },
      };
    
      columns[columnClone.indexOf('amountToBePaid')] = {
        title: `Ödənilməlidir (${usedCurrencies?.find(currency =>currency.id ===selectedCurrency?.id)?.code})`,
        width: { wpx: 150 },
      };
    
      columns[columnClone.indexOf('lastPaymentAmount')] = {
        title: `Son ödəniş (${usedCurrencies?.find(currency =>currency.id ===selectedCurrency?.id)?.code})`,
        width: { wpx: 150 },
      };
      columns[columnClone.indexOf('dateOfTransaction')] = {
        title: 'Son ödəniş tarixi',
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('daysNum')] = {
        title: `Günlərin sayı`,
        width: { wpx: 150 },
      };
  
      columns.unshift({
        title: '№',
        width: { wpx: 90 },
      });
      setExcelColumns(columns)
    }
    
    const getExcelData = () => {
      let columnClone = [...visibleColumns];
      const columnFooterStyle = {
                 font: { color: { rgb: 'FFFFFF' }, bold: true },
                 fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
             };
      const data = exVatInvoices.map((item, index) => {   
        let arr = []
 
        columnClone.includes('contactFullName') && (arr[columnClone.indexOf('contactFullName')] =item.isLastField?{value:'',style:columnFooterStyle}:{ value: item.contactFullName|| '-', })
        columnClone.includes('invoiceDebtAmount') && (arr[columnClone.indexOf('invoiceDebtAmount')] = { value:  Number(defaultNumberFormat(item.invoiceDebtAmount)) || '-', style:item.isLastField?columnFooterStyle:''})
        columnClone.includes('convertedPaidAmount') && (arr[columnClone.indexOf('convertedPaidAmount')] = { value:  Number(defaultNumberFormat(item.convertedPaidAmount)) || '-',style:item.isLastField?columnFooterStyle:'' })
        columnClone.includes('paidAmountPercentage') && (arr[columnClone.indexOf('paidAmountPercentage')] = { value:  Number(defaultNumberFormat(item.paidAmountPercentage))  || '-',style:item.isLastField?columnFooterStyle:'' })
        columnClone.includes('amountToBePaid') && (arr[columnClone.indexOf('amountToBePaid')] = { value:  Number(defaultNumberFormat(item.amountToBePaid)) || '-',style:item.isLastField?columnFooterStyle:'' })
        columnClone.includes('lastPaymentAmount') && (arr[columnClone.indexOf('lastPaymentAmount')] =item.isLastField?{value:'',style:columnFooterStyle}: { value:  Number(defaultNumberFormat(item.lastPaymentAmount))|| '-', })
        columnClone.includes('dateOfTransaction') && (arr[columnClone.indexOf('dateOfTransaction')] = item.isLastField?{value:'',style:columnFooterStyle}:{ value: item.dateOfTransaction|| '-', })
        columnClone.includes('daysNum') && (arr[columnClone.indexOf('daysNum')] =item.isLastField?{value:'',style:columnFooterStyle}: { value: Number(item.daysNum)|| '-', })
       
      
       arr.unshift(item.isLastField?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
        return arr;
       
      })
      setExcelData(data);
    }
          
    useEffect(() => {
      getExcelColumns(usedCurrencies,selectedCurrency)
    }, [visibleColumns,usedCurrencies,selectedCurrency])
    
    useEffect(() => {
      getExcelData()
    }, [exVatInvoices]);


  const handleDetailsClick = row => {
    setOperationsModalIsVisible(true);
    setSelectedRow(row);
  };
  const handleCurrencyChange = currency => {
    setSelectedCurrency(currency);
    onFilter('currencyId', currency.id);
  };
  const getVatInvoicesWithTotal = data => {
    const totalDebt = data.reduce(
      (initialValue, currentValue) =>
        initialValue + Number(currentValue.invoiceDebtAmount),
      0
    );
    const totalPaid = data.reduce(
      (initialValue, currentValue) =>
        initialValue + Number(currentValue.convertedPaidAmount),
      0
    );

    const toBePaidTotal = data.reduce(
      (initialValue, currentValue) =>
        math.add(initialValue, Number(currentValue.amountToBePaid)),
      0
    );
    return data.length > 0
      ? [
          ...data,
          {
            isLastField: true,
            invoiceDebtAmount: totalDebt,
            convertedPaidAmount: totalPaid,
            paidAmountPercentage: (Number(totalPaid) * 100) / Number(totalDebt),
            amountToBePaid: toBePaidTotal,
            currencyCode:data[0]?.currencyCode
          },
        ]
      : [];
  };

  useEffect(() => {
    if (selectedRow) {
      fetchVatOperations({
        filters: {
          contacts: [selectedRow.contactId],
          salesManagers: filters.salesmans,
          taxCurrencyId: selectedCurrency.id,
          limit: 10000,
          isDeleted: 0,
          invoiceTypes: filters.type === 'recievables' ? [2, 4, 13] : [1, 3, 10, 12],
          businessUnitIds: filters.businessUnitIds,
          description: filters.description,
          excludeZeroTaxAmount: 1
        },
      });
    }
  }, [selectedRow]);

  useEffect(() => {
    fetchUsedCurrencies(
      filters.type === 'recievables'
                ? {
                      usedInTaxInvoice: 1,
                      invoiceType: [2, 4, 13],
                  }
                : { usedInTaxInvoice: 1, invoiceType: [1, 3, 12] },
      ({ data }) => {
        if(data.length>0  &&!filters.currencyId)
         { setSelectedCurrency(data[0]);
           onFilter('currencyId', data[0].id);}
      }
    );
  }, []);

  useEffect(() => {
    if (usedCurrencies && usedCurrencies.length > 0 &&changeCurrency) {
      setSelectedCurrency(usedCurrencies[0]);
      onFilter('currencyId', usedCurrencies[0].id);
    }
    if(filters.currencyId&&usedCurrencies.length > 0 &&!changeCurrency) {
      setSelectedCurrency(usedCurrencies.find(currency=>
        currency.id==Number(filters.currencyId )))
      }
  }, [usedCurrencies]);

  return (
    <>
      <VatSidebar
        onFilter={onFilter}
        filters={filters}
        salesman={salesman}
        profile={profile}
        setCurrentPage={setCurrentPage}
        handlePaginationChange={handlePaginationChange}
        setChangeCurrency={setChangeCurrency}
      />
      <TableConfiguration
        saveSetting={handleSaveSettingModal}
        visible={Tvisible}
        AllStandartColumns={VAT_TABLE_SETTING_DATA }
        setVisible={toggleVisible}
        columnSource={tableSettingData}
         />
      <section className="scrollbar aside">
        <OperationsModal
          visible={operationsModalIsVisible}
          setIsVisible={setOperationsModalIsVisible}
          type={filters.type}
        />
        <div className="container" style={{ marginTop: 30 }}>
          <Spin spinning={isBalanceLoading}>
            <div
              className="flex"
              style={{ justifyContent: 'space-between', marginBottom: 20 }}
            >
              <div className={styles.currenciesOption}>
                {usedCurrencies.length > 1
                  ? usedCurrencies.map(currency => (
                      <Button
                        key={currency.id}
                        className={`${styles.currencyButton} ${
                          selectedCurrency?.id === currency.id
                            ? styles.activeCurrencyButton
                            : null
                        }`}
                        onClick={() => {
                          handlePaginationChange(1);
                          handleCurrencyChange(currency);
                        }}
                        currency={currency}
                      >
                        {currency.code}
                      </Button>
                    ))
                  : null}
              </div>
              <div 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}>
              <Can
                I={accessTypes.manage}
                a={permissions.transaction_vat_report}
              >
                 <SettingButton onClick={toggleVisible} />
        
                <ExportToExcel
                    getExportData={
                    () => fetchAllVatInvoices({
                        filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                          setExVatInvoices(getVatInvoicesWithTotal(data.data))
                        }
                    })
                    }
                    data={excelData}
                    columns={excelColumns}
                    excelTitle={`ƏDV - ${
                      filters.type === 'recievables'
                        ? 'Debitor borclar'
                        : 'Kreditor borclar'
                    } ${
                      filters.dateOfTransactionFrom && filters.dateOfTransactionTo
                        ? `(${moment(
                            filters.dateOfTransactionFrom,
                            'DD-MM-YYYY'
                          ).format('DD.MM.YYYY')} - ${moment(
                            filters.dateOfTransactionTo,
                            'DD-MM-YYYY'
                          ).format('DD.MM.YYYY')})`
                        : filters.dateOfTransactionFrom
                        ? `(${moment(
                            filters.dateOfTransactionFrom,
                            'DD-MM-YYYY'
                          ).format('DD.MM.YYYY')})`
                        : filters.dateOfTransactionTo
                        ? `(${moment(
                            filters.dateOfTransactionTo,
                            'DD-MM-YYYY'
                          ).format('DD.MM.YYYY')})`
                        : `(${moment().format('DD.MM.YYYY')})`
                    }`}
                    excelName={`ƏDV - ${
                      filters.type === 'recievables'
                        ? 'Debitor borclar'
                        : 'Kreditor borclar'
                    } (${selectedCurrency?.code})`}

                    filename={`ƏDV -${
                      filters.type === 'recievables'
                        ? 'Debitor borclar'
                        : 'Kreditor borclar'
                    } (${selectedCurrency?.code})`}

                    count={vatInvoicesCount}
                />
              </Can>
              </div>
            </div>
            <div style={{ marginTop: 30 }}>
              <Table
                loading={isBalanceLoading || isVatLoading}
                className={styles.customTable}
                dataSource={getVatInvoicesWithTotal(vatInvoices)}
                pagination={false}
                columns={getColumns({column: visibleColumns})}
                // scroll={{ x: false, y: false }}
                scroll={{ x: 'max-content',y:500 }}
                size="default"
              />
            </div>
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
                  loading={isBalanceLoading || isVatLoading}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onChange={handlePaginationChange}
                  total={vatInvoicesCount}
                />
              </Col>
              <Col span={6} offset={2} align="end">
                <ProPageSelect
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={vatInvoicesCount}
                  onChange={e => handlePageSizeChange(currentPage, e)}
                />
              </Col>
            </Row>
          </Spin>
        </div>
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  isBalanceLoading: state.kassaReducer.isBalanceLoading,
  isVatLoading: state.vatInvoicesReducer.isLoading,
  vatInvoices: state.vatInvoicesReducer.vatInvoices,
  vatInvoicesCount: state.vatInvoicesReducer.vatInvoicesCount,
  usedCurrencies: state.kassaReducer.usedCurrencies,
  salesman: state.usersReducer.users,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchAllVatInvoices,
    fetchTableConfiguration,
    createTableConfiguration,
    fetchVatInvoices,
    fetchVatInvoicesCount,
    fetchVatOperations,
    fetchUsedCurrencies,
    fetchUsers,
  }
)(Vat);
