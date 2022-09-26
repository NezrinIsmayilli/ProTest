/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { getProductComposition } from 'store/actions/product';
import styles from './styles.module.scss';
import InfoDetails from './InfoDetails';
import RequisitesDetails from './RequisitesDetails';

function DetailsTab(props) {
  const { activeTab, setActiveTab, row, isLoading } = props;

  const handleChangeTab = value => setActiveTab(value);

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <InfoDetails row={row} />;
      case 1:
        return <RequisitesDetails row={row} />;

      default:
    }
  };

  const {
    officialName,
    generalDirector,
    companyVoen,
    bankName,
    bankVoen,
    bankCode,
    correspondentAccount,
    settlementAccount,
    swift,
  } = row;

  return (
    <div>
      {officialName !== null ||
      generalDirector !== null ||
      companyVoen !== null ||
      bankName !== null ||
      bankVoen !== null ||
      bankCode !== null ||
      correspondentAccount !== null ||
      settlementAccount !== null ||
      swift !== null ? (
        <div className={styles.detailsTab}>
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
            disabled={isLoading}
          >
            Ətraflı
          </Button>
          <Button
            size="large"
            style={{ borderRadius: '0 4px 4px 0', borderLeft: 'none' }}
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
            disabled={isLoading}
          >
            Rekvizitlər
          </Button>
        </div>
      ) : null}

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.financeOperationsReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    getProductComposition,
  }
)(DetailsTab);
