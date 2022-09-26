/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Tooltip } from 'antd';
import {
    Table,
    Can,
    DetailButton,
    ProPageSelect,
    ProPagination,
    TableConfiguration,
} from 'components/Lib';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
    fetchPayables,
    fetchPayablesCount,
} from 'store/actions/recievablesAndPayables';
import { useFilterHandle } from 'hooks';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import moment from 'moment';
import { AddFormModal } from 'containers/Settings/#shared';
import { accessTypes, permissions } from 'config/permissions';
import styles from '../Operations/styles.module.scss';
import RecPaySideBar from '../Recievables/recPaySideBar';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import RecievablesDetails from '../Recievables/RecievablesDetails';
import CurrenciesOption from '../Recievables/currenciesOption';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
import { PAYABLES_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';
import { fetchAllPayables } from 'store/actions/export-to-excel/financeModule';
function addTotals(data) {
  if (data.length > 0) {
    const totalInvoiceDebtAmount = roundToDown(
      data.reduce(
        (total, { invoiceDebtAmount }) =>
          total + roundToDown(invoiceDebtAmount),
        0
      )
    );
    const totalConvertedPaidAmount = roundToDown(
      data.reduce(
        (total, { convertedPaidAmount }) =>
          total + roundToDown(convertedPaidAmount),
        0
      )
    );
    const totalAmountToBePaid = roundToDown(
      data.reduce(
        (total, { amountToBePaid }) =>
          total + Number(amountToBePaid),
        0
      )
    );
    const paidInPercentage =
      (totalConvertedPaidAmount * 100) / totalInvoiceDebtAmount;
    return [
      ...data.map(dataItem => ({
        ...dataItem,
        paidInPercentage:
          (roundToDown(dataItem.convertedPaidAmount) * 100) /
          roundToDown(dataItem.invoiceDebtAmount),
      })),
      {
        isTotal: true,
        invoiceDebtAmount: totalInvoiceDebtAmount,
        convertedPaidAmount: totalConvertedPaidAmount,
        amountToBePaid: totalAmountToBePaid,
        currencyCode: data[0].currencyCode,
        paidInPercentage,
      },
    ];
  }

  return [];
}

function Payables(props) {
  const {
    fetchPayables,
    fetchAllPayables,
    createTableConfiguration,
    tableConfiguration,
    fetchTableConfiguration,
    fetchUsers,
    payables,
    currencies,
    isLoading,
    profile,
    fetchBusinessUnitList,
    fetchPayablesCount,
    payablesCount,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [filter, setFilter] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState(params.currencyId ?Number( params.currencyId ):undefined);
  const [salesmansExcel, setSalesmansExcel] = useState('Hamısı');
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [businessUnits, setBusinessUnits] = useState([]);
  const [salesman, setSalesman] = useState([]);
  const [changedCurrency, setChangedCurrency] = useState(undefined);
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(PAYABLES_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exReceivables, setExReceivables] = useState([]);
  const ajaxSalesmansSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
) => {
    const defaultFilters = {
        limit,
        page,
        'filters[search]': search,
        businessUnitIds: filters?.businessUnitIds
            ? filters?.businessUnitIds
            : undefined,
    };
    fetchUsers({
        filters: defaultFilters,
        onSuccessCallback: data => {
            const appendList = [];
            console.log(data);
            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            console.log(appendList.length, 'appendList');
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setSalesman(appendList);
            } else {
                setSalesman(salesman.concat(appendList));
            }
        },
    });
};

  const ajaxBusinessUnitSelectRequest = (
      page = 1,
      limit = 20,
      search = '',
      stateReset = 0,
      onSuccessCallback
  ) => {
      const filters = {
          limit,
          page,
          name: search,
          isDeleted: 0,
          businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      };
      fetchBusinessUnitList({
          filters,
          onSuccess: data => {
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
                  setBusinessUnits(appendList);
              } else {
                  setBusinessUnits(businessUnits.concat(appendList));
              }
          },
      });
  };

  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      currencyId:params.currencyId ? params.currencyId : null,
      contrparty:params.contrparty ? params.contrparty : null,
      salesmans:params.salesmans ? params.salesmans : null,
      dateOfTransactionFrom: params.dateOfTransactionFrom ? params.dateOfTransactionFrom :null,
      dateOfTransactionTo: params.dateOfTransactionTo ? params.dateOfTransactionTo : null,
      daysFrom:params.daysFrom ? params.daysFrom :  null,
      daysTo:params.daysTo ? params.daysTo :  null,
      amountToBePaidFrom:params.amountToBePaidFrom ? params.amountToBePaidFrom : null,
      amountToBePaidTo:params.amountToBePaidTo ? params.amountToBePaidTo : null,
      salesmans:params.salesmans ? params.salesmans : undefined,
      borrow:params.borrow ? params.borrow : undefined,
      withDebt:params.withDebt ? params.withDebt : params.borrow? undefined: 1,
      description:params.description ? params.description : undefined,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
        (businessUnits?.length === 1
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
      if (filters.currencyId) fetchPayables(filters); // must have currency
            if (filters.currencyId)
                fetchPayablesCount(filters); // must have currency
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

useEffect(()=>{
  fetchTableConfiguration({ module: 'Finance-Payables' })
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
      const column = PAYABLES_TABLE_SETTING_DATA
      .filter(column => column.visible === true)
      .map(column => column.dataIndex);
    setVisibleColumns(column);
    setTableSettingData(PAYABLES_TABLE_SETTING_DATA);
    }
  }, [tableConfiguration]);

  useEffect(() => {
    if (selectedCurrency) {
      onFilter('currencyId', selectedCurrency);
      if(changedCurrency){
        handlePaginationChange(1);
        }
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (businessUnits) {
      if (businessUnits?.length === 1 && businessUnits[0]?.id !== null) {
        onFilter('businessUnitIds', [businessUnits[0]?.id]);
        } else {
          onFilter('businessUnitIds',params.businessUnitIds ? params.businessUnitIds.map(Number): undefined);
        }
    }
  }, [businessUnits]);

  useEffect(() => {
    if (filters?.businessUnitIds) {
        ajaxSalesmansSelectRequest(1, 20, '', 1);
    }
}, [filters.businessUnitIds]);

  // useEffect(() => {
  //   const columnFooterStyle = {
  //     font: { color: { rgb: 'FFFFFF' }, bold: true },
  //     fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
  //   };
  //   const data = addTotals(payables).map((item, index) => [
  //     item.isTotal
  //       ? { value: 'Toplam', style: columnFooterStyle }
  //       : { value: index + 1 },
  //     item.isTotal
  //       ? { value: '', style: columnFooterStyle }
  //       : { value: salesmansExcel },
  //     item.isTotal
  //       ? { value: '', style: columnFooterStyle }
  //       : { value: item.contactFullName },
  //     item.isTotal
  //       ? {
  //           value: Number(defaultNumberFormat(item.invoiceDebtAmount)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.invoiceDebtAmount)),
  //         },
  //     item.isTotal
  //       ? {
  //           value: Number(defaultNumberFormat(item.convertedPaidAmount)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.convertedPaidAmount)),
  //         },
  //     item.isTotal
  //       ? {
  //           value: Number(defaultNumberFormat(item.paidInPercentage)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.paidInPercentage)),
  //         },
  //     item.isTotal
  //       ? {
  //           value: Number(defaultNumberFormat(item.amountToBePaid)),
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.amountToBePaid)),
  //         },
  //     item.isTotal
  //       ? {
  //           value: '',
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: Number(defaultNumberFormat(item.lastPaymentAmount)),
  //         },
  //     item.isTotal
  //       ? {
  //           value: '',
  //           style: columnFooterStyle,
  //         }
  //       : {
  //           value: item.dateOfTransaction || '-',
  //         },
  //     item.isTotal
  //       ? {
  //           value: '',
  //           style: columnFooterStyle,
  //         }
  //       : { value: Number(item.daysNum) || '-' },
  //   ]);

  //   setExcelData(data);
  // }, [payables]);
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
  const handleSaveSettingModal = column => {
    let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({column: tableColumn})
    createTableConfiguration({ moduleName: "Finance-Payables", columnsOrder: data })
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns(currencies,selectedCurrency)
  };

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
  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
    const filter = {
      contacts: [row.contactId],
      salesManagers: filters.salesmans,
      currencyId: selectedCurrency,
      isDeleted: 0,
      invoiceTypes: [1, 3, 10, 12],
      limit: 10000,
      businessUnitIds: filters.businessUnitIds,
      description: filters.description,
    };
    setFilter(filter);
  };
  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };

  const getColumns = ({column}) => {

    const columns = [];
    
       
    columns[column.indexOf('contactFullName')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'contactFullName',
            align: 'left',
            width: 150,
            ellipsis: true,
            render: (value, { isTotal }) =>
                isTotal
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
                    <span>Toplam Borclar</span>
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
    columns[column.indexOf('paidInPercentage')] ={
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
            dataIndex: 'paidInPercentage',
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
            render: (value, { isTotal, currencyCode }) =>
                isTotal
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
            render: (value, { isTotal }) => (isTotal ? '' : value || '-'),
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
            render: (daysNum, { isTotal }) => (isTotal ? '' : daysNum || '-'),
        };
        columns.push({
            title: 'Seç',
            width: 60,
            align: 'center',
            render: (row, { isTotal }) =>
                !isTotal ? (
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                ) : null,
        });

        columns.unshift({
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 100,
            render: (value, { isTotal }, index) =>
                isTotal
                    ? 'Toplam'
                    : (filters.page - 1) * filters.limit + index + 1,
        });
    return columns;
    }

    const getExcelColumns = (currencies,selectedCurrency) => {
      let columnClone = [...visibleColumns];
      let columns = []
      columns[columnClone.indexOf('contactFullName')] = {
        title: 'Qarşı tərəf',
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('invoiceDebtAmount')] = {
        title: `Toplam Borclar (${currencies?.find(currency =>currency.id ===selectedCurrency)?.code})`,
        width: { wpx: 200 },
      };
    
      columns[columnClone.indexOf('convertedPaidAmount')] = {
        title: `Ödənilib  (${currencies?.find(currency =>currency.id ===selectedCurrency)?.code})`,
        width: { wpx: 150 },
      };
      
      columns[columnClone.indexOf('paidInPercentage')] = {
        title: 'Ödənilib(%)',
        width: { wpx: 200 },
      };
    
      columns[columnClone.indexOf('amountToBePaid')] = {
        title: `Ödənilməlidir (${currencies?.find(currency =>currency.id ===selectedCurrency)?.code})`,
        width: { wpx: 150 },
      };
    
      columns[columnClone.indexOf('lastPaymentAmount')] = {
        title: `Son ödəniş (${currencies?.find(currency =>currency.id ===selectedCurrency)?.code})`,
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
      const data = exReceivables.map((item, index) => {   
        let arr = []
 
        columnClone.includes('contactFullName') && (arr[columnClone.indexOf('contactFullName')] =item.isTotal?{value:'',style:columnFooterStyle}:{ value: item.contactFullName|| '-', })
        columnClone.includes('invoiceDebtAmount') && (arr[columnClone.indexOf('invoiceDebtAmount')] = { value:  Number(defaultNumberFormat(item.invoiceDebtAmount)) || '-', style:item.isTotal?columnFooterStyle:''})
        columnClone.includes('convertedPaidAmount') && (arr[columnClone.indexOf('convertedPaidAmount')] = { value:  Number(defaultNumberFormat(item.convertedPaidAmount)) || '-',style:item.isTotal?columnFooterStyle:'' })
        columnClone.includes('paidInPercentage') && (arr[columnClone.indexOf('paidInPercentage')] = { value:  Number(defaultNumberFormat(item.paidInPercentage))  || '-',style:item.isTotal?columnFooterStyle:'' })
        columnClone.includes('amountToBePaid') && (arr[columnClone.indexOf('amountToBePaid')] = { value:  Number(defaultNumberFormat(item.amountToBePaid)) || '-',style:item.isTotal?columnFooterStyle:'' })
        columnClone.includes('lastPaymentAmount') && (arr[columnClone.indexOf('lastPaymentAmount')] =item.isTotal?{value:'',style:columnFooterStyle}: { value:  Number(defaultNumberFormat(item.lastPaymentAmount))|| '-', })
        columnClone.includes('dateOfTransaction') && (arr[columnClone.indexOf('dateOfTransaction')] = item.isTotal?{value:'',style:columnFooterStyle}:{ value: item.dateOfTransaction|| '-', })
        columnClone.includes('daysNum') && (arr[columnClone.indexOf('daysNum')] =item.isTotal?{value:'',style:columnFooterStyle}: { value: Number(item.daysNum)|| '-', })
       
      
       arr.unshift(item.isTotal?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
        return arr;
       
      })
      setExcelData(data);
    }
          
    useEffect(() => {
      getExcelColumns(currencies,selectedCurrency)
    }, [visibleColumns,currencies,selectedCurrency])
    
    useEffect(() => {
      getExcelData()
    }, [exReceivables]);
  return (
    <>
      <section>
        <AddFormModal
          width={1200}
          withOutConfirm
          onCancel={handleDetailsModal}
          visible={details}
        >
          <RecievablesDetails
            type="payables"
            filters={filter}
            onCancel={handleDetailsModal}
            row={selectedRow}
            visible={details}
          />
        </AddFormModal>
        <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={PAYABLES_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
        <RecPaySideBar
          {...{
            filters,
            onFilter,
            businessUnits,
            salesman,
            ajaxBusinessUnitSelectRequest,
            ajaxSalesmansSelectRequest,
            handlePaginationChange
          }}
          type="payables"
        />

        <section className="scrollbar aside">
          <div className="container" style={{ marginTop: 30 }}>
            {/* table and infobox */}
            <Row gutter={16}>
              <Col xl={24} xxl={24}>
                {/* go to add new operations */}
                <div
                  className="flex"
                  style={{ justifyContent: 'space-between', marginBottom: 20 }}
                >
                  <CurrenciesOption
                    currency={selectedCurrency}
                    setCurrency={setSelectedCurrency}
                    setChangedCurrency={setChangedCurrency}
                    filters={filters}
                  />
                     <div 
                     style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'flex-end',
                     }}>
                  <Can
                    I={accessTypes.manage}
                    a={permissions.transaction_payables_report}
                  >
                     <SettingButton onClick={toggleVisible} />
                    
                    <ExportToExcel
                        getExportData={
                        () => fetchAllPayables({
                            filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                                setExReceivables(addTotals(data.data))
                            }
                        })
                        }
                        data={excelData}
                        columns={excelColumns}
                        excelTitle={`Kreditor borclar`}
                        excelName={`Kreditor borclar (${
                            currencies?.find(
                                currency =>
                                    currency.id ===
                                    selectedCurrency
                            )?.code
                        })`}
                        filename={`Kreditor borclar (${
                            currencies?.find(
                                currency =>
                                    currency.id ===
                                    selectedCurrency
                            )?.code
                        })`}
                        count={payablesCount}
                    />
                    {/* <ExportToExcel
                      data={excelData}
                      excelTitle={`Kreditor borclar ${
                        filters.dateOfTransactionFrom &&
                        filters.dateOfTransactionTo
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
                      excelName={`Kreditor borclar (${
                        currencies?.find(
                          currency => currency.id === selectedCurrency
                        )?.code
                      })`}
                      filename={`Kreditor borclar (${
                        currencies?.find(
                          currency => currency.id === selectedCurrency
                        )?.code
                      })`}
                      currency={
                        currencies?.find(
                          currency => currency.id === selectedCurrency
                        )?.code
                      }
                    /> */}
                  </Can>
                  </div>
                </div>

                <Table
                  className={styles.customTable}
                  loading={isLoading}
                  scroll={{ x: 'max-content',y:500 }}
                  dataSource={addTotals(payables)}
                  columns={getColumns({column: visibleColumns})}
                  rowKey={record => record.id}
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
                  total={payablesCount}
                />
              </Col>
              <Col span={6} offset={2} align="end">
                <ProPageSelect
                  currentPage={currentPage}
                  pageSize={pageSize}
                  total={payablesCount}
                  onChange={e => handlePageSizeChange(currentPage, e)}
                />
              </Col>
            </Row>
          </div>
        </section>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  payables: state.recievablesAndPayablesReducer.payables,
  payablesCount: state.recievablesAndPayablesReducer.payablesCount,
  isLoading: state.recievablesAndPayablesReducer.isLoading,
  currencies: state.kassaReducer.currencies,
  salesman: state.usersReducer.users,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchPayables,
    fetchAllPayables,
    fetchUsers,
    createTableConfiguration,
    fetchTableConfiguration,
    fetchBusinessUnitList,
    fetchPayablesCount,
  }
)(Payables);
