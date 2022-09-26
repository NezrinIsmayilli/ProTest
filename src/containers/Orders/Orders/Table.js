import React, { useState } from 'react';
import { connect } from 'react-redux';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { Pagination, Row, Col, Select, Tooltip } from 'antd';
import {
  Table as ProTable,
  ProStage,
  ProDots,
  ProDotsItem,
  DetailButton,
  Can,
  ProModal,
} from 'components/Lib';
import moment from 'moment';
import { permissions, accessTypes } from 'config/permissions';
import { changeStage, setSelectedOrder } from 'store/actions/orders';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  visualStatuses,
  sortedStatuses,
} from 'utils';
import styles from '../styles.module.scss';
import SelectExpeditor from './SelectExpeditor';

const Table = props => {
  const {
    orders,
    total,
    mainCurrency,
    expeditors,
    isLoading,
    toggleFetchAction,
    stageRoles,
    tenant,
    filters,
    onFilter,
    setSelectedOrder,
    removingOrder,
    changeStage,
    setIsView,
    permissionsList,
    handleChange,
    currentPage,
    setPageSize,
    pageSize
  } = props;

  const pages = [8, 10, 20, 50, 100, total];
  const [currentOrder, setCurrentOrder] = useState(undefined);
  const [expeditorModalIsVisible, setExpeditorModalIsVisible] = useState(false);

  const updateToDeliveryStage = newExpeditorId => {
    changeStage(
      6,
      currentOrder.id,
      { description: null, deliveredByTenantPerson: newExpeditorId || null },
      toggleFetchAction
    );
  };
  const handleStageChange = (newStageId, row) => {
    const {
      id,
      tenantId,
      availableTransitions,
      direction,
      deliveredByParty,
    } = row;
    const newStage = availableTransitions.find(
      availableTransition => availableTransition.visualStage === newStageId
    );
    
    if (
      newStageId === 9 &&
      ((direction === 1 && deliveredByParty === 1) ||
        (direction === 2 &&
          deliveredByParty === 1 &&
          tenantId === tenant.id)) &&
      stageRoles.allowToSelectTenantPerson
    ) {
      toggleExpeditorModal();
      setCurrentOrder(row);
    } else {
      if ((total - 1) % pageSize == 0 && currentPage > 1&&(newStageId==4||newStageId==6)) {
        handleChange(currentPage - 1);
    } 
    changeStage(newStage.stage, id, { description: null }, toggleFetchAction);
    }
  };
  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };

  const toggleExpeditorModal = () => {
    setExpeditorModalIsVisible(prevValue => !prevValue);
  };
  const handleStatusOptions = (row, statuses) => {
    const filteredStatuses = statuses.filter(
      ({ id }) =>
        id === row.visualStage ||
        (row.canChangeStage &&
          row.availableTransitions
            .map(({ visualStage }) => visualStage)
            .includes(id))
    );
    return filteredStatuses;
  };

  const getOrdersWithTotal = orders => {
    if (orders.length === 0) {
      return orders;
    }
    const totalQuantity = orders.reduce(
      (total, current) => total + Number(current.totalQuantity || 0),
      0
    );
    const totalPriceInMainCurrency = orders.reduce(
      (total, current) =>
        total + Number(current.totalPriceInMainCurrency || 0) || 0,
      0
    );
    return [
      ...orders,
      {
        isTotal: true,
        totalQuantity,
        totalPriceInMainCurrency,
      },
    ];
  };

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (value, { isTotal }, index) =>
        isTotal ? 'Toplam' : (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: 'Sənəd',
      dataIndex: 'serialNumber',
      render: (value, row) =>
        row.isTotal
          ? null
          : filters.direction === 1
          ? `SFD${moment(
              row.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
              'YYYY'
            ).format('YYYY')}/${value}`
          : `SFX${moment(
              row.createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
              'YYYY'
            ).format('YYYY')}/${value}`,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Sifariş tarixi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'createdAt' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('createdAt', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'createdAt' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('createdAt', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'createdAt',
      render: (value, row) => (row.isTotal ? null : value),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'partnerName',
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
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Məbləğ ({mainCurrency?.code || ''})</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'totalPrice' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalPrice', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'totalPrice' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalPrice', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'totalPriceInMainCurrency',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Məhsul sayı</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'totalQuantity' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalQuantity', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'totalQuantity' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('totalQuantity', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'totalQuantity',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Son icra tarixi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'deliveryDate' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('deliveryDate', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'deliveryDate' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('deliveryDate', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'deliveryDate',
      render: (value, { isTotal }) => (isTotal ? null : value || 'Sərbəst'),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Gecikmə (gün)</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'latenessDays' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('latenessDays', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'latenessDays' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('latenessDays', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'daysPassed',
      align: 'center',
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
    {
      title: 'Status',
      dataIndex: 'visualStage',
      align: 'center',
      width: 190,
      render: (value, row) =>
        row.isTotal || row.visualStage === null ? null : (
          <ProStage
            visualStage={visualStatuses[row.visualStage]}
            statuses={handleStatusOptions(row, sortedStatuses)}
            onChange={newStage => handleStageChange(newStage, row)}
            disabled={permissionsList.order.permission !== 2}
          />
        ),
    },
    {
      title: 'Seç',
      align: 'center',
      width: 80,
      render: row =>
        row.isTotal ? null : (
          <div
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <DetailButton onClick={() => handleClick(row, 'view')} />
            <Can I={accessTypes.manage} a={permissions.order}>
              <ProDots isDisabled={!row.canChangeStage}>
                <>
                  <ProDotsItem
                    label="Düzəliş et"
                    icon="pencil"
                    onClick={() => handleClick(row, 'edit')}
                  />
                </>
              </ProDots>
            </Can>
          </div>
        ),
    },
  ];

 

  const handleNumberChange = size => {
    onFilter('limit', size);
    setPageSize(size)
    handleChange(1);
  };

  const handleClick = (row, type) => {
    if (type === 'view') {
      setIsView(true);
    } else {
      setIsView(false);
    }
    setSelectedOrder(row);
  };

  return (
    <div>
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={expeditorModalIsVisible}
        handleModal={toggleExpeditorModal}
        updateToDeliveryStage={updateToDeliveryStage}
      >
        <SelectExpeditor
          expeditors={expeditors}
          prevExpeditorId={currentOrder?.deliveredByTenantPersonId}
          toggleExpeditorModal={toggleExpeditorModal}
          updateToDeliveryStage={updateToDeliveryStage}
        />
      </ProModal>
      <ProTable
        loading={isLoading || removingOrder}
        dataSource={getOrdersWithTotal(orders)}
        className={styles.tableFooter}
        columns={columns}
        scroll={{ x: false, y: false }}
        size="default"
      />

      <Row
        style={{
          margin: '15px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Col span={8}>
          <Pagination
            current={currentPage}
            className={styles.customPagination}
            pageSize={filters.limit}
            onChange={handleChange}
            total={total || 0}
            size="small"
          />
        </Col>
        <Col span={6} offset={10} align="end">
          <Select
            defaultValue={pageSize}
            className={styles.pageSize}
            size="large"
            onChange={e => handleNumberChange(e)}
          >
            {pages.map(page => (
              <Select.Option
                value={page}
                className={styles.dropdown}
                key={page}
              >
                {page}
              </Select.Option>
            ))}
          </Select>
          <span className={styles.totalNumber}>{`${total} ədəd`}</span>
        </Col>
      </Row>
    </div>
  );
};
const mapStateToProps = state => ({
  isLoading: state.ordersReducer.isLoading,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
  stageRoles: state.orderRolesReducer.stageRoles,
  expeditors: state.orderRolesReducer.expeditors,
  mainCurrency: state.kassaReducer.mainCurrency,
  removingOrder: state.loadings.deleteOrder,
  orders: state.ordersReducer.orders,
  tenant: state.tenantReducer.tenant,
  total: state.ordersReducer.total,
});

export default connect(
  mapStateToProps,
  {
    changeStage,
    setSelectedOrder,
  }
)(Table);
