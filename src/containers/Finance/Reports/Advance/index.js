/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    fetchAdvanceReport,
    fetchTransactions,
    clearReports,
} from 'store/actions/finance/reports';
import axios from 'axios';
import { accessTypes, permissions } from 'config/permissions';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchFilteredContacts } from 'store/actions/contacts-new';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { fetchAllAdvanceReport } from 'store/actions/export-to-excel/financeModule';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { ProModal, ExcelButton, Can, TableConfiguration } from 'components/Lib';
import { ADVANCE_REPORTS_TABLE_SETTING_DATA } from 'utils/table-config/financeModule';
import { useFilterHandle } from 'hooks';
import { defaultNumberFormat, filterQueryResolver } from 'utils';
import CurrenciesOption from '../currencies-filter';
import TransactionsModal from '../transactions-modal';
import ReportTabs from '../Tabs';
import Table, { getColumns } from './Table';
import Sidebar from './Sidebar';
import math from 'exact-math';

const Advance = props => {
    const {
        fetchTransactions,
        fetchFilteredContacts,
        fetchAdvanceReport,
        fetchAllAdvanceReport,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        clearReports,
        advanceReport,
        profile,
        fetchBusinessUnitList,
    } = props;

    const [currency, setCurrency] = useState({});
    const [excelFileLoading, setExcelFileLoading] = useState(false);
    const [financeOperations, setfinanceOperations] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [detailModalIsVisible, setDetailModalIsVisible] = useState(false);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [businessUnitLength, setBusinessUnitLength] = useState(2);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        ADVANCE_REPORTS_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exAdvance, setExAdvance] = useState([]);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                limit: 10,
                page: 1,
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
            onSuccess: data => {
                setBusinessUnitLength(data.data?.length || 0);
            },
        });
        fetchTableConfiguration({ module: 'Finance-Reports-Advance' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({
            column: tableColumn,
            currencyCode: currency?.code,
            handleDetailClick,
        });
        createTableConfiguration({
            moduleName: 'Finance-Reports-Advance',
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
            const column = ADVANCE_REPORTS_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(ADVANCE_REPORTS_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const ajaxSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchFilteredContacts({ filters }, data => {
            const appendList = [];

            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({ id: element.id, name: element.name });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setContacts(appendList);
            } else {
                setContacts(contacts.concat(appendList));
            }
        });
    };

    const ajaxBusinessUnitSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = {
            limit,
            page,
            name: search,
            isDeleted: 0,
            businessUnitIds: profile.businessUnits?.map(({ id }) => id),
        };
        fetchBusinessUnitList({
            filters,
            onSuccess: data => {
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
                if (onSuccessCallback !== undefined) {
                    onSuccessCallback(!appendList.length);
                }
                if (stateReset) {
                    setBusinessUnits(appendList);
                } else {
                    setBusinessUnits(businessUnits.concat(appendList));
                }
            },
        });
    };

    useEffect(() => {
        if (businessUnits) {
            if (businessUnits?.length === 1 && businessUnits[0]?.id !== null) {
                onFilter('businessUnitIds', [businessUnits[0]?.id]);
            }
        }
    }, [businessUnits]);

    const [filters, onFilter] = useFilterHandle(
        {
            contacts: undefined,
            currencyId: null,
            isAdvance: 1,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            limit: 1000,
        },
        ({ filters }) => {
            if (filters.currencyId)
                fetchAdvanceReport({
                    filters,
                });
        }
    );

    const handleDetailClick = row => {
        const { contactId } = row;
        toggleModal();
        setSelectedRecord(row);
        fetchTransactions({
            filters: {
                contacts: [contactId],
                transactionCurrencyId: currency.id,
                isAdvance: 1,
                limit: 10000,
                businessUnitIds: filters.businessUnitIds,
            },
            onSuccessCallback: ({ data }) => {
                setfinanceOperations(data);
            },
        });
    };

    const toggleModal = () => {
        setDetailModalIsVisible(prevValue => !prevValue);
    };

    const getAdvanceReport = data => {
        if (data.length > 0) {
            const amountCashOut = data.reduce(
                (total, current) =>
                    math.add(Number(total), Number(current.amountCashOut)),
                0
            );
            const amountCashIn = data.reduce(
                (total, current) =>
                    math.add(Number(total), Number(current.amountCashIn)),
                0
            );
            const balance = data.reduce(
                (total, current) =>
                    math.add(Number(total), Number(current.balance)),
                0
            );
            return [
                ...data,
                {
                    summaryRow: true,
                    amountCashOut,
                    amountCashIn,
                    balance,
                },
            ];
        }
        return data;
    };

    useEffect(() => {
        if (currency) {
            onFilter('currencyId', currency.id);
        }
    }, [currency]);

    const getExcelColumns = currency => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('contactFullName')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`amountCashOut`)] = {
            title: `Məxaric (${currency})`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('amountCashIn')] = {
            title: `Mədaxil (${currency})`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('balance')] = {
            title: `Balans (${currency})`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('lastTransactionAmount')] = {
            title: `Son ödəniş (${currency})`,
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('lastTransactionDate')] = {
            title: 'Son ödəniş tarixi',
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

        const data = exAdvance.map((item, index) => {
            let arr = [];

            columnClone.includes('contactFullName') &&
                (arr[columnClone.indexOf('contactFullName')] = item?.summaryRow
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.contactFullName || '-',
                      });
            columnClone.includes('amountCashOut') &&
                (arr[columnClone.indexOf('amountCashOut')] = item?.summaryRow
                    ? {
                          value: Number(
                              defaultNumberFormat(item?.amountCashOut)
                          ),
                          style: columnFooterStyle,
                      }
                    : {
                          value: Number(
                              defaultNumberFormat(item?.amountCashOut)
                          ),
                      });
            columnClone.includes('amountCashIn') &&
                (arr[columnClone.indexOf('amountCashIn')] = item?.summaryRow
                    ? {
                          value: Number(
                              defaultNumberFormat(item?.amountCashIn)
                          ),
                          style: columnFooterStyle,
                      }
                    : {
                          value: Number(
                              defaultNumberFormat(item?.amountCashIn)
                          ),
                      });
            columnClone.includes('balance') &&
                (arr[columnClone.indexOf('balance')] = item?.summaryRow
                    ? {
                          value: Number(defaultNumberFormat(item?.balance)),
                          style: columnFooterStyle,
                      }
                    : {
                          value: Number(defaultNumberFormat(item?.balance)),
                      });
            columnClone.includes('lastTransactionAmount') &&
                (arr[
                    columnClone.indexOf('lastTransactionAmount')
                ] = item?.summaryRow
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value:
                              Number(
                                  defaultNumberFormat(
                                      item?.lastTransactionAmount
                                  )
                              ) || '-',
                      });
            columnClone.includes('lastTransactionDate') &&
                (arr[
                    columnClone.indexOf('lastTransactionDate')
                ] = item?.summaryRow
                    ? { value: '', style: columnFooterStyle }
                    : {
                          value: item.lastTransactionDate || '-',
                      });

            arr.unshift(
                item.summaryRow
                    ? { value: 'Toplam:', style: columnFooterStyle }
                    : { value: index + 1 }
            );
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns(currency?.code);
    }, [visibleColumns, currency]);

    useEffect(() => {
        getExcelData();
    }, [exAdvance]);

    useEffect(() => {
        return () => {
            clearReports();
        };
    }, []);
    return (
        <>
            <Sidebar
                contacts={contacts}
                advanceReport={advanceReport}
                filters={filters}
                onFilter={onFilter}
                businessUnits={businessUnits}
                profile={profile}
                ajaxBusinessUnitSelectRequest={ajaxBusinessUnitSelectRequest}
                ajaxSelectRequest={ajaxSelectRequest}
                businessUnitLength={businessUnitLength}
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
                <TableConfiguration
                    saveSetting={handleSaveSettingModal}
                    visible={Tvisible}
                    AllStandartColumns={ADVANCE_REPORTS_TABLE_SETTING_DATA}
                    setVisible={toggleVisible}
                    columnSource={tableSettingData}
                />
                <ReportTabs>
                    <Can I={accessTypes.manage} a={permissions.advance_report}>
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
                                    fetchAllAdvanceReport({
                                        filters: {
                                            ...filters,
                                            limit: 5000,
                                            page: undefined,
                                        },
                                        onSuccessCallback: data => {
                                            setExAdvance(
                                                getAdvanceReport(data.data)
                                            );
                                        },
                                    })
                                }
                                data={excelData}
                                columns={excelColumns}
                                excelTitle={`Maliyyə-Hesabatlar-Avans`}
                                excelName="Maliyyə-Hesabatlar-Avans"
                                filename="Maliyyə-Hesabatlar-Avans"
                                count={getAdvanceReport(advanceReport)?.length}
                            />
                        </div>
                    </Can>
                </ReportTabs>
                <ProModal
                    maskClosable
                    width={1200}
                    centered
                    padding
                    isVisible={detailModalIsVisible}
                    handleModal={toggleModal}
                >
                    <TransactionsModal
                        header="Maliyyə əməliyyatları"
                        financeOperations={financeOperations}
                        label={selectedRecord?.contactFullName}
                    />
                </ProModal>
                <CurrenciesOption
                    currency={currency}
                    type="advance"
                    setCurrency={setCurrency}
                />
                <Table
                    visibleColumns={visibleColumns}
                    currencyCode={currency?.code}
                    getAdvanceReport={getAdvanceReport}
                    handleDetailClick={handleDetailClick}
                />
            </section>
        </>
    );
};

const mapStateToProps = state => ({
    advanceReport: state.financeReportsReducer.advanceReport,
    profile: state.profileReducer.profile,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export const AdvanceReport = connect(
    mapStateToProps,
    {
        fetchAdvanceReport,
        fetchAllAdvanceReport,
        fetchTransactions,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchFilteredContacts,
        clearReports,
        fetchBusinessUnitList,
    }
)(Advance);
