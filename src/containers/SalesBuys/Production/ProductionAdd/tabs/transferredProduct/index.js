/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
    defaultNumberFormat,
    formatNumberToLocale,
    fullDateTimeWithSecond,
} from 'utils';
import { requiredRule } from 'utils/rules';
import { handleResetInvoiceFields } from 'store/actions/sales-operation';
import { Table, ProDatePicker, ProFormItem, ProSelect } from 'components/Lib';
import { Input, Checkbox, Tooltip } from 'antd';
import moment from 'moment';
import styles from '../../styles.module.scss';

const math = require('exact-math');
const roundTo = require('round-to');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong style={{ marginLeft: '4%' }}>{quantity}</strong>
        <strong style={{ marginRight: '40px' }}>{secondary}</strong>
    </div>
);

const Transferred = props => {
    const {
        // States
        handleResetInvoiceFields,
        restInvoiceData,
        tableDatas,
        form,
        stocks,
        stocksLoading,
    } = props;
    const {
        getFieldDecorator,
        getFieldError,
        setFieldsValue,
        getFieldValue,
    } = form;

    const [filters, setFilters] = useState({
        productNames: [],
        serialNumbers: [],
    });
    const [checked, setChecked] = useState(false);
    const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 90,
            render: (value, row, index) => (row.isTotal ? 'Toplam' : index + 1),
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'productName',
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            render: (value, row) => (row.isTotal ? null : value),
        },
        {
            title: 'Maya dəyəri',
            dataIndex: 'cost',
            align: 'center',
            width: 120,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : formatNumberToLocale(defaultNumberFormat(value)),
        },
        {
            title: 'Say',
            dataIndex: 'quantity',
            align: 'center',
            width: 120,
            render: value => formatNumberToLocale(defaultNumberFormat(value)),
        },
        {
            title: 'Seriya nömrəsi',
            dataIndex: 'serialNumber',
            align: 'center',
            width: 120,
            render: value =>
                value ? (
                    checked && value.length > 1 ? (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            {value[0]}
                            <Tooltip
                                placement="right"
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {value.map(serialNumber => (
                                            <span>{serialNumber}</span>
                                        ))}
                                    </div>
                                }
                            >
                                <span className={styles.serialNumberCount}>
                                    {value.length}
                                </span>
                            </Tooltip>
                        </div>
                    ) : (
                        value
                    )
                ) : (
                    '-'
                ),
        },
        {
            title: 'Ölçü vahidi',
            dataIndex: 'unitOfMeasurementName',
            align: 'center',
            width: 130,
            render: (value, row) => (row.isTotal ? null : value || '-'),
        },
        {
            title: 'Toplam',
            dataIndex: 'total',
            width: 150,
            align: 'right',
            render: total =>
                `${formatNumberToLocale(defaultNumberFormat(total))} ${
                    restInvoiceData?.currencyCode
                }`,
        },
    ];

    useEffect(
        () => () => {
            handleResetInvoiceFields();
        },
        []
    );

    useEffect(() => {
        if (restInvoiceData) {
            if (restInvoiceData.stockToId !== null) {
                setFieldsValue({
                    stockTo: restInvoiceData.stockToId,
                    productionDate: moment(
                        restInvoiceData.operationDate,
                        fullDateTimeWithSecond
                    ),
                });
            }
        }
    }, [restInvoiceData]);

    useEffect(() => {
        let tmp = {};
        if (checked && tableDatas.length > 0) {
            tableDatas.forEach((value, index) => {
                if (tmp[value.productId]) {
                    tmp = {
                        ...tmp,
                        [value.productId]: {
                            ...tmp[value.productId],
                            quantity: math.add(
                                tmp[value.productId].quantity || 0,
                                Number(value.quantity) || 0
                            ),
                            total: math.add(
                                tmp[value.productId].total || 0,
                                Number(value.total) || 0
                            ),
                            serialNumber: value.serialNumber
                                ? [
                                      ...tmp[value.productId].serialNumber,
                                      value.serialNumber,
                                  ]
                                : undefined,
                        },
                    };
                } else {
                    tmp[value.productId] = {
                        id: index + 1,
                        product: value.productId,
                        productName: value.productName,
                        catalogName: value.catalogName,
                        serialNumber: value.serialNumber
                            ? [value.serialNumber]
                            : undefined,
                        quantity: roundTo(Number(value.quantity), 2),
                        cost: roundTo(Number(value.cost), 4),
                        pricePerUnit: roundTo(Number(value.pricePerUnit), 2),
                        unitOfMeasurementName: value.unitOfMeasurementName,
                        currencyCode: value.currencyCode,
                        total: roundTo(Number(value.total), 4),
                    };
                }
            });
            setMergedInvoiceContent(Object.values(tmp));
        } else {
            setMergedInvoiceContent([]);
        }
    }, [checked, tableDatas]);
    const filterDuplicates = (tableDatas, field) => {
        const data = [];
        return tableDatas.reduce((total, current) => {
            if (data.includes(current[field])) {
                return total;
            }
            data.push(current[field]);
            return [...total, { name: current[field] }];
        }, []);
    };
    const filterSerialNumber = (tableDatas, field) =>
        tableDatas.reduce((total, current) => {
            if (current[field] === null) {
                return total;
            }
            return [...total, { name: current[field] }];
        }, []);

    const handleFilter = (type, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [type]: value,
        }));
    };

    const getFilteredInvoices = (
        tableData,
        { productNames, serialNumbers }
    ) => {
        if (productNames.length > 0 || serialNumbers.length > 0) {
            const newtableDatas = tableData.filter(
                ({ productName, serialNumber }) => {
                    if (
                        (productNames.length > 0
                            ? productNames.includes(productName)
                            : true) &&
                        (serialNumbers.length > 0
                            ? checked
                                ? serialNumber?.some(serialNum =>
                                      serialNumbers.includes(serialNum)
                                  )
                                : serialNumbers.includes(serialNumber)
                            : true)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
            return newtableDatas.sort(function(a, b) {
                return a.productId - b.productId;
            });
        }
        return tableData.sort(function(a, b) {
            return a.productId - b.productId;
        });
    };
    const handleCheckbox = checked => {
        if (checked) {
            setChecked(true);
        } else {
            setChecked(false);
        }
    };

    return (
        <>
            <div className={styles.parentBox}>
                <div className={styles.paper}>
                    <div className={styles.Header}>
                        <span className={styles.newOperationTitle}>
                            Transfer olunmuş məhsullar
                        </span>
                    </div>
                    <div className={styles.fieldsContainer}>
                        <div className={styles.field}>
                            <ProFormItem
                                label="İstehsal tarixi"
                                help={getFieldError('productionDate')?.[0]}
                            >
                                {getFieldDecorator('productionDate', {
                                    getValueFromEvent: date => date,
                                    rules: [requiredRule],
                                })(
                                    <ProDatePicker
                                        size="large"
                                        format={fullDateTimeWithSecond}
                                        // disabledDate={disabledDate}
                                        disabledDate={d =>
                                            (!restInvoiceData?.canEdit &&
                                                (!d ||
                                                    d.isAfter(
                                                        moment(
                                                            restInvoiceData?.operationDate,
                                                            fullDateTimeWithSecond
                                                        )
                                                    ))) ||
                                            (!d ||
                                                d.isAfter(
                                                    moment().endOf('day')
                                                ))
                                        }
                                    />
                                )}
                            </ProFormItem>
                        </div>
                        <div className={styles.field}>
                            <ProFormItem
                                label="Anbar(Haraya)"
                                help={getFieldError('stockTo')?.[0]}
                            >
                                {getFieldDecorator('stockTo', {
                                    rules: [requiredRule],
                                })(
                                    <ProSelect
                                        data={stocks}
                                        disabled={
                                            stocksLoading ||
                                            !restInvoiceData?.canEdit
                                        }
                                        allowClear={false}
                                    />
                                )}
                            </ProFormItem>
                        </div>
                    </div>
                    <div
                        className={styles.exportBox}
                        style={{
                            justifyContent: 'space-between',
                            width: '100%',
                            margin: '60px 0 20px 0',
                        }}
                    >
                        <div style={{ display: 'flex', width: '70%' }}>
                            <Input.Group style={{ width: '30%' }}>
                                <span className={styles.filterName}>
                                    Məhsul adı
                                </span>
                                <ProSelect
                                    mode="multiple"
                                    id={false}
                                    size="medium"
                                    value={filters.productNames}
                                    data={filterDuplicates(
                                        tableDatas,
                                        'productName'
                                    )}
                                    onChange={values =>
                                        handleFilter('productNames', values)
                                    }
                                />
                            </Input.Group>
                            <Input.Group
                                style={{ marginLeft: '5px', width: '30%' }}
                            >
                                <span className={styles.filterName}>
                                    Seriya nömrəsi
                                </span>
                                <ProSelect
                                    mode="multiple"
                                    id={false}
                                    size="medium"
                                    value={filters.serialNumbers}
                                    data={filterSerialNumber(
                                        tableDatas,
                                        'serialNumber'
                                    )}
                                    onChange={values =>
                                        handleFilter('serialNumbers', values)
                                    }
                                />
                            </Input.Group>
                        </div>
                        <Checkbox
                            onChange={event =>
                                handleCheckbox(event.target.checked)
                            }
                            checked={checked}
                        >
                            Qruplaşdır
                        </Checkbox>
                    </div>
                    <Table
                        scroll={{ x: 'max-content', y: 500 }}
                        dataSource={
                            checked
                                ? getFilteredInvoices(
                                      mergedInvoiceContent,
                                      filters
                                  )
                                : getFilteredInvoices(tableDatas, filters)
                        }
                        className={styles.invoiceTable}
                        columns={columns}
                        pagination={false}
                        rowKey={record => record.id}
                        rowClassName={styles.row}
                    />
                    <FooterRow
                        primary="Toplam"
                        quantity={
                            checked
                                ? getFilteredInvoices(
                                      mergedInvoiceContent,
                                      filters
                                  ).reduce(
                                      (total, { quantity }) =>
                                          math.add(
                                              total,
                                              Number(quantity) || 0
                                          ),
                                      0
                                  )
                                : getFilteredInvoices(
                                      tableDatas,
                                      filters
                                  ).reduce(
                                      (total, { quantity }) =>
                                          math.add(
                                              total,
                                              Number(quantity) || 0
                                          ),
                                      0
                                  )
                        }
                        secondary={
                            checked
                                ? formatNumberToLocale(
                                      defaultNumberFormat(
                                          getFilteredInvoices(
                                              mergedInvoiceContent,
                                              filters
                                          ).reduce(
                                              (total, current) =>
                                                  math.add(
                                                      Number(total),
                                                      Number(current.total)
                                                  ),
                                              0
                                          )
                                      )
                                  )
                                : formatNumberToLocale(
                                      defaultNumberFormat(
                                          getFilteredInvoices(
                                              tableDatas,
                                              filters
                                          ).reduce(
                                              (total, current) =>
                                                  math.add(
                                                      Number(total),
                                                      Number(current.total)
                                                  ),
                                              0
                                          )
                                      )
                                  )
                        }
                    />
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    stocks: state.stockReducer.stocks,
    stocksLoading: state.loadings.fetchStocks,
});

export const TransferredProduct = connect(
    mapStateToProps,
    { handleResetInvoiceFields }
)(Transferred);
