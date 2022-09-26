import React, { useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import { Skeleton, Row, Col, Button, Empty } from 'antd';
import { fetchPersonById } from 'store/actions/jobs/appeals';

import DisplayPersonInfo from 'containers/Jobs/Shared/DisplayPersonInfo';

import styles from './styles.module.scss';

function DetailsTab(props) {
  const {
    // parent
    type,
    openInterviewCalendar,
    openInterviewRejectDrawer,
    openInterviewResultDrawer,

    // redux data
    selectedAppeal,
    person,
    personLoading,
    interviewLoading,
    isInterviewEnd,
    canInterviewChange,
    // action
    fetchPersonById,
  } = props;

  const { person: appealPerson } = selectedAppeal || {};
  const id = appealPerson?.id;

  useEffect(() => {
    if (id) {
      fetchPersonById(id);
    }
  }, [id, fetchPersonById]);

  let renderedContent = null;
  const isShowButtons =
    (!isInterviewEnd && !interviewLoading && canInterviewChange) ||
    type === 'new' ||
    type === 'wait';

  const tabContentStyle = {};

  if (type === 'result') {
    tabContentStyle.height = 'calc(100vh - 260px)';
  }

  if (person && !personLoading && selectedAppeal) {
    renderedContent = (
      <Fragment>
        <div
          className={`${styles.tabContent} scrollbar`}
          style={tabContentStyle}
        >
          <DisplayPersonInfo person={person} />
        </div>

        <>
          {isShowButtons ? (
            <Button.Group size="large" className={styles.buttonGroup}>
              <Row>
                <Col span={12}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={openInterviewCalendar}
                  >
                    Intervyu
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    block
                    onClick={openInterviewRejectDrawer}
                  >
                    Imtina
                  </Button>
                </Col>
              </Row>
            </Button.Group>
          ) : null}

          {isInterviewEnd && type === 'interview' && (
            <Button
              type="primary"
              size="large"
              block
              onClick={openInterviewResultDrawer}
            >
              Müsahibə nəticəsini qeyd et
            </Button>
          )}
        </>
      </Fragment>
    );
  } else if (!personLoading && !selectedAppeal) {
    renderedContent = <Empty description="müraciət seçin" />;
  } else if (interviewLoading) {
    renderedContent = null;
  } else if (personLoading && selectedAppeal) {
    renderedContent = (
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
    );
  }

  return renderedContent;
}

const mapStateToProps = state => ({
  person: state.appealsReducer.person,
  selectedAppeal: state.appealsReducer.selectedAppeal,

  personLoading: !!state.loadings.fetchPersonById,
  interviewLoading: !!state.loadings.fetchInterviewById,

  isInterviewEnd: true, // state.interviewReducer.isInterviewEnd,
  canInterviewChange: state.interviewReducer.canInterviewChange,
});

export default connect(
  mapStateToProps,
  {
    fetchPersonById,
  }
)(DetailsTab);
