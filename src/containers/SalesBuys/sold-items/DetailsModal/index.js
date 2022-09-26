/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, Spin } from 'antd';
import { ProCollapse, ProPanel } from 'components/Lib';
import { fetchSoldItemDetails } from 'store/actions/operations/sold-items';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  fullDateTimeWithSecond,
} from 'utils';
// import ExportJsonExcel from 'js-export-excel';
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
  selectedSoldItemDetails,
  mainCurrencyCode,
  fetchSoldItemDetails,
}) => {
  const sections = [
    {
      name: 'Anbar',
      value: selectedSoldItemDetails.warehouseName,
      defaultValue: '-',
    },
    {
      name: 'Kataloq',
      value: selectedSoldItemDetails.rootCatalogName,
      defaultValue: '-',
    },
    {
      name: 'Alt kataloq',
      value: selectedSoldItemDetails.catalogName,
      defaultValue: '-',
    },
    {
      name: 'Məhsul adı',
      value: selectedSoldItemDetails.productName,
      defaultValue: '-',
    },
    {
      name: 'Say',
      value: formatNumberToLocale(
        defaultNumberFormat(selectedSoldItemDetails.quantity || 0)
      ),
      defaultValue: '-',
    },
    {
      name: 'Vahidin qiyməti',
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          selectedSoldItemDetails.pricePerUnitInMainCurrency || 0
        )
      )} ${mainCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Vahidin maya dəyəri',
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          selectedSoldItemDetails.costPerUnitInMainCurrency || 0
        )
      )} ${mainCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: `Cəmi endirim (${roundTo(
        math.div(
          math.mul(
            Number(selectedSoldItemDetails.discountAmountPerUnit) || 0,
            Number(selectedSoldItemDetails.quantity) || 0,
            Number(selectedSoldItemDetails.rate) || 0,
            100
          ),
          selectedSoldItemDetails.totalPriceInMainCurrency || 0
        ),
        4
      ) || '0.00'}%)`,
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          math.mul(
            Number(selectedSoldItemDetails.discountAmountPerUnit) || 0,
            Number(selectedSoldItemDetails.quantity) || 0,
            Number(selectedSoldItemDetails.rate) || 0
          ) || 0
        )
      )} ${mainCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Son qiymət',
      value: `${formatNumberToLocale(
        defaultNumberFormat(
          math.mul(
            Number(selectedSoldItemDetails.endPricePerUnitInMainCurrency) || 0,
            Number(selectedSoldItemDetails.quantity) || 0
          ) || 0
        )
      )} ${mainCurrencyCode}`,
      defaultValue: '-',
    },
    {
      name: 'Qaimə',
      value: selectedSoldItemDetails.invoiceNumber,
      defaultValue: '-',
    },
    {
      name: 'Alıcı',
      value: selectedSoldItemDetails.clientName,
      defaultValue: '-',
    },
    {
      name: 'Satış meneceri',
      value: selectedSoldItemDetails.salesman,
      defaultValue: '-',
    },
    {
      name: 'Agent',
      value: selectedSoldItemDetails.agent,
      defaultValue: '-',
    },
    {
      name: 'İcra tarixi',
      value: `${moment(selectedSoldItemDetails.createdAt).format(
        fullDateTimeWithSecond
      )}`,
      defaultValue: '-',
    },
    {
      name: 'Əməliyyat tarixi',
      value: `${moment(selectedSoldItemDetails.operationDate).format(
        fullDateTimeWithSecond
      )}`,
      defaultValue: '-',
    },
    {
      name: 'Müqavilə',
      value: selectedSoldItemDetails.contractNumber,
      defaultValue: '-',
    },
    {
      name: 'Əməliyyatçı',
      value: selectedSoldItemDetails.operator,
      defaultValue: '-',
    },
    {
      name: 'Məhsul kodu',
      value: selectedSoldItemDetails.productCode,
      defaultValue: '-',
    },
    {
      name: 'Barkod',
      value: selectedSoldItemDetails.productBarcode,
      defaultValue: '-',
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    row.invoiceId &&
      row.productId &&
      fetchSoldItemDetails(row.invoiceId, row.productId, {serialNumber: filters.serialNumber});
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
                {selectedSoldItemDetails.productName}
              </span>
            </Col>
            {/* <Col span={8} offset={8} align="end">
              <IconButton
                buttonSize="large"
                icon="printer"
                iconWidth={18}
                iconHeight={18}
                onClick={window.print}
                className={styles.exportButton}
              />
            </Col> */}
          </Row>
          {sections.map(section => (
            <Section
              section={section.name}
              value={section.value || section.defaultValue}
            />
          ))}
          <ProCollapse>
            <ProPanel
              header={`Seriya nömrəsi(${selectedSoldItemDetails.serialNumbers &&
                selectedSoldItemDetails.serialNumbers.length})`}
              id="parent1"
              key="1"
              style={{ padding: 0, fontSize: '16px!important' }}
            >
              <div className={styles.serialContainer}>
                {selectedSoldItemDetails.serialNumbers &&
                  selectedSoldItemDetails.serialNumbers.map(serialNumber => (
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      {serialNumber}{' '}
                    </div>
                  ))}
              </div>
            </ProPanel>
          </ProCollapse>
          <hr
            style={{
              border: 'none',
              marginTop: '10px',
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
                {selectedSoldItemDetails.invoiceDescription ? selectedSoldItemDetails.invoiceDescription : 'Təyin edilməyib'}
              </p>
            </ProPanel>
          </ProCollapse>
        </div>
      </Spin>
    </Modal>
  );
};

const mapStateToProps = state => ({
  isLoading: state.soldItemsReducer.isLoading,
  selectedSoldItemDetails: state.soldItemsReducer.selectedSoldItemDetails,
  mainCurrencyCode: state.soldItemsReducer.mainCurrencyCode,
});

export default connect(
  mapStateToProps,
  {
    fetchSoldItemDetails,
  }
)(DetailsModal);
