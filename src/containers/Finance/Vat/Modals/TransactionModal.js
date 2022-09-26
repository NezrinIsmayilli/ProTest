/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row, Modal } from 'antd';
import {
  fetchFinOperations,
  fetchInvoiceContent,
} from 'store/actions/vat-invoices';
import {
    getCreditPayment,
    fetchCreditPayments,
} from 'store/actions/finance/paymentTable';
import { roundToDown } from 'utils';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import PaymentTableTab from 'containers/Finance/PaymentTable/operationDetails/paymentTableTab';
import FinOperations from './fin-operations';
import InvoiceContent from './invoice-content';
import styles from '../styles.module.scss';

const roundTo = require('round-to');
const math = require('exact-math');

function TransactionModal(props) {
  const {
    type,
    visible,
    setIsVisible,
    data = {},
    setType,
    fetchFinOperations,
    finOperations,
    fetchInvoiceContent,
    invoiceContent,
    fetchMainCurrency,
    getCreditPayment,
    fetchCreditPayments,
    creditPayments,
    creditPaymentsLoading,
  } = props;

  const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [creditPayment, setCreditPayment] = useState([]);

  useEffect(() => {
    let tmp = {};
    if (
      invoiceContent.invoiceProducts &&
      invoiceContent.invoiceProducts.content.length > 0
    ) {
      invoiceContent.invoiceProducts.content.forEach((value, index) => {
        if (tmp[value.productId]) {
          tmp = {
            ...tmp,
            [value.productId]: {
              ...tmp[value.productId],
              quantity: tmp[value.productId].quantity + Number(value.quantity),
            },
          };
        } else {
          tmp[value.productId] = {
            id: index + 1,
            product: value.productId,
            productName: value.productName,
            catalogName: value.catalogName,
            quantity: roundTo(Number(value.quantity), 2),
            pricePerUnit: roundTo(Number(value.pricePerUnit), 2),
            unitsOfMeasurementName: value.unitsOfMeasurementName,
            currencyCode: value.currencyCode,
          };
        }
      });
      setMergedInvoiceContent(Object.values(tmp));
      setSummaryData([
        {
          isSummary: true,
          id: 'Total',
          pricePerUnit:
            Object.values(tmp).reduce(
              (initialValue, currentValue) =>
                initialValue + roundTo(Number(currentValue.pricePerUnit), 2),
              0
            ) || '',

          quantity:
            Object.values(tmp).reduce(
              (initialValue, currentValue) =>
                initialValue + roundTo(Number(currentValue.quantity), 2),
              0
            ) || '',
          total:
            Object.values(tmp).reduce(
              (initialValue, currentValue) =>
                initialValue +
                roundTo(
                  Number(currentValue.pricePerUnit) *
                    Number(currentValue.quantity),
                  2
                ),
              0
            ) || '',
          currencyCode: Object.values(tmp)[0]?.currencyCode || '',
        },
        {
          isDiscount: true,
          id: `Endirim(${roundToDown(
            math.div(
              math.mul(Number(invoiceContent.discountAmount || 0) || 0, 100),
              Object.values(tmp).reduce(
                (initialValue, currentValue) =>
                  initialValue +
                  roundTo(
                    Number(currentValue.pricePerUnit) *
                      Number(currentValue.quantity),
                    2
                  ),
                0
              ) || 0
            ),
            4
          ) || ''}%)`,
          total: invoiceContent.discountAmount
            ? invoiceContent.discountAmount
            : '-',
          currencyCode: invoiceContent.discountAmount
            ? Object.values(tmp)[0]?.currencyCode || ''
            : '',
        },
        {
          isEndPrice: true,
          id: 'Son qiymət',
          total: invoiceContent.invoiceProducts.result.endPrice
            ? invoiceContent.invoiceProducts.result.endPrice
            : '-',
          currencyCode: invoiceContent.invoiceProducts.result.endPrice
            ? Object.values(tmp)[0]?.currencyCode || ''
            : '',
        },
        {
          isVat: true,
          id: `ƏDV(${
            invoiceContent?.cost !== null
              ? roundToDown(
                  math.div(
                    math.mul(Number(invoiceContent?.taxAmount || 0) || 0, 100),
                    invoiceContent?.cost || 0
                  ),
                  4
                )
              : roundToDown(
                  math.div(
                    math.mul(Number(invoiceContent?.taxAmount || 0) || 0, 100),
                    invoiceContent?.endPrice || 0
                  ),
                  4
                ) || ''
          }%)`,
          total: invoiceContent.taxAmount
            ? roundToDown(invoiceContent.taxAmount, 2)
            : '-',
          currencyCode: invoiceContent.taxAmount
            ? Object.values(tmp)[0]?.currencyCode || ''
            : '',
        },
      ]);
    } else {
      setSummaryData([]);
      setMergedInvoiceContent([]);
    }
  }, [invoiceContent]);

    useEffect(() => {
        if (
            invoiceContent &&
            Object.keys(invoiceContent).length > 0 &&
            invoiceContent.creditId !== null
        ) {
            getCreditPayment({
                id: invoiceContent.creditId,
                onSuccess: ({ data }) => {
                    setCreditPayment(data);
                },
            });
        }
    }, [invoiceContent]);



  useEffect(() => {
    if (data.id) {
      fetchFinOperations({ filters: { vat: 1, invoices: [data.id] } });
      fetchInvoiceContent(data.id);
    }
  }, [data.id]);
  useEffect(() => {
    fetchMainCurrency();
    fetchCreditPayments({ filters: { limit: 1000 } });
  }, []);
  return (
    <Modal
      visible={visible}
      footer={null}
      width={1000}
      closable={false}
      onCancel={() => setIsVisible(false)}
      className={styles.customModal}
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
      <div className={styles.OperationsModal} style={{ alignItems: 'center' }}>
        <Row style={{ width: '100%', marginTop: 16 }}>
          <Col span={24}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                onClick={() => setIsVisible(false)}
                type="link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#464A4B',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '16px',
                }}
              >
                Qaimə Siyahısına qayıt
              </Button>
            </div>
          </Col>
        </Row>

       {(data.invoiceType !== 12 && data.invoiceType !== 13) || data.creditId ?( <Row style={{ width: '100%', marginTop: 16 }}>
          <Col span={8} offset={data.creditId ? 0 :4}>
            <Button
              onClick={() => setType(1)}
              style={{
                width: '100%',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              size="large"
              type={type === 1 ? 'primary' : ''}
            >
              Maliyyə əməliyyatları ({finOperations.length})
            </Button>
          </Col>
          {data.invoiceType !== 12 && data.invoiceType !== 13 ? (<Col span={8}>
            <Button
              onClick={() => setType(2)}
              style={{
                width: '100%',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              size="large"
              type={type === 2 ? 'primary' : ''}
            >
              Qaimənin tərkibi ({summaryData[0]?.quantity})
            </Button>
          </Col>):
          null}
          {data.creditId ? 
            (<Col span={8}>
            <Button
                size="large"
                type={type === 3 ? 'primary' : ''}
                onClick={() => setType(3)}
                style={{
                  width: '100%',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
            >
                Ödəniş cədvəli ({creditPayment?.length})
            </Button>
          </Col>
          ): null}
        </Row>): null}
        {type === 1 ? (
          <FinOperations data={data} />
        ) : type === 2 ? (
          <InvoiceContent
            data={data}
            mergedInvoiceContent={mergedInvoiceContent}
            summaryData={summaryData}
          />
        ) : (
          <PaymentTableTab
              details={invoiceContent? invoiceContent : {}}
              creditRow={creditPayments.find(
                creditPayment =>
                    creditPayment.creditId === invoiceContent?.creditId
              )}
              creditPayment={creditPayment}
              loading={creditPaymentsLoading}
          />
        )}
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  finOperations: state.vatInvoicesReducer.finOperations,
  invoiceContent: state.vatInvoicesReducer.invoiceContent,
  creditPayments: state.paymentTableReducer.creditPayments,
  creditPaymentsLoading: state.loadings.fetchCreditPayments,
});

export default connect(
  mapStateToProps,
  {
    fetchFinOperations,
    fetchInvoiceContent,
    fetchMainCurrency,
    getCreditPayment,
    fetchCreditPayments
  }
)(TransactionModal);
