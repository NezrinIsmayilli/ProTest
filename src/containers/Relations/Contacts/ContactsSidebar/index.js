import React, { useState, useEffect } from 'react';
import { Sidebar, ProSelect, ProSearch, ProAsyncSelect, ProSidebarItem } from 'components/Lib';
import { contactTypes, contactCategories } from 'utils';
import { useTranslation } from 'react-i18next';

const ContactsSidebar = props => {
    const { t } = useTranslation();
    const { persons, onFilter, filterData, handlePaginationChange, fetchUsers, openedSidebar, setOpenedSidebar } = props;
    const [users, setUsers] = useState([]);
    const [name, setName] = useState(
        filterData.name ? filterData.name : undefined
    );
    const [
        filterSelectedUsers,
        setFilterSelectedUsers,
    ] = useState([]);
    const [description, setDescription] = useState(filterData.description ? filterData.description : undefined);

    const handleDefaultFilter = (type, value) => {
        handlePaginationChange(1);
        onFilter(type, value);
    };
    const handleChange = (e, value) => {
        setDescription(e.target.value)
        if (e.target.value === '') {
            onFilter('description', value);
            handlePaginationChange(1);
        }
    };
    // This function filtered the current 'managers'. In the present case, all 'users'
    // const filterDuplicates = (person, field) => {
    //   const data = [];
    //   return person?.reduce((total, current) => {
    //     if (data.includes(current[field]) || current[field] === null) {
    //       return total;
    //     }
    //     data.push(current[field]);
    //     return [...total, { name: current[field], id: current.managerId }];
    //   }, []);
    // };

    useEffect(() => {
        if (filterData.managers) {
            fetchUsers({
                filters: { ids: filterData.managers.map(Number) },
                onSuccessCallback: data => {
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
                    setFilterSelectedUsers(appendList);
                },
            });
        }
    }, [])

    const ajaxUsersSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds: filterData?.businessUnitIds
                ? filterData?.businessUnitIds
                : undefined,
        };
        fetchUsers({
            filters: defaultFilters,
            onSuccessCallback: data => {
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
                    setUsers(appendList);
                } else {
                    setUsers(users.concat(appendList));
                }
            },
        });
    };


    return (
        <Sidebar
            title={t('relations:main:contact')}
            openedSidebar={openedSidebar}
            setOpenedSidebar={setOpenedSidebar}
        >
            <ProSidebarItem label={t('relations:contacts:type')}>
                <ProSelect
                    value={filterData.types ? filterData.types.map(Number) : []}
                    mode="multiple"
                    onChange={value => handleDefaultFilter('types', value)}
                    data={contactTypes}
                />
            </ProSidebarItem>
            <ProSidebarItem label={t('relations:contacts:category')}>
                <ProSelect
                    mode="multiple"
                    value={
                        filterData.categories
                            ? filterData.categories.map(Number)
                            : []
                    }
                    onChange={value => handleDefaultFilter('categories', value)}
                    data={Object.values(contactCategories)}
                />
            </ProSidebarItem>
            <ProSidebarItem label={t('relations:contacts:name')}>
                <ProSearch
                    value={name}
                    onChange={e => {
                        setName(e.target.value);
                        if (e.target.value === '') {
                            handleDefaultFilter('name', undefined);
                        }
                    }}
                    onSearch={value => handleDefaultFilter('name', value)}
                />
            </ProSidebarItem>
            <ProSidebarItem label={t('relations:contacts:manager')}>
                <ProAsyncSelect
                    mode="multiple"
                    selectRequest={ajaxUsersSelectRequest}
                    value={
                        filterData.managers
                            ? filterData.managers.map(Number)
                            : []
                    }
                    valueOnChange={value => handleDefaultFilter('managers', value)}
                    // data={filterDuplicates(persons, 'manager')}
                    data={filterSelectedUsers.length > 0
                        ? [
                            ...filterSelectedUsers,
                            ...users.filter(
                                item =>
                                    !filterSelectedUsers
                                        .map(({ id }) => id)
                                        ?.includes(item.id)
                            ),
                        ]
                        : users}
                    keys={['name', 'lastName']}
                />
            </ProSidebarItem>
            <ProSidebarItem label={t('relations:contacts:additionalInfo')}>
                <ProSearch
                    onSearch={value =>
                        handleDefaultFilter('description', value)
                    }
                    onChange={(e, value) => handleChange(e, value)}
                    value={description}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

export default ContactsSidebar;
