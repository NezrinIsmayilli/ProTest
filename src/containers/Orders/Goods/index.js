/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import { Col, Input, Pagination, Row, Select, Tooltip, Form } from 'antd';
import { permissions, accessTypes } from 'config/permissions';
import { ProSelect, Table, Can } from 'components/Lib';
import GoodsSidebar from 'containers/Orders/Goods/GoodsSidebar/index';
import {
    fetchStageRoleExecutors,
    fetchTenantPersonRoles,
} from 'store/actions/settings/order-roles';
import MoreDetails from 'containers/Orders/Goods/MoreDetails/index';
import OrderList from 'containers/Orders/Goods/OrderCart/index';
import IconButton from 'containers/Orders/utils/IconButton/index';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { connect, useDispatch } from 'react-redux';
import { fetchGoods, clearGoods } from 'store/actions/goods';
import { fetchMeasurements } from 'store/actions/measurements';
import { fetchPartners } from 'store/actions/partners';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import {
    fetchInvoiceListByContactId,
    fetchAdvancePaymentByContactId,
} from 'store/actions/contact';
import { formatNumberToLocale, defaultNumberFormat, re_amount } from 'utils';
import { useOrderCart } from 'hooks';
import CashboxInfoButton from './OrderCart/CashboxInfoButton';
import styles from '../styles.module.scss';

