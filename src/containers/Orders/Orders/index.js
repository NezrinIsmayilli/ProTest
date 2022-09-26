/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row } from 'antd';
import { fetchPartners } from 'store/actions/partners';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import {
  fetchStageRoleExecutors,
  fetchTenantPersonRoles,
} from 'store/actions/settings/order-roles';
import { fetchOrders, setSelectedOrder } from 'store/actions/orders';
import { useOrderPermissions } from 'hooks';
import OrdersSidebar from './OrdersSidebar/index';
import MoreDetails from './MoreDetails/index';
import styles from '../styles.module.scss';
import Filters from './Filters';
import Table from './Table';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import {useHistory, useLocation } from 'react-router-dom';
const Orders = props => {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    fetchPartners,
    fetchOrders,
    fetchMainCurrency,
    fetchStageRoleExecutors,
    fetchTenantPersonRoles,
    tenant,
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
  const [isVisible, setIsVisible] = useState(false);
  const [isView, setIsView] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [toggleFetch, setToggleFetch] = useState(false);
  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      stages:params.stages ? params.stages : [],
      statusGroup:params.statusGroup ? params.statusGroup : 1,
      serialNumber:params.serialNumber ? params.serialNumber : null,
      search:params.search ? params.search : undefined,
      direction:params.direction ? params.direction : 1,
      partners:params.partners ? params.partners :  undefined,
      deliveredByTenantPersons:params.deliveredByTenantPersons ? params.deliveredByTenantPersons :  undefined,
      visualStages:params.visualStages ? params.visualStages : undefined,
      dateFrom:params.dateFrom ? params.dateFrom :  undefined,
      dateTo:params.dateTo ? params.dateTo :  undefined,
      amountFrom:params.amountFrom ? params.amountFrom :  null,
      amountTo:params.amountTo ? params.amountTo :  null,
      limit: pageSize,
      page: currentPage,
      repeatFetch:params.repeatFetch ? params.repeatFetch : null,
      orderBy:params.orderBy ? params.orderBy : undefined,
      order: params.order ? params.order :undefined,
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }
      toggleFetchAction();
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

  const toggleFetchAction = () => {
    setToggleFetch(prevToggleFetch => !prevToggleFetch);
  };

  const [permissions, handlePermissionsChange] = useOrderPermissions();

  useEffect(() => {
    if (isFetched) {
      fetchOrders(filters);
    } else {
      setIsFetched(true);
    }
  }, [toggleFetch]);

  useEffect(() => {
    fetchMainCurrency();
    fetchPartners();
    fetchStageRoleExecutors();
    fetchTenantPersonRoles();
  }, []);

  useEffect(() => {
    if (selectedOrder?.id) {
      setSelectedOrder(
        orders.filter(order => order.id === selectedOrder.id)[0]
      );
    }
  }, [orders]);

  useEffect(() => {
    if (selectedOrder?.id) {
      setIsVisible(true);
      handlePermissionsChange(
        selectedOrder,
        tenant?.id === selectedOrder?.tenantId
      );
    }
  }, [selectedOrder]);

  const handleChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  return (
    <div className={styles.Orders}>
      <OrdersSidebar filters={filters} onFilter={onFilter}  handleChange={handleChange} />
      {isVisible && (
        <MoreDetails
          permissions={permissions}
          visible={isVisible}
          setIsVisible={setIsVisible}
          toggleFetchAction={toggleFetchAction}
          isView={isView}
          direction={filters.direction}
        />
      )}
      <section className="scrollbar aside">
        <Row style={{ margin: '0 32px' }}>
          <Filters
            filters={filters}
            onFilter={onFilter}
            handleChange={handleChange}
            toggleFetchAction={toggleFetchAction}
          />
          <Table
            filters={filters}
            onFilter={onFilter}
            handleChange={handleChange}
            currentPage={currentPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
            toggleFetchAction={toggleFetchAction}
            setIsView={setIsView}
          />
        </Row>
      </section>
    </div>
  );
};
const mapStateToProps = state => ({
  isLoading: state.ordersReducer.isLoading,
  orders: state.ordersReducer.orders,
  selectedOrder: state.ordersReducer.selectedOrder,
  tenant: state.tenantReducer.tenant,
  stages: state.ordersReducer.stages,
  total: state.ordersReducer.total,
});

export default connect(
  mapStateToProps,
  {
    fetchPartners,
    fetchOrders,
    fetchMainCurrency,
    fetchStageRoleExecutors,
    fetchTenantPersonRoles,
    setSelectedOrder,
  }
)(Orders);
