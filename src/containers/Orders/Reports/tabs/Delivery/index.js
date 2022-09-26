import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Checkbox, Col, Row } from 'antd';
import { ProSelect, ProDatePicker, ProButton } from 'components/Lib';
import { fullDateTime, todayWithMinutes } from 'utils';
import moment from 'moment';
import { updateDeliveryDetails } from 'store/actions/orders';
import styles from './styles.module.scss';

const range = (start, end) => {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
};

const disabledDate = current => {
  const defaultTime = moment('12:00', 'HH:mm');
  const endTime = moment();
  const isHalfDayPassed = defaultTime.isBefore(endTime);
  return current && isHalfDayPassed
    ? current < moment()
    : current < moment().subtract(1, 'days');
};

const disabledTime = () => ({
  // disabledHours: () => range(0, 24).splice(4, 20),
  // disabledMinutes: () => range(30, 60),
  disabledSeconds: () => range(1, 60),
});
const Delivery = ({
  tenant,
  expeditors,
  stageRoles,
  toggleFetchAction,
  selectedOrder,
  loading,
  updateDeliveryDetails,
  visible = false,
}) => {
  const [dateIsFree, setDateIsFree] = useState(false);
  const [deliveredByParty, setDeliveredByParty] = useState(undefined);
  const [orderDate, setOrderDate] = useState(undefined);
  const [prevDeliveredBy, setPrevDeliveredBy] = useState(undefined);
  const [deliveredBy, setDeliveredBy] = useState(undefined);
  const [expeditor, setExpeditor] = useState(undefined);

  useEffect(() => {
    if (selectedOrder) {
      const {
        deliveredByParty,
        deliveredByTenantPersonId,
        partnerId,
        direction,
        tenantId,
        deliveryDate,
      } = selectedOrder;
      if (deliveryDate) {
        setOrderDate(deliveryDate);
      } else {
        setDateIsFree(true);
      }
      if (deliveredByTenantPersonId) {
        setExpeditor(deliveredByTenantPersonId);
        setPrevDeliveredBy(deliveredByTenantPersonId);
      }
      if (
        (deliveredByParty === 1 && direction === 1) ||
        (deliveredByParty === 2 && direction === 2)
      ) {
        setDeliveredBy(tenant.id);
        setPrevDeliveredBy(tenant.id);
      } else {
        setDeliveredBy(partnerId);
        setPrevDeliveredBy(partnerId);
      }
    }
  }, [selectedOrder]);

  const handleExpeditorChange = expeditorId => {
    setExpeditor(expeditorId);
  };
  const handleOrderDateChange = date => {
    setOrderDate(date);
  };

  const handleUpdateOrder = () => {
    const data = {
      deliveryDate: orderDate || null,
      deliveredByParty:
        prevDeliveredBy === deliveredBy
          ? selectedOrder.deliveredByParty
          : selectedOrder.deliveredByParty === 1
          ? 2
          : 1,
      deliveredByTenantPerson:
        deliveredBy === tenant.id && stageRoles.allowToSelectTenantPerson
          ? expeditor || null
          : null,
    };
    updateDeliveryDetails(selectedOrder?.id, data, () => {
      toggleFetchAction();
    });
  };
  const handleFreeDate = checked => {
    if (checked) {
      setDateIsFree(true);
      setOrderDate(undefined);
    } else {
      setDateIsFree(false);

      setOrderDate(moment().format('DD-MM-YYYY HH:mm'));
    }
  };

  const handleDeliveryDirection = deliveryId => {
    setDeliveredBy(deliveryId);
    if (deliveredByParty === 1) {
      setDeliveredByParty(2);
    } else {
      setDeliveredByParty(1);
    }
  };
  if (!visible) return null;

  return (
    <div className={styles.Detail}>
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col className="gutter-row" span={8}>
          <span style={{ fontSize: '12px', marginBottom: '5px' }}>
            Sifariş tarixi
          </span>
          <ProDatePicker
            format={fullDateTime}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            disabled
            showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
            value={orderDate ? moment(orderDate, fullDateTime) : undefined}
            className={styles.datePicker}
            onChange={event =>
              handleOrderDateChange(event.format(fullDateTime))
            }
          />
          <Checkbox
            style={{ fontSize: '14px' }}
            checked={dateIsFree}
            disabled
            onChange={event => handleFreeDate(event.target.checked)}
          >
            Sərbəst
          </Checkbox>
        </Col>
        <Col className="gutter-row" span={8}>
          <span style={{ fontSize: '12px', marginBottom: '5px' }}>
            Daşıyan tərəf
          </span>
          <ProSelect
            value={deliveredBy}
            allowClear={false}
            disabled
            data={[
              tenant,
              {
                id: selectedOrder.partnerId,
                name: selectedOrder.partnerName,
              },
            ]}
            onChange={direction => handleDeliveryDirection(direction)}
          />
        </Col>
        {deliveredBy === tenant.id && stageRoles.allowToSelectTenantPerson ? (
          selectedOrder.isSoloWorkflow === false ? (
            deliveredBy === tenant.id ? (
              <Col className="gutter-row" span={8}>
                <span style={{ fontSize: '12px', marginBottom: '5px' }}>
                  Ekspeditor
                </span>
                <ProSelect
                  allowClear={false}
                  value={expeditor}
                  keys={['tenantPersonName', 'tenantPersonLastName']}
                  onChange={expeditor => handleExpeditorChange(expeditor)}
                  disabled
                  data={expeditors.map(expeditor => ({
                    ...expeditor,
                    id: expeditor.tenantPersonId,
                  }))}
                />
              </Col>
            ) : null
          ) : selectedOrder.tenantId === tenant.id &&
            deliveredBy === tenant.id ? (
            <Col className="gutter-row" span={8}>
              <span style={{ fontSize: '12px', marginBottom: '5px' }}>
                Ekspeditor
              </span>
              <ProSelect
                allowClear={false}
                value={expeditor}
                keys={['tenantPersonName', 'tenantPersonLastName']}
                onChange={expeditor => handleExpeditorChange(expeditor)}
                disabled
                data={expeditors.map(expeditor => ({
                  ...expeditor,
                  id: expeditor.tenantPersonId,
                }))}
              />
            </Col>
          ) : null
        ) : null}
      </Row>
      <ProButton
        style={{ margin: '10px' }}
        disabled
        loading={loading}
        onClick={handleUpdateOrder}
      >
        Təsdiq et
      </ProButton>
    </div>
  );
};

const mapStateToProps = state => ({
  orders: state.ordersReducer.orders,
  stageRoles: state.orderRolesReducer.stageRoles,
  loading: state.loadings.updateDeliveryDetails,
  expeditors: state.orderRolesReducer.expeditors,
  // selectedOrder: state.ordersReducer.selectedOrder,
  tenant: state.tenantReducer.tenant,
});

export default connect(
  mapStateToProps,
  {
    updateDeliveryDetails,
  }
)(Delivery);
