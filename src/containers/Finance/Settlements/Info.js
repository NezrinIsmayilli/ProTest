/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import { Row, Col } from 'antd';
import {
  Sidebar,
  ProFilterButton,
  ProSearch,
  Table,
  ProSidebarTab,
} from 'components/Lib';

// actios
import {
  fetchContactsWhoHasSettlements,
  fetchOperationsByContact,
} from 'store/actions/settlements';

import { useSearch } from 'hooks';

import styles from './info.module.scss';

const columns = [
  {
    title: '№',
    dataIndex: 'id',
    key: 'id',
    render: (value, row, index) => index + 1,
  },
  {
    title: 'Tarix',
    dataIndex: 'date',
    key: 'date',
    render: value => value.substring(0, 10),
  },
  {
    title: 'Sənəd',
    dataIndex: 'invoicenumber',
    key: 'invoicenumber',
  },
  {
    title: 'Borcun artması',
    dataIndex: 'increment',
    key: 'increment',
  },
  {
    title: 'Borcun azalması',
    dataIndex: 'decrement',
    key: 'decrement',
  },
  {
    title: 'Balans',
    dataIndex: 'balance',
    key: 'balance',
  },
];

function Info(props) {
  const {
    // actions
    fetchContactsWhoHasSettlements,
    fetchOperationsByContact,
    // data
    contactsWhoHasSettlements,
    operations,
    isLoading,
  } = props;

  const { id } = useParams();
  // load all contactsWhoHasSettlements
  useLayoutEffect(() => {
    if (contactsWhoHasSettlements.length === 0) {
      fetchContactsWhoHasSettlements();
    }
  }, []);

  // sidebar serach handle
  const { result, handleSearch, searchTouched } = useSearch(
    contactsWhoHasSettlements,
    ['name']
  );

  // memoized data for render
  const memoizedContactsWhoHasSettlements = useMemo(
    () => (searchTouched ? result : contactsWhoHasSettlements),
    [searchTouched, contactsWhoHasSettlements.length, result.length]
  );

  const [selectedContactId, setSelectedContactId] = useState(Number(id));

  // onchange selectedContactId, reFetch data
  useEffect(() => {
    if (selectedContactId) {
      fetchOperationsByContact({ id: selectedContactId });
    }
  }, [selectedContactId]);

  return (
    <section>
      <Sidebar title="Maliyyə">
        <ProSearch label="" onSearch={handleSearch} />
        <div className={`footerCount ${styles.countTab}`}>
          Əlaqələrin sayı: {memoizedContactsWhoHasSettlements.length}
        </div>
        <div className={styles.wrapSidebarTabs}>
          {useMemo(
            () =>
              memoizedContactsWhoHasSettlements.map(contact => (
                <ProSidebarTab
                  key={`${contact.contact_id}`}
                  selected={selectedContactId === contact.contact_id}
                  address={` ${contact.name} ${contact.surname || ''}`}
                  onClick={() => setSelectedContactId(contact.contact_id)}
                />
              )),
            [memoizedContactsWhoHasSettlements.length, selectedContactId]
          )}
        </div>
      </Sidebar>

      <section className="scrollbar aside">
        <div className="container">
          {/* tools_line */}
          <div className={styles.toolsContainer}>
            <Row gutter={32}>
              <Col span={18}>
                <div className={styles.paddingTop13}>
                  {/* <div className={styles.toolsBlock}>
                    {stockInfo && (
                      <>
                        <span className={styles.stockName}>
                          {stockInfo.name}
                        </span>
                      </>
                    )}
                  </div> */}

                  <div style={{ display: 'inline-block' }}>
                    <ProFilterButton type="button" active>
                      Əməliyyatlar
                    </ProFilterButton>
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <Link className="goToLink" to="/finance/settlements">
                  Geri
                </Link>
              </Col>
            </Row>
          </div>

          <Row className={styles.tablePadding}>
            <Col className="paddingBottom70">
              <Table
                loading={isLoading}
                dataSource={operations}
                columns={columns}
                rowKey={record => record.invoicenumber}
              />
            </Col>
          </Row>
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  contactsWhoHasSettlements: state.settlementsReducer.contactsWhoHasSettlements,
  operations: state.settlementsReducer.operations,
  isLoading: state.settlementsReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { fetchContactsWhoHasSettlements, fetchOperationsByContact }
)(Info);
