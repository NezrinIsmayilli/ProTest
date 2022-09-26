/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// components
import { Row, Col, Button } from 'antd';
import {
  Sidebar,
  ProSearch,
  ProSelect,
  ProPanel,
  ProCollapse,
  ProDateRangePicker,
  Table,
  TableFooter,
  ProFilterButton,
} from 'components/Lib';
import { FaInfoCircle } from 'react-icons/fa';

// utils and hooks
import {
  getQueryStringFromUrl,
  addQueryStringToURL,
  dateFormat,
  thisWeekStart,
  thisWeekEnd,
} from 'utils';
import { usePrevious, useFilterHandle } from 'hooks';

// actions
import { fetchInvoiceInfo } from 'store/actions/operations';
import { fetchClients } from 'store/actions/relations';
import { fetchEmployees } from 'store/actions/employees';
import { fetchActiveCurrencies } from 'store/actions/settings/kassa';

import {
  fetchFilteredSalesProfit,
  fetchFilteredSalesProfitReturned,
  searchInvoiceHandle,
} from 'store/actions/salesReport';

import DetailsModal from './DetailsModal';

import styles from './styles.module.scss';

function Report(props) {
  const {
    isLoading,
    invoiceLoading,
    profitList,
    profitReturnedList,
    invoiceInfo = {},
    employees,
    clients,
    mainCurrency,

    // actions
    fetchFilteredSalesProfit,
    fetchFilteredSalesProfitReturned,
    fetchInvoiceInfo,
    fetchClients,
    fetchEmployees,
    fetchActiveCurrencies,

    searchInvoiceHandle,
  } = props;

  // satis/geri qaytarma tabs (default 1 selected) [1, 2]
  const [activeTab, setActiveTab] = useState(
    getQueryStringFromUrl('tab', '1', [1, 2])
  );

  const oldTab = usePrevious(activeTab);

  const isSales = activeTab === '1';
  const isReturn = activeTab === '2';
  const listData = isSales ? profitList : profitReturnedList;

  const modalRef = useRef(null);

  // make last table column
  function getProfitColumn(_, rowData) {
    const { invoiceId, purchasePrice, salesPrice } = rowData;

    const profit = isSales
      ? (Number(salesPrice) - Number(purchasePrice)).toFixed(2)
      : null;

    return (
      <div className={styles.lastColumn}>
        <div className={styles.inner}>
          {profit}
          <Button
            type="link"
            className={styles.info}
            onClick={() => {
              modalRef.current.openModal();
              // don't fetch same invoiceInfo
              if (invoiceInfo.id !== invoiceId) {
                fetchInvoiceInfo(invoiceId);
              }
            }}
          >
            <FaInfoCircle />
          </Button>
        </div>
      </div>
    );
  }

  // table columns
  const columns = [
    {
      title: '№',
      key: 'invoiceId',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: value => value && value.substring(0, 10),
    },
    {
      title: 'Alıcı',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (_, rowData) =>
        `${rowData.clientName || ''} ${rowData.clientSurname || ''}`,
    },
    {
      title: 'Sənəd',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: `${'Alış qiyməti, '} ${mainCurrency.code || ''}`,
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: value => Number(value).toFixed(2),
    },
    {
      title: `${isSales ? 'Satış' : 'GA'} qiyməti, ${mainCurrency.code || ''}`,
      dataIndex: isSales ? 'salesPrice' : 'returnedPrice',
      key: 'price',
      render: value => Number(value).toFixed(2),
    },
    {
      title: isSales ? `Satışdan mənfəət, ${mainCurrency.code || ''}` : ' ',
      key: 'profit',
      render: getProfitColumn,
    },
  ];

  // handling table filter hook
  const [filters, onFilter] = useFilterHandle(
    {
      dateFrom: thisWeekStart,
      dateTo: thisWeekEnd,
      salesman: false,
      client: false,
    },
    isSales ? fetchFilteredSalesProfit : fetchFilteredSalesProfitReturned
  );

  const changeActiveTab = value => {
    setActiveTab(value);
    addQueryStringToURL('tab', value);
  };

  // catch tab changes, then fetch list,(useEffect cause second needless request)
  if (oldTab && oldTab !== activeTab) {
    if (isSales) {
      fetchFilteredSalesProfit({
        filters,
      });
    }
    if (isReturn) {
      fetchFilteredSalesProfitReturned({
        filters,
      });
    }
  }

  // fetch filter select options
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }

    if (clients.length === 0) {
      fetchClients();
    }
    // get main curency
    if (!mainCurrency.code) {
      fetchActiveCurrencies();
    }
  }, []);

  function onChangeDateHandle(startDate, endDate) {
    const from = moment(startDate).format(dateFormat);
    const to = moment(endDate).format(dateFormat);

    if (filters.dateFrom !== from) {
      onFilter('dateFrom', from);
    }

    if (filters.dateTo !== to) {
      onFilter('dateTo', to);
    }
  }

  // table footer prices
  const overallPrice = useMemo(() => {
    let totalPrice;

    // total profit price
    if (isSales) {
      totalPrice = profitList.reduce(
        (acc, item) =>
          (acc += Number(item.salesPrice) - Number(item.purchasePrice)),
        0
      );
    }

    // total returnedPirce
    if (isReturn) {
      totalPrice = profitReturnedList.reduce(
        (acc, item) => (acc += Number(item.returnedPrice)),
        0
      );
    }

    return `${Number(totalPrice).toFixed(2)} ${mainCurrency.code || ''}`;
  }, [profitList, profitReturnedList]);

  function onSearch(searchQuery) {
    searchInvoiceHandle({ searchQuery, isSales });
  }

  return (
    <>
      <Sidebar title="Satış Hesabatı">
        {/* Filters */}
        <ProSearch  onChange={e => {
                        if (e.target.value === '') {
                          onSearch(undefined);
                        }
                    }} onSearch={onSearch} placeholder="" />

        <ProCollapse defaultActiveKey="1">
          <ProPanel header="Tarix üzrə axtarış" key="1">
            <ProDateRangePicker
              getCalendarContainer={trigger => trigger.parentNode.parentNode}
              onChangeDate={onChangeDateHandle}
            />
          </ProPanel>
          <ProPanel header="Satış meneceri" key="2">
            <ProSelect
              allowClear
              showSearch
              placeholder="Satış meneceri"
              onChange={value => onFilter('salesman', value)}
              data={employees}
              keys={['name', 'lastName']}
            />
          </ProPanel>
          <ProPanel header="Alıcı" key="3">
            <ProSelect
              allowClear
              showSearch
              placeholder="Alıcı"
              onChange={value => onFilter('client', value)}
              data={clients}
              keys={['name', 'surname']}
            />
          </ProPanel>
        </ProCollapse>
      </Sidebar>

      <section className="aside scrollbar" style={{ paddingBottom: 100 }}>
        <Row>
          <Col span={24} className={styles.tableWrap}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <ProFilterButton
                onClick={() => {
                  changeActiveTab('1');
                }}
                active={isSales}
              >
                Satış
              </ProFilterButton>
              <ProFilterButton
                onClick={() => {
                  changeActiveTab('2');
                }}
                active={isReturn}
              >
                Geri alma
              </ProFilterButton>
            </div>

            {/* Table */}
            <Table
              dataSource={listData}
              columns={columns}
              rowKey={record => record.invoiceId}
              loading={isLoading}
              footer={<TableFooter mebleg={overallPrice} />}
            />
            <p className="footerCount">Nəticə sayı: {listData.length}</p>

            {/* Details Modal */}
            <DetailsModal
              {...{
                invoiceLoading,
                invoiceInfo,
                ref: modalRef,
              }}
            />
          </Col>
        </Row>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  isLoading: state.salesReportReducer.isLoading,

  profitList: state.salesReportReducer.profitList,
  profitReturnedList: state.salesReportReducer.profitReturnedList,

  invoiceInfo: state.salesOperationsReducer.invoiceInfo,
  invoiceLoading: state.salesOperationsReducer.isLoading,
  employees: state.employeesReducer.employees,
  clients: state.contactsReducer.clients,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  {
    fetchFilteredSalesProfit,
    fetchFilteredSalesProfitReturned,
    fetchInvoiceInfo,
    fetchClients,
    fetchEmployees,
    fetchActiveCurrencies,

    searchInvoiceHandle,
  }
)(Report);
