import React from 'react';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import CustomTag from '../../../CustomTag';
import styles from './styles.module.scss';

const TimelineItem = ({ selectedCallDetail, tenant, credential }) => {
  const {
    endedAt,
    prospectContact,
    fromNumber,
    fromOperator,
    direction,
    status,
  } = selectedCallDetail;

  return (
    <Row>
      <Col span={13}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className={styles.date}>
            {moment
              .utc(endedAt, null)
              .tz(tenant?.timezone)
              .format('DD.MM.YYYY')}
          </span>
          <span className={styles.time}>
            {moment
              .utc(endedAt, null)
              .tz(tenant?.timezone)
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
              : credential?.number == fromNumber
              ? `${fromOperator?.prospectTenantPerson.name} ${
                  fromOperator?.prospectTenantPerson.lastName
                    ? fromOperator?.prospectTenantPerson.lastName
                    : ''
                }`
              : prospectContact !== null
              ? prospectContact?.name
              : fromNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )}
          </div>
          <CustomTag
            data={
              direction === 1 && status === 2
                ? { name: 'delete', label: 'Geri yığılmamış' }
                : { label: 'Yeni' }
            }
          />
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
)(TimelineItem);
