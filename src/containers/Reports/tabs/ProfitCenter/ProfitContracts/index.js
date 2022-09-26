import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { accessTypes, permissions } from 'config/permissions';
import {
    Can,
    Table,
    ExcelButton,
    DetailButton,
    ProModal,
    TableConfiguration,
} from 'components/Lib';
import { Tooltip } from 'antd';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    filterQueryResolver,
} from 'utils';
import { fetchContracts, fetchContract } from 'store/actions/contracts';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchContacts } from 'store/actions/contact';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { fetchProfitContracts } from 'store/actions/reports/profit-center';
import { useFilterHandle } from 'hooks/useFilterHandle';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import ContractDetail from './contractDetail';

// content
import Sidebar from './sidebar';
import styles from './styles.module.scss';
import ReportTabs from '../Tabs';
import { ProfitContracts_TABLE_SETTING_DATA } from 'utils/table-config/reportsModule';
import { fetchAllProfitContracts } from 'store/actions/export-to-excel/reportsModule';

const math = require('exact-math');
// eslint-disable-next-line no-unused-vars
function ProfitContracts(props) {
    const {
        fetchProfitContracts,
        fetchAllProfitContracts,
        fetchProfitContractsLoading,
        fetchContracts,
        tableConfiguration,
        fetchTableConfiguration,
        createTableConfiguration,
        currencies,
        contacts,
        fetchContacts,
        fetchCurrencies,
        profitContracts,
        contract,
        fetchContract,
        profile,
        fetchBusinessUnitList,
        businessUnits,
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
    ); // Filters handle
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [filterSelectedCurrencies, setFilterSelectedCurrencies] = useState(
        []
    );
    const [agents, setAgents] = useState([]);
    const [filters, onFilter] = useFilterHandle(
        {
            types: null,
            dateFrom: undefined,
            dateTo: undefined,
            status: null,
            page: currentPage,
            limit: pageSize,
            isDeleted: params.isDeleted ? params.isDeleted : 0,
            agents: params.agents ? params.agents : undefined,
            contacts: params.contacts ? params.contacts : undefined,
            currencyId: params.currencyId ? params.currencyId : undefined,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
        },
        ({ filters }) => {
            if (filters) {
                const query = filterQueryResolver({ ...filters });
                if (typeof filters['history'] == 'undefined') {
                    history.push({
                        search: query,
                    });
                }
                fetchProfitContracts({ filters });
            }
        }
    );
    const [details, setDetails] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [description, setDescription] = useState(undefined);
    const [activeTab, setActiveTab] = useState(0);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        ProfitContracts_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exProfitCenter, setExProfitCenter] = useState([]);
    useEffect(() => {
        fetchCurrencies();
        if (contacts.length === 0) fetchContacts({});
        fetchContracts({ limit: 1000 });
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
        fetchTableConfiguration({ module: 'Reports-ProfitContracts' });
    }, []);

    useEffect(() => {
        if (selectedRow.id) {
            fetchContract(selectedRow.id);
        }
    }, [selectedRow]);

    useEffect(() => {
        setDescription(contract?.description);
    }, [contract]);

    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
        setDescription(undefined);
    };
    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Reports-ProfitContracts',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };

    const getFilteredData = tableData => {
        const newtableDatas = tableData.filter(
            ({ expenses_amount, writing_off_amount, salary_amount }) => {
                if (
                    Number(expenses_amount) === 0 &&
                    Number(writing_off_amount) === 0 &&
                    Number(salary_amount) === 0
                ) {
                    return false;
                }
                return true;
            }
        );
        return newtableDatas;
    };

    useEffect(() => {
        handlePaginationChange(filters.page ? filters.page : 1);
    }, []);

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
            const column = ProfitContracts_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(ProfitContracts_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    useEffect(() => {
        if (params.contacts) {
            fetchContacts({ ids: params.contacts.map(Number) }, data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedContacts(appendList);
            });
        }
        if (params.currencyId) {
            fetchCurrencies({ ids: [Number(params.currencyId)] }, data => {
                const appendList = [];
                if (data.data) {
                    data.data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedCurrencies(appendList);
            });
        }
    }, []);
    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('counterparty_name')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'counterparty_name',
            width: 120,
            render: value =>
                value?.length > 9 ? (
                    <Tooltip title={value}>{value.substring(0, 9)}...</Tooltip>
                ) : (
                    value || '-'
                ),
        };
        columns[column.indexOf('contract_no')] = {
            title: 'Müqavilə',
            width: 160,
            dataIndex: 'contract_no',
            ellipsis: true,
            render: (value, row) =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('currencycode')] = {
            title: 'Valyuta',
            dataIndex: 'currencycode',
            align: 'left',
            width: 100,
        };
        columns[column.indexOf('turnover')] = {
            title: 'Dövriyyə',
            dataIndex: 'turnover',
            align: 'center',
            width: 120,
            render: turnover =>
                formatNumberToLocale(defaultNumberFormat(turnover)) || '-',
        };
        columns[column.indexOf('profit')] = {
            title: 'Maya dəyəri',
            dataIndex: 'profit',
            align: 'center',
            width: 120,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || '-',
        };
        columns[column.indexOf('expenses_amount')] = {
            title: 'Xərclər',
            dataIndex: 'expenses_amount',
            align: 'center',
            width: 120,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || '-',
        };
        columns[column.indexOf('writing_off_amount')] = {
            title: 'Silinmiş mallar',
            dataIndex: 'writing_off_amount',
            align: 'center',
            width: 150,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || '-',
        };
        columns[column.indexOf('salary_amount')] = {
            title: 'Əməkhaqqı',
            dataIndex: 'salary_amount',
            align: 'center',
            width: 120,
            render: value =>
                formatNumberToLocale(defaultNumberFormat(value)) || '-',
        };
        columns[column.indexOf('salary_amountProfit')] = {
            title: 'Mənfəət',
            dataIndex: 'salary_amountProfit',
            align: 'center',
            width: 150,
            render: (value, row) => (
                <span
                    style={
                        math.sub(
                            Number(row.turnover),
                            math.add(
                                Number(row.writing_off_amount),
                                Number(row.salary_amount),
                                Number(row.expenses_amount),
                                Number(row.profit)
                            )
                        ) > 0
                            ? {
                                  color: 'green',
                                  fontSize: '15px',
                                  fontWeight: 700,
                              }
                            : {
                                  color: 'red',
                                  fontSize: '15px',
                                  fontWeight: 700,
                              }
                    }
                >
                    {formatNumberToLocale(
                        defaultNumberFormat(
                            math.sub(
                                Number(row.turnover),
                                math.add(
                                    Number(row.writing_off_amount),
                                    Number(row.salary_amount),
                                    Number(row.expenses_amount),
                                    Number(row.profit)
                                )
                            )
                        )
                    )}
                </span>
            ),
        };
        columns[column.indexOf('salary_amountMargin')] = {
            title: 'Marja %',
            dataIndex: 'salary_amountMargin',
            align: 'center',
            width: 150,
            render: (value, row) =>
                Number(row.turnover) !== 0 ? (
                    math.div(
                        math.sub(
                            Number(row.turnover),
                            math.add(
                                Number(row.writing_off_amount),
                                Number(row.salary_amount),
                                Number(row.expenses_amount),
                                Number(row.profit)
                            )
                        ),
                        Number(row.turnover)
                    ) > 0 ? (
                        <span
                            style={{
                                color: 'green',
                                fontSize: '15px',
                                fontWeight: 700,
                            }}
                        >{`${formatNumberToLocale(
                            defaultNumberFormat(
                                math.mul(
                                    math.div(
                                        math.sub(
                                            Number(row.turnover),
                                            math.add(
                                                Number(row.writing_off_amount),
                                                Number(row.salary_amount),
                                                Number(row.expenses_amount),
                                                Number(row.profit)
                                            )
                                        ),
                                        Number(row.turnover)
                                    ),
                                    100
                                )
                            )
                        )}%`}</span>
                    ) : (
                        <span
                            style={{
                                color: 'red',
                                fontSize: '15px',
                                fontWeight: 700,
                            }}
                        >{`${formatNumberToLocale(
                            defaultNumberFormat(
                                math.mul(
                                    math.div(
                                        math.sub(
                                            Number(row.turnover),
                                            math.add(
                                                Number(row.writing_off_amount),
                                                Number(row.salary_amount),
                                                Number(row.expenses_amount),
                                                Number(row.profit)
                                            )
                                        ),
                                        Number(row.turnover)
                                    ),
                                    -100
                                )
                            )
                        )}%`}</span>
                    )
                ) : (
                    <span
                        style={{
                            color: 'red',
                            fontSize: '15px',
                            fontWeight: 700,
                        }}
                    >
                        0.00%
                    </span>
                ),
        };
        columns[column.indexOf('contract_type')] = {
            title: 'Növ',
            width: 100,
            dataIndex: 'contract_type',
            render: (value, row) =>
                value === 1 ? `Məhsul` : value === 2 ? 'Xidmət' : '-',
        };
        columns[column.indexOf('direction')] = {
            title: 'İstiqamət',
            width: 100,
            dataIndex: 'direction',
            render: (value, row) =>
                value === 1 ? `Alış` : value === 2 ? 'Satış' : '-',
        };
        columns[column.indexOf('responsible_person_name')] = {
            title: 'Məsul şəxs',
            align: 'left',
            width: 150,
            dataIndex: 'responsible_person_name',
            ellipsis: true,
            render: (value, row) => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        // columns[column.indexOf('related_contacts')]={
        //   title: 'Əlaqəli tərəflər',
        //   align: 'left',
        //   width: 100,
        //   dataIndex: 'related_contacts',
        //   ellipsis: true,
        //   render: (value,row) =>
        //   (
        //       value?.length>0?
        //         value?.map(item=>(
        //           <span>{item}</span>
        //         ))
        //       : '-'
        //   ),
        // };
        columns[column.indexOf('start_date')] = {
            title: 'Başlama tarixi',
            align: 'left',
            width: 150,
            dataIndex: 'start_date',
            render: (value, row) =>
                value
                    ? String(value)
                          .split(' ')[0]
                          .split('-')
                          .reverse()
                          .join('-')
                    : '-',
        };
        columns[column.indexOf('end_date')] = {
            title: 'Bitmə tarixi',
            align: 'left',
            width: 150,
            dataIndex: 'end_date',
            ellipsis: true,
            render: (value, row) =>
                value
                    ? String(value)
                          .split(' ')[0]
                          .split('-')
                          .reverse()
                          .join('-')
                    : 'Müddətsiz',
        };
        columns[column.indexOf('days_to_end')] = {
            title: 'Günlərin sayı',
            dataIndex: 'days_to_end',
            align: 'center',
            width: 120,
            render: value => value || '-',
        };
        columns[column.indexOf('amount')] = {
            title: 'Məbləğ',
            dataIndex: 'amount',
            align: 'left',
            width: 150,
            render: amount =>
                amount
                    ? Number(amount) == 0
                        ? 'Limitsiz'
                        : formatNumberToLocale(defaultNumberFormat(amount))
                    : '-',
        };
        columns[column.indexOf('rest')] = {
            title: 'Qalıq',
            dataIndex: 'rest',
            align: 'left',
            width: 150,
            render: rest =>
                rest ? formatNumberToLocale(defaultNumberFormat(rest)) : '-',
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            align: 'left',
            width: 150,
            render: status =>
                status === 1 ? (
                    <span
                        className={styles.chip}
                        style={{
                            color: '#55AB80',
                            background: '#EBF5F0',
                        }}
                    >
                        İmzalanıb
                    </span>
                ) : status === 2 ? (
                    <span
                        style={{
                            color: '#B16FE4',
                            background: '#F6EEFC',
                        }}
                        className={styles.chip}
                    >
                        Qaralama
                    </span>
                ) : (
                    <span
                        style={{
                            color: '#C4C4C4',
                            background: '#F8F8F8',
                        }}
                        className={styles.chip}
                    >
                        Silinib
                    </span>
                ),
        };
        // columns[column.indexOf('description')] = {
        //   title: 'Əlavə məlumat',
        //   dataIndex: 'description',
        //   align: 'center',
        //   ellipsis: true,
        //   width: 120,
        //   render: (value,row) =>
        //     (value ? <Tooltip
        //       placement="topLeft"
        //       title={value}
        //     >
        //       {value}
        //     </Tooltip> : '-'),
        // };
        columns.push({
            title: 'Seç',
            width: 70,
            align: 'right',
            render: row => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                </div>
            ),
        });
        columns.unshift({
            title: '№',
            width: 60,
            render: (value, row, index) => index + 1,
        });

        return columns;
    };

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('counterparty_name')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`contract_no`)] = {
            title: `Müqavilə`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('currencycode')] = {
            title: `Valyuta`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('turnover')] = {
            title: `Dövriyyə`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('profit')] = {
            title: `Maya dəyəri`,
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('expenses_amount')] = {
            title: `Xərclər`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('writing_off_amount')] = {
            title: 'Silinmiş mallar',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('salary_amount')] = {
            title: 'Əməkhaqqı',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('salary_amountProfit')] = {
            title: 'Mənfəət',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('salary_amountMargin')] = {
            title: 'Marja %',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('contract_type')] = {
            title: 'Növ',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('direction')] = {
            title: 'İstiqamət',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('responsible_person_name')] = {
            title: 'Məsul şəxs',
            width: { wpx: 120 },
        };
        // columns[columnClone.indexOf('related_contacts')] = {
        //   title: 'Əlaqəli tərəflər',
        //   width: { wpx: 120 },
        // };
        columns[columnClone.indexOf('start_date')] = {
            title: 'Başlama tarixi',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('end_date')] = {
            title: 'Bitmə tarixi',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('days_to_end')] = {
            title: 'Günlərin sayı',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('amount')] = {
            title: 'Məbləğ',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('rest')] = {
            title: 'Qalıq',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Status',
            width: { wpx: 120 },
        };
        // columns[columnClone.indexOf('description')] = {
        //   title: 'Əlavə məlumat',
        //   width: { wpx: 120 },
        // };

        columns.unshift({
            title: '№',
            width: { wpx: 90 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];

        const data = exProfitCenter.map((item, index) => {
            let arr = [];
            columnClone.includes('counterparty_name') &&
                (arr[columnClone.indexOf('counterparty_name')] = {
                    value: item.counterparty_name || '-',
                });
            columnClone.includes('contract_no') &&
                (arr[columnClone.indexOf('contract_no')] = {
                    value: item.contract_no || '-',
                });
            columnClone.includes('currencycode') &&
                (arr[columnClone.indexOf('currencycode')] = {
                    value: item.currencycode || '-',
                });
            columnClone.includes('turnover') &&
                (arr[columnClone.indexOf('turnover')] = {
                    value: Number(item.turnover),
                });
            columnClone.includes('profit') &&
                (arr[columnClone.indexOf('profit')] = {
                    value: Number(defaultNumberFormat(item.profit)),
                });
            columnClone.includes('expenses_amount') &&
                (arr[columnClone.indexOf('expenses_amount')] = {
                    value: Number(defaultNumberFormat(item.expenses_amount)),
                });
            columnClone.includes('writing_off_amount') &&
                (arr[columnClone.indexOf('writing_off_amount')] = {
                    value: Number(defaultNumberFormat(item.writing_off_amount)),
                });
            columnClone.includes('salary_amount') &&
                (arr[columnClone.indexOf('salary_amount')] = {
                    value: Number(defaultNumberFormat(item.salary_amount)),
                });
            columnClone.includes('salary_amountProfit') &&
                (arr[columnClone.indexOf('salary_amountProfit')] = {
                    value: Number(
                        defaultNumberFormat(
                            math.sub(
                                Number(item.turnover),
                                math.add(
                                    Number(item.writing_off_amount),
                                    Number(item.salary_amount),
                                    Number(item.expenses_amount),
                                    Number(item.profit)
                                )
                            )
                        )
                    ),
                });
            columnClone.includes('salary_amountMargin') &&
                (arr[columnClone.indexOf('salary_amountMargin')] = {
                    value:
                        Number(item.turnover) !== 0
                            ? math.div(
                                  math.sub(
                                      Number(item.turnover),
                                      math.add(
                                          Number(item.writing_off_amount),
                                          Number(item.salary_amount),
                                          Number(item.expenses_amount),
                                          Number(item.profit)
                                      )
                                  ),
                                  Number(item.turnover)
                              ) > 0
                                ? `${formatNumberToLocale(
                                      defaultNumberFormat(
                                          math.mul(
                                              math.div(
                                                  math.sub(
                                                      Number(item.turnover),
                                                      math.add(
                                                          Number(
                                                              item.writing_off_amount
                                                          ),
                                                          Number(
                                                              item.salary_amount
                                                          ),
                                                          Number(
                                                              item.expenses_amount
                                                          ),
                                                          Number(item.profit)
                                                      )
                                                  ),
                                                  Number(item.turnover)
                                              ),
                                              100
                                          )
                                      )
                                  )}%`
                                : `${formatNumberToLocale(
                                      defaultNumberFormat(
                                          math.mul(
                                              math.div(
                                                  math.sub(
                                                      Number(item.turnover),
                                                      math.add(
                                                          Number(
                                                              item.writing_off_amount
                                                          ),
                                                          Number(
                                                              item.salary_amount
                                                          ),
                                                          Number(
                                                              item.expenses_amount
                                                          ),
                                                          Number(item.profit)
                                                      )
                                                  ),
                                                  Number(item.turnover)
                                              ),
                                              -100
                                          )
                                      )
                                  )}%`
                            : '0.00%',
                });
            columnClone.includes('contract_type') &&
                (arr[columnClone.indexOf('contract_type')] = {
                    value:
                        item.contract_type == 1
                            ? `Məhsul`
                            : item.contract_type === 2
                            ? 'Xidmət'
                            : '-',
                });
            columnClone.includes('direction') &&
                (arr[columnClone.indexOf('direction')] = {
                    value:
                        item.direction == 1
                            ? `Alış`
                            : item.direction === 2
                            ? 'Satış'
                            : '-',
                });
            columnClone.includes('responsible_person_name') &&
                (arr[columnClone.indexOf('responsible_person_name')] = {
                    value: item.responsible_person_name || '-',
                });
            // columnClone.includes('related_contacts') && (arr[columnClone.indexOf('related_contacts')] ={ value: item.related_contacts?.length?
            //   item?.related_contacts.map((contact,index)=>`${index==0?contact:','+contact}`) : '-', });
            columnClone.includes('start_date') &&
                (arr[columnClone.indexOf('start_date')] = {
                    value: item.start_date
                        ? String(item.start_date)
                              .split(' ')[0]
                              .split('-')
                              .reverse()
                              .join('-')
                        : '-',
                });
            columnClone.includes('end_date') &&
                (arr[columnClone.indexOf('end_date')] = {
                    value: item.end_date
                        ? String(item.end_date)
                              .split(' ')[0]
                              .split('-')
                              .reverse()
                              .join('-')
                        : 'Müddətsiz',
                });
            columnClone.includes('days_to_end') &&
                (arr[columnClone.indexOf('days_to_end')] = {
                    value: Number(item.days_to_end) || '-',
                });
            columnClone.includes('amount') &&
                (arr[columnClone.indexOf('amount')] = {
                    value: item.amount
                        ? item.amount == 0
                            ? 'Limitsiz'
                            : Number(item.amount)
                        : '-',
                });
            columnClone.includes('rest') &&
                (arr[columnClone.indexOf('rest')] = {
                    value: Number(item.rest) || '-',
                });
            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = {
                    value:
                        item.status == 1
                            ? `İmzalanıb`
                            : item.status === 2
                            ? 'Qaralama'
                            : 'Silinib',
                });
            // columnClone.includes('description') && (arr[columnClone.indexOf('description')] ={ value: item.description || '-', })

            arr.unshift({ value: index + 1 });
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns();
    }, [visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exProfitCenter]);

    return (
        <>
            <ProModal
                maskClosable
                padding
                isVisible={details}
                handleModal={handleDetailsModal}
                width={activeTab === 0 ? 900 : 1200}
            >
                <ContractDetail
                    row={selectedRow}
                    description={description}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={details}
                    contract={contract}
                    profitContracts={profitContracts}
                    {...props}
                />
            </ProModal>
            <Sidebar
                {...{
                    onFilter,
                    filters,
                    businessUnits,
                    profile,
                    filterSelectedContacts,
                    filterSelectedCurrencies,
                    agents,
                    setAgents,
                    handlePaginationChange,
                }}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={ProfitContracts_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <section
                id="container-area"
                className="aside scrollbar"
                style={{
                    paddingBottom: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 24,
                    paddingRight: 32,
                    paddingLeft: 32,
                }}
            >
                <ReportTabs>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Can
                            I={accessTypes.manage}
                            a={permissions.profit_center_contracts}
                        >
                            <SettingButton onClick={toggleVisible} />

                            <ExportToExcel
                                getExportData={() =>
                                    fetchAllProfitContracts({
                                        filters: {
                                            ...filters,
                                            limit: 5000,
                                            page: undefined,
                                        },
                                        onSuccessCallback: data => {
                                            setExProfitCenter(
                                                getFilteredData(data.data)
                                            );
                                        },
                                    })
                                }
                                data={excelData}
                                columns={excelColumns}
                                excelTitle={`Mənfəət Mərkəzləri-Müqavilələr`}
                                excelName="Mənfəət Mərkəzləri-Müqavilələr"
                                filename="Mənfəət Mərkəzləri-Müqavilələr"
                                count={getFilteredData(profitContracts)?.length}
                            />
                        </Can>
                    </div>
                </ReportTabs>
                <Table
                    style={{ marginTop: '10px' }}
                    loading={fetchProfitContractsLoading}
                    scroll={{ x: 'max-content' }}
                    dataSource={getFilteredData(profitContracts)}
                    columns={getColumns({ column: visibleColumns })}
                    rowKey={record => record.id}
                    footer={<div></div>}
                />
            </section>
        </>
    );
}

const mapStateToProps = state => ({
    profitContracts: state.profitCenter.profitContracts,
    fetchProfitContractsLoading: state.loadings.fetchProfitContracts,
    contacts: state.contactsReducer.contacts,
    currencies: state.kassaReducer.currencies,
    contract: state.contractsReducer.contractInfo,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});
export const ProfitContractsReport = connect(
    mapStateToProps,
    {
        fetchProfitContracts,
        fetchAllProfitContracts,
        fetchCurrencies,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchContacts,
        fetchContract,
        fetchContracts,
        fetchBusinessUnitList,
    }
)(ProfitContracts);
