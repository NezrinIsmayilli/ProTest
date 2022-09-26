import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CustomTag from '../../../CustomTag';
import styles from './styles.module.scss';

const TimelineItemCallAnswer = ({
  selectedCallDetail,
  selectedCallParticipant,
  tenant,
}) => {
  const { answeredAt, direction } = selectedCallDetail;
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
              .utc(answered?.answeredAt, null)
              .tz(tenant?.timezone)
              .format('HH:mm:ss')}
          </span>
          <span className={styles.time}>
            {moment.utc(answered?.totalHoldTime * 1000).format('HH:mm:ss')}
          </span>
          <span className={styles.time}>
            {moment.utc(answered?.talkTime * 1000).format('HH:mm:ss')}
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
              ? `${answered?.operator?.prospectTenantPerson.name} ${
                  answered?.operator?.prospectTenantPerson.lastName
                    ? answered?.operator?.prospectTenantPerson.lastName
                    : ''
                }`
              : answered?.prospectContact !== null
              ? answered?.prospectContact?.name
              : answered?.operator !== null
              ? `${answered?.operator?.prospectTenantPerson.name} ${
                  answered?.operator?.prospectTenantPerson.lastName
                    ? answered?.operator?.prospectTenantPerson.lastName
                    : ''
                }`
              : answered.number}
          </div>
          <CustomTag data={{ name: 'done', label: 'Dəstəyin qaldırılması' }} />
          <div>
            Nömrə:
            {answered?.prospectContact !== null
              ? answered?.prospectContact?.number
              : answered?.number}
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
)(TimelineItemCallAnswer);
