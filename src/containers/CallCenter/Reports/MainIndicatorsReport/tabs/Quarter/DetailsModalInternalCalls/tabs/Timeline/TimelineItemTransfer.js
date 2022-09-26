import React from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CustomTag from 'containers/CallCenter/Reports/MainIndicatorsReport/CustomTag';
import styles from './styles.module.scss';

const TimelineItemTransfer = ({
  selectedCallDetail,
  participants,
  tenant,
  index,
  isTransferrer = false,
}) => {
  return (
    <Row>
      <Col span={13}>
        {selectedCallDetail?.talkTime > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={styles.date}>
              {isTransferrer
                ? moment
                    .utc(participants?.[index]?.ringStartedAt, null)
                    .tz(tenant?.timezone)
                    .format('HH:mm:ss')
                : moment
                    .utc(selectedCallDetail?.answeredAt, null)
                    .tz(tenant?.timezone)
                    .format('HH:mm:ss')}
            </span>
            <span className={styles.time}>
              {isTransferrer
                ? moment
                    .utc(participants?.[index]?.ringTime * 1000)
                    .format('HH:mm:ss')
                : moment
                    .utc(selectedCallDetail?.totalHoldTime * 1000)
                    .format('HH:mm:ss')}
            </span>
            {!isTransferrer ? (
              <span className={styles.time}>
                {moment
                  .utc(selectedCallDetail?.talkTime * 1000)
                  .format('HH:mm:ss')}
              </span>
            ) : null}
          </div>
        ) : null}
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
            {`${selectedCallDetail?.operator?.prospectTenantPerson.name} ${
              selectedCallDetail?.operator?.prospectTenantPerson.lastName
                ? selectedCallDetail?.operator?.prospectTenantPerson.lastName
                : ''
            }`}
          </div>
          {isTransferrer ? (
            <CustomTag data={{ label: 'Zəngin başlaması' }} />
          ) : selectedCallDetail?.talkTime > 0 ? (
            <CustomTag data={{ label: 'Dəstəyin qaldırılması' }} />
          ) : null}
          {isTransferrer ? <div>İstiqamət: Xaric olan</div> : null}
          <div>
            Nömrə:
            {selectedCallDetail?.number?.replace(
              /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
              '($1) $2 $3 $4 $5'
            )}
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
)(TimelineItemTransfer);
