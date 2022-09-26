import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { Modal, Row, Col, Button, Table, Tooltip } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { DetailButton, Can } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import Invoices from './invoices';
import styles from './styles.module.scss';

const math = require('exact-math');

const MoreDetails = ({
  visible,
  row,
  isLoading,
  selectedEmployeeBonuses,
  fetchSalesInvoiceList,
  setIsVisible,
  mainCurrency,
  rate,
}) => {
  const [invoiceIsVisible, setInvoiceIsVisible] = useState(false);
  const [invoice, setInvoice] = useState(false);
  const [selectedRow, setSelectedRow] = useState(undefined);

  const handleDetailClick = row => {
    setSelectedRow(row);
    setInvoiceIsVisible(true);
  };
  useEffect(() => {
    if (selectedRow) {
      fetchSalesInvoiceList({
        filters: {
          invoices: selectedRow.invoiceIds,
          invoiceTypes: [2],
          isDeleted: 0,
          limit: 1000,
        },
        onSuccess: res => {
          setInvoice(res.data);
        },
      });
    }
  }, [selectedRow]);
  const handleTotalData = selectedEmployeeBonuses => {
    if (selectedEmployeeBonuses.length > 0) {
      const totalCalculatedBonus = selectedEmployeeBonuses.reduce(
        (total, current) =>
          math.add(total, Number(current.calculatedBonus) || 0),
        0
      );

      return [
        {
          isTotal: true,
          calculatedBonus: totalCalculatedBonus,
        },
      ];
    }
    return [];
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (_, { isTotal }, index) => (isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Kataloq',
      dataIndex: 'catalog',
      ellipsis: true,
      width: 100,
      render: (value, { isTotal }) =>
        isTotal ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || 'Hamısı'}</span>
          </Tooltip>
        ),
    },
    {
      title: 'Alt kataloq',
      dataIndex: 'subCatalog',
      ellipsis: true,
      width: 100,
      render: (value, { isTotal }) =>
        isTotal ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || 'Hamısı'}</span>
          </Tooltip>
        ),
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'product',
      width: 120,
      ellipsis: true,
      render: (value, { isTotal }) =>
        isTotal ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || 'Hamısı'}</span>
          </Tooltip>
        ),
    },
    {
      title: `Satış dövriyyəsi(${mainCurrency?.code})`,
      dataIndex: 'totalTurnover',
      width: 120,
      render: (value, { turnoverUnitOfMeasurement, isTotal }) =>
        isTotal
          ? ''
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
              turnoverUnitOfMeasurement === 1 ? 'Ədəd' : mainCurrency?.code
            }`,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonusAmount',
      width: 120,
      render: (value, { bonusUnitOfMeasurement, isTotal }) =>
        isTotal
          ? ''
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
              bonusUnitOfMeasurement === 1 ? '%' : mainCurrency?.code
            }`,
    },
    {
      title: `Hesablanan bonus (${mainCurrency?.code})`,
      dataIndex: 'calculatedBonus',
      width: 150,
      render: (value, { isTotal }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: `Hesablanan bonus (${row?.currencyCode})`,
      dataIndex: 'calculatedBonus',
      width: 150,
      render: (value, { isTotal }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(math.div(value, rate || 1))
        )} ${row?.currencyCode}`,
    },
    {
      title: 'Seç',
      dataIndex: 'id',
      width: 80,
      align: 'center',
      render: (id, row) =>
        row.isTotal ? null : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DetailButton
              onClick={() => handleDetailClick(row)}
              style={{ height: '30px' }}
            />
          </div>
        ),
    },
  ];
  return (
    <>
      <Invoices
        visible={invoiceIsVisible}
        row={selectedRow}
        invoices={invoice}
        setIsVisible={setInvoiceIsVisible}
        selectedEmployeeBonuses={selectedEmployeeBonuses}
      />
      <Modal
        visible={visible}
        footer={null}
        width={1200}
        closable={false}
        maskClosable
        className={styles.customBonusModal}
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
          <Row
            type="flex"
            style={{ alignItems: 'center', marginBottom: '40px' }}
          >
            <Col span={12} className={styles.ellipsisDiv}>
              <Tooltip
                placement="topLeft"
                title={`${row?.name} ${row?.surname} ${row?.patronymic}`}
              >
                <span
                  className={styles.header}
                >{`${row?.name} ${row?.surname} ${row?.patronymic}`}</span>
              </Tooltip>
            </Col>
          </Row>
          {handleTotalData(selectedEmployeeBonuses)?.[0]?.calculatedBonus ==
            row?.bonusAmount ||
          handleTotalData(selectedEmployeeBonuses).length === 0 ||
          isLoading ? null : (
            <Row>
              {
                <div className={styles.infoWarning}>
                  <p className={styles.fade}>
                    Köhnə qaimələridə dəyişiklik edildikdə, siyahıda əks olunan
                    məbləğ ilə toplam məbləğ üst-üstə düşməyə bilər
                  </p>
                  <div>
                    <ExclamationIcon />
                  </div>
                </div>
              }
            </Row>
          )}
          <Row>
            <Col>
              <Table
                scroll={{ x: 'max-content' }}
                dataSource={selectedEmployeeBonuses}
                loading={isLoading}
                className={styles.invoiceTable}
                columns={columns}
                pagination={false}
                rowKey={record => record.id}
                rowClassName={styles.row}
              />
              {selectedEmployeeBonuses.length > 0 && (
                <Table
                  scroll={{ x: 'max-content' }}
                  dataSource={handleTotalData(selectedEmployeeBonuses)}
                  loading={isLoading}
                  className={styles.totalTable}
                  columns={columns}
                  pagination={false}
                  rowKey={record => record.id}
                  rowClassName={styles.row}
                />
              )}
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchSelectedEmployeeBonus,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  { fetchSalesInvoiceList }
)(MoreDetails);
