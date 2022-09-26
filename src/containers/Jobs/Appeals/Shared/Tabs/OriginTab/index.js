import React, { useEffect } from 'react';
import { connect } from 'react-redux';

// utils
import { AppealOriginTypes } from 'utils';

// actions
import { fetchAppealOriginById } from 'store/actions/jobs/appeals';

// components
import { InfoBox } from 'components/Lib';
import { Skeleton, Empty } from 'antd';

import DisplayAnnouncementInfo from 'containers/Jobs/Shared/DisplayAnnouncementInfo';
import DisplayVacancyInfo from 'containers/Jobs/Shared/DisplayVacanyInfo';

import styles from './styles.module.scss';

function OriginTab(props) {
  const {
    selectedAppeal,
    appealOrigin,
    isLoading,

    fetchAppealOriginById,
  } = props;

  const { originId, origin, id } = selectedAppeal || {};

  useEffect(() => {
    if (id) {
      fetchAppealOriginById(originId, AppealOriginTypes[origin]);
    }
  }, [id, originId, origin, fetchAppealOriginById]);

  let infoList = null;

  if (appealOrigin && !isLoading) {
    if (origin === 'announcement') {
      infoList = <DisplayAnnouncementInfo announcement={appealOrigin} />;
    }

    if (origin === 'vacancy') {
      infoList = (
        <InfoBox title={appealOrigin.name}>
          <DisplayVacancyInfo vacancy={appealOrigin} />
        </InfoBox>
      );
    }
  }

  return (
    <>
      {selectedAppeal && !isLoading ? (
        <div className={`${styles.tabContent} scrollbar`}>{infoList}</div>
      ) : !isLoading ? (
        <Empty description="müraciət seçin" />
      ) : (
        <>
          <Skeleton
            loading
            active
            size={48}
            avatar={{ shape: 'circle' }}
            paragraph={{ rows: 0 }}
          />
          <Skeleton loading active paragraph={{ rows: 1 }} />
          <Skeleton loading active paragraph={{ rows: 1 }} />
          <Skeleton loading active paragraph={{ rows: 1 }} />
          <Skeleton loading active paragraph={{ rows: 1 }} />
        </>
      )}
    </>
  );
}

const mapStateToProps = state => ({
  appealOrigin: state.appealsReducer.appealOrigin,
  selectedAppeal: state.appealsReducer.selectedAppeal,
  isLoading: !!state.loadings.fetchAppealOriginById,
});

export default connect(
  mapStateToProps,
  {
    fetchAppealOriginById,
  }
)(OriginTab);
