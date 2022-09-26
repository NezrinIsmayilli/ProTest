import { Button, Col, Row } from 'antd';
import IconButton from 'containers/Orders/utils/IconButton';
import React from 'react';
import { connect } from 'react-redux';
import { createOrder } from 'store/actions/orders';
import styles from './styles.module.scss';

const Footer = props => {
  const {
    tenant,
    createOrder,
    stageRoles,
    orderActions,
    orderStates,
    createOrderLoading,
    createDraftOrderLoading,
  } = props;
  const { completeOrder } = orderActions;
  const {
    seller,
    buyer,
    expeditor,
    orderDate,
    deliveredBy,
    selectedProducts,
    dateIsFree,
    initialStatus,
  } = orderStates;

  return (
    <Row gutter={16} style={{ marginTop: '36px' }}>
      <Col className="gutter-row" span={4}>
        <Button
          loading={createOrderLoading}
          style={{
            backgroundColor: '#55AB80',
            width: '100%',
            fontSize: '14px',
            color: 'white',
          }}
          size="large"
          onClick={() => completeOrder(false, createOrder, tenant)}
          disabled={
            !seller?.id ||
            !buyer?.id ||
            !deliveredBy ||
            (deliveredBy === tenant.id &&
              !expeditor &&
              initialStatus === 6 &&
              stageRoles.allowToSelectTenantPerson) ||
            (!orderDate && !dateIsFree) ||
            !selectedProducts.length ||
            createOrderLoading
          }
        >
          Təsdiq et
        </Button>
      </Col>
      <Col className="gutter-row" span={4}>
        <IconButton
          loading={createDraftOrderLoading}
          buttonSize="large"
          label="Qaralama"
          icon="timer"
          iconWidth={18}
          iconHeight={20}
          className={styles.draftButton}
          disabled={
            !seller?.id ||
            !buyer?.id ||
            !deliveredBy ||
            (deliveredBy === tenant.id &&
              !expeditor &&
              initialStatus === 6 &&
              stageRoles.allowToSelectTenantPerson) ||
            (!orderDate && !dateIsFree) ||
            !selectedProducts.length ||
            createOrderLoading
          }
          onClick={() => completeOrder(true, createOrder, tenant)}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  createOrderLoading: state.loadings.createOrder,
  stageRoles: state.orderRolesReducer.stageRoles,

  createDraftOrderLoading: state.loadings.createDraftOrder,
});

export default connect(
  mapStateToProps,
  {
    createOrder,
  }
)(Footer);
