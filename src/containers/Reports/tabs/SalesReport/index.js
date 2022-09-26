import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Pagination, Select, Tooltip } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { ExcelButton, Table, Can, DetailButton, TableConfiguration } from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
  fetchSalesReports,
  fetchSalesReportsCount,
} from 'store/actions/reports/sales-report';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { accessTypes, permissions } from 'config/permissions';
import { thisMonthStart, thisMonthEnd, formatNumberToLocale, defaultNumberFormat } from 'utils';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import { AddFormModal } from 'containers/Settings/#shared';
import SalesReportSidebar from './Sidebar';
import styles from '../styles.module.scss';
import { types } from './types';
import SalesReportDetails from './salesReportDetails';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
import { SalesReports_TABLE_SETTING_DATA } from 'utils/table-config/reportsModule';
import { fetchAllSalesReports } from 'store/actions/export-to-excel/reportsModule';
const roundTo = require('round-to');

const SalesReport = props => {
  const {
    // states
    fetchTableConfiguration,
    fetchAllSalesReports,
    createTableConfiguration,
    tableConfiguration,
    isLoading,
    salesReports,
    salesReportsCount,
    mainCurrencyCode,
    // functions
    fetchSalesReports,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});


  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const pages = [8, 10, 20, 50, 100];
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [filter, setFilter] = useState({});
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(SalesReports_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exSalesReports, setExSalesReports] = useState([]);

  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
    let key = '';
    let value = [];
    if (row.salesman_id) {
      key = 'salesManagers';
      value = [row.salesman_id];
    } else if (row.client_id) {
      key = 'contacts';
      value = [row.client_id];
    } else if (row.stock_from_id) {
      key = 'stocks';
      value = [row.stock_from_id];
    } else if (row.catalog_id) {
      key = 'catalogs';
      value = [row.catalog_id];
    }
    const filter = {
      [key]: value,
      isDeleted: 0,
      limit: 1000,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      invoiceTypes: [2],
      businessUnitIds: filters.businessUnitIds,
      description: filters.description,
    };
    setFilter(filter);
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
  const calculateTotalRevenue = salesReports => {
    const totalRevenue = salesReports.reduce(
      (totalValue, currentValue) => totalValue + Number(currentValue.revenue),
      0
    );

    return totalRevenue;
  };

  const calculateTotalCostOfGoods = salesReports => {
    const totalCostOfGoods = salesReports.reduce(
      (totalValue, currentValue) =>
        totalValue + Number(currentValue.cost_of_goods_sold),
      0
    );
    return totalCostOfGoods;
  };

  const calculateTotalProfit = salesReports => {
    const totalProfit = salesReports.reduce(
      (totalValue, currentValue) =>
        totalValue +
        (Number(currentValue.revenue) -
          Number(currentValue.cost_of_goods_sold)),
      0
    );
    return totalProfit;
  };

  const calculateTotalQuantity = salesReports => {
    const totalQuantity = salesReports.reduce(
      (totalValue, currentValue) => totalValue + currentValue.invoice_count,
      0
    );
    return totalQuantity;
  };
  const getTotalValues = salesReports =>
    salesReports.length > 0
      ? [
          ...salesReports,
          {
            isTotal: true,
            revenue: calculateTotalRevenue(salesReports),
            invoice_count: calculateTotalQuantity(salesReports),
            cost_of_goods_sold: calculateTotalCostOfGoods(salesReports),
          },
        ]
      : salesReports;

  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      page: currentPage,
      limit: pageSize,
      type:params.type? params.type:  'sales-per-sales-managers',
      dateFrom:params.dateFrom? params.dateFrom: thisMonthStart,
      dateTo:params.dateTo? params.dateTo: thisMonthEnd,
      description:params.description ? params.description : undefined,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
       ( businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined),
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchSalesReports(filters.type, filters);
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

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  const handleSaveSettingModal = column => {
    let tableColumn = column
        .filter(col => col.visible === true)
        .map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({ column: tableColumn });
    createTableConfiguration({
        moduleName: 'Reports-salesReports',
        columnsOrder: data,
    });
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns();
};

useEffect(()=>{
  fetchTableConfiguration({ module: 'Reports-salesReports' })
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
    const column = SalesReports_TABLE_SETTING_DATA
    .filter(column => column.visible === true)
    .map(column => column.dataIndex);
  setVisibleColumns(column);
  setTableSettingData(SalesReports_TABLE_SETTING_DATA );
  }
}, [tableConfiguration]);

