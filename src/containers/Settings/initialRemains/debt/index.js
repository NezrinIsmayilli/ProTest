import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import axios from 'axios';
import {
    Button,
    Checkbox,
    Col,
    Row,
    Tooltip,
    Icon,
    Dropdown,
    Menu,
} from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import {
    Can,
    Table,
    ProPageSelect,
    ProPagination,
    ProModal,
    ProButton,
    ProInput,
    ProSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import {
    fetchInitialDebtList,
    fetchInitialDebtCount,
    createInitialDebt,
    deleteIninitialDebts,
} from 'store/actions/salesAndBuys';
import {
    fetchMainCurrency,
    fetchCurrencies,
} from 'store/actions/settings/kassa';
import { BiUnite } from 'react-icons/all';
import {
    re_amount,
    formatNumberToLocale,
    defaultNumberFormat,
    roundToDown,
    filterQueryResolver,
} from 'utils';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import AddInitialDebt from './addInitialDebt';
import styles from './styles.module.scss';

function InitialRemainsDebt(props) {
    const {
        initialDebt,
        isLoading,
        actionLoading,
        debtsCount,
        fetchInitialDebtList,
        fetchInitialDebtCount,
        fetchMainCurrency,
        fetchBusinessUnitList,
        deleteIninitialDebts,
        fetchCurrencies,
        permissionsList,
        createInitialDebt,
        mainCurrency,
        businessUnits,
        profile,
        currencies,
        tenant,
        permissionsByKeyValue,
    } = props;

    const newProductNameRef = useRef(null);
    const history = useHistory();
    const location = useLocation();
    const { sales_initial_debt } = permissionsByKeyValue;
    const isEditDisabled = sales_initial_debt.permission !== 2;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const contactsParam = urlParams.get('contacts');

    const [pageSize, setPageSize] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [initialDebtsFromBack, setInitialDebtsFromBack] = useState([]);
    const [selectedRow, setSelectedRow] = useState(undefined);
    const [selectedChangedRow, setSelectedChangedRow] = useState(undefined);
    const [selectedId, setSelectedId] = useState(undefined);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [checkList, setCheckList] = useState({
        checkedListAll: [],
        ItemsChecked: false,
    });

    const [filters, onFilter] = useFilterHandle(
        {
            invoices: undefined,
            contacts:
                contactsParam !== null && contactsParam !== ''
                    ? contactsParam.split(',').map(Number)
                    : undefined,
            dateFrom: undefined,
            dateTo: undefined,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            limit: pageSize,
            page: currentPage,
            isDeleted: 0,
        },
        ({ filters }) => {
            fetchInitialDebtList({ filters });
            fetchInitialDebtCount({ filters });
        }
    );

    const handlePaginationChange = value => {
        onFilter('page', value);
        onFilter('page', value);
        onFilter(
            'contacts',
            contactsParam !== null && contactsParam !== ''
                ? contactsParam.split(',').map(Number)
                : undefined
        );
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        setCurrentPage(1);
        setPageSize(size);
        onFilter('page', 1);
        onFilter(
            'contacts',
            contactsParam !== null && contactsParam !== ''
                ? contactsParam.split(',').map(Number)
                : undefined
        );
    };

    const toggleModal = row => {
        if (row?.id) {
            setSelectedRow(row);
        } else {
            setSelectedRow(undefined);
        }
        setModalIsVisible(prevValue => !prevValue);
    };

    const handleMenuClick = ({ key }) => {
        history.push({
            pathname: location.pathName,
            search: `${filterQueryResolver({ ...filters })}&tkn_unit=${
                key == 'null' ? 0 : key
            }`,
        });
        toggleModal();
    };
    const menu = (
        <Menu
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            onClick={handleMenuClick}
        >
            {profile.businessUnits?.length === 0
                ? businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <BiUnite style={{ marginRight: '5px' }} />
                          {item.name}
                      </Menu.Item>
                  ))}
        </Menu>
    );

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
                                const token =
                                    initialDebt.find(debt => debt.id === item)
                                        ?.businessUnitId === null
                                        ? undefined
                                        : initialDebt.find(
                                              debt => debt.id === item
                                          )?.businessUnitId;
                                const { data } = await axios.delete(
                                    `/sales/invoices/initial-debts/${
                                        initialDebt.find(
                                            debt => debt.id === item
                                        )?.contact
                                    }`,
                                    token
                                        ? {
                                              headers: {
                                                  'X-BUSINESS-UNIT-ID': token,
                                              },
                                          }
                                        : {}
                                );
                            } catch (error) {
                                notRemovedData.push(item);
                            }
                        })
                    ).then(results => {
                        fetchInitialDebtList({
                            filters,
                        });
                        fetchInitialDebtCount({
                            filters,
                        });
                        setCheckList({
                            checkedListAll: [],
                            ItemsChecked: false,
                        });
                        if (notRemovedData.length > 0) {
                            const arr = initialDebt
                                .filter(item =>
                                    notRemovedData.includes(item.id)
                                )
                                .map(item => item.invoiceNumber);
                            toast.error(
                                `${arr.toString()} nömrəli sənədlər silinə bilməz`
                            );
                        }
                    });
                } else {
                    history.push({
                        pathname: location.pathName,
                        search: `${filterQueryResolver({ ...filters })}&tkn_unit=${
                            row.businessUnitId == null ? 0 : row.businessUnitId
                        }`,
                    });
                    deleteIninitialDebts({
                        id: row.contact,
                        onSuccess: () => {
                            fetchInitialDebtList({
                                filters,
                            });
                            fetchInitialDebtCount({
                                filters,
                            });
                            setCheckList({
                                checkedListAll: [],
                                ItemsChecked: false,
                            });
                        },
                        onFailure: ({ error }) => {
                            if (
                                error?.response?.data?.error?.message ===
                                'Bu qaimə ilə başqa bir qaimədə əməliyyat olunub.'
                            ) {
                                toast.error(
                                    'Sənədə ödəniş edildiyi üçün silimək mümkün deyil.'
                                );
                            }
                        },
                    });
                }
            }
        });
    };

    useEffect(() => {
        fetchMainCurrency();
        fetchCurrencies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!modalIsVisible) {
            history.push({
                pathname: location.pathName,
                search: `${filterQueryResolver({ ...filters })}`,
            });
        }
    }, [modalIsVisible]);

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
    }, [fetchBusinessUnitList]);
    useEffect(() => {
        setInitialDebtsFromBack(initialDebt);
    }, [initialDebt]);

    const handleAmountUpdate = (row, value, type) => {
        history.push({
            pathname: location.pathName,
            search: `${filterQueryResolver({ ...filters })}&tkn_unit=${
                row.businessUnitId == null ? 0 : row.businessUnitId
            }`,
        });
        
        let newProducts = [];
        if (value === '') {
            newProducts = initialDebtsFromBack.map(selectedProduct =>
                selectedProduct?.id === row?.id
                    ? {
                          ...selectedProduct,
                          [type]: null,
                      }
                    : selectedProduct
            );
            setInitialDebtsFromBack(newProducts);
        } else if (re_amount.test(value) && value < 10000000000) {
            newProducts = initialDebtsFromBack.map(selectedProduct =>
                selectedProduct?.id === row?.id
                    ? {
                          ...selectedProduct,
                          [type]: value,
                      }
                    : selectedProduct
            );
            setInitialDebtsFromBack(newProducts);
        }
        setSelectedId(row.id);
        setSelectedChangedRow(row);
    };

    useEffect(() => {
        if (selectedId) {
            const rowForChange = initialDebtsFromBack.find(
                selectedItem => selectedItem.id === selectedId
            );
            const data = {
                operationDate: rowForChange?.operationDate,
                contact: rowForChange?.contact,
                receivablesAmount: rowForChange?.receivablesAmount,
                receivablesTenantCurrency:
                    rowForChange?.receivablesTenantCurrency,
                receivablesTaxAmount: rowForChange?.receivablesTaxAmount,
                receivablesTaxTenantCurrency:
                    rowForChange?.receivablesTaxTenantCurrency,
                payablesAmount: rowForChange?.payablesAmount,
                payablesTenantCurrency: rowForChange?.payablesTenantCurrency,
                payablesTaxAmount: rowForChange?.payablesTaxAmount,
                payablesTaxTenantCurrency:
                    rowForChange?.payablesTaxTenantCurrency,
            };

            clearTimeout(newProductNameRef.current);
            if (
                data.receivablesAmount != null ||
                data.receivablesTaxAmount != null ||
                data.payablesAmount != null ||
                data.payablesTaxAmount != null
            )
                newProductNameRef.current = setTimeout(
                    () =>
                        createInitialDebt(
                            data,
                            () => {
                                fetchInitialDebtList({ filters });
                                fetchInitialDebtCount({ filters });
                            },
                            ({ error }) => {
                                const errorKey =
                                    error?.response?.data?.error?.errors?.key;
                                if (errorKey === 'wrong_receivables_debt') {
                                    return toast.error(
                                        `Debitor borc artıq ödənilmiş ${roundToDown(
                                            rowForChange?.receivablesPaidAmount
                                        )} ${
                                            rowForChange.receivablesTenantCurrencyCode
                                        } məbləğindən az ola bilməz`,
                                        { autoClose: 8000 }
                                    );
                                }
                                if (errorKey === 'wrong_receivables_tax_debt') {
                                    return toast.error(
                                        `Debitor(ƏDV) borc artıq ödənilmiş ${roundToDown(
                                            rowForChange?.receivablesPaidTaxAmount
                                        )} ${
                                            rowForChange.receivablesTaxTenantCurrencyCode
                                        } məbləğindən az ola bilməz`,
                                        { autoClose: 8000 }
                                    );
                                }
                                if (errorKey === 'wrong_payables_debt') {
                                    return toast.error(
                                        `Kreditor borc artıq ödənilmiş ${roundToDown(
                                            rowForChange?.payablesPaidAmount
                                        )} ${
                                            rowForChange.payablesTenantCurrencyCode
                                        } məbləğindən az ola bilməz`,
                                        { autoClose: 8000 }
                                    );
                                }
                                if (errorKey === 'wrong_payables_tax_debt') {
                                    return toast.error(
                                        `Kreditor(ƏDV) borc artıq ödənilmiş ${roundToDown(
                                            rowForChange?.payablesPaidTaxAmount
                                        )} ${
                                            rowForChange.payablesTaxTenantCurrencyCode
                                        } məbləğindən az ola bilməz`,
                                        { autoClose: 8000 }
                                    );
                                }
                            }
                        ),
                    3000
                );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, selectedChangedRow]);

    const getColumns = () => {
        const columns = [
            {
                title: '№',
                width: 50,
                render: (value, row, index) =>
                    (currentPage - 1) * pageSize + index + 1,
            },
            {
                title: 'Qalıq tarixi',
                dataIndex: 'operationDate',
                render: (date, row) => (row.isTotal ? null : date || ''),
                width: 180,
            },
            {
                title: 'Qarşı tərəf',
                dataIndex: 'contactName',
                align: 'left',
                ellipsis: true,
                width: 150,
                render: value => value,
            },
            {
                title: 'Sənəd',
                dataIndex: 'invoiceNumber',
                width: 150,
                render: (value, row) => (row.isTotal ? null : value),
            },
            {
                title: 'Biznes blok',
                dataIndex: 'businessUnitName',
                align: 'center',
                width: 150,
                render: (value, row) =>
                    row.isTotal ? null : value === null ? tenant?.name : value,
            },
            {
                title: 'Debitor borc',
                dataIndex: 'receivablesAmount',
                align: 'center',
                width: 250,
                render: (value, row) =>
                    isEditDisabled ? (
                        `${formatNumberToLocale(defaultNumberFormat(value))} ${
                            row.receivablesTenantCurrencyCode
                        }`
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <ProInput
                                style={{ width: '55%', textAlign: 'center' }}
                                size="default"
                                value={value === '0' ? 0 : value}
                                onChange={event =>
                                    handleAmountUpdate(
                                        row,
                                        event.target.value,
                                        'receivablesAmount'
                                    )
                                }
                                className={`${
                                    Number(value || 0) >=
                                    Number(row.receivablesPaidAmount || 0)
                                        ? {}
                                        : styles.inputError
                                } ${styles.tableInput}`}
                            />
                            <ProSelect
                                style={{ width: '42%', marginBottom: '0' }}
                                disabled={Number(row.receivablesPaidAmount) > 0}
                                size="medium"
                                allowClear={false}
                                value={row.receivablesTenantCurrency}
                                keys={['code']}
                                onChange={values =>
                                    handleAmountUpdate(
                                        row,
                                        values,
                                        'receivablesTenantCurrency'
                                    )
                                }
                                data={currencies.filter(
                                    ({ isActive }) => isActive
                                )}
                            />
                        </div>
                    ),
            },
            {
                title: 'Kreditor borc',
                dataIndex: 'payablesAmount',
                align: 'center',
                width: 250,
                render: (value, row) =>
                    isEditDisabled ? (
                        `${formatNumberToLocale(defaultNumberFormat(value))} ${
                            row.payablesTenantCurrencyCode
                        }`
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <ProInput
                                style={{ width: '55%', textAlign: 'center' }}
                                size="default"
                                value={value === '0' ? 0 : value}
                                onChange={event =>
                                    handleAmountUpdate(
                                        row,
                                        event.target.value,
                                        'payablesAmount'
                                    )
                                }
                                className={`${
                                    Number(value || 0) >=
                                    Number(row.payablesPaidAmount || 0)
                                        ? {}
                                        : styles.inputError
                                } ${styles.tableInput}`}
                            />
                            <ProSelect
                                style={{ width: '42%', marginBottom: '0' }}
                                size="medium"
                                allowClear={false}
                                disabled={Number(row.payablesPaidAmount) > 0}
                                value={row.payablesTenantCurrency}
                                keys={['code']}
                                onChange={values =>
                                    handleAmountUpdate(
                                        row,
                                        values,
                                        'payablesTenantCurrency'
                                    )
                                }
                                data={currencies.filter(
                                    ({ isActive }) => isActive
                                )}
                            />
                        </div>
                    ),
            },
            {
                title: 'Debitor ƏDV',
                dataIndex: 'receivablesTaxAmount',
                align: 'center',
                width: 250,
                render: (value, row) =>
                    isEditDisabled ? (
                        `${formatNumberToLocale(defaultNumberFormat(value))} ${
                            row.receivablesTaxTenantCurrencyCode
                        }`
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <ProInput
                                style={{ width: '55%', textAlign: 'center' }}
                                size="default"
                                value={value === '0' ? 0 : value}
                                onChange={event =>
                                    handleAmountUpdate(
                                        row,
                                        event.target.value,
                                        'receivablesTaxAmount'
                                    )
                                }
                                className={`${
                                    Number(value || 0) >=
                                    Number(row.receivablesPaidTaxAmount || 0)
                                        ? {}
                                        : styles.inputError
                                } ${styles.tableInput}`}
                            />
                            <ProSelect
                                style={{ width: '42%', marginBottom: '0' }}
                                size="medium"
                                allowClear={false}
                                disabled={
                                    Number(row.receivablesPaidTaxAmount) > 0
                                }
                                value={row.receivablesTaxTenantCurrency}
                                keys={['code']}
                                onChange={values =>
                                    handleAmountUpdate(
                                        row,
                                        values,
                                        'receivablesTaxTenantCurrency'
                                    )
                                }
                                data={currencies.filter(
                                    ({ isActive }) => isActive
                                )}
                            />
                        </div>
                    ),
            },
            {
                title: 'Kreditor ƏDV',
                dataIndex: 'payablesTaxAmount',
                align: 'center',
                width: 250,
                render: (value, row) =>
                    isEditDisabled ? (
                        `${formatNumberToLocale(defaultNumberFormat(value))} ${
                            row.payablesTaxTenantCurrencyCode
                        }`
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <ProInput
                                style={{ width: '55%', textAlign: 'center' }}
                                size="default"
                                value={value === '0' ? 0 : value}
                                onChange={event =>
                                    handleAmountUpdate(
                                        row,
                                        event.target.value,
                                        'payablesTaxAmount'
                                    )
                                }
                                className={`${
                                    Number(value || 0) >=
                                    Number(row.payablesPaidTaxAmount || 0)
                                        ? {}
                                        : styles.inputError
                                } ${styles.tableInput}`}
                            />
                            <ProSelect
                                style={{ width: '42%', marginBottom: '0' }}
                                size="medium"
                                allowClear={false}
                                disabled={Number(row.payablesPaidTaxAmount) > 0}
                                value={row.payablesTaxTenantCurrency}
                                keys={['code']}
                                onChange={values =>
                                    handleAmountUpdate(
                                        row,
                                        values,
                                        'payablesTaxTenantCurrency'
                                    )
                                }
                                data={currencies.filter(
                                    ({ isActive }) => isActive
                                )}
                            />
                        </div>
                    ),
            },
        ];

        if (!isEditDisabled) {
            columns.push({
                title: 'Seç',
                dataIndex: 'id',
                width: 90,
                align: 'center',
                render: (value, row) => (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Can
                            I={accessTypes.manage}
                            a={permissions.sales_initial_debt}
                        >
                            <Button
                                type="button"
                                onClick={() => toggleModal(row)}
                                className={styles.edit}
                            >
                                <Icon component={FaPencilAlt} />
                            </Button>
                            <Button
                                type="link"
                                icon="delete"
                                className={styles.button}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteClick(row);
                                }}
                            />
                        </Can>
                    </div>
                ),
            });
            columns.unshift({
                title: '',
                width: 46,
                dataIndex: 'id',
                render(val, row) {
                    return (
                        <Can
                            I={accessTypes.manage}
                            a={permissions.sales_initial_debt}
                        >
                            <Checkbox
                                disabled={
                                    row.isDeleted ||
                                    Number(row.receivablesPaidAmount) > 0 ||
                                    Number(row.payablesPaidAmount) > 0 ||
                                    Number(row.receivablesPaidTaxAmount) > 0 ||
                                    Number(row.payablesPaidTaxAmount) > 0
                                }
                                checked={checkList.checkedListAll.includes(val)}
                                onChange={event => handleCheckboxes(row, event)}
                            />
                        </Can>
                    );
                },
            });
        }

        return columns;
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
        for (const item of initialDebt) {
            if (
                !item.isDeleted &&
                (!Number(item.receivablesPaidAmount) > 0 &&
                    !Number(item.payablesPaidAmount) > 0 &&
                    !Number(item.receivablesPaidTaxAmount) > 0 &&
                    !Number(item.payablesPaidTaxAmount) > 0)
            ) {
                collection.push(item.id);
            }
        }

        return collection;
    };

    const handleCheckboxes = (row, e) => {
        const { checked } = e.target;

        if (checked) {
            const collection = initialDebt;

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
                centered
                width={400}
                isVisible={modalIsVisible}
                handleModal={toggleModal}
            >
                <AddInitialDebt
                    toggleModal={toggleModal}
                    mainCurrency={mainCurrency}
                    filters={filters}
                    selectedRow={selectedRow}
                    setSelectedRow={setSelectedRow}
                    setModalIsVisible={setModalIsVisible}
                    modalIsVisible={modalIsVisible}
                />
            </ProModal>
            <section
                className="scrollbar aside"
                style={{ padding: '0 32px', marginTop: '10px' }}
            >
                <Row
                    style={{
                        margin: '20px 0',
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
                                a={permissions.sales_initial_debt}
                            >
                                <Checkbox
                                    onChange={event =>
                                        handleCheckbox(event.target.checked)
                                    }
                                    disabled={
                                        initialDebtsFromBack.filter(
                                            item =>
                                                !item.isDeleted &&
                                                (!Number(
                                                    item.receivablesPaidAmount
                                                ) > 0 &&
                                                    !Number(
                                                        item.payablesPaidAmount
                                                    ) > 0 &&
                                                    !Number(
                                                        item.receivablesPaidTaxAmount
                                                    ) > 0 &&
                                                    !Number(
                                                        item.payablesPaidTaxAmount
                                                    ) > 0)
                                        ).length === 0
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
                                a={permissions.sales_initial_debt}
                            >
                                {profile.businessUnits?.length > 1 ? (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <ProButton
                                            icon="plus"
                                            size="large"
                                            type="primary"
                                        >
                                            Qarşı tərəf əlavə et
                                        </ProButton>
                                    </Dropdown>
                                ) : profile.businessUnits?.length === 1 ? (
                                    <ProButton
                                        icon="plus"
                                        size="large"
                                        type="primary"
                                        onClick={() => toggleModal()}
                                    >
                                        Qarşı tərəf əlavə et
                                    </ProButton>
                                ) : businessUnits?.length === 1 ? (
                                    <ProButton
                                        icon="plus"
                                        size="large"
                                        type="primary"
                                        onClick={() => toggleModal()}
                                    >
                                        Qarşı tərəf əlavə et
                                    </ProButton>
                                ) : (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <ProButton
                                            icon="plus"
                                            size="large"
                                            type="primary"
                                        >
                                            Qarşı tərəf əlavə et
                                        </ProButton>
                                    </Dropdown>
                                )}
                            </Can>
                        </div>
                    </Col>
                </Row>
                <Table
                    scroll={{ x: 'max-content' }}
                    columns={getColumns()}
                    loading={isLoading || actionLoading}
                    dataSource={initialDebtsFromBack}
                    rowKey={record => record.rowId}
                />
                <Row
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                    }}
                >
                    <Col span={16}>
                        <ProPagination
                            loading={isLoading}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onChange={handlePaginationChange}
                            total={debtsCount}
                        />
                    </Col>
                    <Col span={6} offset={2} align="end">
                        <ProPageSelect
                            currentPage={currentPage}
                            pageSize={pageSize}
                            total={debtsCount}
                            onChange={e => handlePageSizeChange(currentPage, e)}
                        />
                    </Col>
                </Row>
            </section>
        </>
    );
}
const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
    isLoading: state.salesAndBuysReducer.isLoading,
    actionLoading: state.salesAndBuysReducer.actionLoading,
    invoices: state.salesAndBuysReducer.invoices,
    debtsCount: state.salesAndBuysReducer.debtsCount,
    mainCurrency: state.kassaReducer.mainCurrency,
    businessUnits: state.businessUnitReducer.businessUnits,
    profile: state.profileReducer.profile,
    initialDebt: state.salesAndBuysReducer.initialDebt,
    currencies: state.kassaReducer.currencies,
    tenant: state.tenantReducer.tenant,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        fetchMainCurrency,
        fetchCurrencies,
        fetchBusinessUnitList,
        fetchInitialDebtList,
        fetchInitialDebtCount,
        createInitialDebt,
        deleteIninitialDebts,
    }
)(InitialRemainsDebt);
