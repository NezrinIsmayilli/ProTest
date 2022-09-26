import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CustomTag from 'containers/CallCenter/Reports/MainIndicatorsReport/CustomTag';
import styles from './styles.module.scss';

const TimelineItemCallStart = ({
  selectedCallDetail,
  selectedCallParticipant,
  tenant,
  credential,
}) => {
  const {
    startedAt,
    ringTime,
    waitTime,
    prospectContact,
    fromNumber,
    fromOperator,
    toNumber,
    direction,
    status,
  } = selectedCallDetail;
  const [answered, setAnswered] = useState(undefined);
  useEffect(() => {
    const whoAnswered = selectedCallParticipant?.find(
      ({ isInitiator, talkTime }) => isInitiator === false && talkTime > 0
    );
    setAnswered(whoAnswered);
  }, [selectedCallParticipant]);

  return (
    <Row>
      <Col span={13}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.date}>
            {moment
              .utc(startedAt, null)
              .tz(tenant?.timezone)
              .format('HH:mm:ss')}
          </span>
          <span className={styles.time}>
            {moment
              .utc(
                moment(answered?.answeredAt, 'HH:mm:ss').diff(
                  moment(startedAt, 'HH:mm:ss')
                )
              )
              .format('HH:mm:ss')}
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
              ? `${fromOperator?.prospectTenantPerson.name} ${
                  fromOperator?.prospectTenantPerson.lastName
                    ? fromOperator?.prospectTenantPerson.lastName
                    : ''
                }`
              : prospectContact !== null
              ? prospectContact?.name
              : credential?.number == fromNumber
              ? toNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )
              : fromNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )}
          </div>
          <CustomTag data={{ label: 'Zəngin başlaması' }} />
          <div>
            İstiqamət:{' '}
            {credential?.number == fromNumber ? 'Xaric olan' : 'Daxil olan'}
          </div>
          <div>
            Nömrə:{' '}
            {fromNumber?.replace(
              /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
              '($1) $2 $3 $4 $5'
            )}{' '}
          </div>
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
)(TimelineItemCallStart);
