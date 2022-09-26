import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Checkbox } from 'antd';
import { ProSelect, ProDatePicker, ProStage } from 'components/Lib';
import IconButton from 'containers/Orders/utils/IconButton';
import ExportJsonExcel from 'js-export-excel';
import moment from 'moment';

import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import { fullDateTime, order_statuses, historyStatuses } from 'utils';
import CashboxInfoButton from './CashboxInfoButton';
import styles from './styles.module.scss';

/*

(buyer.id === tenant.id &&
              deliveredBy === tenant.id &&
              stageRoles.allowToSelectTenantPerson) ||
            (seller.id === tenant.id &&
              deliveredBy === tenant.id &&
              stageRoles.allowToSelectTenantPerson)
              
*/
const Header = props => {
  const {
    partners,
    tenant,
    expeditors,
    orderActions,
    orderStates,
    stageRoles,
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    permissionsList,
  } = props;

  const {
    handleOrderStageChange,
    handleOrderDateChange,
    handleBuyerChange,
    handleExpeditorChange,
    handleDelivery,
    handleFreeDate,
  } = orderActions;
  const {
    selectedProducts,
    selectedCounterparty,
    deliveredBy,
    expeditor,
    orderDate,
    initialStatus,
    seller,
    buyer,
    dateIsFree,
  } = orderStates;

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

  const changeBuyer = value => {
    const buyer = partners.filter(partner => partner.id === value)[0];
    handleBuyerChange(buyer);
  };

  const handleExport = () => {
    const data = selectedProducts || [];
    const option = {};
    const dataTable = data.map(dataItem => ({
      Id: dataItem.id,
      Product: `${dataItem.catalogName} / ${dataItem.name}`,
      Quantity: dataItem.quantity,
      'Unit of measurement': dataItem.unitOfMeasurementName,
      'Price per unit': dataItem.pricePerUnit,
      Total: `${dataItem.quantity * dataItem.pricePerUnit}`,
    }));

    option.fileName = 'order-cart';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Product',
          'Quantity',
          'Unit of measurement',
          'Price per unit',
          'Total',
        ],
        sheetHeader: [
          'Id',
          'Product',
          'Quantity',
          'Unit of measurement',
          'Price per unit',
          'Total',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  return (
    <>
      <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
        <Col span={8}>
          <span className={styles.header}>Yeni sifariş</span>
        </Col>
        <Col span={8} offset={8} align="end">
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            buttonStyle={{ marginRight: '10px' }}
            onClick={handleExport}
          />
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={window.print}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col className="gutter-row" span={seller?.isTenant ? 5 : 6}>
          <span className={styles.filterName}>Təchizatçı</span>
          {seller?.id &&
            seller?.id !== tenant?.id &&
            (permissionsList.transaction_recievables_report.permission !== 0 &&
            permissionsList.transaction_payables_report.permission !== 0 ? (
              <CashboxInfoButton
                fetchInfo={callback =>
                  fetchInvoiceListByContactId(
                    selectedCounterparty?.contactId,
                    callback
                  )
                }
                fetchAdvance={callback =>
                  fetchAdvancePaymentByContactId(
                      selectedCounterparty?.contactId,
                      {},
                      callback
                  )
              }
              />
            ) : null)}
          <ProSelect disabled value={seller?.id} data={[...partners, tenant]} />
        </Col>
        <Col className="gutter-row" span={seller?.isTenant ? 5 : 6}>
          <span className={styles.filterName}>Sifarişçi</span>
          {buyer?.id &&
            seller?.id !== tenant?.id &&
            buyer?.id !== tenant?.id &&
            (permissionsList.transaction_recievables_report.permission !== 0 &&
            permissionsList.transaction_payables_report.permission !== 0 ? (
              <CashboxInfoButton
                fetchInfo={callback =>
                  fetchInvoiceListByContactId(
                    selectedCounterparty?.contactId,
                    callback
                  )
                }
                fetchAdvance={callback =>
                  fetchAdvancePaymentByContactId(
                      selectedCounterparty?.contactId,
                      {},
                      callback
                  )
              }
              />
            ) : null)}
          <ProSelect
            value={buyer?.id}
            disabled={seller?.id !== tenant?.id}
            data={[...partners, tenant].filter(
              partner => partner?.id !== seller?.id
            )}
            onChange={value => changeBuyer(value)}
          />
        </Col>
        <Col className="gutter-row" span={seller?.isTenant ? 5 : 6}>
          <span className={styles.filterName}>Çatdırılma tarixi</span>
          <ProDatePicker
            format={fullDateTime}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            disabled={dateIsFree}
            showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
            value={orderDate ? moment(orderDate, fullDateTime) : undefined}
            className={styles.datePicker}
            onChange={event =>
              handleOrderDateChange(event.format(fullDateTime))
            }
          />
          <Checkbox
            style={{ fontSize: '14px' }}
            onChange={event => handleFreeDate(event.target.checked)}
          >
            Sərbəst
          </Checkbox>
        </Col>
        <Col className="gutter-row" span={seller?.isTenant ? 5 : 6}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              <span className={styles.filterName}>Daşıyan tərəf</span>
              <ProSelect
                value={deliveredBy}
                onChange={direction => handleDelivery(direction)}
                data={[seller, buyer].filter(counterparty => counterparty)}
              />
            </div>
            {seller?.isTenant ? (
              deliveredBy === tenant.id &&
              stageRoles.allowToSelectTenantPerson &&
              initialStatus === 6 ? (
                <div>
                  <span className={styles.filterName}>Ekspeditor</span>
                  <ProSelect
                    value={expeditor}
                    keys={['tenantPersonName', 'tenantPersonLastName']}
                    onChange={expeditorId => handleExpeditorChange(expeditorId)}
                    data={expeditors.map(expeditor => ({
                      ...expeditor,
                      id: expeditor.tenantPersonId,
                    }))}
                  />
                </div>
              ) : null
            ) : deliveredBy === tenant.id &&
              stageRoles.allowToSelectTenantPerson ? (
              <div>
                <span className={styles.filterName}>Ekspeditor</span>
                <ProSelect
                  value={expeditor}
                  keys={['tenantPersonName', 'tenantPersonLastName']}
                  onChange={expeditorId => handleExpeditorChange(expeditorId)}
                  data={expeditors.map(expeditor => ({
                    ...expeditor,
                    id: expeditor.tenantPersonId,
                  }))}
                />
              </div>
            ) : null}
          </div>
        </Col>
        {seller?.isTenant ? (
          <Col span={4}>
            <span className={styles.filterName}>İlkin status:</span>
            <ProStage
              statuses={order_statuses}
              customStyle={styles.customStage}
              visualStage={historyStatuses[initialStatus]}
              onChange={id => {
                handleOrderStageChange(id);
              }}
            />
          </Col>
        ) : null}
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  expeditors: state.orderRolesReducer.expeditors,
  actionLoading: state.ordersReducer.actionLoading,
  partners: state.partnersReducer.partners,
  stageRoles: state.orderRolesReducer.stageRoles,
  tenant: state.tenantReducer.tenant,
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { fetchInvoiceListByContactId, fetchAdvancePaymentByContactId }
)(Header);
