import React, { useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// components
import { Row, Col, Avatar, Skeleton, Empty } from 'antd';
import {} from 'components/Lib';

// actions
import { fetchAppealHistories } from 'store/actions/jobs/appeals';

// utils
import { AppealHistoryStatusData } from 'utils';
import styles from '../styles.module.scss';

const HistoryItem = ({ image, fullName, statusTitle, date, note }) => (
  <Row type="flex" align="middle" className={styles.profile}>
    <Col span={2}>
      <Avatar size={80} icon="user" src={image} />
    </Col>
    <Col span={20}>
      <div className={styles.descWrap}>
        <h5>{fullName}</h5>
        <h4>{statusTitle}</h4>
        <span>{date}</span>
        <br />
        <span>{note}</span>
      </div>
    </Col>
  </Row>
);

function HistoryTab(props) {
  const {
    selectedAppeal,
    histories,
    isLoading,

    fetchAppealHistories,
  } = props;

  const { id } = selectedAppeal || {};

  useEffect(() => {
    if (id) {
      fetchAppealHistories(id);
    }
  }, [id, fetchAppealHistories]);

  let renderedContent = null;

  if (selectedAppeal && !isLoading) {
    renderedContent = (
      <div className={`${styles.tabContent} scrollbar`}>
        {histories.map(history => {
          const { createdAt, person, provider, operation, operator, note } =
            history || {};
          const { image, name, surname = '' } =
            operator === 1 ? person.detail : provider;

          return (
            <HistoryItem
              key={createdAt}
              note={note?.description || ''}
              image={image}
              fullName={`${name} ${surname || ''}`}
              statusTitle={AppealHistoryStatusData[operation]}
              date={moment(createdAt).format('DD-MM-YYYY HH:mm')}
            />
          );
        })}
      </div>
    );
  } else if (!isLoading) {
    renderedContent = <Empty description="müraciət seçin" />;
  } else {
    renderedContent = (
      <Fragment>
        <Skeleton
          loading
          active
          size={48}
          avatar={{ shape: 'circle' }}
          paragraph={{ rows: 1 }}
        />
        <Skeleton
          loading
          active
          size={48}
          avatar={{ shape: 'circle' }}
          paragraph={{ rows: 1 }}
        />
      </Fragment>
    );
  }

  return renderedContent;
}

const mapStateToProps = state => ({
  histories: state.appealsReducer.histories,
  selectedAppeal: state.appealsReducer.selectedAppeal,
  isLoading: !!state.loadings.fetchAppealHistories,
});

export default connect(
  mapStateToProps,
  {
    fetchAppealHistories,
  }
)(HistoryTab);
