/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, Spin } from 'antd';
import { ProPanel, ProCollapse, CustomTag } from 'components/Lib';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    contactCategories,
    roundToDown,
} from 'utils';
import ExportJsonExcel from 'js-export-excel';
import {
    getPartnerContactInformation,
    getPartner,
} from 'store/actions/partners';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import IconButton from '../../utils/IconButton/index';
import Section from './Section';
import styles from './styles.module.scss';

const math = require('exact-math');

const MoreDetails = ({
    visible,
    id,
    partnerId,
    setIsVisible,
    isLoading,
    selectedPartner,
    selectedPartnerContactInfo,
    getPartnerContactInformation,
    getPartner,
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
    invoices,
    advancePayment,
}) => {
    const [contactId] = useState(id);
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
    useEffect(() => {
        fetchInvoiceListByContactId(contactId);
        fetchAdvancePaymentByContactId(contactId);
        getPartnerContactInformation(contactId);
    }, [contactId]);
    useEffect(() => {
        getPartner(partnerId);
    }, [partnerId]);
    const handleExport = () => {
        const data = [selectedPartnerContactInfo] || '';
        const option = {};
        const dataTable = data.map(dataItem => ({
            Id: dataItem.id,
            'Date of order': dataItem.createdAt,
            Type: dataItem.type,
            Categories: dataItem.categories.join(', '),
            Name: dataItem.name,
            Position: dataItem.position,
            Company: dataItem.company,
            'Phone numbers': dataItem.phoneNumbers.join(', '),
            Emails: dataItem.emails.join(', '),
            Voen: dataItem.voen,
            Address: dataItem.address,
            status: dataItem.status,
            Manager: dataItem.manager,
            'Price type': dataItem.priceType,
            description: dataItem.description,
        }));

        option.fileName = 'orders';
        option.datas = [
            {
                sheetData: dataTable,
                shhetName: 'sheet',
                sheetFilter: [
                    'Id',
                    'Date of order',
                    'Type',
                    'Categories',
                    'Name',
                    'Position',
                    'Company',
                    'Phone numbers',
                    'Emails',
                    'Voen',
                    'Address',
                    'Status',
                    'Manager',
                    'Price type',
                    'Description',
                ],
                sheetHeader: [
                    'Id',
                    'Date of order',
                    'Type',
                    'Categories',
                    'Name',
                    'Position',
                    'Company',
                    'Phone numbers',
                    'Emails',
                    'Voen',
                    'Address',
                    'Status',
                    'Manager',
                    'Price type',
                    'Description',
                ],
            },
        ];

        const toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    };

    return (
        <Modal
            loading={isLoading}
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
                <div className={styles.MoreDetails}>
                    <Row
                        type="flex"
                        style={{ alignItems: 'center', marginBottom: '40px' }}
                    >
                        <Col xs={24} sm={24} md={12}>
                            <span className={styles.header}>
                                Partnyor məlumatları
                            </span>
                        </Col>
                        <Col xs={20} sm={20} md={8} offset={4} align="end">
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
                        section="Əməliyyat tarixi"
                        value={
                            selectedPartnerContactInfo.createdAt
                                ? selectedPartnerContactInfo.createdAt.split(
                                    ' '
                                )[0]
                                : ''
                        }
                    />
                    <Section
                        section="Əlavə olunub"
                        value={selectedPartnerContactInfo.createdBy || '-'}
                    />
                    <Section
                        section="Əlaqə tipi"
                        value={
                            selectedPartnerContactInfo.type === 'Person'
                                ? 'Fiziki şəxs'
                                : 'Hüquqi şəxs'
                        }
                    />
                    <Section
                        section="Kateqoriya"
                        value={
                            selectedPartnerContactInfo.categoryIds
                                ? selectedPartnerContactInfo.categoryIds
                                    .map(
                                        category =>
                                            contactCategories[
                                                Number(category)
                                            ]?.name
                                    )
                                    .join(', ')
                                : '-'
                        }
                    />
                    <Section
                        section="Ad"
                        value={selectedPartnerContactInfo.name || '-'}
                    />
                    {/* <Section
            section="Vəzifə"
            value={selectedPartnerContactInfo.position || '-'}
          /> */}
                    <Section
                        section="Əlaqə tel"
                        value={
                            selectedPartnerContactInfo.phoneNumbers
                                ? selectedPartnerContactInfo.phoneNumbers.join(
                                    ', '
                                )
                                : '-'
                        }
                    />
                    <Section
                        section="Email"
                        value={
                            selectedPartnerContactInfo.emails
                                ? selectedPartnerContactInfo.emails.join(', ')
                                : '-'
                        }
                    />
                    <Section
                        section="Dəvət sorğusunun göndərildiyi email"
                        value={
                            selectedPartner?.email ? selectedPartner.email : '-'
                        }
                    />

                    <Section
                        section="Website"
                        value={
                            selectedPartnerContactInfo.websites
                                ? selectedPartnerContactInfo.websites.join(', ')
                                : '-'
                        }
                    />
                    <Section
                        section="Facebook istifadəçi adı"
                        value={selectedPartnerContactInfo.facebook || '-'}
                    />
                    <Section
                        section="VÖEN"
                        value={selectedPartnerContactInfo.voen || '-'}
                    />
                    <Section
                        section="Ünvan"
                        value={selectedPartnerContactInfo.address || '-'}
                    />
                    <Section
                        section="Çatdırılma ünvanı"
                        value={selectedPartner.deliveryAddress || '-'}
                    />
                    <Section
                        section="Status"
                        value={
                            (
                                <CustomTag
                                    label={
                                        selectedPartnerContactInfo.status ===
                                            'Active'
                                            ? 'Aktiv'
                                            : 'Deaktiv'
                                    }
                                />
                            ) || '-'
                        }
                    />
                    <Section
                        section="Əlaqə statusu"
                        value={
                            selectedPartner.status === 'active'
                                ? 'Qoşulub'
                                : 'Qoşulmayıb'
                        }
                    />
                    <Section
                        section="Menecer"
                        value={selectedPartnerContactInfo.manager || '-'}
                    />
                    <Section
                        section="Qiymət tipi"
                        value={selectedPartnerContactInfo.priceType || 'Satış'}
                    />
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
                                    {Object.keys(receivables).map(
                                        (item, index) => (
                                            <>
                                                {roundToDown(receivables[item])}{' '}
                                                {item}{' '}
                                                {index ===
                                                    Object.keys(receivables)
                                                        .length -
                                                    1
                                                    ? ' '
                                                    : ', '}
                                            </>
                                        )
                                    )}
                                </p>
                            </ProPanel>
                        </ProCollapse>
                    ) : (
                        <Section section="Debitor borclar" value="0.00" />
                    )}
                    {Object.keys(payables).length !== 0 ? (
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
                                    {Object.keys(payables).map(
                                        (item, index) => (
                                            <>
                                                {roundToDown(payables[item])}{' '}
                                                {item}{' '}
                                                {index ===
                                                    Object.keys(payables).length - 1
                                                    ? ' '
                                                    : ', '}
                                            </>
                                        )
                                    )}
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
                            <ProPanel
                                header="Avans"
                                key="1"
                                style={{ padding: 0 }}
                            >
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
                                {selectedPartner.description
                                    ? selectedPartner.description
                                    : 'Təyin edilməyib'}
                            </p>
                        </ProPanel>
                    </ProCollapse>
                </div>
            </Spin>
        </Modal>
    );
};

const mapStateToProps = state => ({
    isLoading: state.partnersReducer.isLoading,
    selectedPartnerContactInfo:
        state.partnersReducer.selectedPartnerContactInfo,
    selectedPartner: state.partnersReducer.selectedPartner,
    invoices: state.invoicesReducer.invoices,
    advancePayment: state.advancePaymentReducer.advancePayment,
});

export default connect(
    mapStateToProps,
    {
        getPartnerContactInformation,
        getPartner,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
    }
)(MoreDetails);
