/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { fetchUnitStock, fetchUnitCashbox } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import styles from '../styles.module.scss';
import DetailTab from './businessUnitDetails/detailTab';
import UserTab from './businessUnitDetails/userTab';
import StructureTab from './businessUnitDetails/structureTab';
import StockTab from './businessUnitDetails/stockTab';
import CashboxTab from './businessUnitDetails/cashboxTab';
import PriceTypeTab from './businessUnitDetails/priceTypeTab';

function BusinessUnitDetail(props) {
  const {
    isDeletedForLog,
    activeTab,
    setActiveTab,
    row,
    fetchUnitStock,
    fetchUnitCashbox,
    users,
    fetchUsers,
  } = props;

  const [stockData, setStockData] = useState([]);
  const [cashboxData, setCashboxData] = useState([]);

  useEffect(() => {
    if (row.id === null) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [row]);

  useEffect(() => {
    if (row.id) {
      fetchUnitStock({
        id: row?.id,
        onSuccess: ({ data }) => {
          setStockData(data);
        },
      });
      fetchUnitCashbox({
        id: row?.id,
        onSuccess: ({ data }) => {
          setCashboxData(data);
        },
      });
    }
  }, [row]);
  useEffect(() => {
    fetchUsers({});
  }, []);
  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DetailTab details={row} isDeletedForLog={isDeletedForLog} />;
      case 1:
        return (
          <UserTab userData={row?.tenantPersons} details={row} users={users} />
        );
      case 2:
        return <StructureTab structureData={row?.structures} details={row} />;
      case 3:
        return (
          <StockTab
            stockData={row?.id === null ? row?.stocks : stockData}
            details={row}
          />
        );
      case 4:
        return (
          <CashboxTab
            cashboxData={row?.id === null ? row?.cashboxes : cashboxData}
            details={row}
          />
        );
      case 5:
        return <PriceTypeTab priceTypeData={row?.priceTypes} details={row} />;
      default:
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        {row.id !== null ? (
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
          >
            Ətraflı
          </Button>
        ) : null}
        <Button
          size="large"
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
        >
          İstifadəçilər ({row?.tenantPersonsCount})
        </Button>
        <Button
          style={{ borderRadius: '0' }}
          size="large"
          type={activeTab === 2 ? 'primary' : ''}
          onClick={() => handleChangeTab(2)}
        >
          Bölmə ({row?.structuresCount})
        </Button>
        <Button
          style={{ borderRadius: 0 }}
          size="large"
          type={activeTab === 3 ? 'primary' : ''}
          onClick={() => handleChangeTab(3)}
        >
          Anbarlar ({row?.id === null ? row?.stocksCount : stockData?.length})
        </Button>
        <Button
          style={{ borderRadius: 0 }}
          size="large"
          type={activeTab === 4 ? 'primary' : ''}
          onClick={() => handleChangeTab(4)}
        >
          Hesablar(
          {row?.id === null ? row?.cashboxesCount : cashboxData?.length})
        </Button>
        <Button
          style={{ borderRadius: '0 4px 4px 0' }}
          size="large"
          type={activeTab === 5 ? 'primary' : ''}
          onClick={() => handleChangeTab(5)}
        >
          Qiymət tipi({row?.priceTypes?.length})
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  users: state.usersReducer.users,
});

export default connect(
  mapStateToProps,
  { fetchUsers, fetchUnitStock, fetchUnitCashbox }
)(BusinessUnitDetail);
