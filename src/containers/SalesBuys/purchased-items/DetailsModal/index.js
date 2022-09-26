/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, Spin } from 'antd';
import { ProCollapse, ProPanel } from 'components/Lib';
import { fetchPurchasedItemDetails } from 'store/actions/operations/purchased-items';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  fullDateTimeWithSecond,
} from 'utils';
import moment from 'moment';
import Section from './Section';
import styles from './styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const DetailsModal = ({
  filters,
  visible = true,
  row = {},
  setIsVisible = () => {},
  isLoading,
  fetchPurchasedItemDetails,
  selectedPurchasedItemDetails,
}) => {
  const sections = [
    {
      name: 'Anbar',
      value: selectedPurchasedItemDetails.warehouseName,
      defaultValue: '-',
    },
    {
      name: 'Kataloq',
      value: selectedPurchasedItemDetails.rootCatalogName,
      defaultValue: '-',
    },
    {
      name: 'Alt kataloq',
      value: selectedPurchasedItemDetails.catalogName,
      defaultValue: '-',
    },
    {
      name: 'Məhsul adı',
      value: selectedPurchasedItemDetails.productName,
      defaultValue: '-',
    },
    {
      name: 'Say',
      value: formatNumberToLocale(
        defaultNumberFormat(selectedPurchasedItemDetails.quantity || 0)
      ),
      defaultValue: '-',
    },
    {
      name: 'Ölçü vahidi',
      value: selectedPurchasedItemDetails.unitOfmeasuring,
      defaultValue: '-',
    },
    {
      name: 'Vahidin qiyməti',
      value: `${formatNumberToLocale(
        defaultNumberFormat(selectedPurchasedItemDetails.costPerUnit || 0)
      )} ${row.invoiceCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: `Endirim (${roundTo(
        math.div(
          math.mul(
            Number(selectedPurchasedItemDetails.discountAmountPerUnit) || 0,
            Number(selectedPurchasedItemDetails.quantity) || 0,
            100
          ),
          selectedPurchasedItemDetails.totalCost || 0
        ),
        4
      ) || '0.00'}%)`,
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          math.mul(
            Number(selectedPurchasedItemDetails.discountAmountPerUnit) || 0,
            Number(selectedPurchasedItemDetails.quantity) || 0
          ) || 0
        )
      )} ${row.invoiceCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Son qiymət',
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          math.mul(
            Number(selectedPurchasedItemDetails.endPricePerUnit) || 0,
            Number(selectedPurchasedItemDetails.quantity) || 0
          ) || 0
        )
      )} ${row.invoiceCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Vahidin son qiyməti',
      value: `${formatNumberToLocale(
        defaultNumberFormat(selectedPurchasedItemDetails.endPricePerUnit || 0)
      )} ${row.invoiceCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Qaimə',
      value: selectedPurchasedItemDetails.invoiceNumber,
      defaultValue: '-',
    },
    {
      name: 'Təchizatçı',
      value: selectedPurchasedItemDetails.supplier,
      defaultValue: '-',
    },
    {
      name: 'İcra tarixi',
      value: `${moment(selectedPurchasedItemDetails.createdAt).format(
        fullDateTimeWithSecond
      )}`,
      defaultValue: '-',
    },
    {
      name: 'Əməliyyat tarixi',
      value: `${moment(selectedPurchasedItemDetails.operationDate).format(
        fullDateTimeWithSecond
      )}`,
      defaultValue: '-',
    },
    {
      name: 'Müqavilə',
      value: selectedPurchasedItemDetails.contractNumber,
      defaultValue: '-',
    },
    {
      name: 'Agent',
      value: selectedPurchasedItemDetails.agent,
      defaultValue: '-',
    },
    {
      name: 'Əməliyyatçı',
      value: selectedPurchasedItemDetails.operator,
      defaultValue: '-',
    },
    {
      name: 'Məhsul kodu',
      value: selectedPurchasedItemDetails.productCode,
      defaultValue: '-',
    },
    {
      name: 'Barkod',
      value: selectedPurchasedItemDetails.productBarcode,
      defaultValue: '-',
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    row.invoiceId &&
      row.productId &&
      fetchPurchasedItemDetails(row.invoiceId, row.productId, {serialNumber: filters.serialNumber});
  }, [row]);

  return (
    <Modal
      isLoading={isLoading}
      visible={visible}
      footer={null}
      width={1000}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Spin spinning={isLoading}>
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
        <div className={styles.DetailsModal}>
          <Row
            type="flex"
            style={{ alignItems: 'center', marginBottom: '40px' }}
          >
            <Col span={8}>
              <span className={styles.header}>
                {selectedPurchasedItemDetails.productName}
              </span>
            </Col>
          </Row>
          {sections.map(section => (
            <Section
              section={section.name}
              key={section.name}
              value={section.value || section.defaultValue}
            />
          ))}
          <ProCollapse>
            <ProPanel
              header={`Seriya nömrəsi(${selectedPurchasedItemDetails.serialNumbers &&
                selectedPurchasedItemDetails.serialNumbers.length})`}
              id="parent1"
              key="1"
              style={{ padding: 0, fontSize: '16px!important' }}
            >
              <div className={styles.serialContainer}>
                {selectedPurchasedItemDetails.serialNumbers &&
                  selectedPurchasedItemDetails.serialNumbers.map(
                    serialNumber => (
                      <div style={{ display: 'inline-block', margin: '10px' }}>
                        {serialNumber}{' '}
                      </div>
                    )
                  )}
              </div>
            </ProPanel>
          </ProCollapse>
          <hr
            style={{
              border: 'none',
              marginTop: '9px',
              borderBottom: '1px solid #DBDBDB',
            }}
          />
          <ProCollapse style={{ marginTop: '20px' }}>
            <ProPanel
              header="Əlavə məlumat"
              id="parent2"
              key="2"
              style={{ padding: 0 }}
            >
              <p className={styles.information}>
                {selectedPurchasedItemDetails.invoiceDescription ? selectedPurchasedItemDetails.invoiceDescription : 'Təyin edilməyib'}
              </p>
            </ProPanel>
          </ProCollapse>
        </div>
      </Spin>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.purchasedItemsReducer.isLoading,
  selectedPurchasedItemDetails:
    state.purchasedItemsReducer.selectedPurchasedItemDetails,
});

export default connect(
  mapStateToProps,
  {
    fetchPurchasedItemDetails,
  }
)(DetailsModal);
