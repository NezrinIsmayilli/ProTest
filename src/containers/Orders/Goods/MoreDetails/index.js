import { Button, Col, Modal, Row } from 'antd';
import { ProCollapse, ProPanel } from 'components/Lib';
import ExportJsonExcel from 'js-export-excel';
import React from 'react';
import { connect } from 'react-redux';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import IconButton from '../../utils/IconButton/index';
import Section from './Section';
import styles from './styles.module.scss';

const MoreDetails = ({ visible, row, setIsVisible }) => {
  const handleExport = () => {
    const option = {};
    const dataTable = [
      {
        Category: row.parentCatalogName || row.catalogName,
        'Sub category': row.catalogName,
        'Name of product': row.name,
        'Unit of measurement': row.unitOfMeasurementName,
        'Price per unit': (Math.round(row.pricePerUnit * 100) / 100).toFixed(2),
        'Additional information': row.description,
      },
    ];

    option.fileName = 'order-detail';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Sub category',
          'Name of product',
          'Unit of measurement',
          'Price per unit',
          'Additional information',
        ],
        sheetHeader: [
          'Sub category',
          'Name of product',
          'Unit of measurement',
          'Price per unit',
          'Additional information',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };
  return (
    <Modal
      visible={visible}
      footer={null}
      closable={false}
      width={1000}
      maskClosable
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
          <Col span={12}>
            <span className={styles.header}>
              {row.name} - {row.parentCatalogName}
            </span>
          </Col>
          <Col span={8} offset={4} align="end">
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

        <Section section="Kataloq" value={row.parentCatalogName || '-'} />
        <Section section="Alt kataloq" value={row.catalogName || '-'} />
        <Section section="Məhsul adı" value={row.name || '-'} />
        <Section
          section="Ölçü vahidi"
          value={row.unitOfMeasurementName || '-'}
        />
        <Section
          section="Vahidin qiyməti"
          value={
            row.pricePerUnit
              ? `${formatNumberToLocale(
                  defaultNumberFormat(row.pricePerUnit)
                )} ${row.currencyCode}`
              : '-'
          }
        />
        <Section
          section="Anbardakı miqdar"
          value={
            row.pricePerUnit
              ? `${formatNumberToLocale(Number(row.stockAmount))} `
              : '-'
          }
        />
        <ProCollapse>
          <ProPanel
            header="Əlavə məlumat"
            id="parent1"
            key="1"
            style={{ padding: 0 }}
          >
            <p className={styles.information}>
              {row.description ? row.description : 'Təyin edilməyib'}
            </p>
          </ProPanel>
        </ProCollapse>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => ({
  goods: state.goodsReducer.goods,
});

export default connect(
  mapStateToProps,
  null
)(MoreDetails);
