import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Spin, Tooltip, Col, Row } from 'antd';
import {
    IoIosArrowDropdownCircle,
    IoIosArrowDroprightCircle,
} from 'react-icons/all';
import {
    fetchCreditPayments,
    fetchPaymentTransaction,
    fetchCreditCounts,
} from 'store/actions/finance/paymentTable';
import {
    Can,
    ProModal,
    DetailButton,
    ProPagination,
    ProPageSelect,
    TableConfiguration,
} from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import moment from 'moment';
import { useFilterHandle } from 'hooks/useFilterHandle';
import {
    fetchMainCurrency,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { fetchAllCreditPayments } from 'store/actions/export-to-excel/financeModule';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { useHistory, useLocation } from 'react-router-dom';
import math from 'exact-math';
import ReportTabs from '../Tabs';
import styles from '../styles.module.scss';
import CreditPaymentsSidebar from './Sidebar';
import OperationsDetails from '../operationsDetails';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { PAYMENTTABLE_CREDITPAYMT_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';
function CreditPayments(props) {
    const {
        isLoading,
        fetchCreditPayments,
        fetchAllCreditPayments,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        creditCount,
        fetchCreditCounts,
        fetchCurrencies,
        fetchMainCurrency,
        mainCurrency,
    } = props;

    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [selectedRow, setSelectedRow] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [tableData, setTableData] = useState([]);
    const [sortedData, setSortedData] = useState([]);

    const [defaultExpand, setDefaultExpand] = useState([]);

    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        PAYMENTTABLE_CREDITPAYMT_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exCreditPayment, setExCreditPayment] = useState([]);

    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            invoiceType: params.invoiceType ? params.invoiceType : 1,
            latenessStatuses: params.latenessStatuses
                ? params.latenessStatuses
                : [4],
            createdAtFrom: params.createdAtFrom
                ? params.createdAtFrom
                : undefined,
            createdAtTo: params.createdAtTo ? params.createdAtTo : undefined,
            startDateFrom: params.startDateFrom
                ? params.startDateFrom
                : undefined,
            startDateTo: params.startDateTo ? params.startDateTo : undefined,
            remainingAmountFrom: params.remainingAmountFrom
                ? params.remainingAmountFrom
                : undefined,
            remainingAmountTo: params.remainingAmountTo
                ? params.remainingAmountTo
                : undefined,
            monthlyPaymentAmountFrom: params.monthlyPaymentAmountFrom
                ? params.monthlyPaymentAmountFrom
                : undefined,
            monthlyPaymentAmountTo: params.monthlyPaymentAmountTo
                ? params.monthlyPaymentAmountTo
                : undefined,
            latenessDaysFrom: params.latenessDaysFrom
                ? params.latenessDaysFrom
                : undefined,
            latenessDaysTo: params.latenessDaysTo
                ? params.latenessDaysTo
                : undefined,
            contacts: params.contacts ? params.contacts : [],
            statuses: params.statuses ? params.statuses : [1],
            salesmans: params.salesmans ? params.salesmans : undefined,
            currencies: params.currencies ? params.currencies : [],
            invoiceIds: params.invoiceIds ? params.invoiceIds : [],
            serialNumber: params.serialNumber ? params.serialNumber : undefined,
            ids: params.ids ? params.ids : undefined,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : undefined,
            creditTypes: params.creditTypes ? params.creditTypes : [],
            orderBy: params.orderBy ? params.orderBy : undefined,
            order: params.order ? params.order : undefined,
            limit: pageSize,
            page: currentPage,
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters['history'] == 'undefined') {
                history.push({
                    search: query,
                });
            }
            setLoading(true);
            fetchCreditPayments({
                filters,
                onSuccessCallback: response => {
                    const result = response?.data.map(item => {
                        if (item.creditTable.length > 1) {
                            const creditTable = item.creditTable.filter(
                                (tables, index, arr) => {
                                    if (filters?.startDateFrom) {
                                        if (
                                            moment(
                                                filters.startDateFrom,
                                                'DD-MM-YYYY'
                                            ).isAfter(
                                                moment(
                                                    tables.date,
                                                    'DD-MM-YYYY'
                                                )
                                            )
                                        ) {
                                            return null;
                                        }
                                    }
                                    if (filters.startDateTo) {
                                        if (
                                            moment(
                                                filters.startDateTo,
                                                'DD-MM-YYYY'
                                            ).isBefore(
                                                moment(
                                                    tables.date,
                                                    'DD-MM-YYYY'
                                                )
                                            )
                                        ) {
                                            return null;
                                        }
                                    }
                                    if (
                                        (tables.status === 3 &&
                                            arr[index - 1]?.status === 3) ||
                                        tables.status === 1
                                    ) {
                                        return null;
                                    }
                                    return tables;
                                }
                            );

                            return {
                                ...item,
                                monthlyPaymentAmount: creditTable.reduce(
                                    (
                                        total,
                                        { totalRemainingMonthlyPaymentAmount }
                                    ) =>
                                        total +
                                        Number(
                                            totalRemainingMonthlyPaymentAmount
                                        ),
                                    0
                                ),
                                remainingPaymentAmountForTotal: creditTable.reduce(
                                    (
                                        total,
                                        {
                                            totalRemainingMonthlyPaymentAmountInMainCurrency,
                                        }
                                    ) =>
                                        total +
                                        Number(
                                            totalRemainingMonthlyPaymentAmountInMainCurrency
                                        ),
                                    0
                                ),
                                totalMonthlyPaymentAmount: creditTable.reduce(
                                    (total, { totalMonthlyPaymentAmount }) =>
                                        total +
                                        Number(totalMonthlyPaymentAmount),
                                    0
                                ),
                                date:
                                    creditTable?.length === 1
                                        ? creditTable[0]?.date
                                        : null,
                                status:
                                    creditTable?.length === 1
                                        ? creditTable[0]?.status
                                        : null,
                                latenessDays: creditTable[0]?.latenessDays,
                                children: creditTable.map(credits => ({
                                    monthlyPaymentAmount:
                                        credits.totalRemainingMonthlyPaymentAmount,
                                    totalMonthlyPaymentAmount:
                                        credits.totalMonthlyPaymentAmount,
                                    date: credits.date,
                                    status: credits.status,
                                    latenessDays: credits.latenessDays,
                                    contactName: item.contactName,
                                    creditId: item.creditId,
                                    serialNumber: item.serialNumber,
                                    createdAt: item.createdAt,
                                    totalInvoiceAmount: item.totalInvoiceAmount,
                                    invoiceTenantCurrencyCode:
                                        item.invoiceTenantCurrencyCode,
                                    remainingAmount: item.remainingAmount,
                                    invoiceNumber: item.invoiceNumber,
                                    numberOfMonths: item.numberOfMonths,
                                    invoiceId: item.invoiceId,
                                    paidNumberOfMonths: item.paidNumberOfMonths,
                                    invoiceType: item.invoiceType,
                                    creditTable: item.creditTable,
                                })),
                            };
                        }
                        return {
                            ...item,
                            monthlyPaymentAmount:
                                item.creditTable[0]
                                    ?.totalRemainingMonthlyPaymentAmount || 0,
                            totalMonthlyPaymentAmount:
                                item.creditTable[0]
                                    ?.totalMonthlyPaymentAmount || 0,
                            remainingPaymentAmountForTotal:
                                item.creditTable[0]
                                    ?.totalRemainingMonthlyPaymentAmountInMainCurrency ||
                                0,
                            date: item.creditTable[0]?.date,
                            status: item.creditTable[0]?.status,
                            latenessDays: item.creditTable[0]?.latenessDays,
                            children: [],
                        };
                    });
                    setTableData(result);
                    setLoading(false);
                },
                setOperations: false,
            });
            fetchCreditCounts({ filters });
        }
    );

    const [rerender, setRerender] = useState(0);
    const popstateEvent = () => {
        setRerender(rerender + 1);
    };

    useEffect(() => {
        window.addEventListener('popstate', popstateEvent);
        return () => window.removeEventListener('popstate', popstateEvent);
    }, [rerender]);

    useEffect(() => {
        const parmas = queryString.parse(location.search, {
            arrayFormat: 'bracket',
        });

        if (rerender > 0) {
            parmas['history'] = 1;

            if (parmas.page && !isNaN(parmas.page)) {
                setTableData([]);
                setCurrentPage(parseInt(parmas.page));
            }
            setFilters({ ...parmas });
        }
    }, [rerender]);

    const handlePaginationChange = value => {
        setTableData([]);
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        setTableData([]);
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };

    const handleDetailsModal = row => {
        setVisible(!visible);
        setSelectedRow(row);
    };

    useEffect(() => {
        fetchTableConfiguration({
            module: 'Finance-PaymentTable-CreditPayment',
        });
        if (!mainCurrency.id) fetchMainCurrency();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (tableData) {
            tableData.sort((a, b) => {
                if (a.creditId < b.creditId) {
                    return -1;
                }
                if (a.creditId > b.creditId) {
                    return 1;
                }
                return 0;
            });
        }
        setSortedData(tableData);
    }, [tableData]);

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({
            column: tableColumn,
        });
        createTableConfiguration({
            moduleName: 'Finance-PaymentTable-CreditPayment',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };

    // set Table Configuration data and set visible columns
    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration);
            let columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = PAYMENTTABLE_CREDITPAYMT_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(PAYMENTTABLE_CREDITPAYMT_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('contactName')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'contactName',
            width: 150,
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Tooltip placement="topLeft" title={value || ''}>
                        <span
                            style={
                                row.hasOwnProperty('children')
                                    ? {}
                                    : { marginLeft: '15px' }
                            }
                        >
                            {value?.length > 20
                                ? value?.slice(0, 20) + '...'
                                : value}
                        </span>
                    </Tooltip>
                ),
        };
        columns[column.indexOf('serialNumber')] = {
            title: 'Sənəd',
            dataIndex: 'serialNumber',
            width: 150,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `KC${moment(
                          row.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                          'YYYY'
                      ).format('YYYY')}/${value}`,
        };
        columns[column.indexOf('totalInvoiceAmount')] = {
            title: 'Kredit məbləği',
            dataIndex: 'totalInvoiceAmount',
            width: 180,
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('remainingAmount')] = {
            title: 'Sənəd üzrə qalıq',
            dataIndex: 'remainingAmount',
            width: 180,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('monthlyPaymentAmount')] = {
            title: 'Ödəniş məbləği',
            dataIndex: 'monthlyPaymentAmount',
            width: 180,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('date')] = {
            title: 'Ödəniş tarixi',
            dataIndex: 'date',
            align: 'center',
            render: (date, row) => (row.isTotal ? null : date || '-'),
            width: 180,
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            width: 130,
            key: 'status',
            render: (value, row) =>
                row.isTotal ? null : value ? (
                    value === 1 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#55AB80',
                                background: '#EBF5F0',
                            }}
                        >
                            Bağlı
                        </span>
                    ) : value === 2 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#c0392b',
                                background: '#F6EEFC',
                            }}
                        >
                            Gecikir
                        </span>
                    ) : value === 3 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#4E9CDF',
                                background: '#EAF3FB',
                            }}
                        >
                            Qalır
                        </span>
                    ) : (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#d35400',
                                background: '#ffecdb',
                            }}
                        >
                            Vaxtı çatıb
                        </span>
                    )
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            width: 130,
            dataIndex: 'invoiceNumber',
            render: (value, row) => (row.isTotal ? null : value),
        };
        columns[column.indexOf('latenessDays')] = {
            title: 'Gecikmə (gün)',
            dataIndex: 'latenessDays',
            align: 'center',
            width: 140,
            render: (value, row) => (row.isTotal ? null : value),
        };
        columns[column.indexOf('numberOfMonths')] = {
            title: 'Ödənişlərin sayı',
            dataIndex: 'numberOfMonths',
            width: 140,
            align: 'center',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `${row.paidNumberOfMonths}/${value}` || '-',
        };
        columns.push({
            title: 'Seç',
            align: 'center',
            width: 120,
            dataIndex: 'invoiceId',
            render: (value, row) =>
                row.isTotal ? null : row.hasOwnProperty('children') &&
                  row.children.length > 1 ? null : (
                    <>
                        <DetailButton onClick={() => handleDetailsModal(row)} />
                        <Can
                            I={accessTypes.manage}
                            a={permissions.credit_payments}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.transaction_invoice_payment}
                            >
                                <Tooltip
                                    placement="right"
                                    title={
                                        [1, 3, 10].includes(row.invoiceType)
                                            ? 'Ödəniş et'
                                            : 'Ödənişi qəbul et'
                                    }
                                >
                                    <Button
                                        style={{ border: 'none' }}
                                        onClick={() =>
                                            history.push(
                                                `/finance/operations/add?id=${value}&isVat=${false}`
                                            )
                                        }
                                        icon="credit-card"
                                    ></Button>
                                </Tooltip>
                            </Can>
                        </Can>
                    </>
                ),
        });

        columns.unshift({
            title: '№',
            dataIndex: 'creditId',
            align: 'center',
            width: 100,
            render: (value, row, index) =>
                row.isTotal ? null : row.hasOwnProperty('children') ? (
                    <span style={{ color: '#151414', fontWeight: 500 }}>
                        {(currentPage - 1) * pageSize +
                            tableData.indexOf(
                                tableData.find(
                                    data => data.creditId === row.creditId
                                )
                            ) +
                            1}
                    </span>
                ) : (
                    <span style={{ marginLeft: '10px' }}>
                        {`${(currentPage - 1) * pageSize +
                            tableData.indexOf(
                                tableData.find(
                                    data => data.creditId === row.creditId
                                )
                            ) +
                            1}.${index + 1}`}
                    </span>
                ),
        });

        return columns;
    };
    const handleExpand = (props, row) => {
        if (props) {
            setDefaultExpand([row.creditId]);
        } else {
            setDefaultExpand(defaultExpand =>
                defaultExpand.filter(item => item !== row.creditId)
            );
        }
    };

    const customExpandIcon = props => {
        if (
            props?.record?.children?.length <= 1 ||
            !props?.record?.hasOwnProperty('children')
        ) {
            return (
                <span style={{ display: 'inline-block', width: '36px' }}></span>
            );
        }
        if (props?.expanded) {
            return (
                <a
                    style={{
                        color: 'black',
                        marginRight: '15px',
                        display: 'inline-block',
                    }}
                    onClick={e => {
                        props.onExpand(props.record, e);
                    }}
                >
                    <IoIosArrowDropdownCircle
                        style={{ verticalAlign: 'middle' }}
                        fontSize="22px"
                        color="#505050"
                    />
                </a>
            );
        }
        return (
            <a
                style={{
                    color: 'black',
                    marginRight: '15px',
                    display: 'inline-block',
                }}
                onClick={e => {
                    props.onExpand(props.record, e);
                }}
            >
                <IoIosArrowDroprightCircle
                    style={{ verticalAlign: 'middle' }}
                    fontSize="22px"
                    color="#505050"
                />
            </a>
        );
    };

    const getList = data => {
        let invoices = [];

        if (data?.length > 0) {
            const totalInvoiceAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalInvoiceAmountInMainCurrency || 0)
                    ),
                0
            );
            const remainingAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.remainingAmountInMainCurrency || 0)
                    ),
                0
            );
            const remainingPaymentAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.remainingPaymentAmountForTotal || 0)
                    ),
                0
            );
            invoices = [
                ...data,
                {
                    isTotal: true,
                    totalInvoiceAmount: totalInvoiceAmountInMainCurrency,
                    remainingAmount: remainingAmountInMainCurrency,
                    monthlyPaymentAmount: remainingPaymentAmountInMainCurrency,
                    invoiceTenantCurrencyCode: mainCurrency?.code,
                },
            ];
        }
        return invoices;
    };

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf(`contactName`)] = {
            title: `Qarşı tərəf`,
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('serialNumber')] = {
            title: `Sənəd `,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('totalInvoiceAmount')] = {
            title: `Kredit məbləği`,
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('remainingAmount')] = {
            title: 'Sənəd üzrə qalıq',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('monthlyPaymentAmount')] = {
            title: 'Ödəniş məbləği',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('date')] = {
            title: `Ödəniş tarixi`,
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Status',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('latenessDays')] = {
            title: 'Gecikmə (gün)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('numberOfMonths')] = {
            title: 'Ödənişlərin sayı',
            width: { wpx: 150 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 90 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const columnFooterStyle = {
            font: { color: { rgb: 'FFFFFF' }, bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
        };
        const data = exCreditPayment.map((item, index) => {
            let arr = [];

            columnClone.includes('contactName') &&
                (arr[columnClone.indexOf('contactName')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.contactName || '-',
                      });

            columnClone.includes('serialNumber') &&
                (arr[columnClone.indexOf('serialNumber')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              `KC${moment(
                                  item.createdAt?.replace(
                                      /(\d\d)-(\d\d)-(\d{4})/,
                                      '$3'
                                  ),
                                  'YYYY'
                              ).format('YYYY')}/${item.serialNumber}` || '-',
                      });
            columnClone.includes('totalInvoiceAmount') &&
                (arr[columnClone.indexOf('totalInvoiceAmount')] = {
                    value: `${Number(
                        defaultNumberFormat(item?.totalInvoiceAmount)
                    )} ${item.invoiceTenantCurrencyCode}`,
                    style: item?.isTotal ? columnFooterStyle : '',
                });

            columnClone.includes('remainingAmount') &&
                (arr[columnClone.indexOf('remainingAmount')] = {
                    value: `${Number(
                        defaultNumberFormat(item?.remainingAmount)
                    )} ${item.invoiceTenantCurrencyCode}`,
                    style: item?.isTotal ? columnFooterStyle : '',
                });

            columnClone.includes('monthlyPaymentAmount') &&
                (arr[
                    columnClone.indexOf('monthlyPaymentAmount')
                ] = {
                          value: `${Number(
                              defaultNumberFormat(item?.monthlyPaymentAmount)
                          )} ${item.invoiceTenantCurrencyCode}`, style: item?.isTotal ? columnFooterStyle : '',
                      });
            columnClone.includes('date') &&
                (arr[columnClone.indexOf('date')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.date || '-',
                      });

            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.status
                              ? item.status === 1
                                  ? 'Bağlı'
                                  : item.status === 2
                                  ? 'Gecikir'
                                  : item.status === 3
                                  ? 'Qalır'
                                  : 'Vaxtı çatıb '
                              : '-',
                      });

            columnClone.includes('invoiceNumber') &&
                (arr[columnClone.indexOf('invoiceNumber')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.invoiceNumber || '-',
                      });
            columnClone.includes('latenessDays') &&
                (arr[columnClone.indexOf('latenessDays')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.latenessDays || '-',
                      });

            columnClone.includes('numberOfMonths') &&
                (arr[columnClone.indexOf('numberOfMonths')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              `${item.paidNumberOfMonths}/${item.numberOfMonths}` ||
                              '-',
                      });

            arr.unshift(
                item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : { value: index + 1 }
            );
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns();
    }, [visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exCreditPayment]);
    console.log(getList(sortedData),"salam")
    return (
        <section>
            <CreditPaymentsSidebar
                filters={filters}
                onFilter={onFilter}
                setTableData={setTableData}
                loading={loading}
                handlePaginationChange={handlePaginationChange}
            />

            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={PAYMENTTABLE_CREDITPAYMT_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <ProModal
                maskClosable
                padding
                isVisible={visible}
                handleModal={handleDetailsModal}
                width={1200}
            >
                <OperationsDetails
                    row={selectedRow}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={visible}
                />
            </ProModal>
            <section
                className="scrollbar aside"
                id="ProductionCalendarMainArea"
            >
                <div className="container">
                    <ReportTabs>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <SettingButton onClick={toggleVisible} />

                            <ExportToExcel
                                getExportData={() =>
                                    fetchAllCreditPayments({
                                        filters: {
                                            ...filters,
                                            limit: 5000,
                                            page: undefined,
                                        },
                                        onSuccessCallback: data => {
                                            setExCreditPayment(
                                                getList(sortedData)
                                            );
                                        },
                                    })
                                }
                                data={excelData}
                                columns={excelColumns}
                                excelTitle={`Ödənişlər Cədvəli-${
                                    filters?.invoiceType == 1
                                        ? 'Debitor borclar'
                                        : 'Kreditor borclar'
                                }`}
                                excelName={`Ödənişlər Cədvəli-${
                                    filters?.invoiceType == 1
                                        ? 'Debitor borclar'
                                        : 'Kreditor borclar'
                                }`}
                                filename={`Ödənişlər Cədvəli-${
                                    filters?.invoiceType == 1
                                        ? 'Debitor borclar'
                                        : 'Kreditor borclar'
                                }`}
                                count={getList(sortedData)?.length}
                            />
                        </div>
                    </ReportTabs>
                    <Spin spinning={isLoading}>
                        <Table
                            className={styles.creditPaymentsTable}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            dataSource={getList(sortedData)}
                            rowKey={record => record.creditId}
                            expandedRowKeys={defaultExpand}
                            onExpand={(expanded, row) =>
                                handleExpand(expanded, row)
                            }
                            columns={getColumns({
                                column: visibleColumns,
                            })}
                            expandIcon={props => customExpandIcon(props)}
                        />
                        <Row
                            style={{
                                marginTop: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Col span={8}>
                                <ProPagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    onChange={handlePaginationChange}
                                    total={creditCount}
                                />
                            </Col>
                            <Col span={6} offset={10} align="end">
                                <ProPageSelect
                                    pageSize={pageSize}
                                    onChange={e =>
                                        handlePageSizeChange(currentPage, e)
                                    }
                                    total={creditCount}
                                />
                            </Col>
                        </Row>
                    </Spin>
                </div>
            </section>
        </section>
    );
}
const mapStateToProps = state => ({
    mainCurrency: state.kassaReducer.mainCurrency,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    creditCount: state.paymentTableReducer.creditCount,
    creditPayments: state.paymentTableReducer.creditPayments,
    isLoading: state.loadings.fetchCreditPayments,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchMainCurrency,
        fetchAllCreditPayments,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchCreditPayments,
        fetchPaymentTransaction,
        fetchCreditCounts,
    }
)(CreditPayments);
