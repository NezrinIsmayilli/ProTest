import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, Spin, Tooltip } from 'antd';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import Section from './Section';

const MoreDetails = ({
  visible,
  row,
  users,
  setIsVisible,
  fetchCallOperators,
  operators,
  isLoading,
  allBusinessUnits,
}) => {
  const { t } = useTranslation();
  const [isOneAdmin, setIsOneAdmin] = useState(true);
  const [number, setNumber] = useState(undefined);

  useEffect(() => {
    if (users) {
      if (users.filter(user => user.isAdmin === true).length > 1) {
        setIsOneAdmin(false);
      } else {
        setIsOneAdmin(true);
      }
    } else {
      setIsOneAdmin(true);
    }
  }, [users]);
  useEffect(() => {
    if (operators.length === 0) fetchCallOperators();
  }, []);

  useEffect(() => {
    operators.map(operator => {
      if (operator?.prospectTenantPerson?.id === row.id) {
        setNumber(operator.number);
      } else {
        setNumber(undefined)
      }
    });
  }, [operators, visible]);
  return (
    <Modal
      visible={visible}
      footer={null}
      width={700}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div className={styles.MoreDetails}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
          <Col>
            <span className={styles.header}>{`${row.name}${' '}${
              row.lastName
            }`}</span>
          </Col>
        </Row>
        <Section
          section={t('users:details:businessUnit')}
          value={
            row.businessUnits?.length === 0 ? (
              allBusinessUnits?.find(({ id }) => id === null)?.name
            ) : row.businessUnits?.length > 1 ? (
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                {row.businessUnits?.[0]?.name}
                <Tooltip
                  placement="right"
                  title={
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {row.businessUnits?.map(({ name }) => (
                        <span>{name}</span>
                      ))}
                    </div>
                  }
                >
                  <span className={styles.serialNumberCount}>
                    {row.businessUnits?.length}
                  </span>
                </Tooltip>
              </div>
            ) : (
              row.businessUnits?.[0]?.name
            )
          }
        />
        <Section section={t('users:details:name')} value={row.name || '-'} />
        <Section section={t('users:details:lastName')} value={row.lastName || '-'} />
        <Section section={t('users:details:email')} value={row.email || '-'} />
        <Section
          section={t('users:details:role')}
          value={
            row.isChief
              ? isOneAdmin
                ? 'Təsisçi'
                : 'Həmtəsisçi'
              : row.roleName || '-'
          }
        />
        <Section
          section={t('users:details:status')}
          value={row.isConnected === 2 ? t('constants:userStatusTypes:connected') : t('constants:userStatusTypes:notConnected')}
        />
        <Section
          section={t('users:details:number')}
          value={isLoading ? <Spin size="small" /> : number || '-'}
        />
        <Section
          section={t('users:details:employeeFullName')}
          value={row.employeeFullName || '-'}
        />
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  operators: state.internalCallsReducer.operators,
  users: state.usersReducer.users,
  isLoading: state.loadings.fetchCallOperators,
});

export default connect(
  mapStateToProps,
  { fetchCallOperators }
)(MoreDetails);
