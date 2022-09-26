/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Row, Col, Button, Spin, Tooltip } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import {
  Table,
  ExcelButton,
  Can,
  DetailButton,
  ProModal,
  ProPageSelect,
  ProPagination,
  TableConfiguration,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchContacts } from 'store/actions/contact';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
  fetchUsedCurrencies,
  setUsedCurrencies,
} from 'store/actions/settings/kassa';
import {
  fetchDebtsTurnovers,
  setDebtsTurnovers,
  fetchDebtsTurnoversCount,
} from 'store/actions/reports/debts-turnovers';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import {
  formatDate,
  thisMonthStart,
  thisMonthEnd,
  formatNumberToLocale,
} from 'utils';
import { accessTypes, permissions } from 'config/permissions';
import DebtsTurnoversSidebar from './Sidebar';
import DebtsTurnoverDetails from './DebtsTurrnoverDetails/debtsTurnoverDetails';
import { handleExport } from './utils';
import styles from '../styles.module.scss';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
import { DebstTurnovers_TABLE_SETTING_DATA } from 'utils/table-config/reportsModule';
import { fetchAllDebtsTurnovers } from 'store/actions/export-to-excel/reportsModule';
const DebtsTurnovers = props => {
  const {
    // states
    isLoading,
    fetchTableConfiguration,
    createTableConfiguration,
    tableConfiguration,
    currenciesIsLoading,
    usedCurrencies,
    debtsTurnovers = [],
    debtsTurnoversCount,
    // functions
    fetchUsedCurrencies,
    fetchDebtsTurnovers,
    fetchAllDebtsTurnovers,
    profile,
    fetchBusinessUnitList,
    businessUnits,
    fetchContacts,
    fetchDebtsTurnoversCount,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
  });
  const [debtType, setDebtType] = useState(params.type ? params.type : 'receivables-turnover');
  const [selectedCurrency, setSelectedCurrency] = useState(undefined);
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [StartDate, setStartDate] = useState(params.operationDateStart != thisMonthStart ? params.operationDateStart : null);
  const [EndDate, setEndDate] = useState(params.operationDateEnd != thisMonthEnd ? params.operationDateEnd : null);
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(DebstTurnovers_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exSalesReports, setExSalesReports] = useState([]);

  const [filters, onFilter, setFilters] = useFilterHandle(
    {
      type: params.type ? params.type : undefined,
      page: currentPage,
      limit: pageSize,
      currencyId: params.currencyId ? params.currencyId : undefined,
      operationDateStart: params.operationDateStart ? params.operationDateStart : thisMonthStart,
      operationDateEnd: params.operationDateEnd ? params.operationDateEnd : thisMonthEnd,
      contacts: params.contacts ? params.contacts : undefined,
      businessUnitIds:
        params.businessUnitIds ? params.businessUnitIds :
          (businessUnits?.length === 1
            ? businessUnits[0]?.id !== null
              ? [businessUnits[0]?.id]
              : undefined
            : undefined),
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if (typeof (filters['history']) == 'undefined') {
        history.push({
          search: query,
        });
      }
    });


  const [rerender, setRerender] = useState(0);
  const popstateEvent = () => {
    setRerender(rerender + 1);
  }

  useEffect(() => {
    window.addEventListener('popstate', popstateEvent);
    return (() => window.removeEventListener('popstate', popstateEvent));
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

  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
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

  useEffect(() => {
    if (usedCurrencies?.length > 0) {
      toggleFetch(filters, debtType);
    }
  }, [filters]);

  useEffect(() => {
    handlePaginationChange(filters.page ? filters.page : 1)
  }, []);

  const getColumns = ({ column }) => {
    const columns = [];

    columns[column.indexOf('contrpartyFullName')] = {
      title: 'Qarşı tərəf',
      dataIndex: 'contrpartyFullName',
      width: 150,
      align: 'left',
      ellipsis: true,
      render: (value, row) =>
        row.total ? null : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
    };
    columns[column.indexOf('startOfThePeriod')] = {
      title: 'Dövrün əvvəli',
      dataIndex: 'startOfThePeriod',
      width: 150,
      align: 'right',
      render: (value, row) =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${row.currencyCode}`,
    };
    columns[column.indexOf('debtReduction')] = {
      title: 'Borcun azalması',
      dataIndex: 'debtReduction',
      width: 150,
      align: 'right',
      render: (value, row) =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${row.currencyCode}`,
    };
    columns[column.indexOf('debtIncreasment')] = {
      title: 'Borcun artması',
      dataIndex: 'debtIncreasment',
      width: 150,
      align: 'right',
      render: (value, row) =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${row.currencyCode}`,
    };
    columns[column.indexOf('endOfThePeriod')] = {
      title: 'Dövrün sonu',
      dataIndex: 'endOfThePeriod',
      width: 150,
      align: 'center',
      render: (value, row) =>
        `${formatNumberToLocale(Number(value).toFixed(2))} ${row.currencyCode}`,
    };
    columns[column.indexOf('dynamics')] = {
      title: 'Dinamika',
      dataIndex: 'dynamics',
      width: 150,
      align: 'right',
      render: (value, row) => (
        <span
          style={
            row.total
              ? { color: '#FFFFFF' }
              : Number(value) < 0
                ? { color: '#55AB' }
                : Number(value) > 0
                  ? { color: '#FF716A' }
                  : { color: '#373737' }
          }
        >
          {formatNumberToLocale(Number(value).toFixed(2))} {row.currencyCode}
        </span>
      ),
    };
    columns[column.indexOf('dynamicsPercentage')] = {
      title: 'Dinamika(%)',
      dataIndex: 'dynamicsPercentage',
      width: 140,
      align: 'center',
      render: (value, row) => (
        <span
          style={
            Number(value) < 0
              ? { color: '#55AB' }
              : Number(value) > 0
                ? { color: '#FF716A' }
                : { color: '#373737' }
          }
        >
          {row.total
            ? null
            : `${formatNumberToLocale(Number(value).toFixed(2))}%`}
        </span>
      ),
    };
    columns.push({
      title: 'Seç',
      dataIndex: 'id',
      width: 85,
      align: 'center',
      render: (value, row) =>
        row.total ? null : (
          <DetailButton onClick={() => handleDetailsModal(row)} />
        ),
    });

    columns.unshift({
      title: '№',
      width: 90,
      align: 'left',
      render: (value, row, index) => (row.total ? 'Toplam' : (filters.page - 1) * filters.limit + index + 1),
    });

    return columns;

  }
  const toggleFetch = (filters, debtType) => {
    if (filters.currencyId !== undefined) {
      fetchDebtsTurnovers(filters, debtType);
      fetchDebtsTurnoversCount(filters, debtType);
    }
  };
  const handleCurrencyChange = currency => {
    setSelectedCurrency(currency);
    onFilter('currencyId', currency.id);
    onFilter('page', 1)
    setCurrentPage(1)
  };

  const handleTypeChange = type => {
    setDebtType(type);
    onFilter('type', type);
    onFilter('page', 1);
    setCurrentPage(1);
    fetchUsedCurrencies(
      {
        usedInInvoice: true,
        invoiceType: type === 'receivables-turnover' ? [2, 4, 13] : [1, 3, 12],
      },
      ({ data }) => {
        if (data.length > 0) {
          onFilter('currencyId', data[0].id);
        } else {
          dispatch(setDebtsTurnovers({ data: [] }));
          onFilter('currencyId', undefined);
        }
      }
    );
  };

  const handleDateChange = (startValue, endValue) => {
    handlePaginationChange(1);
    setStartDate(startValue);
    setEndDate(endValue);
    if (startValue) onFilter('operationDateStart', formatDate(startValue));
    if (endValue) onFilter('operationDateEnd', formatDate(endValue));
    // eslint-disable-next-line no-unused-expressions
    // if(usedCurrencies.length > 0 && !isLoading && !currenciesIsLoading && filters.currencyId){
    //   fetchDebtsTurnovers(
    //     {
    //       ...filters,
    //       operationDateStart: startValue ? formatDate(startValue) : undefined,
    //       operationDateEnd: endValue ? formatDate(endValue) : undefined,
    //     },
    //     debtType
    //   );
    //   fetchDebtsTurnoversCount(
    //     {
    //       ...filters,
    //       operationDateStart: startValue ? formatDate(startValue) : undefined,
    //       operationDateEnd: endValue ? formatDate(endValue) : undefined,
    //     },
    //     debtType
    //   );}
  };

  const handleTableDataWithSummaryRow = data => {
    const totalStartOfThePeriod = data.reduce(
      (totalValue, currentValue) =>
        Number(currentValue.startOfThePeriod) + totalValue,
      0
    );
    const totalDebtReduction = data.reduce(
      (totalValue, currentValue) =>
        Number(currentValue.debtReduction) + totalValue,
      0
    );
    const totalDebtIncreasment = data.reduce(
      (totalValue, currentValue) =>
        Number(currentValue.debtIncreasment) + totalValue,
      0
    );

    const totalEndOfThePeriod = data.reduce(
      (totalValue, currentValue) =>
        Number(currentValue.endOfThePeriod) + totalValue,
      0
    );

    const totalDynamics = Math.abs(totalStartOfThePeriod - totalEndOfThePeriod);

    return [
      ...data.map(dataItem => ({
        ...dataItem,
        currencyCode: selectedCurrency?.code,
      })),
      {
        total: true,
        startOfThePeriod: totalStartOfThePeriod,
        debtReduction: totalDebtReduction,
        debtIncreasment: totalDebtIncreasment,
        endOfThePeriod: totalEndOfThePeriod,
        dynamics: totalDynamics,
        currencyCode: selectedCurrency?.code,
      },
    ];
  };

  useEffect(() => {
    fetchUsedCurrencies(
      {
        usedInInvoice: true,
        invoiceType: [2, 4, 13],
      },
      data => {
        if (data.length > 0) {
          onFilter('currencyId', data[0].id);
        }
      }
    );
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
    return () => {
      dispatch(setUsedCurrencies({ data: [] }));
      dispatch(setDebtsTurnovers({ data: [] }));
    };
  }, []);
  useEffect(() => {

    if (filters.currencyId && usedCurrencies.length > 0) {

    }
    if (usedCurrencies.length > 0) {
      if (!filters.currencyId) {
        setSelectedCurrency(usedCurrencies[0]);
        onFilter('currencyId', usedCurrencies[0].id);
      }
      else {
        setSelectedCurrency(usedCurrencies?.find(currency => currency.id == Number(filters.currencyId)));
        onFilter('currencyId', usedCurrencies?.find(currency => currency.id == Number(filters.currencyId)).id);
      }
    }

    // else if(usedCurrencies.length > 0 ){ 
    //   onFilter('currencyId',usedCurrencies?.find(currency=>currency.id==Number(filters.currencyId)).id);
    // }
  }, [usedCurrencies]);

  const handleSaveSettingModal = column => {
    let tableColumn = column
      .filter(col => col.visible === true)
      .map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({ column: tableColumn });
    createTableConfiguration({
      moduleName: 'Reports-DebtsTurnover',
      columnsOrder: data,
    });
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns();
  };

  useEffect(() => {
    fetchTableConfiguration({ module: 'Reports-DebtsTurnover' })
  }, []);

  // set Table Configuration data and set visible columns
  useEffect(() => {
    if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
      let parseData = JSON.parse(tableConfiguration)
      let columns = parseData.filter(column => column.visible === true)
        .map(column => column.dataIndex);
      setVisibleColumns(columns)
      setTableSettingData(parseData)
    }
    else if (tableConfiguration == null) {
      const column = DebstTurnovers_TABLE_SETTING_DATA
        .filter(column => column.visible === true)
        .map(column => column.dataIndex);
      setVisibleColumns(column);
      setTableSettingData(DebstTurnovers_TABLE_SETTING_DATA);
    }
  }, [tableConfiguration]);

  const getExcelColumns = (usedCurrencies, selectedCurrency) => {
    let columnClone = [...visibleColumns];
    let columns = []
    columns[columnClone.indexOf('contrpartyFullName')] = {
      title: 'Qarşı tərəf',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf(`startOfThePeriod`)] = {
      title: `Dövrün əvvəli (${usedCurrencies?.find(currency => currency.id == selectedCurrency?.id)?.code})`,
      width: { wpx: 150 },
    };

    columns[columnClone.indexOf('debtReduction')] = {
      title: `Borcun azalması (${usedCurrencies?.find(currency => currency.id == selectedCurrency?.id)?.code})`,
      width: { wpx: 150 },
    };

    columns[columnClone.indexOf('debtIncreasment')] = {
      title: `Borcun artması (${usedCurrencies?.find(currency => currency.id == selectedCurrency?.id)?.code})`,
      width: { wpx: 200 },
    };

    columns[columnClone.indexOf('endOfThePeriod')] = {
      title: `Dövrün sonu (${usedCurrencies?.find(currency => currency.id == selectedCurrency?.id)?.code})`,
      width: { wpx: 120 },
    };

    columns[columnClone.indexOf('dynamics')] = {
      title: `Dinamika (${usedCurrencies?.find(currency => currency.id == selectedCurrency?.id)?.code})`,
      width: { wpx: 150 },
    };

    columns[columnClone.indexOf('dynamicsPercentage')] = {
      title: 'Dinamika(%)',
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
      columnClone.includes('contrpartyFullName') && (arr[columnClone.indexOf('contrpartyFullName')] = item?.total ? { value: '', style: columnFooterStyle } : { value: item.contrpartyFullName || '-', });
      columnClone.includes('startOfThePeriod') && (arr[columnClone.indexOf('startOfThePeriod')] = { value: Number(Number(item.startOfThePeriod).toFixed(2)), style: item?.total ? columnFooterStyle : '' });
      columnClone.includes('debtReduction') && (arr[columnClone.indexOf('debtReduction')] = { value: Number(Number(item.debtReduction || 0).toFixed(2)), style: item?.total ? columnFooterStyle : '' });
      columnClone.includes('debtIncreasment') && (arr[columnClone.indexOf('debtIncreasment')] = { value: Number(Number(item.debtIncreasment || 0).toFixed(2)), style: item?.total ? columnFooterStyle : '' });
      columnClone.includes('endOfThePeriod') && (arr[columnClone.indexOf('endOfThePeriod')] = { value: Number(Number(item.endOfThePeriod || 0).toFixed(2)), style: item?.total ? columnFooterStyle : '' });
      columnClone.includes('dynamics') && (arr[columnClone.indexOf('dynamics')] = { value: Number(Number(item.dynamics || 0).toFixed(2)), style: item?.total ? columnFooterStyle : '' });
      columnClone.includes('dynamicsPercentage') && (arr[columnClone.indexOf('dynamicsPercentage')] = item?.total ? { value: '', style: columnFooterStyle } : { value: `${formatNumberToLocale(Number(item.dynamicsPercentage).toFixed(2))}%` || '-', });

      arr.unshift(item.total ? { value: 'Toplam:', style: columnFooterStyle } : { value: index + 1, })
      return arr;

    })
    setExcelData(data);
  }


  useEffect(() => {
    getExcelColumns(usedCurrencies, selectedCurrency)
  }, [visibleColumns, usedCurrencies, selectedCurrency]);

  useEffect(() => {
    getExcelData()
  }, [exSalesReports]);
  return (
    <div>
      <ProModal
        maskClosable
        padding
        centered
        width={1300}
        handleModal={() => setDetails(false)}
        visible={details}
      >
        <DebtsTurnoverDetails
          filters={filters}
          type={debtType}
          row={selectedRow}
          selectedCurrency={selectedCurrency}
          onCancel={handleDetailsModal}
          visible={details}
        />
      </ProModal>
      <TableConfiguration
        saveSetting={handleSaveSettingModal}
        visible={Tvisible}
        AllStandartColumns={DebstTurnovers_TABLE_SETTING_DATA}
        setVisible={toggleVisible}
        columnSource={tableSettingData}
      />
      <DebtsTurnoversSidebar
        fetchContacts={fetchContacts}
        fetchBusinessUnitList={fetchBusinessUnitList}
        filters={filters}
        onFilter={onFilter}
        debtType={debtType}
        handleTypeChange={handleTypeChange}
        handleDateChange={handleDateChange}
        businessUnits={businessUnits}
        profile={profile}
        handlePaginationChange={handlePaginationChange}
        StartDate={StartDate}
        EndDate={EndDate}
      />
      <section className="scrollbar aside">
        <div style={{ margin: '0px 31px' }}>
          <Row style={{ margin: '15px 0 ' }}>
            <Col span={12}>
              <div className={styles.currenciesOption}>
                <Spin spinning={currenciesIsLoading}>
                  {usedCurrencies.length > 1
                    ? usedCurrencies.map(currency => (
                      <Button
                        key={currency.id}
                        className={`${styles.currencyButton} ${selectedCurrency?.id === currency.id
                            ? styles.activeCurrencyButton
                            : null
                          }`}
                        onClick={() => {
                          handleCurrencyChange(currency);
                        }}
                        currency={currency}
                      >
                        {currency.code}
                      </Button>
                    ))
                    : null}
                </Spin>
              </div>
            </Col>
            <Col span={6} offset={6} align="end">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <Can I={accessTypes.manage} a={permissions.debt_turnover}>
                  <SettingButton onClick={toggleVisible} />

                  <ExportToExcel
                    getExportData={
                      () => fetchAllDebtsTurnovers(
                        {
                          filters: { ...filters, limit: 5000, page: undefined }, onSuccessCallback: data => {
                            setExSalesReports(handleTableDataWithSummaryRow(data.data))
                          },
                          debtType
                        })
                    }
                    data={excelData}
                    columns={excelColumns}
                    excelTitle={`Borc dövriyyəsi - ${debtType == 'receivables-turnover' ? 'Debitor Borclar' : 'Kreditor Borclar'}`}
                    excelName="Borc dövriyyəsi"
                    filename="Borc dövriyyəsi"
                    count={debtsTurnoversCount}
                  />

                </Can>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                loading={isLoading || currenciesIsLoading}
                className={styles.tableFooter}
                scroll={{ x: 'max-content', y: 600 }}
                dataSource={
                  debtsTurnovers?.length > 0
                    ? handleTableDataWithSummaryRow(debtsTurnovers)
                    : []
                }
                columns={getColumns({ column: visibleColumns })}
                rowKey={row => row.id}
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
                total={debtsTurnoversCount}
              />
            </Col>
            <Col span={6} offset={2} align="end">
              <ProPageSelect
                currentPage={currentPage}
                pageSize={pageSize}
                total={debtsTurnoversCount}
                onChange={e => handlePageSizeChange(currentPage, e)}
              />
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.debtsTurnovers.isLoading,
  currenciesIsLoading: state.kassaReducer.isBalanceLoading,
  actionIsLoading: state.debtsTurnovers.actionIsLoading,
  usedCurrencies: state.kassaReducer.usedCurrencies,
  debtsTurnovers: state.debtsTurnovers.debtsTurnovers,
  debtsTurnoversCount: state.debtsTurnovers.debtsTurnoversCount,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchUsedCurrencies,
    fetchTableConfiguration,
    createTableConfiguration,
    fetchDebtsTurnovers,
    fetchAllDebtsTurnovers,
    fetchBusinessUnitList,
    fetchContacts,
    fetchDebtsTurnoversCount,
  }
)(DebtsTurnovers);

