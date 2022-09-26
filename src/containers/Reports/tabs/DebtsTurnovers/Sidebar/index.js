import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import {
    Sidebar,
    ProDateRangePicker,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';
import styles from '../../styles.module.scss';

const DebtsTurnoversSidebar = props => {
    const {
        fetchContacts,
        fetchBusinessUnitList,
        debtType,
        handleTypeChange,
        handleDateChange,
        filters,
        onFilter,
        profile,
        handlePaginationChange,
        EndDate,
        StartDate,
    } = props;

    const [contacts, setContacts] = useState([]);
    const [filterSelectedContacts, setFilterSelectedContacts] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [
        filterSelectedBusinessUnit,
        setFilterSelectedBusinessUnit,
    ] = useState([]);

    useEffect(() => {
        if (filters.businessUnitIds) {
            fetchBusinessUnitList({
                filters: {
                    isDeleted: 0,
                    businessUnitIds: profile.businessUnits?.map(({ id }) => id),
                    ids: filters.businessUnitIds.map(Number),
                },
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
                    setFilterSelectedBusinessUnit(appendList);
                },
            });
        }
    }, []);

    useEffect(() => {
        if (filters.contacts?.length) {
            fetchContacts({ ids: filters.contacts.map(Number) }, data => {
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
    }, [fetchContacts, filters.contacts]);

    const ajaxSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchContacts(filters, data => {
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
    return (
        <Sidebar title="Borc dövriyyəsi">
            <div className={styles.Sidebar}>
                {businessUnits?.length === 1 &&
                    profile.businessUnits.length === 0 ? null : (
                    <div className={styles.sidebarItem}>
                        <span className={styles.sectionName}>Biznes blok</span>
                        <ProAsyncSelect
                            selectRequest={ajaxBusinessUnitSelectRequest}
                            mode="multiple"
                            valueOnChange={values => {
                                handlePaginationChange(1);
                                onFilter('businessUnitIds', values);
                            }}
                            value={
                                filters.businessUnitIds
                                    ? filters.businessUnitIds.map(Number)
                                    : businessUnits?.length === 1
                                        ? businessUnits[0]?.id === null
                                            ? businessUnits[0]?.name
                                            : businessUnits[0]?.id
                                        : filters.businessUnitIds
                            }
                            disabled={businessUnits?.length === 1}
                            data={
                                filterSelectedBusinessUnit.length > 0
                                    ? [
                                        ...filterSelectedBusinessUnit.filter(
                                            item => item.id !== null
                                        ),
                                        ...businessUnits
                                            ?.map(item =>
                                                item.id === null
                                                    ? { ...item, id: 0 }
                                                    : item
                                            )
                                            .filter(
                                                item =>
                                                    !filterSelectedBusinessUnit
                                                        .map(({ id }) => id)
                                                        ?.includes(item.id)
                                            ),
                                    ]
                                    : businessUnits?.map(item =>
                                        item.id === null
                                            ? { ...item, id: 0 }
                                            : item
                                    )
                            }
                            disabledBusinessUnit={businessUnits?.length === 1}
                        />
                    </div>
                )}
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}></span>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '4px',
                        }}
                    >
                        <Button
                            className={`${styles.dataButton} ${debtType === 'receivables-turnover'
                                    ? styles.dataButtonActive
                                    : null
                                }`}
                            onClick={() =>
                                handleTypeChange('receivables-turnover')
                            }
                        >
                            Debitor Borclar
                        </Button>
                        <Button
                            className={`${styles.dataButton} ${debtType === 'payables-turnover'
                                    ? styles.dataButtonActive
                                    : null
                                }`}
                            onClick={() =>
                                handleTypeChange('payables-turnover')
                            }
                        >
                            Kreditor Borclar
                        </Button>
                    </div>
                </div>
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}>Tarix</span>
                    <ProDateRangePicker
                        size="large"
                        buttonSize="default"
                        buttonStyle={{ width: '31.5%' }}
                        rangeButtonsStyle={{ margin: '10px 0 0 0' }}
                        className={styles.datePicker}
                        onChangeDate={handleDateChange}
                        style={{ marginTop: '8px' }}
                        placeholder="Seçin"
                        defaultStartValue={
                            filters.operationDateStart
                                ? filters.operationDateStart
                                : undefined
                        }
                        defaultEndValue={
                            filters.operationDateEnd
                                ? filters.operationDateEnd
                                : undefined
                        }
                        notRequired={!!(StartDate || EndDate)}
                    />
                </div>
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}>Qarşı tərəf</span>
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxSelectRequest}
                        valueOnChange={values => {
                            handlePaginationChange(1);
                            onFilter('contacts', values);
                        }}
                        data={
                            filterSelectedContacts.length > 0
                                ? [
                                    ...filterSelectedContacts,
                                    ...contacts.filter(
                                        item =>
                                            !filterSelectedContacts
                                                .map(({ id }) => id)
                                                ?.includes(item.id)
                                    ),
                                ]
                                : contacts
                        }
                        value={
                            filters.contacts
                                ? filters.contacts.map(Number)
                                : undefined
                        }
                    />
                </div>
            </div>
        </Sidebar>
    );
};

export default DebtsTurnoversSidebar;
