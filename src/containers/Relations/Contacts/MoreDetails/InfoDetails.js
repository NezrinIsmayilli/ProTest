import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Tooltip } from 'antd';
import { ProPanel, ProCollapse, CustomTag } from 'components/Lib';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    contactCategories,
    roundToDown,
} from 'utils';
import IconButton from '../../utils/IconButton/index';
import Section from './Section';
import styles from './styles.module.scss';

const math = require('exact-math');

const InfoDetails = props => {
    const { row, invoices, advancePayment } = props;

    const [receivables, setReceivables] = useState({});
    const [payables, setPayables] = useState({});
    const [advance, setAdvance] = useState({});

    useEffect(() => {
        setAdvance(
            advancePayment?.myAmount?.concat(
                advancePayment?.contactsAmount?.map(currencyBalance => ({
                    ...currencyBalance,
                    amount: math.mul(Number(currencyBalance.amount), -1),
                }))
            )
        );
    }, [advancePayment]);

    useEffect(() => {
        let receivablesTemp = {};
        let payablesTemp = {};

        // eslint-disable-next-line no-unused-expressions
        invoices !== null
            ? invoices.forEach(invoice => {
                  const {
                      invoiceType,
                      currencyCode,
                      remainingInvoiceDebt,
                  } = invoice;
                  if (
                      invoiceType === 2 ||
                      invoiceType === 4 ||
                      invoiceType === 13
                  ) {
                      receivablesTemp = {
                          ...receivablesTemp,
                          [currencyCode]:
                              (receivablesTemp[currencyCode] || 0) +
                              Number(remainingInvoiceDebt),
                      };
                  } else if (
                      invoiceType === 1 ||
                      invoiceType === 3 ||
                      invoiceType === 10 ||
                      invoiceType === 12
                  ) {
                      payablesTemp = {
                          ...payablesTemp,
                          [currencyCode]:
                              (payablesTemp[currencyCode] || 0) +
                              Number(remainingInvoiceDebt),
                      };
                  }
              })
            : undefined;
        setReceivables(receivablesTemp);
        setPayables(payablesTemp);
    }, [invoices]);
    // const handleExport = () => {
    //   const data = [row] || '';
    //   const option = {};
    //   const dataTable = data.map(dataItem => ({
    //     Id: dataItem.id,
    //     'Date of order': dataItem.createdAt,
    //     Type: dataItem.type,
    //     Categories: dataItem.categories.join(', '),
    //     Name: dataItem.name,
    //     Position: dataItem.position,
    //     Company: dataItem.company,
    //     'Phone numbers': dataItem.phoneNumbers.join(', '),
    //     Emails: dataItem.emails.join(', '),
    //     Voen: dataItem.voen,
    //     Address: dataItem.address,
    //     status: dataItem.status,
    //     Manager: dataItem.manager,
    //     'Price type': dataItem.priceType,
    //     description: dataItem.description,
    //   }));

    //   option.fileName = 'orders';
    //   option.datas = [
    //     {
    //       sheetData: dataTable,
    //       shhetName: 'sheet',
    //       sheetFilter: [
    //         'Id',
    //         'Date of order',
    //         'Type',
    //         'Categories',
    //         'Name',
    //         'Position',
    //         'Company',
    //         'Phone numbers',
    //         'Emails',
    //         'Voen',
    //         'Address',
    //         'Status',
    //         'Manager',
    //         'Price type',
    //         'Description',
    //       ],
    //       sheetHeader: [
    //         'Id',
    //         'Date of order',
    //         'Type',
    //         'Categories',
    //         'Name',
    //         'Position',
    //         'Company',
    //         'Phone numbers',
    //         'Emails',
    //         'Voen',
    //         'Address',
    //         'Status',
    //         'Manager',
    //         'Price type',
    //         'Description',
    //       ],
    //     },
    //   ];

    //   const toExcel = new ExportJsonExcel(option);
    //   toExcel.saveExcel();
    // };

    return (
        <div className={styles.MoreDetails}>
            <Row
                type="flex"
                style={{ alignItems: 'center', marginBottom: '40px' }}
            >
                <Col span={12}>
                    <span className={styles.header}>Ətraflı</span>
                </Col>
                <Col span={12} align="end">
                    {/* <IconButton
              buttonSize="large"
              icon="excel"
              iconWidth={18}
              iconHeight={18}
              className={styles.exportButton}
              onClick={handleExport}
              buttonStyle={{ marginRight: '10px' }}
            /> */}
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
                section="Əməliyyat tarixi"
                value={row.createdAt ? row.createdAt.split(' ')[0] : ''}
            />
            <Section section="Əlavə olunub" value={row.createdBy || '-'} />
            <Section
                section="Əlaqə tipi"
                value={
                    row.type === 'Legal entity'
                        ? 'Hüquqi şəxs'
                        : 'Fiziki şəxs' || '-'
                }
            />
            <Section
                section="Kateqoriya"
                value={
                    row.categoryIds
                        ? row.categoryIds
                              .map(
                                  category =>
                                      contactCategories[Number(category)]?.name
                              )
                              .join(', ')
                        : '-'
                }
            />
            <Section
                section="Ad"
                value={
                    <Tooltip title={`${row.name || ''}`}>
                        <Col span={12} className={styles.ellipsis}>
                            {row.name || '-'}
                        </Col>
                    </Tooltip>
                }
            />
            <Section
                section="Əlaqə tel"
                value={
                    row.phoneNumbers?.length > 0
                        ? row.phoneNumbers.join(', ')
                        : '-'
                }
            />
            <Section
                section="Email"
                value={row.emails?.length > 0 ? row.emails.join(', ') : '-'}
            />
            <Section
                section="Website"
                value={row.websites?.length > 0 ? row.websites.join(', ') : '-'}
            />
            <Section
                section="Facebook istifadəçi adı"
                value={row.facebook || '-'}
            />
            <Section section="VÖEN" value={row.voen || '-'} />
            <Section section="Ünvan" value={row.address || '-'} />
            <Section
                section="Status"
                value={
                    (
                        <CustomTag
                            label={
                                row.status === 'Active' ? 'Aktiv' : 'Deaktiv'
                            }
                        />
                    ) || '-'
                }
            />
            <Section section="Menecer" value={row.manager || '-'} />
            <Section section="Qiymət tipi" value={row.priceType || 'Satış'} />
            {Object.keys(receivables).length !== 0 ? (
                <ProCollapse
                    className={styles.collapseDetail}
                    defaultActiveKey="1"
                >
                    <ProPanel
                        header="Debitor borclar"
                        key="1"
                        style={{ padding: 0 }}
                    >
                        <p className={styles.information}>
                            {Object.keys(receivables).map((item, index) => (
                                <>
                                    {roundToDown(receivables[item])} {item}{' '}
                                    {index ===
                                    Object.keys(receivables).length - 1
                                        ? ' '
                                        : ', '}
                                </>
                            ))}
                        </p>
                    </ProPanel>
                </ProCollapse>
            ) : (
                <Section section="Debitor borclar" value="0.00" />
            )}
            {Object.keys(payables).length > 0 ? (
                <ProCollapse
                    className={styles.collapseDetail}
                    defaultActiveKey="1"
                >
                    <ProPanel
                        header="Kreditor borclar"
                        key="1"
                        style={{ padding: 0 }}
                    >
                        <p className={styles.information}>
                            {Object.keys(payables).map((item, index) => (
                                <>
                                    {roundToDown(payables[item])} {item}{' '}
                                    {index === Object.keys(payables).length - 1
                                        ? ' '
                                        : ', '}
                                </>
                            ))}
                        </p>
                    </ProPanel>
                </ProCollapse>
            ) : (
                <Section section="Kreditor borclar" value="0.00" />
            )}
            {advance?.length > 0 ? (
                <ProCollapse
                    className={styles.collapseDetail}
                    defaultActiveKey="1"
                >
                    <ProPanel header="Avans" key="1" style={{ padding: 0 }}>
                        <p className={styles.information}>
                            {advance?.map(
                                (
                                    {
                                        code,
                                        amount,
                                        amountCashIn,
                                        amountCashOut,
                                    },
                                    index
                                ) => (
                                    <span
                                        style={{
                                            color:
                                                Number(amountCashIn) >
                                                Number(amountCashOut)
                                                    ? '#FF716A'
                                                    : '#55AB80',
                                        }}
                                    >
                                        {formatNumberToLocale(
                                            defaultNumberFormat(amount)
                                        )}{' '}
                                        {code}{' '}
                                        {index === advance?.length - 1
                                            ? ' '
                                            : ', '}
                                    </span>
                                )
                            )}
                        </p>
                    </ProPanel>
                </ProCollapse>
            ) : (
                <Section section="Avans" value="0.00" />
            )}
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

            {/* {row && row.map(section => <Section section={section[0]} value={section[1]} />)} */}
        </div>
    );
};

const mapStateToProps = state => ({
    goods: state.goodsReducer.goods,
    invoices: state.invoicesReducer.invoices,
    advancePayment: state.advancePaymentReducer.advancePayment,
});

export default connect(
    mapStateToProps,
    null
)(InfoDetails);
