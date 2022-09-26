/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row } from 'antd';

import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchTenentFeatureSub, setFinance } from 'store/actions/subscription';
import Table from './Table';
import DefaultSideBar from '../Sidebar';
import styles from './styles.module.scss';

const Invoice = props => {
  const { invoices, selectedOrder, setFinance, fetchTenentFeatureSub } = props;

  const [isFetched, setIsFetched] = useState(false);
  const [toggleFetch, setToggleFetch] = useState(false);
  const [filters, onFilter] = useFilterHandle(
    {
      orderBy: undefined,
      order: 'desc',
    },
    () => {
      toggleFetchAction();
    }
  );

  const toggleFetchAction = () => {
    setToggleFetch(prevToggleFetch => !prevToggleFetch);
  };

  useEffect(() => {
    if (isFetched) {
      fetchTenentFeatureSub(filters);
    } else {
      setIsFetched(true);
    }
  }, [toggleFetch]);

  useEffect(() => {
    if (selectedOrder?.id) {
      setFinance(invoices.filter(order => order.id === selectedOrder.id)[0]);
    }
  }, [invoices]);

  return (
    <div>
      <DefaultSideBar />
      <section className="aside-without-navigation scrollbar">
        <div className={styles.content}>
          <Row>
            <Table
              invoices={invoices}
              filters={filters}
              onFilter={onFilter}
              toggleFetchAction={toggleFetchAction}
            />
          </Row>
        </div>
      </section>
    </div>
  );
};
const mapStateToProps = state => ({
  invoices: state.subscriptionReducer.invoices,
});

export default connect(
  mapStateToProps,
  {
    fetchTenentFeatureSub,
    setFinance,
  }
)(Invoice);
