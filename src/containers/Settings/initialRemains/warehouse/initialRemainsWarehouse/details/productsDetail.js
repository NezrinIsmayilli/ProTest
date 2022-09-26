import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import {
    Button,
    Col,
    Row,
    Table,
    Input,
    Checkbox,
    Pagination,
    Tooltip,
    Select,
} from 'antd';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

const math = require('exact-math');

const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => (
    <div className={styles.columnDetailItem} style={{ marginLeft: 56 }}>
        <label
            style={{
                marginBottom: gutterBottom ? 12 : 0,
            }}
        >
            {name}
        </label>

        {secondary ? <span>{secondary}</span> : children}
    </div>
);
const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
    <div className={styles.opInvoiceContentFooter} style={{ color }}>
        <strong>{primary}</strong>
        <strong style={{ marginLeft: '9%' }}>{quantity}</strong>
        <strong>{secondary}</strong>
    </div>
);

function ProductsDetail({
    details,
    visible,
    isLoading,
    tableDatas,
    setInvoiceLength,
    total,
    onFilter,
    filter,
}) {
    const componentRef = useRef();
    const pages = [8, 10, 20, 50, 100, total];
    const [filters, setFilters] = useState({
        productNames: [],
        serialNumbers: [],
    });
    const [checked, setChecked] = useState(false);
    const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
    const {
        invoiceType,
        invoiceNumber,
        currencyCode,
        operationDate,
        stockName,
    } = details;

    const columns = [
        {
            title: '№',
            dataIndex: 'id',
            width: 50,
            render: (value, row, index) =>
                (filter.page - 1) * filter.limit + index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'productName',
            ellipsis: true,
            width: 200,
        },
        {
            title: 'Vahidin qiyməti',
            dataIndex: 'pricePerUnit',
            width: 110,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode}`,
        },
        {
            title: 'Say ',
            dataIndex: 'quantity',
            align: 'center',
            width: 80,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value || 0)),
        },
        {
            title: 'Seriya nömrəsi',
            dataIndex: 'serialNumber',
            align: 'center',
            width: 130,
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
            width: 90,
        },
        {
            title: 'Toplam',
            dataIndex: 'total',
            width: 100,
            align: 'right',
            render: (value, { currencyCode }) =>
                `${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${currencyCode} `,
        },
    ];

    const handleChange = value => {
        onFilter('page', value);
    };
    const handleNumberChange = size => {
        onFilter('limit', size);
        onFilter('page', 1);
    };

    useEffect(() => {
        if (!visible) {
            setFilters({ productNames: [], serialNumbers: [] });
            setChecked(false);
        }
    }, [visible]);
    useEffect(() => {
        if (checked) {
            setInvoiceLength(
                getFilteredInvoices(mergedInvoiceContent, filters).reduce(
                    (total, { quantity }) => total + Number(quantity),
                    0
                )
            );
        } else {
            setInvoiceLength(
                getFilteredInvoices(tableDatas, filters).reduce(
                    (total, { quantity }) => total + Number(quantity),
                    0
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked, filters, mergedInvoiceContent, tableDatas]);

    useEffect(() => {
        let tmp = {};
        if (checked && tableDatas.length > 0) {
            tableDatas.forEach((value, index) => {
                if (tmp[value.productId]) {
                    tmp = {
                        ...tmp,
                        [value.productId]: {
                            ...tmp[value.productId],
                            quantity:
                                tmp[value.productId].quantity +
                                Number(value.quantity),
                            total:
                                tmp[value.productId].total +
                                Number(value.total),
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
                        quantity: Number(value.quantity),
                        pricePerUnit: value.pricePerUnit,
                        unitOfMeasurementName: value.unitOfMeasurementName,
                        currencyCode: value.currencyCode,
                        total: Number(value.total),
                    };
                }
            });
            setMergedInvoiceContent(Object.values(tmp));
        } else {
            setMergedInvoiceContent([]);
        }
    }, [checked, tableDatas]);
    const handleCheckbox = checked => {
        if (checked) {
            setChecked(true);
        } else {
            setChecked(false);
        }
    };
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
            return newtableDatas;
        }
        return tableData;
    };

    return (
        <div
            ref={componentRef}
            style={{ width: '100%' }}
            className={styles.invoiceContainer}
        >
            <div
                className={styles.exportBox}
                style={{
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 40,
                }}
            >
                <div className={styles.exportBox}>
                    {stockName ? (
                        <div
                            className={styles.columnDetailItem}
                            style={{ marginBottom: 6 }}
                        >
                            <label
                                style={{
                                    fontWeight: 600,
                                    fontSize: 24,
                                    lineHeight: '24px',
                                    marginBottom: 10,
                                    color: '#373737',
                                }}
                            >
                                {stockName}
                            </label>
                        </div>
                    ) : (
                        ''
                    )}

                    <HeaderItem name="Sənəd" secondary={invoiceNumber || '-'} />
                    <HeaderItem
                        name="Tarix"
                        secondary={`${operationDate?.split('  ')}` || '-'}
                    />
                </div>
                <ReactToPrint
                    pageStyle
                    trigger={() => (
                        <Button
                            className={`${styles.customSquareButton} printButton`}
                            style={{ marginRight: 10, marginTop: 10 }}
                            shape="circle"
                            icon="printer"
                        />
                    )}
                    content={() => componentRef.current}
                />
            </div>
            <div
                className={styles.exportBox}
                style={{
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 40,
                }}
            >
                <div style={{ display: 'flex', width: '70%' }}>
                    <Input.Group
                        style={{ width: '30%' }}
                        className={styles.productNameSelect}
                    >
                        <span className={styles.filterName}>Məhsul adı</span>
                        <ProSelect
                            mode="multiple"
                            id={false}
                            size="medium"
                            value={filters.productNames}
                            data={filterDuplicates(tableDatas, 'productName')}
                            onChange={values =>
                                handleFilter('productNames', values)
                            }
                        />
                    </Input.Group>
                    <Input.Group
                        style={{ marginLeft: '5px', width: '30%' }}
                        className={styles.productSeriaSelect}
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
                {invoiceType === 5 || invoiceType === 6 ? null : (
                    <Checkbox
                        onChange={event => handleCheckbox(event.target.checked)}
                        checked={checked}
                        className={styles.productGroupingCheckbox}
                    >
                        Qruplaşdır
                    </Checkbox>
                )}
            </div>
            <div
                className={styles.opInvTable}
                style={{
                    marginTop: 32,
                    maxHeight: 600,
                    paddingRight: 8,
                    overflowY: 'auto',
                }}
            >
                <Table
                    scroll={{ x: 'max-content' }}
                    dataSource={
                        checked
                            ? getFilteredInvoices(mergedInvoiceContent, filters)
                            : getFilteredInvoices(tableDatas, filters)
                    }
                    loading={isLoading}
                    className={styles.opInvoiceContentTable}
                    columns={columns}
                    pagination={false}
                    rowKey={record => record.id}
                    rowClassName={styles.row}
                />

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
                            current={filter.page}
                            className={styles.customPagination}
                            pageSize={filter.limit}
                            onChange={handleChange}
                            total={total || 0}
                            size="small"
                        />
                    </Col>
                    <Col span={6} offset={10} align="end">
                        <Select
                            defaultValue={8}
                            className={styles.pageSize}
                            size="large"
                            onChange={e => handleNumberChange(e)}
                        >
                            {pages.map(page => (
                                <Select.Option
                                    value={page}
                                    className={styles.dropdown}
                                    key={page}
                                >
                                    {page}
                                </Select.Option>
                            ))}
                        </Select>
                        <span
                            className={styles.totalNumber}
                        >{`${total} ədəd`}</span>
                    </Col>
                </Row>
            </div>
            {[5, 6].includes(invoiceType) ? null : (
                <>
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
                        secondary={`${
                            checked
                                ? formatNumberToLocale(
                                      defaultNumberFormat(
                                          getFilteredInvoices(
                                              mergedInvoiceContent,
                                              filters
                                          ).reduce(
                                              (total, { total: totalPrice }) =>
                                                  math.add(
                                                      total,
                                                      Number(totalPrice) || 0
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
                                              (total, { total: totalPrice }) =>
                                                  math.add(
                                                      total,
                                                      Number(totalPrice) || 0
                                                  ),
                                              0
                                          )
                                      )
                                  )
                        } ${currencyCode || '-'}`}
                    />
                </>
            )}
        </div>
    );
}

export default ProductsDetail;
