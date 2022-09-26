import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Checkbox, Col, Row, Tooltip } from 'antd';
import { FaTrash } from 'react-icons/fa';
import {
    Can,
    Table as ProTable,
    ProButton,
    TableFooter,
    ProModal,
} from 'components/Lib';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import math from 'exact-math';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import axios from 'axios';
import { FaPencilAlt } from 'react-icons/all';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import {
    fetchCashboxBalanceReport,
    deleteCashboxBalance,
} from 'store/actions/finance/reports';
import styles from './styles.module.scss';
import AddInitialRemainsCashbox from './addInitialRemainsCashbox/index';

function InitialRemainsCashbox(props) {
    const {
        deleteCashboxBalance,
        fetchCurrencies,
        businessUnits,
        cashboxBalanceReport,
        cashboxBalanceReportLoading,
        fetchCashboxBalanceReport,
        permissionsByKeyValue,
    } = props;

    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });
    const { transaction_initial_balance } = permissionsByKeyValue;
    const isEditDisabled = transaction_initial_balance.permission !== 2;

    const [columnsMain, setColumnsMain] = useState([]);
    const [usedCurrency, setUsedCurrency] = useState([]);
    const [cashBoxCurrencies, setCashBoxCurrencies] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [cashBox, setCashBox] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [load, setLoad] = useState(false);

    const [filters, onFilter] = useFilterHandle(
        {
            transactionTypes: [14],
            cashboxName: undefined,
            dateFrom: undefined,
            dateTime: undefined,
            cashboxTypes: [],
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
        },
        ({ filters }) => {
            fetchCashboxBalanceReport({
                filters,
                forInitial: true,
            });
        }
    );
    const toggleCashboxModal = () => {
        setIsVisible(prevValue => !prevValue);
        setSelectedItem(undefined);
    };
    const openEditModal = row => {
        setIsVisible(true);
        setSelectedItem(row);
    };

    const handleDeleteClick = (row, array) => {
        swal({
            title: 'Diqqət!',
            text: 'Silmək istədiyinizə əminsiniz?',
            buttons: ['Ləğv et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                if (array) {
                    const notRemovedData = [];
                    Promise.all(
                        row.map(async item => {
                            try {
                                const { data } = await axios.delete(
                                    `/transaction/cashbox/${item}`
                                );
                                toast.success('Əməliyyat uğurla tamamlandı.');
                            } catch (error) {
                                notRemovedData.push(item);
                            }
                        })
                    ).then(results => {
                        fetchCashboxBalanceReport({
                            filters,
                            forInitial: true,
                        });
                        setCheckList({
                            checkedListAll: [],
                            ItemsChecked: false,
                        });
                        if (notRemovedData.length > 0) {
                            const arr = cashBox
                                .filter(item =>
                                    notRemovedData.includes(item.id)
                                )
                                .map(item => item.cashboxName);
                            toast.error(
                                `${arr.toString()} adlı hesablara əlavə edilmiş ilkin qalıq, hesabda kifayət qədər məbləğ olmadığı üçün silinə bilməz.`
                            );
                        }
                    });
                } else {
                    deleteCashboxBalance({
                        id: row.id,
                        onSuccess: () => {
                            fetchCashboxBalanceReport({
                                filters,
                                forInitial: true,
                            });
                            toast.success('Əməliyyat uğurla tamamlandı.');
                        },
                        onFailure: ({ error }) => {
                            toast.error(
                                'Əlavə edilmiş ilkin qalıq, hesabda kifayət qədər məbləğ olmadığı üçün silinə bilməz'
                            );
                        },
                    });
                }
            }
        });
    };

    useEffect(() => {
        if (currencies.length === 0) {
            fetchCurrencies({}, ({ data }) => {
                setCurrencies(data);
            });
        }
    }, []);

    useEffect(() => {
        setLoad(true);
        setColumnsMain([]);
        setCashBox([]);
        setCashBoxCurrencies([]);
        setUsedCurrency([]);
        if (cashboxBalanceReport.length > 0 && Object.values(cashboxBalanceReport[0]).length > 0) {
            setCashBox(Object.values(cashboxBalanceReport[0]));
            setCashBoxCurrencies(cashboxBalanceReport[1]);
        }
    }, [cashboxBalanceReport]);

    useEffect(() => {
        if (cashBoxCurrencies.length > 0) {
            const usedCurr = currencies.filter(({ id }) => {
                if (cashBoxCurrencies.includes(id)) {
                    return true;
                }
                return false;
            });
            setUsedCurrency(usedCurr);
        }
    }, [cashBoxCurrencies]);

    useEffect(() => {
        getColumns(getCashboxReport(cashBox));
    }, [usedCurrency, checkList]);

    const getColumns = data => {
        const table = document.getElementsByClassName('ant-table-body')[0];

        const columns = [];

        columns.push({
            title: '№',
            width:
                table.clientWidth > 1000 && usedCurrency.length < 3 ? 80 : 40,
            fixed: 'left',
            render: (value, row, index) => (row.summaryRow ? '' : index + 1),
        });

        columns.push({
            title: 'Qalıq tarixi',
            dataIndex: 'dateOfTransaction',
            width:
                table.clientWidth > 1000 && usedCurrency.length < 3 ? 250 : 150,
            align: 'left',
            fixed: 'left',
            ellipsis: true,
            render: (date, row) => (row.summaryRow ? null : date || ''),
        });

        columns.push({
            title: 'Hesab növü',
            dataIndex: 'cashboxType',
            width:
                table.clientWidth > 1000 && usedCurrency.length < 3 ? 250 : 150,
            align: 'left',
            fixed: 'left',
            render: (value, row) =>
                row.summaryRow ? null : (
                    <Tooltip title={value}>{value}</Tooltip>
                ),
        });

        columns.push({
            title: 'Hesab',
            dataIndex: 'cashboxName',
            width:
                table.clientWidth > 1000 && usedCurrency.length < 3 ? 250 : 150,
            align: 'left',
            fixed: 'left',
            ellipsis: true,
            render: (value, row) =>
                row.summaryRow ? null : (
                    <Tooltip title={value}>{value}</Tooltip>
                ),
        });

        if (data.length > 0  && usedCurrency.length > 0) {
            usedCurrency.map(currency => {
                columns.push({
                    title: currency.code,
                    className: styles.currency,
                    dataIndex: 'balances',
                    align: 'right',
                    render: (value, row) =>
                        row.summaryRow
                            ? `${formatNumberToLocale(
                                  defaultNumberFormat(value[currency.id])
                              )} ${currency.code}`
                            : value[currency.id]
                            ? formatNumberToLocale(
                                  defaultNumberFormat(value[currency.id])
                              )
                            : 0,
                });
            });
            setLoad(false);
        } else {
            columns.push({
                title: '',
                // dataIndex: 'id',
                // width: 90,
                align: 'right',
            });
            setLoad(false);
        }
        if (!isEditDisabled) {
            columns.push({
                title: 'Seç',
                dataIndex: 'id',
                width: 90,
                align: 'right',
                render: (value, row) =>
                    row.summaryRow ? null : (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.transaction_initial_balance}
                            >
                                <Button
                                    style={{
                                        padding: '2px',
                                        marginRight: '10px',
                                    }}
                                    className={styles.editIcon}
                                    type="button"
                                    onClick={() => openEditModal(row)}
                                >
                                    <FaPencilAlt style={{ marginTop: '5px' }} />
                                </Button>
                                <Button
                                    style={{ padding: '2px' }}
                                    className={styles.editIcon}
                                    type="button"
                                    onClick={() => handleDeleteClick(row)}
                                >
                                    <FaTrash style={{ marginTop: '5px' }} />
                                </Button>
                            </Can>
                        </div>
                    ),
            });
            columns.unshift({
                title: '',
                width: 60,
                dataIndex: 'id',
                fixed: 'left',
                render: (val, row, index) =>
                    row.summaryRow ? (
                        <p style={{ whiteSpace: 'nowrap', margin: '0' }}>
                            Toplam
                        </p>
                    ) : (
                        <Can
                            I={accessTypes.manage}
                            a={permissions.transaction_initial_balance}
                        >
                            <Checkbox
                                disabled={row.isDeleted}
                                checked={checkList.checkedListAll.includes(val)}
                                onChange={event => handleCheckboxes(row, event)}
                            />
                        </Can>
                    ),
            });
        }

        setColumnsMain(columns);
    };

    const getCashboxReport = data => {
        const balances = {};
        if (data.length > 0) {
            currencies.map(currency => {
                balances[currency.id] = data.reduce(
                    (total, current) =>
                        math.add(
                            Number(total),
                            current.balances[currency.id]
                                ? Number(current.balances[currency.id])
                                : 0
                        ),
                    0
                );
            });
            const totalConvertedAmount = data.reduce(
                (total, current) =>
                    math.add(
                        Number(total),
                        Number(current.totalConvertedAmount)
                    ),
                0
            );
            return [
                ...data,
                {
                    summaryRow: true,
                    balances,
                    totalConvertedAmount,
                },
            ];
        }
        return data;
    };
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
        for (const item of cashBox) {
            if (!item.isDeleted) {
                collection.push(item.id);
            }
        }

        return collection;
    };

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = cashBox;

            setCheckList(prevState => ({
                checkedListAll: [...prevState.checkedListAll, row.id * 1],
                ItemsChecked:
                    collection.length === prevState.checkedListAll.length + 1,
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

    return (
        <>
            <ProModal
                maskClosable
                padding
                // centered
                width={500}
                isVisible={isVisible}
                handleModal={toggleCashboxModal}
            >
                <AddInitialRemainsCashbox
                    selectedItem={selectedItem}
                    toggleCashboxModal={toggleCashboxModal}
                    id={selectedItem?.id}
                    visiblePopup={isVisible}
                />
            </ProModal>

            <section
                className="scrollbar aside"
                style={{ padding: '0 32px', marginTop: '10px' }}
            >
                <Row
                    style={{
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}
                >
                    <Col span={12} align="start">
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                margin: '0 20px 0',
                                alignItems: 'center',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.transaction_initial_balance}
                            >
                                <Checkbox
                                    onChange={event =>
                                        handleCheckbox(event.target.checked)
                                    }
                                    checked={checkList.ItemsChecked}
                                />

                                <Button
                                    onClick={() =>
                                        handleDeleteClick(
                                            checkList.checkedListAll,
                                            true
                                        )
                                    }
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                    }}
                                    disabled={
                                        checkList.checkedListAll.length === 0
                                    }
                                >
                                    <Tooltip
                                        placement="bottom"
                                        title={`${'Silinmə'}${' '}(${
                                            checkList.checkedListAll.length
                                        })`}
                                    >
                                        <FaTrash
                                            size="20px"
                                            style={{
                                                marginTop: '5px',
                                            }}
                                        />
                                    </Tooltip>
                                </Button>
                            </Can>
                        </div>
                    </Col>
                    <Col span={12} align="end">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Can
                                I={accessTypes.manage}
                                a={permissions.transaction_initial_balance}
                            >
                                <ProButton
                                    icon="plus"
                                    size="large"
                                    type="primary"
                                    onClick={() => setIsVisible(true)}
                                >
                                    Hesab əlavə et
                                </ProButton>
                            </Can>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <ProTable
                            loading={load || cashboxBalanceReportLoading}
                            style={{ marginTop: '25px ' }}
                            scroll={{ x: 'max-content' }}
                            dataSource={getCashboxReport(cashBox)}
                            columns={columnsMain}
                            rowKey={record => record.id}
                            className={styles.customTable}
                            footer={
                                !cashBox.length > 0 ? (
                                    <TableFooter title="Toplam" />
                                ) : null
                            }
                        />
                    </Col>
                </Row>
            </section>
        </>
    );
}
const mapStateToProps = state => ({
    cashboxBalanceReportLoading: state.loadings.fetchCashboxBalanceReport,
    cashboxBalanceReport: state.financeReportsReducer.cashboxInitialBalance,
    businessUnits: state.businessUnitReducer.businessUnits,
    currencies: state.kassaReducer.currencies,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        fetchCashboxBalanceReport,
        deleteCashboxBalance,
        fetchCurrencies,
    }
)(InitialRemainsCashbox);
