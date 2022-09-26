/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Button } from 'antd';
import VerifiedCalls from './VerifiedCalls';
import UnverifiedCalls from './UnverifiedCalls';
import styles from './styles.module.scss';

function DetailsTab(props) {
  const {
    activeTab,
    setActiveTab,
    calls,
    title,
    filters,
    modalName,
    monthState,
  } = props;

  const handleChangeTab = value => setActiveTab(value);

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <VerifiedCalls
            calls={calls}
            filters={filters}
            modalName={modalName}
            monthState={monthState}
          />
        );
      case 1:
        return (
          <UnverifiedCalls
            calls={calls}
            filters={filters}
            modalName={modalName}
            monthState={monthState}
          />
        );
      default:
    }
  };

  return (
    <div>
      <div>
        <h3>{title}</h3>
      </div>
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
        >
          Təyin olunmuş
        </Button>
        <Button
          size="large"
          style={{ borderRadius: '0 4px 4px 0', borderLeft: 'none' }}
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
        >
          Təyin olunmamış
        </Button>
      </div>

      {getTabContent()}
    </div>
  );
}

export default DetailsTab;
