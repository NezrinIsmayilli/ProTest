/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useReducer, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    FaCaretUp,
    FaCaretDown,
    RiInboxArchiveLine,
    RiInboxUnarchiveLine,
    IoMdCheckmarkCircleOutline,
    MdArrowDropDown,
    FaPencilAlt,
    FaWindowClose,
    FaSave,
    FaMinusCircle,
    FaPlusCircle,
} from 'react-icons/all';
// config
import { permissions, accessTypes } from 'config/permissions';
import { abilities } from 'config/ability';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';

// utils
import { history } from 'utils/history';
import {
    reportHistoryOperationStatus,
    toastHelper,
    exportFileDownloadHandle,
    createReducer,
    today,
    dateFormat,
    formatToLocaleString,
    defaultNumberFormat,
} from 'utils';

// actions
import {
    fetchHRMReports,
    fetchHRMReportsHistory,
    saveSalary,
    changeArchive,
} from 'store/actions/hrm/report';
import { fetchAllFilteredReports } from 'store/actions/export-to-excel/hrmModule';

// components
import {
    Row,
    Col,
    Button,
    InputNumber,
    Checkbox,
    Menu,
    Dropdown,
    Tooltip,
    Icon,
} from 'antd';
import {
    Table,
    ExcelButton,
    Can,
    InfoCard,
    ProStage,
    ProWarningModal,
    TableConfiguration,
} from 'components/Lib';

import PayForm from './Operations/PayForm';
import SalaryAdditionForm from './Operations/SalaryAdditionForm';
import SalaryDeductionForm from './Operations/SalaryDeductionForm';
import SalaryHistory from './Operations/SalaryHistory';
import { addFooter } from 'store/reducers/hrm/report';

import styles from './styles.module.scss';
import { HRM_REPORTS_SALARY_TABLE_SETTING_DATA } from 'utils/table-config/hrmModule';

const returnUrl = '/hrm/report/salary';

const initialState = {
    values: {
        payFormOpen: false,
        salaryAdditionFormOpen: false,
        salaryDeductionFormOpen: false,
        salaryHistoryOpen: false,
        infoData: null,
        openCellEdit: false,
        rowId: null,
        selectedMonth: Number(moment(today, dateFormat).format('M')),
        selectedYear: moment(today, dateFormat).format('YYYY'),
        salaryAmount: null,
    },
    errors: {},
};
const reducer = createReducer(initialState, {
    onChangeFormHandle: (state, action) => ({
        ...state,
        values: {
            ...state.values,
            [action.name.firstProperty]: action.value.firstProperty,
            [action.name.secondProperty]: action.value.secondProperty,
        },
        errors: {
            [action.name]: '',
        },
    }),

    onChangeFormMultipleInputHandle: (state, action) => ({
        ...state,
        values: {
            ...state.values,
            [action.name.firstProperty]: action.value.firstProperty,
            [action.name.secondProperty]: action.value.secondProperty,
            [action.name.thirdProperty]: action.value.thirdProperty,
        },
        errors: {
            [action.name]: '',
        },
    }),

    onChangeHandle: (state, action) => ({
        ...state,
        values: {
            ...state.values,
            [action.name]: action.value,
        },
        errors: {
            [action.name]: '',
        },
    }),

    setValues: (state, action) => ({
        ...initialState,
        values: {
            ...initialState.values,
            ...action.values,
        },
    }),

    validate: (state, action) => ({
        ...state,
        errors: action.errors,
    }),

    reset: () => initialState,
});

