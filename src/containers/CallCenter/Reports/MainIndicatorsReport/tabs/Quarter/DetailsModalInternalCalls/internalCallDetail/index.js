import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { Modal, Button, Col, Row } from 'antd';
import TabButton from 'containers/Orders/utils/TabButton/index';
import { internalCallTabs } from 'utils';
import {
  fetchInternalCalls,
  getTotalCallCount,
} from 'store/actions/calls/internalCalls';
import Detail from '../tabs/Detail/index';
import Calls from '../tabs/Calls/index';
import Timeline from '../tabs/Timeline/index';
import styles from './styles.module.scss';

const MoreDetails = ({
  data,
  isView,
  selectedCall,
  selectedCallDetail,
  visible,
  setIsVisible,
  setSelectedCall,
  credential,
  selectedCallParticipant,
  getStatus,
  getTotalCallCount,
  fetchInternalCalls,
  filter,
}) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [total, setTotal] = useState(0);
  const [callWithContact, setCallWithContact] = useState([]);
  const [filters, onFilter] = useFilterHandle(
    {
      limit: 8,
      page: 1,
    },
    ({ filters }) => {}
  );

  const handleTabChange = tab => {
    setCurrentTab(tab);
  };
  useEffect(() => {
    if (selectedCall?.id) {
      if (selectedCall?.prospectContact !== null) {
        fetchInternalCalls({
          label: 'fetchCallsByNumber',
          filters: {
            directions: filter.directions,
            statuses: filter.statuses,
            dateFrom: filter.dateFrom,
            dateTo: filter.dateTo,
            prospectContacts: [selectedCall?.prospectContact.id],
            ...filters,
          },
          onSuccessCallback: response => {
            setCallWithContact(response.data);
          },
        });
        getTotalCallCount({
          filters: {
            directions: filter.directions,
            statuses: filter.statuses,
            dateFrom: filter.dateFrom,
            dateTo: filter.dateTo,
            prospectContacts: [selectedCall?.prospectContact.id],
          },
          onSuccess: res => {
            setTotal(res?.data?.count);
          },
        });
      } else {
        fetchInternalCalls({
          label: 'fetchCallsByNumber',
          filters: {
            directions:
              isView === 'internal'
                ? [3]
                : isView === 'answered'
                ? [1, 2]
                : [1],
            statuses:
              isView === 'missed' ? [2] : isView === 'answered' ? [1] : null,
            dateFrom: filter.dateFrom,
            dateTo: filter.dateTo,
            fromNumber:
              isView === 'internal' ? undefined : selectedCall?.fromNumber,
            toNumber:
              isView === 'internal' ? selectedCall?.toNumber : undefined,
            ...filters,
          },
          onSuccessCallback: response => {
            setCallWithContact(response.data);
          },
        });
        getTotalCallCount({
          filters: {
            directions:
              isView === 'internal'
                ? [3]
                : isView === 'answered'
                ? [1, 2]
                : [1],
            statuses:
              isView === 'missed' ? [2] : isView === 'answered' ? [1] : null,
            dateFrom: filter.dateFrom,
            dateTo: filter.dateTo,
            fromNumber:
              isView === 'internal' ? undefined : selectedCall?.fromNumber,
            toNumber:
              isView === 'internal' ? selectedCall?.toNumber : undefined,
          },
          onSuccess: res => {
            setTotal(res?.data?.count);
          },
        });
      }
    }
  }, [selectedCall?.id, filters]);
  const hideModal = () => {
    setIsVisible(false);
    setCurrentTab(1);
    setSelectedCall(undefined);
    setCallWithContact([]);
  };
  return (
    <Modal
      visible={visible}
      footer={null}
      width={currentTab === 1 ? 800 : 1050}
      closable={false}
      className={styles.customModal}
      onCancel={hideModal}
      maskClosable
    >
      <Button className={styles.closeButton} size="large" onClick={hideModal}>
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.OrderDetails}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '10px' }}>
          <Col
            span={8}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <span className={styles.contrparty}>
              {selectedCall?.type === 3
                ? `${selectedCall?.toOperator?.prospectTenantPerson.name} ${
                    selectedCall?.toOperator?.prospectTenantPerson.lastName
                      ? selectedCall?.toOperator?.prospectTenantPerson.lastName
                      : ''
                  }`
                : selectedCall?.prospectContact !== null
                ? selectedCall?.prospectContact?.name
                : credential?.number == selectedCall?.fromNumber
                ? selectedCall?.toNumber.replace(
                    /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                    '($1) $2 $3 $4 $5'
                  )
                : selectedCall?.fromNumber.replace(
                    /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                    '($1) $2 $3 $4 $5'
                  )}
            </span>
            <span className={styles.contract}>{selectedCall?.id}</span>
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px ' }}>
          {internalCallTabs.map(({ id, label }) => (
            <Col span={4} className={styles.tabContainer}>
              <TabButton
                key={id}
                onClick={() => handleTabChange(id)}
                active={currentTab === id}
                size="large"
                label={label}
              />
            </Col>
          ))}
        </Row>

        <Detail
          visible={currentTab === 1}
          selectedCall={selectedCall}
          data={data}
          getStatus={getStatus}
          selectedCallDetail={selectedCallDetail}
          isView={isView}
        />
        <Timeline
          visible={currentTab === 2}
          selectedCall={selectedCall}
          selectedCallDetail={selectedCallDetail}
          selectedCallParticipant={selectedCallParticipant}
          isView={isView}
        />
        <Calls
          audioData={data}
          visible={currentTab === 3}
          callWithContact={callWithContact}
          getStatus={getStatus}
          isView={isView}
          total={total}
          onFilter={onFilter}
          filters={filters}
        />
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  credential: state.profileReducer.credential,
});

export default connect(
  mapStateToProps,
  { fetchInternalCalls, getTotalCallCount }
)(MoreDetails);