const getColumns = ({column}) => {
  const columns = [];
  
  columns[column.indexOf('salesman_name')]={
      title: types[filters.type].label_column,
      dataIndex:'salesman_name',
      width: 160,
      align: 'left',
      ellipsis: true,
      render: (value, row) =>
        row.isTotal ? null : (
          <Tooltip placement="topLeft" title={row[types[filters.type].columnName] || ''}>
            <span>{row[types[filters.type].columnName] || '-'}</span>
          </Tooltip>
        ),
    };
  columns[column.indexOf('invoice_count')]= {
      title: 'Qaimə sayı',
      dataIndex: 'invoice_count',
      width: 120,
      align: 'center',
    };
  columns[column.indexOf('revenue')]= {
      title: 'Satış dövriyyəsi',
      dataIndex: 'revenue',
      width: 180,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(
          roundTo(Number(value), 2).toFixed(2)
        )} ${mainCurrencyCode}`,
    };
  columns[column.indexOf('cost_of_goods_sold')]= {
      title: 'Maya dəyəri',
      dataIndex: 'cost_of_goods_sold',
      width: 200,
      align: 'right',
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode}`,
    };
  columns[column.indexOf('margin')]={
      title: 'Marja',
      dataIndex: 'margin',
      width: 180,
      align: 'center',
      render: (value, row) =>
        Number(row.revenue)
          ? `${formatNumberToLocale(
              roundTo(
                ((Number(row.revenue) - Number(row.cost_of_goods_sold)) /
                  Number(row.revenue)) *
                  100,
                2
              ).toFixed(2)
            )}%`
          : '0.00%',
    };
  columns[column.indexOf('profit')]={
      title: 'Mənfəət',
      dataIndex: 'profit',
      width: 180,
      align: 'right',
      render: (value, row) =>
        `${formatNumberToLocale(
          roundTo(
            Number(row.revenue) - Number(row.cost_of_goods_sold),
            2
          ).toFixed(2)
        )} ${mainCurrencyCode}`,
    };
  columns[column.indexOf('profitValue')]={
      title: 'Mənfəətdə pay',
      dataIndex: 'profitValue',
      width: 180,
      align: 'center',
      render: (value, row) =>
        row.revenue
          ? row.isTotal ||
            calculateTotalProfit(Object.values(salesReports || [])) === 0
            ? '100.00%'
            : `${formatNumberToLocale(
                roundTo(
                  ((Number(row.revenue) - Number(row.cost_of_goods_sold)) /
                    calculateTotalProfit(Object.values(salesReports || []))) *
                    100,
                  2
                ).toFixed(2)
              )}%`
          : '0.00%',
    };
    columns.push({
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: (value, row) =>
        row.isTotal ? null : (
          <DetailButton onClick={() => handleDetailsModal(row)} />
        ),
    });
  
    columns.unshift({
      title: '№',
      width: 60,
      render: (value, row, index) => (row.isTotal ? null : (currentPage - 1) * pageSize + index + 1),
      align: 'left',
    });

    return columns;

};


