import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
    Can,
    ProDots,
    ProModal,
    ProDotsItem,
    DetailButton,
    ProPagination,
    ProPageSelect,
    Table,
    TableConfiguration,
} from 'components/Lib';
import { Spin, Tooltip, Col, Row } from 'antd';
import {
    fetchCreditPayments,
    deleteCreditPayment,
    fetchCreditCounts,
} from 'store/actions/finance/paymentTable';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { fetchCreditTypes } from 'store/actions/settings/credit';
import { fetchAllCreditPayments } from 'store/actions/export-to-excel/financeModule';
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import moment from 'moment';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { PAYMENTTABLE_CREDITTABLE_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { toast } from 'react-toastify';
import { DeleteModal } from './deleteModal';
import ReportTabs from '../Tabs';
import styles from '../styles.module.scss';
import OperationsDetails from '../operationsDetails';
import CreditTablesSidebar from './Sidebar';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
const math = require('exact-math');

function CreditTables(props) {
    const {
        isLoading,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        fetchAllCreditPayments,
        fetchCreditPayments,
        fetchCreditCounts,
        creditPayments,
        deleteCreditPayment,
        fetchFilteredContacts,
        fetchCreditTypes,
        fetchMainCurrency,
        mainCurrency,
        creditCount,
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
    const [debtType, setDebtType] = useState('receivables-turnover');
    const [invoiceList, setInvoiceList] = useState([]);
    const [deleteModalVisibe, setDeleteModalVisibe] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [visible, setVisible] = useState(false);
    const queryStrin = window.location.search;
    const urlParams = new URLSearchParams(queryStrin);
    const invoiceType = urlParams.get('invoiceType');
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        PAYMENTTABLE_CREDITTABLE_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exCreditTable, setExCreditTable] = useState([]);

    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            invoiceType:
                invoiceType === 'undefined'
                    ? undefined
                    : invoiceType === null
                    ? 1
                    : Number(invoiceType),
            createdAtFrom: params.createdAtFrom
                ? params.createdAtFrom
                : undefined,
            createdAtTo: params.createdAtTo ? params.createdAtTo : undefined,
            contacts: params.contacts ? params.contacts : [],
            statuses: params.statuses ? params.statuses : [1],
            currencies: params.currencies ? params.currencies : [],
            invoiceIds: params.invoiceIds ? params.invoiceIds : [],
            serialNumber: params.serialNumber ? params.serialNumber : undefined,
            creditTypes: params.creditTypes ? params.creditTypes : [],
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : undefined,
            totalInvoiceAmountFrom: params.totalInvoiceAmountFrom
                ? params.totalInvoiceAmountFrom
                : undefined,
            totalInvoiceAmountTo: params.totalInvoiceAmountTo
                ? params.totalInvoiceAmountTo
                : undefined,
            totalPaidAmountFrom: params.totalPaidAmountFrom
                ? params.totalPaidAmountFrom
                : undefined,
            totalPaidAmountTo: params.totalPaidAmountTo
                ? params.totalPaidAmountTo
                : undefined,
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
            numberOfMonthsFrom: params.numberOfMonthsFrom
                ? params.numberOfMonthsFrom
                : undefined,
            numberOfMonthsTo: params.numberOfMonthsTo
                ? params.numberOfMonthsTo
                : undefined,
            ids: params.ids ? params.ids : undefined,
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
            fetchCreditPayments({ filters });
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
                setCurrentPage(parseInt(parmas.page));
            }
            setFilters({ ...parmas });
        }
    }, [rerender]);

    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter('limit', size);
    };

    const removeCreditTable = row => {
        setDeleteModalVisibe(true);
        setSelectedRow(row);
    };

    const handleDeleteOperation = (id, reason) => {
        deleteCreditPayment(id, reason, deleteSuccess);
    };
    const deleteSuccess = () => {
        if ((creditCount - 1) % pageSize == 0 && currentPage > 1) {
            handlePaginationChange(currentPage - 1);
        } else {
            toast.success('Əməliyyat uğurla tamamlandı.');
            fetchCreditPayments({ filters });
            fetchCreditCounts({ filters });
        }
    };

    useEffect(() => {
        // fetchFilteredContacts({ filters: { includeDeleted: 1 } });
        fetchCreditTypes();
        fetchTableConfiguration({ module: 'Finance-PaymentTable-CreditTable' });
        if (!mainCurrency.id) fetchMainCurrency();
    }, []);

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
            moduleName: 'Finance-PaymentTable-CreditTable',
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
            const column = PAYMENTTABLE_CREDITTABLE_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(PAYMENTTABLE_CREDITTABLE_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const handleDetailsModal = row => {
        setVisible(!visible);
        setSelectedRow(row);
    };

    const getTotal = data => {
        let invoices = [];

        if (data?.length > 0) {
            const totalInvoiceAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalInvoiceAmountInMainCurrency)
                    ),
                0
            );
            const totalPaidAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalPaidAmountInMainCurrency)
                    ),
                0
            );
            const remainingAmountInMainCurrency = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.remainingAmountInMainCurrency)
                    ),
                0
            );

            invoices = [
                ...data.map(item => {
                    if (item.status === 3) return { ...item, isDeleted: true };
                    return item;
                }),
                {
                    isTotal: true,
                    totalInvoiceAmount: totalInvoiceAmountInMainCurrency,
                    totalPaidAmount: totalPaidAmountInMainCurrency,
                    remainingAmount: remainingAmountInMainCurrency,
                    invoiceTenantCurrencyCode: mainCurrency?.code,
                },
            ];
        }
        return invoices;
    };

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            dataIndex: 'createdAt',
            width: 200,
            render: (date, row) => (row.isTotal ? null : date),
        };
        columns[column.indexOf('contactName')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'contactName',
            width: 170,
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Tooltip placement="topLeft" title={value || ''}>
                        <span>{value || '-'}</span>
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
        columns[column.indexOf('creditTypeName')] = {
            title: 'Kredit növü',
            dataIndex: 'creditTypeName',
            width: 130,
            ellipsis: true,
            render: (value, row) =>
                row.isTotal ? null : (
                    <Tooltip placement="topLeft" title={value || 'Sərbəst'}>
                        <span>{value || 'Sərbəst'}</span>
                    </Tooltip>
                ),
        };
        columns[column.indexOf('totalInvoiceAmount')] = {
            title: 'Kredit məbləği',
            dataIndex: 'totalInvoiceAmount',
            align: 'right',
            width: 180,
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('totalPaidAmount')] = {
            title: 'Ödənilib',
            dataIndex: 'totalPaidAmount',
            width: 180,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('totalPaidAmountPercentage')] = {
            title: 'Ödənilib(%)',
            dataIndex: 'totalPaidAmountPercentage',
            width: 150,
            align: 'right',
            render: (value, row) =>
                Number(row.totalInvoiceAmount) === 0
                    ? '0.00 %'
                    : `${formatNumberToLocale(
                          defaultNumberFormat(
                              math.mul(
                                  math.div(
                                      Number(row.totalPaidAmount || 0),
                                      Number(row.totalInvoiceAmount || 1)
                                  ),
                                  100
                              )
                          )
                      )} %`,
        };
        columns[column.indexOf('remainingAmount')] = {
            title: 'Ödənilməlidir',
            dataIndex: 'remainingAmount',
            width: 180,
            align: 'right',
            render: (value, row) =>
                `${formatNumberToLocale(defaultNumberFormat(value))} ${
                    row.invoiceTenantCurrencyCode
                }`,
        };
        columns[column.indexOf('monthlyPaymentAmount')] = {
            title: 'Aylıq ödəniş',
            dataIndex: 'monthlyPaymentAmount',
            width: 150,
            align: 'right',
            render: (value, row) =>
                row.isTotal
                    ? null
                    : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                          row.invoiceTenantCurrencyCode
                      }`,
        };
        columns[column.indexOf('numberOfMonths')] = {
            title: 'Müddət (Ay)/dəfə',
            dataIndex: 'numberOfMonths',
            align: 'center',
            width: 180,
            render: (value, row) =>
                row.isTotal ? null : `${row.paidNumberOfMonths}/${value}`,
        };
        columns[column.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            width: 130,
            dataIndex: 'invoiceNumber',
            render: (value, row) => (row.isTotal ? null : value),
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            width: 100,
            key: 'status',
            render: (value, row) =>
                row.isTotal ? null : value ? (
                    value === 1 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#4E9CDF',
                                background: '#EAF3FB',
                            }}
                        >
                            Açıq
                        </span>
                    ) : value === 2 ? (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#55AB80',
                                background: '#EBF5F0',
                            }}
                        >
                            Bağlı
                        </span>
                    ) : (
                        <span
                            className={styles.chip}
                            style={{
                                color: '#55AB80',
                                background: '#EBF5F0',
                            }}
                        >
                            Silinib
                        </span>
                    )
                ) : (
                    '-'
                ),
        };
        columns.push({
            title: 'Seç',
            align: 'center',
            dataIndex: 'creditId',
            width: 100,
            render: (value, row) =>
                row.isTotal ? null : (
                    <div
                        style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <DetailButton onClick={() => handleDetailsModal(row)} />
                        <Can
                            I={accessTypes.manage}
                            a={permissions.credits_table}
                        >
                            <ProDots
                                isDisabled={
                                    row.status === 2 || row.status === 3
                                }
                            >
                                <Can
                                    I={accessTypes.manage}
                                    a={permissions.credits_table}
                                >
                                    <ProDotsItem
                                        label="Düzəliş et"
                                        icon="pencil"
                                        onClick={() => {
                                            history.push(
                                                `/sales/operations/creditTable/edit/${row.invoiceId}/${value}?invoiceType=${filters.invoiceType}`
                                            );
                                        }}
                                    />
                                    <ProDotsItem
                                        label="Sil"
                                        icon="trash"
                                        onClick={() => removeCreditTable(row)}
                                    />
                                </Can>
                            </ProDots>
                        </Can>
                    </div>
                ),
        });

        columns.unshift({
            title: '№',
            dataIndex: 'id',
            align: 'left',
            width: 80,
            render: (value, row, index) =>
                row.isTotal ? null : (currentPage - 1) * pageSize + index + 1,
        });

        return columns;
    };

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`contactName`)] = {
            title: `Qarşı tərəf`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('serialNumber')] = {
            title: `Sənəd `,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('creditTypeName')] = {
            title: `Kredit növü`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('totalInvoiceAmount')] = {
            title: `Kredit məbləği`,
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('totalPaidAmount')] = {
            title: 'Ödənilib',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('totalPaidAmountPercentage')] = {
            title: 'Ödənilib(%)',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('remainingAmount')] = {
            title: 'Ödənilməlidir',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('monthlyPaymentAmount')] = {
            title: 'Aylıq ödəniş',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('numberOfMonths')] = {
            title: 'Müddət (Ay)/dəfə',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('invoiceNumber')] = {
            title: 'Qaimə',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Status',
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
        const data = exCreditTable.map((item, index) => {
            let arr = [];

            columnClone.includes('createdAt') &&
                (arr[columnClone.indexOf('createdAt')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.createdAt || '-',
                      });
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

            columnClone.includes('creditTypeName') &&
                (arr[columnClone.indexOf('creditTypeName')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.creditTypeName || '-',
                      });
            columnClone.includes('totalInvoiceAmount') &&
                (arr[columnClone.indexOf('totalInvoiceAmount')] = {
                    value: `${Number(
                        defaultNumberFormat(item?.totalInvoiceAmount)
                    )} ${item.invoiceTenantCurrencyCode}`,
                    style: item?.isTotal ? columnFooterStyle : '',
                });
            columnClone.includes('totalPaidAmount') &&
                (arr[columnClone.indexOf('totalPaidAmount')] = {
                    value: `${Number(
                        defaultNumberFormat(item?.totalPaidAmount)
                    )} ${item.invoiceTenantCurrencyCode}`,
                    style: item?.isTotal ? columnFooterStyle : '',
                });
            columnClone.includes('totalPaidAmountPercentage') &&
                (arr[columnClone.indexOf('totalPaidAmountPercentage')] = {
                    value:
                        Number(item.totalInvoiceAmount) === 0
                            ? '0.00 %'
                            : `${formatNumberToLocale(
                                  defaultNumberFormat(
                                      math.mul(
                                          math.div(
                                              Number(item.totalPaidAmount || 0),
                                              Number(
                                                  item.totalInvoiceAmount || 1
                                              )
                                          ),
                                          100
                                      )
                                  )
                              )} %`,
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
                ] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: `${Number(
                              defaultNumberFormat(item?.monthlyPaymentAmount)
                          )} ${item.invoiceTenantCurrencyCode}`,
                      });
            columnClone.includes('numberOfMonths') &&
                (arr[columnClone.indexOf('numberOfMonths')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              `${item.paidNumberOfMonths}/${item.numberOfMonths}` ||
                              '-',
                      });
            columnClone.includes('invoiceNumber') &&
                (arr[columnClone.indexOf('invoiceNumber')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.invoiceNumber || '-',
                      });
            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = item?.isTotal
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              item.status === 1
                                  ? 'Açıq'
                                  : item.status === 2
                                  ? 'Bağlı'
                                  : 'Silinib' || '-',
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
    }, [exCreditTable]);
    return (
        <section>
            <CreditTablesSidebar
                filters={filters}
                onFilter={onFilter}
                debtType={debtType}
                setDebtType={setDebtType}
                invoiceList={invoiceList}
                handlePaginationChange={handlePaginationChange}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={PAYMENTTABLE_CREDITTABLE_TABLE_SETTING_DATA}
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
                    fromTable
                    row={selectedRow}
                    mainCurrencyCode={mainCurrency}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={visible}
                />
            </ProModal>
            <DeleteModal
                row={selectedRow}
                setVisible={setDeleteModalVisibe}
                visible={deleteModalVisibe}
                deleteOperation={handleDeleteOperation}
            />
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
                                            setExCreditTable(
                                                getTotal(data.data)
                                            );
                                        },
                                    })
                                }
                                data={excelData}
                                columns={excelColumns}
                                excelTitle={`Ödənişlər Cədvəli-${filters?.invoiceType==1? 'Debitor borclar':'Kreditor borclar'}`}
                                excelName={`Ödənişlər Cədvəli-${filters?.invoiceType==1? 'Debitor borclar':'Kreditor borclar'}`}
                                filename={`Ödənişlər Cədvəli-${filters?.invoiceType==1? 'Debitor borclar':'Kreditor borclar'}`}
                                count={getTotal(creditPayments)?.length}
                            />
                        </div>
                    </ReportTabs>
                    <Spin spinning={isLoading}>
                        <Table
                            className={styles.creditTablesTable}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            dataSource={getTotal(creditPayments)}
                            rowKey={record => record.id}
                            columns={getColumns({
                                column: visibleColumns,
                            })}
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
    creditPayments: state.paymentTableReducer.creditPayments,
    creditCount: state.paymentTableReducer.creditCount,
    isLoading: state.loadings.fetchCreditPayments,
    fetchProductConfigurationLoading: state.loadings.fetchProductConfiguration,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchTableConfiguration,
        createTableConfiguration,
        fetchMainCurrency,
        fetchAllCreditPayments,
        fetchCreditPayments,
        fetchCreditCounts,
        deleteCreditPayment,
        fetchFilteredContacts,
        fetchCreditTypes,
    }
)(CreditTables);
