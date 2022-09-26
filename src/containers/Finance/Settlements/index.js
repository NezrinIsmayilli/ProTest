import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import {
  Sidebar,
  ProSearch,
  ProCollapse,
  ProPanel,
  ProDateRangePicker,
  Table,
} from 'components/Lib';

// actions
import { fetchSettlements } from 'store/actions/settlements';
import { fetchActiveCurrencies } from 'store/actions/settings/kassa';

import { useSearch } from 'hooks';
import { dateFormat, thisWeekStart, thisWeekEnd } from 'utils';

import styles from './styles.module.scss';

const columns = [
  {
    title: '№',
    dataIndex: 'id',
    key: 'id',
    render: (value, row, index) => index + 1,
  },
  {
    title: 'Əlaqə',
    dataIndex: 'name',
    key: 'name',
    // eslint-disable-next-line react/display-name
    render: (value, row) => (
      <Link
        to={`/finance/settlements/info/${row.contact_id}`}
        className={styles.contactLink}
      >
        {value}
      </Link>
    ),
  },
  {
    title: 'Dövrün əvvəlinə',
    dataIndex: 'balance_before_period',
    key: 'balance_before_period',
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
    title: 'Dövrün sonuna',
    dataIndex: 'balance_after_period',
    key: 'balance_after_period',
  },
  {
    title: 'Cari balans',
    dataIndex: 'balance',
    key: 'balance',
  },
];

const CustomTableFooter = ({
  // total,
  // after,
  // balance,
  settlements,
  mainCurrency,
}) => {
  const getOverAll = (data, key) =>
    data.reduce((overAll, item) => (overAll += Number(item[key])), 0);

  const overAllBalance = getOverAll(settlements, 'balance');

  const mainCurrencyCode = mainCurrency?.code || '';

  return (
    <Row>
      <Col span={8} offset={16} className={styles.txtRight}>
        <div className={styles.footerTitle}>Cari balans:</div>
        <div>
          {Number(overAllBalance).toFixed(2)} {mainCurrencyCode}
        </div>
      </Col>
    </Row>
  );
};
/**
 *
 * Settlements - 'Hesablaşmalar'
 *
 */
function Settlements(props) {
  const {
    fetchSettlements,
    // data
    settlements,
    isLoading,
    fetchActiveCurrencies,
    mainCurrency,
  } = props;

  const [query, setQuery] = useState(
    `startDate=${thisWeekStart}&endDate=${thisWeekEnd}`
  );

  // search handle
  const { result, handleSearch, searchTouched } = useSearch(settlements, [
    'name',
  ]);

  function onChangeDate(startDate, endDate) {
    setQuery(
      `startDate=${moment(startDate).format(dateFormat)}&endDate=${moment(
        endDate
      ).format(dateFormat)}`
    );
  }

  useEffect(() => {
    // get main curency
    if (!mainCurrency.code) {
      fetchActiveCurrencies();
    }
  }, [fetchActiveCurrencies, mainCurrency]);

  useEffect(() => {
    fetchSettlements({ query });
  }, [fetchSettlements, query]);

  return (
    <>
      <Sidebar title="Hesablaşmalar">
        <ProSearch placeholder="" onSearch={handleSearch} />
        <ProCollapse defaultActiveKey="1">
          <ProPanel header="Tarix üzrə axtarış" id="parent" key="1">
            <span id="settlemetsArea"></span>
            <ProDateRangePicker
              onChangeDate={onChangeDate}
              getCalendarContainer={() =>
                document.getElementById('settlemetsArea')
              }
            />
          </ProPanel>
        </ProCollapse>
      </Sidebar>
      <section className="scrollbar aside">
        <Row className={styles.tablePadding}>
          <Col className="paddingBottom70">
            <Table
              loading={isLoading}
              dataSource={searchTouched ? result : settlements}
              columns={columns}
              rowKey={record => record.contact_id}
              footer={
                <CustomTableFooter
                  settlements={settlements}
                  mainCurrency={mainCurrency}
                />
              }
            />
            <p className="footerCount">Nəticə sayı: {settlements.length}</p>
          </Col>
        </Row>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  settlements: state.settlementsReducer.settlements,
  isLoading: state.settlementsReducer.isLoading,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  { fetchSettlements, fetchActiveCurrencies }
)(Settlements);