const { Option } = Select;
const Goods = props => {
    const {
        isLoading,
        partners,
        goods,
        clearGoods,
        tenant,
        fetchPartners,
        fetchGoods,
        total,
        measurements,
        fetchMeasurements,
        fetchStageRoleExecutors,
        fetchTenantPersonRoles,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        mainCurrency,
        fetchMainCurrency,
        permissionsList,
        form,
    } = props;

    const [orderActions, orderStates] = useOrderCart();
    const { setFieldsValue, getFieldError, getFieldValue } = form;
    const {
        selectedCounterparty,
        selectedProducts,
        cartIsVisible,
        buyer,
        seller,
    } = orderStates;

    const {
        changeCounterparty,
        handleProductCountChange,
        handleBuyerChange,
        resetOrderCart,
        toggleCart,
    } = orderActions;
    const dispatch = useDispatch();
    const [pageSize, setPageSize] = useState(8);
    const pages = [8, 10, 20, 50, 100, total];
    const [currentPage, setCurrentPage] = useState(1);
    const [row, setRow] = useState([]);
    const [visible, setIsVisible] = useState(false);
    const [filters, onFilter] = useFilterHandle(
        {
            ids: null,
            catalogIds: null, // array
            parentCatalogIds: null,
            q: null, // String
            limit: pageSize, // Number
            page: currentPage, // Number
            unitOfMeasurementIds: null, // Array
            partnerId: null, // Number
            isDeleted: 0,
        },
        ({ filters }) => {
            selectedCounterparty && fetchGoods({ filters }); // Prevent the call when the component is rendering first time
        }
    );

    const handleChangeCount = (event, row) => {
        if (
            re_amount.test(event.target.value) &&
            Number(event.target.value) <= 100000
        ) {
            handleProductCountChange(
                event.target.value,
                row,
                'quantity',
                'change'
            );
        } else if (event.target.value === '') {
            handleProductCountChange('', row, 'quantity', 'change');
        }
    };
    const handleCart = () => {
        toggleCart();
    };

    const handleClick = record => {
        setIsVisible(true);
        setRow(record);
    };

    const handleChange = value => {
        onFilter('page', value);
        setCurrentPage(value);
    };

    const handleNumberChange = (current, size) => {
        onFilter('limit', size);
        onFilter('page', 1);

        setPageSize(size);
    };

    const changeBuyer = value => {
        const buyer = partners.filter(partner => partner.id === value)[0];
        handleBuyerChange(buyer);
    };

    const handleCounterParty = value => {
        const counterparty =
            value === tenant.id
                ? tenant
                : partners.find(partner => partner.id === value);
        changeCounterparty(
            { ...counterparty, isTenant: value === tenant.id },
            tenant,
            customer
        );
    };

    const categories = [
        {
            title: '№',
            dataIndex: 'id',
            align: 'left',
            render: (value, item, index) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Kataloq',
            dataIndex: 'parentCatalogName',
            align: 'left',
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Alt kataloq',
            dataIndex: 'catalogName',
            align: 'left',
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'name',
            align: 'left',
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Ölçü vahidi',
            dataIndex: 'unitOfMeasurementName',
            align: 'center',
            render: value => value || '-',
        },
        {
            title: 'Vahidin qiyməti',
            dataIndex: 'pricePerUnit',
            align: 'left',
            render: (value, row) =>
                value
                    ? `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row.currencyCode
                      }`
                    : '-',
        },
        {
            title: `Vahidin qiyməti (${mainCurrency?.code})`,
            dataIndex: 'pricePerUnitInMainCurrency',
            align: 'left',
            render: (value, row) =>
                value
                    ? `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row.mainCurrency
                      }`
                    : '-',
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'stockAmount',
            align: 'left',
            render: (value, row) =>
                value ? `${formatNumberToLocale(Number(value))}` : '-',
        },
        {
            title: '',
            dataIndex: 'countOf',
            key: 'countOf',
            render: (value, row) => (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                    style={{ display: 'flex' }}
                    onClick={e => e.stopPropagation()}
                >
                    <Input
                        value={
                            selectedProducts.filter(
                                item => item.id === row.id
                            )[0]?.quantity || ''
                        }
                        onChange={event => handleChangeCount(event, row)}
                        min={0}
                        max={10000}
                        style={{ width: '100px' }}
                        disabled={permissionsList.order_basket.permission !== 2}
                    />
                </div>
            ),
        },
    ];

    useEffect(() => {
        partners.length === 0 && fetchPartners();
        fetchMeasurements({ usedInProducts: 1 });
        fetchStageRoleExecutors();
        fetchTenantPersonRoles();
        !mainCurrency.id && fetchMainCurrency();
        return () => {
            dispatch(clearGoods());
        };
    }, []);
    const supplier = [
        ...partners.filter(partner => partner.status === 'active'),
        { ...tenant, name: `${tenant.name} (mən)` },
    ];
    const customer = [
        ...partners,
        { ...tenant, name: `${tenant.name} (mən)` },
    ].filter(partner => partner?.id !== seller?.id);

    useEffect(() => {
        if (supplier.length === 1) {
            handleCounterParty(supplier[0].id);
        }
    }, [supplier.length, customer.length]);
    return (
        <div className={styles.Goods}>
            <MoreDetails
                row={row}
                visible={visible}
                setIsVisible={setIsVisible}
                measurements={measurements}
            />
            <OrderList
                visible={cartIsVisible}
                setIsVisible={toggleCart}
                orderActions={orderActions}
                orderStates={orderStates}
            />
            <GoodsSidebar
                filters={filters}
                onFilter={onFilter}
                pageSize={pageSize}
                setPageSize={setPageSize}
                handleNumberChange={handleNumberChange}
                handleChange={handleChange}
                measurements={measurements}
                {...orderActions}
                {...orderStates}
            />
            <section className="scrollbar aside">
                <Row style={{ margin: '0 32px' }}>
                    <Row
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '20px 0',
                        }}
                    >
                        <Col
                            span={5}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <span style={{ fontSize: '13px' }}>Təchizatçı</span>
                            {seller?.id &&
                                seller?.id !== tenant?.id &&
                                (permissionsList.transaction_recievables_report
                                    .permission !== 0 &&
                                permissionsList.transaction_payables_report
                                    .permission !== 0 ? (
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
                                value={seller?.id}
                                data={[
                                    ...partners.filter(
                                        partner => partner.status === 'active'
                                    ),
                                    { ...tenant, name: `${tenant.name} (mən)` },
                                ]}
                                allowClear={false}
                                onChange={handleCounterParty}
                            />
                        </Col>
                        <Can
                            I={accessTypes.manage}
                            a={permissions.order_basket}
                        >
                            <Col
                                span={5}
                                offset={1}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <span style={{ fontSize: '13px' }}>
                                    Sifarişçi
                                </span>
                                {buyer?.id &&
                                    buyer?.id !== tenant?.id &&
                                    (permissionsList
                                        .transaction_recievables_report
                                        .permission !== 0 &&
                                    permissionsList.transaction_payables_report
                                        .permission !== 0 ? (
                                        <CashboxInfoButton
                                            fetchInfo={callback =>
                                                fetchInvoiceListByContactId(
                                                    buyer?.contactId,
                                                    callback
                                                )
                                            }
                                            fetchAdvance={callback =>
                                                fetchAdvancePaymentByContactId(
                                                    buyer?.contactId,
                                                    {},
                                                    callback
                                                )
                                            }
                                        />
                                    ) : null)}
                                <ProSelect
                                    value={buyer?.id}
                                    disabled={seller?.id !== tenant?.id}
                                    data={[
                                        ...partners,
                                        {
                                            ...tenant,
                                            name: `${tenant.name} (mən)`,
                                        },
                                    ].filter(
                                        partner => partner?.id !== seller?.id
                                    )}
                                    onChange={value => changeBuyer(value)}
                                />
                            </Col>
                        </Can>
                        <Can
                            I={accessTypes.manage}
                            a={permissions.order_basket}
                        >
                            <Col
                                span={12}
                                offset={1}
                                align="end"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <IconButton
                                    buttonSize="large"
                                    onClick={handleCart}
                                    label={`Sifariş səbəti(${selectedProducts.length})`}
                                    icon="shoppingCart"
                                    iconWidth={18}
                                    iconHeight={18}
                                    className={styles.orderButton}
                                />
                                <IconButton
                                    buttonSize="large"
                                    onClick={resetOrderCart}
                                    icon="trash"
                                    iconWidth={18}
                                    iconHeight={18}
                                    className={styles.trashButton}
                                />
                            </Col>
                        </Can>
                    </Row>
                    <Row>
                        <Table
                            loading={isLoading}
                            scroll={{ x: 'max-content' }}
                            dataSource={goods}
                            columns={categories}
                            key={row => row.id}
                            onRow={record => ({
                                onClick: () => {
                                    handleClick(record);
                                },
                            })}
                        />
                    </Row>
                    <Row
                        style={{
                            margin: '15px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Col span={8}>
                            <Pagination
                                isLoading={isLoading}
                                defaultCurrent={currentPage}
                                current={currentPage}
                                className={styles.customPagination}
                                defaultPageSize={pageSize}
                                pageSize={pageSize}
                                onChange={handleChange}
                                total={total}
                                size="small"
                            />
                        </Col>
                        <Col span={6} offset={10} align="end">
                            <Select
                                defaultValue={8}
                                className={styles.pageSize}
                                size="large"
                                onChange={e =>
                                    handleNumberChange(currentPage, e)
                                }
                            >
                                {pages.map(page => (
                                    <Option
                                        key={page}
                                        value={page}
                                        className={styles.dropdown}
                                    >
                                        {page}
                                    </Option>
                                ))}
                            </Select>
                            <span className={styles.totalNumber}>
                                Ədəd: {total}
                            </span>
                        </Col>
                    </Row>
                </Row>
            </section>
        </div>
    );
};

const mapStateToProps = state => ({
    isLoading: state.goodsReducer.isLoading,
    actionLoading: state.goodsReducer.actionLoading,
    permissionsList: state.permissionsReducer.permissionsByKeyValue,
    goods: state.goodsReducer.goods,
    partners: state.partnersReducer.partners,
    total: state.goodsReducer.total,
    tenant: state.tenantReducer.tenant,
    measurements: state.measurementsReducer.measurements,
    mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
    mapStateToProps,
    {
        fetchGoods,
        fetchPartners,
        fetchStageRoleExecutors,
        fetchTenantPersonRoles,
        fetchMeasurements,
        fetchMainCurrency,
        fetchInvoiceListByContactId,
        fetchAdvancePaymentByContactId,
        clearGoods,
    }
)(Form.create({ name: 'Goods' })(Goods));
