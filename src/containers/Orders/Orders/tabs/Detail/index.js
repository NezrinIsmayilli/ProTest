import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Col, Row } from 'antd';
import { ProPanel, ProCollapse } from 'components/Lib';
import { updateDescription } from 'store/actions/orders';
import ExportJsonExcel from 'js-export-excel';
import {
  visualStatuses,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import moment from 'moment';
import CustomTag from '../../../utils/CustomTag/index';
import Section from './Section';
import IconButton from '../../../utils/IconButton/index';
import styles from './styles.module.scss';

const { TextArea } = Input;

const Detail = ({
  updateDescription,
  selectedOrder,
  visible = false,
  toggleFetchAction,
}) => {
  const [isEditible, setIsEditible] = useState(false);
  const [information, setInformation] = useState(selectedOrder.description);

  const handleDescriptionChange = () => {
    setIsEditible(false);

    const items = {
      ...selectedOrder.items[1].map(product => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
    };

    const data = {
      partner: selectedOrder.partnerId,
      direction: selectedOrder.direction,
      deliveredByParty: selectedOrder.deliveredByParty,
      deliveredByTenantPerson: selectedOrder.deliveredByTenantPersonId,
      deliveryDate: selectedOrder.deliveryDate,
      description: information || null,
      isDraft: selectedOrder.isDraft,
      items_ul: items,
    };

    updateDescription(selectedOrder.id, data, () => {
      toggleFetchAction();
    });
  };

  const handleExport = () => {
    const option = {};
    const dataTable = [
      {
        Order: `S${String(new Date().getFullYear()).slice(-2)}/${
          selectedOrder.serialNumber
        }`,
        Status: selectedOrder.status,
        'Date of order': selectedOrder.createdAt,
        Counterparty: selectedOrder.partnerName,
        Amount: (Math.round(selectedOrder.totalPrice * 100) / 100).toFixed(2),
        'Number of goods': selectedOrder.totalQuantity,
        'Deadline of execution': selectedOrder.deliveryDate,
        'Days passed': 0,
        Stage: selectedOrder.stage,
        Description: information,
      },
    ];

    option.fileName = 'order-detail';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Order',
          'Status',
          'Date of order',
          'Counterparty',
          'Number of goods',
          'Deadline of execution',
          'Days passed',
          'Stage',
          'Description',
        ],
        sheetHeader: [
          'Order',
          'Status',
          'Date of order',
          'Counterparty',
          'Number of goods',
          'Deadline of execution',
          'Days passed',
          'Stage',
          'Description',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  if (!visible) return null;
  return (
    <div className={styles.Detail}>
      <Row type="flex" style={{ alignItems: 'center', margin: '0 0 25px 0' }}>
        <Col span={8} offset={16} align="end">
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

      <Section
        section="Sifarişin nömrəsi"
        value={
          selectedOrder.direction === 1
            ? `SFD${moment(
                selectedOrder.createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                'YYYY'
              ).format('YYYY')}/${selectedOrder.serialNumber}`
            : `SFX${moment( 
                selectedOrder.createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                'YYYY'
              ).format('YYYY')}/${selectedOrder.serialNumber}`
        }
      />
      <Section section="Qarşı tərəf" value={selectedOrder.partnerName} />
      <Section
        section="Daxil olan sifarişin nömrəsi"
        value={
          selectedOrder.direction === 1
            ? selectedOrder.partnerSerialNumber
              ? `SFX${moment(
                  selectedOrder.createdAt.replace(
                    /(\d\d)-(\d\d)-(\d{4})/,
                    '$3'
                  ),
                  'YYYY'
                ).format('YYYY')}/${selectedOrder.partnerSerialNumber}`
              : '-'
            : selectedOrder.partnerSerialNumber
            ? `SFD${moment(
                selectedOrder.createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                'YYYY'
              ).format('YYYY')}/${selectedOrder.partnerSerialNumber}`
            : '-'
        }
      />
      <Section
        section="Status"
        value={<CustomTag data={visualStatuses[selectedOrder.visualStage]} />}
      />
      <Section section="Sifariş tarixi" value={selectedOrder.createdAt} />
      <Section
        section="Məbləğ"
        value={formatNumberToLocale(
          defaultNumberFormat(selectedOrder.totalPrice)
        )}
      />
      <Section section="Say" value={selectedOrder.totalQuantity} />
      <Section
        section="Son icra tarixi"
        value={selectedOrder.deliveryDate || 'Sərbəst'}
      />
      <Section section="Gecikmə" value={selectedOrder.daysPassed || '-'} />
      <ProCollapse style={{ padding: 0 }}>
        <ProPanel
          header="Əlavə məlumat"
          id="parent1"
          key="1"
          style={{ padding: 0 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '8px',
              }}
              onClick={() => setIsEditible(true)}
            >
              <img
                width={13}
                height={15}
                src="/img/icons/arrow-down-2.svg"
                alt="iconAlt"
                className={styles.icon}
                style={{ marginRight: '7px' }}
              />
              Redaktə edin
            </Button>
            {!isEditible ? (
              <span
                className={styles.information}
                style={{ paddingTop: '16px', width: '100%' }}
              >
                {information}
              </span>
            ) : (
              <TextArea
                type="text"
                className={styles.information}
                style={{
                  margin: '16px 0 0 0 ',
                  padding: '20px',
                  backgroundColor: 'white',
                }}
                value={information}
                rows={2}
                onChange={e => setInformation(e.target.value)}
              />
            )}
            {isEditible && (
              <Col span={3} style={{ marginTop: '10px' }}>
                <Button
                  style={{
                    backgroundColor: '#55AB80',
                    fontSize: '14px',
                    color: 'white',
                  }}
                  size="large"
                  onClick={handleDescriptionChange}
                >
                  Yadda saxla
                </Button>
              </Col>
            )}
          </div>
        </ProPanel>
      </ProCollapse>
    </div>
  );
};

const mapStateToProps = state => ({
  orders: state.ordersReducer.orders,
  selectedOrder: state.ordersReducer.selectedOrder,
});

export default connect(
  mapStateToProps,
  {
    updateDescription,
  }
)(Detail);