function SalaryTable(props) {
    const {
        isLoading,
        isLoadingExport,
        fetchHRMReports,
        reportsFilteredData,
        exportFileDownloadHandle,
        fetchAllFilteredReports,
        fetchHRMReportsHistory,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        saveSalary,
        mainCurrency,
        selectedYearandMonth,
        changeArchive,
        filters,
        onFilter,
    } = props;
    const canManage = abilities.can(accessTypes.manage, permissions.payroll);

    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        values: {
            payFormOpen,
            salaryAdditionFormOpen,
            salaryDeductionFormOpen,
            salaryHistoryOpen,
            infoData,
            openCellEdit,
            rowId,
            salaryAmount,
        },
    } = state;
    const [nonDeletedHistory, setNonDeletedHistory] = useState({});
    const [deletedHistory, setDeletedHistory] = useState({});
    const [allArchive, setAllArchive] = useState(true);
    const [statusChangeId, setStatusChangeId] = useState(undefined);
    const [isArchive, setIsArchive] = useState(false);
    const [allActive, setAllActive] = useState(true);
    const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);

    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        HRM_REPORTS_SALARY_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exSalary, setExSalary] = useState([]);
    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });
    const visualStatuses = {
        0: {
            id: 0,
            name: 'delivery',
            label: 'Aktiv',
            color: '#2980b9',
        },
        1: { id: 1, name: 'new', label: 'Arxiv', color: '#3b4557' },
    };
    const statuses = [
        { id: 0, name: 'delivery', label: 'Aktiv', color: '#2980b9' },
        { id: 1, name: 'new', label: 'Arxiv', color: '#3b4557' },
    ];
    const handleStageChange = (newStageId, row) => {
        const { id, isArchived } = row;
        setStatusChangeId(id);
        setIsArchive(isArchived);
        setIsOpenWarningModal(true);
    };
    const handleArchive = () => {
        if (statusChangeId) {
            const postData = {
                employees_ul: [statusChangeId],
                year: selectedYearandMonth?.selectedYear,
                month: selectedYearandMonth?.selectedMonth,
            };
            changeArchive(postData, onSuccessCallBackArchive());
        } else {
            const postData = {
                employees_ul: checkList?.checkedListAll,
                year: selectedYearandMonth?.selectedYear,
                month: selectedYearandMonth?.selectedMonth,
            };
            changeArchive(postData, onSuccessCallBackArchive());
        }
    };
    function onSuccessCallBackArchive(message) {
        return () => {
            dispatch({ type: 'reset' });
            fetchHRMReports(
                selectedYearandMonth?.selectedYear,
                selectedYearandMonth?.selectedMonth
            );
            handleWarningModalClose();
            setCheckList({ checkedListAll: [], ItemsChecked: false });
            setAllActive(true);
            setAllArchive(true);
            return toastHelper(history, returnUrl, message);
        };
    }
    const onClick = ({ key }) => {
        if (key === '0') {
            const collection = [];
            for (const item of reportsFilteredData) {
                if (item.isArchived) collection.push(item.id);
            }
            setCheckList({
                checkedListAll: collection,
                ItemsChecked: false,
            });
        }
        if (key === '1') {
            const collection = [];
            for (const item of reportsFilteredData) {
                if (item.isArchived === false) collection.push(item.id);
            }
            setCheckList({
                checkedListAll: collection,
                ItemsChecked: false,
            });
        }
    };
    const menu = (
        <Menu onClick={onClick}>
            <Menu.Item key="0">Arxiv olunmuşlar</Menu.Item>
            <Menu.Item key="1">Aktivlər</Menu.Item>
        </Menu>
    );
    useEffect(() => {
        fetchHRMReportsHistory({
            year: selectedYearandMonth?.selectedYear,
            month: selectedYearandMonth?.selectedMonth,
            deleted: reportHistoryOperationStatus.Non_Deleted,
            onSuccessCallback: ({ data }) => {
                setNonDeletedHistory(data);
            },
        });
        fetchHRMReportsHistory({
            label: 'reportsHistoryDeleted',
            year: selectedYearandMonth?.selectedYear,
            month: selectedYearandMonth?.selectedMonth,
            deleted: reportHistoryOperationStatus.Deleted,
            onSuccessCallback: ({ data }) => {
                setDeletedHistory(data);
            },
        });
        fetchHRMReports(
            selectedYearandMonth?.selectedYear,
            selectedYearandMonth?.selectedMonth
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYearandMonth]);

    function saveSalaryAmountData(id, existingSalary) {
        saveSalary(
            {
                employee: id,
                amount:
                    salaryAmount || salaryAmount === 0
                        ? salaryAmount
                        : existingSalary,
            },
            onSuccessCallBack('Maaş əlavə olundu.')
        );
    }

    function onSuccessCallBack(message) {
        return () => {
            dispatch({ type: 'reset' });
            fetchHRMReports(
                selectedYearandMonth?.selectedYear,
                selectedYearandMonth?.selectedMonth
            );
            return toastHelper(history, returnUrl, message);
        };
    }
    const handleSortTable = (orderBy, order) => {
        onFilter('order', order);
        onFilter('orderBy', orderBy);
    };
    function showRequiredPaymentForm(text, record) {
        if (openCellEdit && record.id === rowId) {
            return (
                <div className={styles.center}>
                    <InputNumber
                        style={{ width: '80%' }}
                        maxLength={10}
                        min={0}
                        name="salary"
                        className={styles.inputNumberColumn}
                        defaultValue={Number(text).toFixed(2)}
                        onChange={value => {
                            dispatch({
                                type: 'onChangeHandle',
                                name: 'salaryAmount',
                                value,
                            });
                        }}
                        onKeyDown={e => {
                            if (e.keyCode === 13) {
                                saveSalaryAmountData(record.id, record.salary);
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            saveSalaryAmountData(record.id, record.salary);
                        }}
                        className={styles.inputBtn}
                    >
                        <FaSave size={18} />
                    </Button>
                    <Button
                        className={`${styles.inputBtn} ${styles.delete}`}
                        onClick={() => {
                            dispatch({
                                type: 'onChangeHandle',
                                name: 'openCellEdit',
                                value: false,
                            });
                        }}
                    >
                        <FaWindowClose size={18} />
                    </Button>
                </div>
            );
        }

        return record.isArchived ||
            (selectedYearandMonth?.selectedMonth !=
                moment(today, dateFormat).format('M') ||
                selectedYearandMonth?.selectedYear !=
                    moment(today, dateFormat).format('YYYY')) ? (
            formatToLocaleString(text)
        ) : (
            <Button
                disabled={!canManage || record.isArchived}
                className={styles.salaryBtn}
                onClick={() => {
                    dispatch({
                        type: 'onChangeFormMultipleInputHandle',
                        name: {
                            firstProperty: 'openCellEdit',
                            secondProperty: 'rowId',
                            thirdProperty: 'salaryAmount',
                        },
                        value: {
                            firstProperty: true,
                            secondProperty: record.id,
                            thirdProperty: null,
                        },
                    });
                }}
            >
                {formatToLocaleString(text)} <FaPencilAlt />
            </Button>
        );
    }

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('name')] = {
            title: 'Əməkdaş',
            dataIndex: 'name',
            align: 'left',
            width: 400,
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>Ümumi məbləğ ({mainCurrency?.code})</b>
                        ) : (
                            <InfoCard
                                name={record.name}
                                surname={record.surname}
                                patronymic={record.patronymic}
                                occupationName={record.occupationName}
                                attachmentUrl={record.attachmentUrl}
                                width="32px"
                                height="32px"
                            />
                        ),
                };
            },
        };
        columns[column.indexOf('currencyCode')] = {
            title: 'Valyuta',
            dataIndex: 'currencyCode',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children: text || '',
                };
            },
        };
        columns[column.indexOf('salary')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Aylıq maaş</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'salary' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('salary', 'asc')}
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'salary' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() => handleSortTable('salary', 'desc')}
                        />
                    </div>
                </div>
            ),
            dataIndex: 'salary',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalaryInMainCurrency}
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            <div className={styles.center}>
                                {showRequiredPaymentForm(text, record)}
                            </div>
                        ),
                };
            },
        };
        columns[column.indexOf('salaryAddition')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Maaşa əlavə</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'salaryAddition' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryAddition', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'salaryAddition' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryAddition', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'salaryAddition',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalaryAdditionInMainCurrency}
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            <div className={styles.center}>
                                {record.isArchived ||
                                (selectedYearandMonth?.selectedYear >
                                    Number(
                                        moment(today, dateFormat).format('YYYY')
                                    ) ||
                                    (selectedYearandMonth?.selectedYear ===
                                        Number(
                                            moment(today, dateFormat).format(
                                                'YYYY'
                                            )
                                        ) &&
                                        selectedYearandMonth?.selectedMonth >
                                            Number(
                                                moment(
                                                    today,
                                                    dateFormat
                                                ).format('M')
                                            ))) ? (
                                    formatToLocaleString(text)
                                ) : (
                                    <Button
                                        className={styles.addSalaryButton}
                                        disabled={!canManage}
                                        onClick={() => {
                                            dispatch({
                                                type: 'onChangeFormHandle',
                                                name: {
                                                    firstProperty: 'infoData',
                                                    secondProperty:
                                                        'salaryAdditionFormOpen',
                                                },
                                                value: {
                                                    firstProperty: record,
                                                    secondProperty: true,
                                                },
                                            });
                                        }}
                                    >
                                        {formatToLocaleString(text)}
                                        <FaPlusCircle />
                                    </Button>
                                )}
                            </div>
                        ),
                };
            },
        };
        columns[column.indexOf('salaryDeduction')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Tutulmalar</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'salaryDeduction' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryDeduction', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'salaryDeduction' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryDeduction', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'salaryDeduction',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalaryDeductionInMainCurrency} 
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            <div className={styles.center}>
                                {record.isArchived ||
                                (selectedYearandMonth?.selectedYear >
                                    Number(
                                        moment(today, dateFormat).format('YYYY')
                                    ) ||
                                    (selectedYearandMonth?.selectedYear ===
                                        Number(
                                            moment(today, dateFormat).format(
                                                'YYYY'
                                            )
                                        ) &&
                                        selectedYearandMonth?.selectedMonth >
                                            Number(
                                                moment(
                                                    today,
                                                    dateFormat
                                                ).format('M')
                                            ))) ? (
                                    formatToLocaleString(text)
                                ) : (
                                    <Button
                                        disabled={!canManage}
                                        className={styles.decreaseBtn}
                                        onClick={() => {
                                            dispatch({
                                                type: 'onChangeFormHandle',
                                                name: {
                                                    firstProperty: 'infoData',
                                                    secondProperty:
                                                        'salaryDeductionFormOpen',
                                                },
                                                value: {
                                                    firstProperty: record,
                                                    secondProperty: true,
                                                },
                                            });
                                        }}
                                    >
                                        {formatToLocaleString(text)}
                                        <FaMinusCircle />
                                    </Button>
                                )}
                            </div>
                        ),
                };
            },
        };
        columns[column.indexOf('latenessPenalty')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Gecikmələr</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'latenessPenalty' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('latenessPenalty', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'latenessPenalty' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('latenessPenalty', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'latenessPenalty',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalLatenessPenaltyInMainCurrency} 
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('salesBonusAmount')] = {
            title: 'Satışdan bonus',
            dataIndex: 'salesBonusAmount',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalesBonusAmount} 
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('totalSalary')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Bu ay cəmi</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'totalSalary' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('totalSalary', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'totalSalary' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('totalSalary', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'totalSalary',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalaryInMainCurrency} 
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('previousBalance')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Ötən dövrlərdən qalıq</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'previousBalance' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('previousBalance', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'previousBalance' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('previousBalance', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'previousBalance',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalPreviousBalanceInMainCurrency}
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('salaryPayment')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Bu ay ödənilmiş</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'salaryPayment' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryPayment', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'salaryPayment' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('salaryPayment', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'salaryPayment',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalSalaryPaymentInMainCurrency}
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('currentBalance')] = {
            title: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Cari qalıq</span>
                    <div className={styles.buttonSortIcon}>
                        <FaCaretUp
                            color={
                                filters.orderBy === 'currentBalance' &&
                                filters.order === 'asc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('currentBalance', 'asc')
                            }
                        />
                        <FaCaretDown
                            color={
                                filters.orderBy === 'currentBalance' &&
                                filters.order === 'desc'
                                    ? '#fff'
                                    : '#ccc'
                            }
                            onClick={() =>
                                handleSortTable('currentBalance', 'desc')
                            }
                        />
                    </div>
                </div>
            ),
            dataIndex: 'currentBalance',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? (
                            <b>
                                {`${record.totalCurrentBalanceInMainCurrency}
              ${mainCurrency?.code}`}
                            </b>
                        ) : (
                            formatToLocaleString(text)
                        ),
                };
            },
        };
        columns[column.indexOf('isArchived')] = {
            title: 'Status',
            dataIndex: 'isArchived',
            width: 190,
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? null : (
                            <ProStage
                                disabled={!canManage}
                                visualStage={
                                    visualStatuses[text === true ? 1 : 0]
                                }
                                statuses={statuses}
                                onChange={newStage =>
                                    handleStageChange(newStage, record)
                                }
                            />
                        ),
                };
            },
        };
        columns.push({
            title: 'Ödə',
            key: 'address',
            align: 'center',
            render(text, record) {
                return {
                    props: {
                        style: {
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? null : (
                            <Button
                                disabled={
                                    !canManage ||
                                    (selectedYearandMonth?.selectedYear >
                                        Number(
                                            moment(today, dateFormat).format(
                                                'YYYY'
                                            )
                                        ) ||
                                        (selectedYearandMonth?.selectedYear ===
                                            Number(
                                                moment(
                                                    today,
                                                    dateFormat
                                                ).format('YYYY')
                                            ) &&
                                            selectedYearandMonth?.selectedMonth >
                                                Number(
                                                    moment(
                                                        today,
                                                        dateFormat
                                                    ).format('M')
                                                )))
                                }
                                className={styles.btnTransparent}
                                onClick={() => {
                                    dispatch({
                                        type: 'onChangeFormHandle',
                                        name: {
                                            firstProperty: 'infoData',
                                            secondProperty: 'payFormOpen',
                                        },
                                        value: {
                                            firstProperty: record,
                                            secondProperty: true,
                                        },
                                    });
                                }}
                            >
                                <IoMdCheckmarkCircleOutline />
                            </Button>
                        ),
                };
            },
        });

        columns.unshift({
            title: '№',
            width: 60,
            dataIndex: 'id',
            render(text, record, index) {
                return {
                    props: {
                        style: {
                            color: record.isArchived ? '#7D7D7D' : '',
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children: record.id === 'isFooter' ? null : index + 1,
                };
            },
        });

        columns.unshift({
            title: '',
            width: 46,
            dataIndex: 'id',
            render(text, record) {
                return {
                    props: {
                        style: {
                            background: record.isArchived
                                ? 'rgb(240, 240, 240)'
                                : '',
                        },
                    },
                    children:
                        record.id === 'isFooter' ? null : (
                            <Checkbox
                                disabled={!canManage}
                                checked={checkList.checkedListAll.includes(
                                    text
                                )}
                                onChange={event =>
                                    handleCheckboxes(record, event)
                                }
                            />
                        ),
                };
            },
        });

        return columns;
    };

    function onHistoryClicked() {
        dispatch({
            type: 'onChangeHandle',
            name: 'salaryHistoryOpen',
            value: true,
        });
        fetchHRMReportsHistory({
            year: selectedYearandMonth?.selectedYear,
            month: selectedYearandMonth?.selectedMonth,
            deleted: reportHistoryOperationStatus.Non_Deleted,
            onSuccessCallback: ({ data }) => {
                setNonDeletedHistory(data);
            },
        });
    }
    useEffect(() => {
        const data = [];
        reportsFilteredData.map(reportData => {
            if (checkList.checkedListAll?.includes(reportData.id)) {
                data.push(reportData);
            }
            return data;
        });
        if (data.length > 0) {
            setAllArchive(data.some(dat => dat.isArchived === true));
            setAllActive(data.some(dat => dat.isArchived === false));
        } else {
            setAllArchive(true);
            setAllActive(true);
        }
    }, [checkList]);
    const handleCheckbox = checked => {
        let collection = [];

        if (checked) {
            collection = getAllItems();
        }
        setCheckList({
            checkedListAll: collection,
            ItemsChecked: checked,
        });
    };
    const getAllItems = () => {
        const collection = [];

        for (const item of reportsFilteredData) {
            if (item.id !== 'isFooter') collection.push(item.id);
        }

        return collection;
    };
    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = reportsFilteredData;
            setCheckList(prevState => ({
                checkedListAll: [...prevState.checkedListAll, row.id * 1],
                ItemsChecked:
                    collection.length === prevState.checkedListAll.length + 2,
            }));
        } else {
            setCheckList(prevState => ({
                checkedListAll: prevState.checkedListAll.filter(
                    item => item !== row.id
                ),
                ItemsChecked: false,
            }));
        }
    };
    const handleWarningModalClose = () => {
        setIsOpenWarningModal(false);
        setStatusChangeId(undefined);
    };

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
            moduleName: 'HRM-Reports-Salary',
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
            const column = HRM_REPORTS_SALARY_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(HRM_REPORTS_SALARY_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);
    useEffect(() => {
        fetchTableConfiguration({ module: 'HRM-Reports-Salary' });
    }, []);

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('name')] = {
            title: 'Əməkdaş',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`currencyCode`)] = {
            title: `Valyuta`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('salary')] = {
            title: `Aylıq maaş`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('salaryAddition')] = {
            title: `Maaşa əlavə`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('salaryDeduction')] = {
            title: `Tutulmalar`,
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('latenessPenalty')] = {
            title: 'Gecikmələr',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('salesBonusAmount')] = {
            title: 'Satışdan bonus',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('totalSalary')] = {
            title: 'Bu ay cəmi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('previousBalance')] = {
            title: 'Ötən dövrlərdən qalıq',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('salaryPayment')] = {
            title: 'Bu ay ödənilmiş',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('currentBalance')] = {
            title: 'Cari qalıq',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('isArchived')] = {
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

        const data = exSalary.map((item, index) => {
            let arr = [];
            columnClone.includes('name') &&
                (arr[columnClone.indexOf('name')] =
                    item.id == 'isFooter'
                        ? {
                              value: `Ümumi məbləğ (${mainCurrency?.code})`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  `${item.name} ${item.surname} ${
                                      item.patronymic
                                  } ${item.occupationName? `(${item.occupationName})`: ''} ` || '-',
                          });
            columnClone.includes('currencyCode') &&
                (arr[columnClone.indexOf('currencyCode')] =
                    item?.id == 'isFooter'
                        ? { value: '', style: columnFooterStyle }
                        : {
                              value: item.currencyCode || '-',
                          });
            columnClone.includes('salary') &&
                (arr[columnClone.indexOf('salary')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalaryInMainCurrency
                              )}  ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(defaultNumberFormat(item?.salary)) ||
                                  0,
                          });
            columnClone.includes('salaryAddition') &&
                (arr[columnClone.indexOf('salaryAddition')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalaryAdditionInMainCurrency
                              )}  ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.salaryAddition)
                                  ) || 0,
                          });
            columnClone.includes('salaryDeduction') &&
                (arr[columnClone.indexOf('salaryDeduction')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalaryDeductionInMainCurrency
                              )}  ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.salaryDeduction)
                                  ) || 0,
                          });
            columnClone.includes('latenessPenalty') &&
                (arr[columnClone.indexOf('latenessPenalty')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalLatenessPenaltyInMainCurrency
                              )}  ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.latenessPenalty)
                                  ) || 0,
                          });
            columnClone.includes('salesBonusAmount') &&
                (arr[columnClone.indexOf('salesBonusAmount')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalesBonusAmount
                              )} ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(
                                          item?.salesBonusAmount
                                      )
                                  ) || 0,
                          });
            columnClone.includes('totalSalary') &&
                (arr[columnClone.indexOf('totalSalary')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalaryInMainCurrency
                              )} ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.totalSalary)
                                  ) || 0,
                          });
            columnClone.includes('previousBalance') &&
                (arr[columnClone.indexOf('previousBalance')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalPreviousBalanceInMainCurrency
                              )} ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.previousBalance)
                                  ) || 0,
                          });
            columnClone.includes('salaryPayment') &&
                (arr[columnClone.indexOf('salaryPayment')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalSalaryPaymentInMainCurrency
                              )} ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.salaryPayment)
                                  ) || 0,
                          });
            columnClone.includes('currentBalance') &&
                (arr[columnClone.indexOf('currentBalance')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ` ${defaultNumberFormat(
                                  item?.totalCurrentBalanceInMainCurrency
                              )} ${mainCurrency?.code}`,
                              style: columnFooterStyle,
                          }
                        : {
                              value:
                                  Number(
                                      defaultNumberFormat(item?.currentBalance)
                                  ) || 0,
                          });
            columnClone.includes('isArchived') &&
                (arr[columnClone.indexOf('isArchived')] =
                    item?.id == 'isFooter'
                        ? {
                              value: ``,
                              style: columnFooterStyle,
                          }
                        : {
                              value: item.isArchived ? 'Arxiv' : 'Aktiv',
                          });

            arr.unshift(
                item?.id == 'isFooter'
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
    }, [exSalary]);

    return (
        <>
            <ProWarningModal
                open={isOpenWarningModal}
                titleIcon={<Icon type="warning" />}
                bodyTitle={
                    statusChangeId
                        ? isArchive
                            ? 'Seçilmiş əməkdaşın statusunu cari ay üçün aktivləşdirmək istədiyinizdən əminsinizmi?'
                            : 'Seçilmiş əməkdaşı cari ay üçün arxivləşdirmək istədiyinizdən əminsinizmi?'
                        : checkList.checkedListAll?.length > 1
                        ? !allActive
                            ? 'Seçilmiş əməkdaşların statuslarını cari ay üçün aktivləşdirmək istədiyinizdən əminsinizmi?'
                            : 'Seçilmiş əməkdaşları cari ay üçün arxivləşdirmək istədiyinizdən əminsinizmi?'
                        : !allActive
                        ? 'Seçilmiş əməkdaşın statusunu cari ay üçün aktivləşdirmək istədiyinizdən əminsinizmi?'
                        : 'Seçilmiş əməkdaşı cari ay üçün arxivləşdirmək istədiyinizdən əminsinizmi?'
                }
                bodyContent={
                    statusChangeId
                        ? isArchive
                            ? 'Aktivləşdirdiyiniz halda, cari ay üçün əməkdaşın məlumatlarına dəyişiklik etmək mümkün olacaq'
                            : 'Arxivləşdirdiyiniz halda, cari ay üçün əməkdaşın məlumatlarına heç bir dəyişiklik etmək mümkün olmayacaq'
                        : checkList.checkedListAll?.length > 1
                        ? !allActive
                            ? 'Aktivləşdirdiyiniz halda, cari ay üçün əməkdaşların məlumatlarına dəyişiklik etmək mümkün olacaq'
                            : 'Arxivləşdirdiyiniz halda, cari ay üçün əməkdaşların məlumatlarına heç bir dəyişiklik etmək mümkün olmayacaq'
                        : !allActive
                        ? 'Aktivləşdirdiyiniz halda, cari ay üçün əməkdaşın məlumatlarına dəyişiklik etmək mümkün olacaq'
                        : 'Arxivləşdirdiyiniz halda, cari ay üçün əməkdaşın məlumatlarına heç bir dəyişiklik etmək mümkün olmayacaq'
                }
                okFunc={() => handleArchive()}
                onCancel={handleWarningModalClose}
            />
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={HRM_REPORTS_SALARY_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <Row gutter={32}>
                <Col span={24} className="paddingBottom70">
                    <div className={styles.flexBetween}>
                        <div className={styles.flexDisplay}>
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    margin: '0 12px',
                                    alignItems: 'center',
                                }}
                            >
                                <Checkbox
                                    onChange={event =>
                                        handleCheckbox(event.target.checked)
                                    }
                                    checked={checkList.ItemsChecked}
                                    className={styles.checkBoxArchive}
                                    disabled={!canManage}
                                />
                                <Dropdown
                                    disabled={!canManage}
                                    overlay={menu}
                                    trigger={['click']}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginRight: '5px',
                                        }}
                                    >
                                        <Tooltip
                                            placement="bottom"
                                            title="Seçin"
                                        >
                                            <MdArrowDropDown size="24px" />
                                        </Tooltip>
                                    </div>
                                </Dropdown>
                                <Button
                                    onClick={() => setIsOpenWarningModal(true)}
                                    style={{
                                        padding: '0',
                                        border: 'none',
                                        background: 'none',
                                    }}
                                    disabled={!canManage || allArchive}
                                >
                                    <Tooltip
                                        placement="bottom"
                                        title="Arxivləşdir"
                                    >
                                        <RiInboxArchiveLine
                                            size="30px"
                                            style={{
                                                marginRight: '5px',
                                            }}
                                        />
                                    </Tooltip>
                                </Button>
                                <Button
                                    onClick={() => setIsOpenWarningModal(true)}
                                    style={{
                                        padding: '0',
                                        border: 'none',
                                        background: 'none',
                                    }}
                                    disabled={!canManage || allActive}
                                >
                                    <Tooltip
                                        placement="bottom"
                                        title="Arxivdən çıxart"
                                    >
                                        <RiInboxUnarchiveLine size="30px" />
                                    </Tooltip>
                                </Button>
                            </div>
                        </div>
                        <div className={styles.flexDisplay}>
                            <Can I={accessTypes.manage} a={permissions.payroll}>
                                <SettingButton onClick={toggleVisible} />

                                <ExportToExcel
                                    getExportData={() =>
                                        fetchAllFilteredReports(
                                            selectedYearandMonth.selectedYear,
                                            selectedYearandMonth.selectedMonth,
                                            {
                                                filters: {
                                                    ...filters,
                                                    limit: 5000,
                                                    page: undefined,
                                                },
                                                onSuccessCallback: data => {
                                                    setExSalary(
                                                        addFooter(data.data)
                                                    );
                                                },
                                            }
                                        )
                                    }
                                    data={excelData}
                                    columns={excelColumns}
                                    excelTitle={`Əməkhaqqı cədvəli-${selectedYearandMonth.selectedMonth}-${selectedYearandMonth.selectedYear}`}
                                    excelName={`Əməkhaqqı cədvəli-${selectedYearandMonth.selectedMonth}-${selectedYearandMonth.selectedYear}`}
                                    filename={`Əməkhaqqı cədvəli-${selectedYearandMonth.selectedMonth}-${selectedYearandMonth.selectedYear}`}
                                    count={reportsFilteredData?.length}
                                />
                                <span
                                    style={{
                                        display: 'inline-block',
                                        marginLeft: '15px',
                                    }}
                                >
                                    <ExcelButton
                                        label="Tarixçə"
                                        onClick={onHistoryClicked}
                                        history={true}
                                    />
                                </span>
                            </Can>
                        </div>
                    </div>
                    <div className={styles.mainTable}>
                        <Table
                            columns={getColumns({
                                column: visibleColumns,
                            })}
                            loading={isLoading}
                            dataSource={reportsFilteredData}
                            bordered
                            rowKey={record => record.id}
                            size="middle"
                            scroll={{ x: 'max-content' }}
                            // footerClassName="customFooter"
                            // footer={<TableFooter mebleg={totalSalary} />}
                        />
                    </div>

                    {infoData && (
                        <PayForm
                            selectedYear={selectedYearandMonth?.selectedYear}
                            selectedMonth={selectedYearandMonth?.selectedMonth}
                            infoData={infoData}
                            open={payFormOpen}
                            handleCancel={() => {
                                dispatch({
                                    type: 'onChangeHandle',
                                    name: 'payFormOpen',
                                    value: false,
                                });
                            }}
                        />
                    )}

                    {infoData && (
                        <SalaryAdditionForm
                            selectedYear={selectedYearandMonth?.selectedYear}
                            selectedMonth={selectedYearandMonth?.selectedMonth}
                            infoData={infoData}
                            open={salaryAdditionFormOpen}
                            handleCancel={() => {
                                dispatch({
                                    type: 'onChangeHandle',
                                    name: 'salaryAdditionFormOpen',
                                    value: false,
                                });
                            }}
                        />
                    )}

                    {infoData && (
                        <SalaryDeductionForm
                            selectedYear={selectedYearandMonth?.selectedYear}
                            selectedMonth={selectedYearandMonth?.selectedMonth}
                            infoData={infoData}
                            open={salaryDeductionFormOpen}
                            handleCancel={() => {
                                dispatch({
                                    type: 'onChangeHandle',
                                    name: 'salaryDeductionFormOpen',
                                    value: false,
                                });
                            }}
                        />
                    )}

                    {salaryHistoryOpen && (
                        <SalaryHistory
                            selectedYear={selectedYearandMonth?.selectedYear}
                            selectedMonth={selectedYearandMonth?.selectedMonth}
                            open={salaryHistoryOpen}
                            nonDeletedHistory={nonDeletedHistory}
                            setDeletedHistory={setDeletedHistory}
                            setNonDeletedHistory={setNonDeletedHistory}
                            deletedHistory={deletedHistory}
                            handleCancel={() => {
                                dispatch({
                                    type: 'onChangeHandle',
                                    name: 'salaryHistoryOpen',
                                    value: false,
                                });
                            }}
                        />
                    )}
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => ({
    reportsFilteredData: state.reportReducer.reportsFilteredData,
    isLoading: !!state.loadings.reports,
    isLoadingExport: !!state.loadings.exportFileDownloadHandle,
    isLoadingHistory: !!state.loadings.reportsHistory,
    mainCurrency: state.kassaReducer.mainCurrency,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchHRMReports,
        fetchAllFilteredReports,
        exportFileDownloadHandle,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchHRMReportsHistory,
        saveSalary,
        changeArchive,
    }
)(SalaryTable);
