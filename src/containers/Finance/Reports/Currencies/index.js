/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCurrencies } from 'store/actions/contact';
import { Button } from 'antd';
import { fetchCurrencyReport } from 'store/actions/finance/reports';
import { fetchAllCurrencyReport } from 'store/actions/export-to-excel/financeModule';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { useFilterHandle } from 'hooks';
import styles from './styles.module.scss';

import ReportTabs from '../Tabs';
import Table, { getColumns } from './Table';
import Sidebar from './Sidebar';
import { TableConfiguration } from 'components/Lib';
import { defaultNumberFormat } from 'utils';
import { CURRENCIES_REPORTS_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';

const Currencies = props => {
    const {
        fetchCurrencies,
        currencies,
        currencyReport,
        tableConfiguration,
        fetchCurrencyReport,
        fetchAllCurrencyReport,
        fetchTableConfiguration,
        createTableConfiguration,
    } = props;
    const [currency, setCurrency] = useState();
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        CURRENCIES_REPORTS_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exCurrencies, setExCurrencies] = useState([]);

    const [filters, onFilter] = useFilterHandle(
        {
            currencyId: null,
            dateFrom: null,
            dateTo: null,
        },
        ({ filters }) => {
            if (filters.currencyId)
                fetchCurrencyReport({
                    filters,
                });
        }
    );
    useEffect(() => {
        if (currency) {
            onFilter('currencyId', currency);
        }
    }, [currency]);
    useEffect(() => {
        fetchCurrencies();
        fetchTableConfiguration({ module: 'Finance-Reports-Currencies' });
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
            moduleName: 'Finance-Reports-Currencies',
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
            const column = CURRENCIES_REPORTS_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(CURRENCIES_REPORTS_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('startAt')] = {
            title: 'Başlama tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`endAt`)] = {
            title: `Bitmə tarixi`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('currencyCode')] = {
            title: `Valyuta `,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('rate')] = {
            title: `Son məzənnə`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('prevRate')] = {
            title: `Əvvəlki məzənnə`,
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('dynamicsPercent')] = {
            title: 'Dinamika (%)',
            width: { wpx: 150 },
        };
        columns.unshift({
            title: '№',
            width: { wpx: 50 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];

        const data = exCurrencies.map((item, index) => {
            let arr = [];
            columnClone.includes('startAt') &&
                (arr[columnClone.indexOf('startAt')] = {
                    value: item.startAt || '-',
                });
            columnClone.includes('endAt') &&
                (arr[columnClone.indexOf('endAt')] = {
                    value: item.endAt || 'Davam edir',
                });
            columnClone.includes('currencyCode') &&
                (arr[columnClone.indexOf('currencyCode')] = {
                    value: item.currencyCode || '-',
                });
            columnClone.includes('rate') &&
                (arr[columnClone.indexOf('rate')] = {
                    value: Number(defaultNumberFormat(item?.rate)),
                });
            columnClone.includes('prevRate') &&
                (arr[columnClone.indexOf('prevRate')] = {
                    value: Number(defaultNumberFormat(item?.prevRate)),
                });
            columnClone.includes('dynamicsPercent') &&
                (arr[columnClone.indexOf('dynamicsPercent')] = {
                    value: item.dynamicsPercent
                        ? `${item.dynamicsPercent}%`
                        : item.prevRate
                        ? '0%'
                        : '100%',
                });

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
    }, [exCurrencies]);

    useEffect(() => {
        if (currencies.length > 0) {
            currencies.forEach(({ isMain, id }) => {
                if (isMain) {
                    setCurrency(id);
                }
            });
        }
    }, [currencies]);
    const handleGetCurrency = value => {
        setCurrency(value);
    };
    return (
        <>
            <Sidebar filters={filters} onFilter={onFilter} />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={CURRENCIES_REPORTS_TABLE_SETTING_DATA}
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <ReportTabs />
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
                                fetchAllCurrencyReport({
                                    filters: {
                                        ...filters,
                                        limit: 5000,
                                        page: undefined,
                                    },
                                    onSuccessCallback: data => {
                                        setExCurrencies(data.data);
                                    },
                                })
                            }
                            data={excelData}
                            columns={excelColumns}
                            excelTitle={`Maliyyə-Hesabatlar-Valyuta-tarixçəsi`}
                            excelName="Maliyyə-Hesabatlar-Valyuta-tarixçəsi"
                            filename="Maliyyə-Hesabatlar-Valyuta-tarixçəsi"
                            count={currencyReport?.length}
                        />
                    </div>
                </div>
                <div className={styles.currenciesOption}>
                    {currencies.length > 1
                        ? currencies.map(val => (
                              <Button
                                  onClick={() => handleGetCurrency(val.id)}
                                  type={currency === val.id ? 'primary' : ''}
                              >
                                  {val.code}
                              </Button>
                          ))
                        : null}
                </div>
                <Table
                    currencyCode={currency?.code}
                    visibleColumns={visibleColumns}
                />
            </section>
        </>
    );
};

const mapStateToProps = state => ({
    currencies: state.currenciesReducer.currencies,
    currencyReport: state.financeReportsReducer.currencyReport,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export const CurrencyReport = connect(
    mapStateToProps,
    {
        fetchCurrencies,
        fetchCurrencyReport,
        fetchAllCurrencyReport,
        fetchTableConfiguration,
        createTableConfiguration,
    }
)(Currencies);
