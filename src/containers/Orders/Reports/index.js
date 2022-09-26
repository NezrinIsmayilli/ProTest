import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Pagination, Select, Tooltip } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import {
  ExcelButton,
  Table,
  Can,
  DetailButton,
  ProPageSelect,
  ProPagination,
} from 'components/Lib';
import {
  fetchOrderReports,
  fetchOrderReportsCount,
} from 'store/actions/reports/order-report';
import { accessTypes, permissions } from 'config/permissions';
import {
  thisMonthStart,
  thisMonthEnd,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import { AddFormModal } from 'containers/Settings/#shared';
import { types } from './types';
import SalesReportSidebar from './Sidebar';
import styles from '../styles.module.scss';
import SalesReportDetails from './salesReportDetails';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import {useHistory, useLocation } from 'react-router-dom';
const ExportJsonExcel = require('js-export-excel');

const Reports = props => {
  const {
    // states
    isLoading,
    orderReports,
    orderReportsCount,
    // functions
    fetchOrderReports,
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
  const [details, setDetails] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [filter, setFilter] = useState({});

  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
    let key = '';
    let value = [];
    if (row.partnerId) {
      key = 'partners';
      value = [row.partnerId];
    } else if (row.deliveredByTenantPerson) {
      key = 'deliveredByTenantPersons';
      value = [row.deliveredByTenantPerson];
    }
    const filter = {
      [key]: value,
      statusGroup: 4,
      direction: filters.direction,
      limit: 1000,
      page: 1,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };
    setFilter(filter);
  };

  const getTotalValues = reportsInfo =>
    reportsInfo
      ? [
          ...reportsInfo,
          {
            isTotal: true,
            totalPrice: reportsInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.totalPrice),
              0
            ),
            amount: reportsInfo.reduce(
              (totalValue, currentValue) =>
                totalValue + Number(currentValue.amount),
              0
            ),
          },
        ]
      : [];

  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      type:params.type ? params.type :  'grouped-by-contact',
      dateFrom:params.dateFrom ? params.dateFrom :  thisMonthStart,
      dateTo:params.dateTo ? params.dateTo :  thisMonthEnd,
      direction:params.direction ? params.direction :  1,
      limit: pageSize,
      page: currentPage,
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if (typeof filters.history === 'undefined') {
          history.push({
              search: query,
          });
      }
      fetchOrderReports(filters.type, filters);
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
          parmas.history = 1;

          if (parmas.page && !isNaN(parmas.page)) {
              setCurrentPage(parseInt(parmas.page));
          }
          setFilters({ ...parmas });
      }
  }, [rerender]);

  // Pagination Change
  const handlePaginationChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  // Pagination Selectbox
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
      width: 100,
      render: (_value, row, index) =>
        row.isTotal ? 'Toplam' : (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: types[filters.type].label_column,
      dataIndex: types[filters.type].columnName,
      width: 160,
      align: 'left',
      ellipsis: true,
      render: (value, row) =>
        row.isTotal ? null : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
    },
    {
      title: 'Sifariş sayı',
      dataIndex: 'amount',
      width: 150,
      align: 'center',
      render: (value, row) => value || '-',
    },
    {
      title: 'Sifariş dövriyyəsi',
      dataIndex: 'totalPrice',
      width: 150,
      align: 'center',
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${'AZN'}`,
    },
    {
      title: 'Sifariş saynda pay, %',
      dataIndex: 'quantityPercentage',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? '100%'
          : `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${'%'}`,
    },
    {
      title: 'Sifariş dövriyyəsində pay, %',
      dataIndex: 'pricePercentage',
      width: 150,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? '100%'
          : `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${'%'}`,
    },
    {
      title: 'Seç',
      width: 100,
      align: 'center',
      render: row => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DetailButton onClick={() => handleDetailsModal(row)} />
        </div>
      ),
    },
  ];

  // Excel Export data
  function exportExcelAll() {
    const option = {};
    let num = 0;
    const dataTable = orderReports.map(dataItem => ({
      Nömrə: (num += 1),
      Qarsi_teref: dataItem.name,
      Sifaris_sayi: dataItem.amount,
      Sifaris_dovriyyesi: `${formatNumberToLocale(
        defaultNumberFormat(dataItem.totalPrice || 0)
      )} ${'AZN'}`,
      Pay: `${formatNumberToLocale(
        defaultNumberFormat(dataItem.quantityPercentage || 0)
      )} ${'%'}`,
      Pay_2: `${formatNumberToLocale(
        defaultNumberFormat(dataItem.pricePercentage || 0)
      )} ${'%'}`,
    }));

    option.fileName = 'Hesabatlar';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Nömrə',
          'Qarsi_teref',
          'Sifaris_sayi',
          'Sifaris_dovriyyesi',
          'Pay',
          'Pay_2',
        ],
        sheetHeader: [
          '№',
          'Qarşı tərəf',
          'Sifariş sayı',
          'Sifariş dövriyyəsi',
          'Sifariş saynda pay, %',
          'Sifariş dövriyyəsində pay, %',
        ],
        columnWidths: [5, 10, 10, 10, 10, 10, 10, 20],
      },
    ];

    const toExcel = new ExportJsonExcel(option);

    toExcel.saveExcel();
  }

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
          onCancel={handleDetailsModal}
          visible={details}
        />
      </AddFormModal>
      <SalesReportSidebar
      filters={filters}
      onFilter={onFilter}
      handlePaginationChange={handlePaginationChange}
      thisMonthStart={thisMonthStart}
      thisMonthEnd={thisMonthEnd}
          />
      <section className="scrollbar aside">
        <div style={{ margin: '0px 31px' }}>
          <Row style={{ margin: '15px 0 ' }}>
            <Col span={6} offset={18} align="end">
              <Can I={accessTypes.manage} a={permissions.order_report}>
                <ExcelButton onClick={exportExcelAll} />
              </Can>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                loading={isLoading}
                scroll={{ x: 'max-content', y: 600 }}
                className={styles.tableFooter}
                dataSource={
                  orderReports && getTotalValues(Object.values(orderReports))
                }
                columns={columns}
                rowKey={record => record.rowId}
                footer={false}
              />
            </Col>
          </Row>
          <Row
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Col span={8}>
              <ProPagination
                isLoading={isLoading}
                current={currentPage}
                pageSize={pageSize}
                onChange={handlePaginationChange}
                total={orderReportsCount}
              />
            </Col>
            <Col span={6} offset={10} align="end">
              <ProPageSelect
                pageSize={pageSize}
                onChange={e => handlePageSizeChange(currentPage, e)}
                total={orderReportsCount}
              />
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.orderReportReducer.isLoading,
  actionIsLoading: state.orderReportReducer.actionIsLoading,
  orderReports: state.orderReportReducer.orderReports,
  orderReportsCount: state.orderReportReducer.orderReportsCount,
  mainCurrencyCode: state.orderReportReducer.mainCurrencyCode,
});

export default connect(
  mapStateToProps,
  {
    fetchOrderReports,
    fetchOrderReportsCount,
  }
)(Reports);