const getExcelColumns = (mainCurrencyCode,types) => {
  let columnClone = [...visibleColumns];
  let columns = []
  columns[columnClone.indexOf('salesman_name')] = {
    title: types[filters.type]?.label_column,
    width: { wpx: 150 },
  };
  columns[columnClone.indexOf('invoice_count')] = {
    title: 'Qaimə sayı',
    width: { wpx: 150 },
  };

  columns[columnClone.indexOf('revenue')] = {
    title: `Satış dövriyyəsi (${mainCurrencyCode})`,
    width: { wpx: 150 },
  };
  
  columns[columnClone.indexOf('cost_of_goods_sold')] = {
    title: `Maya dəyəri (${mainCurrencyCode})`,
    width: { wpx: 200 },
  };

  columns[columnClone.indexOf('margin')] = {
    title: 'Marja',
    width: { wpx: 120 },
  };

  columns[columnClone.indexOf('profit')] = {
    title: `Mənfəət (${mainCurrencyCode})`,
    width: { wpx: 150 },
  };

  columns[columnClone.indexOf('profitValue')] = {
    title: 'Mənfəətdə pay',
    width: { wpx: 120 },
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

  const data = exSalesReports.map((item, index) => {   
    let arr = []
    columnClone.includes('salesman_name') && (arr[columnClone.indexOf('salesman_name')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item[types[filters.type].columnName]|| '-', });
    columnClone.includes('invoice_count') && (arr[columnClone.indexOf('invoice_count')] ={ value: item.invoice_count || '-',style:item?.isTotal?columnFooterStyle:'' });
    columnClone.includes('revenue') && (arr[columnClone.indexOf('revenue')] = { value: item.revenue?Number(roundTo(Number(item.revenue), 2).toFixed(2)):'-',style:item?.isTotal?columnFooterStyle:'' });
    columnClone.includes('cost_of_goods_sold') && (arr[columnClone.indexOf('cost_of_goods_sold')] = { value: item.cost_of_goods_sold?Number(defaultNumberFormat(item.cost_of_goods_sold)) :'-',style:item?.isTotal?columnFooterStyle:'' });
    columnClone.includes('margin') && (arr[columnClone.indexOf('margin')] = { value:  Number(item.revenue)
      ? `${formatNumberToLocale(roundTo(((Number(item.revenue) - Number(item.cost_of_goods_sold)) /Number(item.revenue)) *100,2).toFixed(2))}%`: '0.00%',style:item?.isTotal?columnFooterStyle:'' });
    columnClone.includes('profit') && (arr[columnClone.indexOf('profit')] = { value: Number(roundTo(Number(item.revenue) - Number(item.cost_of_goods_sold),2).toFixed(2))||'-',style:item?.isTotal?columnFooterStyle:'' });
    columnClone.includes('profitValue') && (arr[columnClone.indexOf('profitValue')] = { value: item.revenue? item.isTotal ||
        calculateTotalProfit(Object.values(salesReports || [])) === 0
        ? '100.00%'
        : `${formatNumberToLocale(roundTo(((Number(item.revenue) - Number(item.cost_of_goods_sold)) /calculateTotalProfit(Object.values(salesReports || [])))*100,2).toFixed(2))}%`: '0.00%',style:item?.isTotal?columnFooterStyle:'' }); 
    
   arr.unshift(item.isTotal?{value:'Toplam:',style:columnFooterStyle}:{ value:index + 1, })
    return arr;
   
  })
  setExcelData(data);
}


useEffect(() => {
  getExcelColumns(mainCurrencyCode,types)
}, [visibleColumns,mainCurrencyCode,types[filters.type]])

useEffect(() => {
  getExcelData()
}, [exSalesReports]);
  return (
    <div>
      <AddFormModal
        width={1300}
        withOutConfirm
        onCancel={handleDetailsModal}
        visible={details}
      >
        <SalesReportDetails
          filters={filter}
          type={filters.type}
          row={selectedRow}
          mainCurrencyCode={mainCurrencyCode}
          onCancel={handleDetailsModal}
          visible={details}
        />
      </AddFormModal>
      <TableConfiguration
         saveSetting={handleSaveSettingModal}
         visible={Tvisible}
         AllStandartColumns={SalesReports_TABLE_SETTING_DATA}
         setVisible={toggleVisible}
         columnSource={tableSettingData}
          />
      <SalesReportSidebar
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
        profile={profile}
        handlePaginationChange={handlePaginationChange}
        thisMonthEnd={thisMonthEnd}
        thisMonthStart={thisMonthStart}
      />
      <section className="scrollbar aside">
        <div style={{ margin: '0px 31px' }}>
          <Row style={{ margin: '15px 0 ' }}>
            <Col span={6} offset={18} align="end">
            <div 
               style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'flex-end',
               }}>
              <Can I={accessTypes.manage} a={permissions.sales_report}>
              <SettingButton onClick={toggleVisible} />
        
               <ExportToExcel
                   getExportData={
                   () => fetchAllSalesReports(
                    {
                   filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                        setExSalesReports(getTotalValues(Object.values(data.data)))
                       }
                   })
                   }
                   data={excelData}
                   columns={excelColumns}
                   excelTitle="Satış hesabatı"
                   excelName="Satış hesabatı"
                   filename="Satış hesabatı"
                   count={salesReportsCount}
               />
              </Can>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                loading={isLoading}
                scroll={{ x: 'max-content', y: 600 }}
                className={styles.tableFooter}
                dataSource={
                  salesReports && getTotalValues(Object.values(salesReports))
                }
                columns={getColumns({column: visibleColumns})}
                rowKey={record => record.rowId}
                footer={false}
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
              <Pagination
                loading={isLoading}
                defaultCurrent={currentPage}
                current={currentPage}
                className={styles.customPagination}
                defaultPageSize={8}
                pageSize={pageSize}
                onChange={handlePaginationChange}
                total={salesReportsCount}
                size="small"
              />
            </Col>
            <Col span={6} offset={2} align="end">
              <Select
                defaultValue={8}
                className={styles.pageSize}
                size="large"
                onChange={e => handlePageSizeChange(currentPage, e)}
              >
                {pages.map(page => (
                  <Select.Option
                    key={page}
                    value={page}
                    className={styles.dropdown}
                  >
                    {page}
                  </Select.Option>
                ))}
              </Select>
              <span className={styles.totalNumber}>
                Ədəd: {salesReportsCount}
              </span>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.salesReport.isLoading,
  actionIsLoading: state.salesReport.actionIsLoading,
  salesReports: state.salesReport.salesReports,
  salesReportsCount: state.salesReport.salesReportsCount,
  mainCurrencyCode: state.salesReport.mainCurrencyCode,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchAllSalesReports,
    fetchTableConfiguration,
    createTableConfiguration,
    fetchSalesReports,
    fetchSalesReportsCount,
    fetchBusinessUnitList,
  }
)(SalesReport);
