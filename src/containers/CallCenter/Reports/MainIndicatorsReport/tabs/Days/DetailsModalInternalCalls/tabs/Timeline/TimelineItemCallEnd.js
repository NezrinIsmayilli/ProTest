import React from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CustomTag from 'containers/CallCenter/Reports/MainIndicatorsReport/CustomTag';
import styles from './styles.module.scss';

const TimelineItemCallEnd = ({ selectedCallDetail, tenant, credential }) => {
  const {
    endedAt,
    prospectContact,
    fromNumber,
    toNumber,
    fromOperator,
    toOperator,
    hangupDisposition,
    totalTime,
    direction,
    participants,
    isTransfer,
  } = selectedCallDetail;
  return (
    <Row>
      <Col span={13}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.date}>
            {moment
              .utc(endedAt, null)
              .tz(tenant?.timezone)
              .format('HH:mm:ss')}
          </span>
          <span className={styles.time}>
            {moment.utc(totalTime * 1000).format('HH:mm:ss')}
          </span>
        </div>
      </Col>
      <Col span={11}>
        <div className={styles.TimelineDetails}>
          <div className={styles.userInfo}>
            <img
              width={40}
              height={40}
              src="/img/icons/user.svg"
              alt="user"
              className={styles.icon}
              style={{
                borderRadius: '50%',
                backgroundColor: '#FFF',
                marginRight: '10px',
              }}
            />
            {direction === 3
              ? hangupDisposition === 2
                ? `${toOperator?.prospectTenantPerson.name} ${
                    toOperator?.prospectTenantPerson.lastName
                      ? toOperator?.prospectTenantPerson.lastName
                      : ''
                  }`
                : `${fromOperator?.prospectTenantPerson.name} ${
                    fromOperator?.prospectTenantPerson.lastName
                      ? fromOperator?.prospectTenantPerson.lastName
                      : ''
                  }`
              : hangupDisposition === 2
              ? credential?.number == fromNumber
                ? prospectContact !== null
                  ? prospectContact?.name
                  : toNumber.replace(
                      /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                      '($1) $2 $3 $4 $5'
                    )
                : isTransfer
                ? `${
                    participants
                      .map(partisipant => partisipant.talkTime > 0)
                      .lastIndexOf(true)[0]?.operator?.prospectTenantPerson.name
                  } ${
                    participants
                      .map(partisipant => partisipant.talkTime > 0)
                      .lastIndexOf(true)[0]?.operator?.prospectTenantPerson
                      .lastName
                      ? participants
                          .map(partisipant => partisipant.talkTime > 0)
                          .lastIndexOf(true)[0]?.operator?.prospectTenantPerson
                          .lastName
                      : ''
                  }`
                : `${toOperator?.prospectTenantPerson.name} ${
                    toOperator?.prospectTenantPerson.lastName
                      ? toOperator?.prospectTenantPerson.lastName
                      : ''
                  }`
              : prospectContact !== null
              ? prospectContact?.name
              : fromNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )}
          </div>
          <CustomTag data={{ name: 'delete', label: 'Zəngin bitməsi' }} />
        </div>
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  credential: state.profileReducer.credential,
});

export default connect(
  mapStateToProps,
  {}
)(TimelineItemCallEnd);
