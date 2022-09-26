import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { accountTypeOptions } from 'utils';
import moment from 'moment';
// content
import { Select, Icon } from 'antd';
import {
    Sidebar,
    ProDateRangePicker,
    ProSidebarItem,
    ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import styles from '../styles.module.scss';

const { Option, OptGroup } = Select;
function ReportsSidebar(props) {
    const {
        groupedByTypeCashboxNames,
        cashboxLoading,
        onFilter,
        filters,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        profile,
        fetchBusinessUnitList,
    } = props;

    const [businessUnitLength, setBusinessUnitLength] = useState(2);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDatePicker = (startValue, endValue) => {
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('dateFrom', startDate);
        onFilter('dateTo', endDate);
    };

    return (
        <Sidebar title="Pul axınları">
            <div className={styles.Sidebar}>
                {businessUnitLength === 1 &&
                profile.businessUnits.length === 0 ? null : (
                    <ProSidebarItem label="Biznes blok">
                        <ProAsyncSelect
                            mode="multiple"
                            selectRequest={ajaxBusinessUnitSelectRequest}
                            valueOnChange={values => {
                                onFilter('businessUnitIds', values);
                            }}
                            disabled={businessUnitLength === 1}
                            data={businessUnits?.map(item =>
                                item.id === null ? { ...item, id: 0 } : item
                            )}
                            disabledBusinessUnit={businessUnitLength === 1}
                            value={
                                businessUnitLength === 1
                                    ? businessUnits[0]?.id === null
                                        ? businessUnits[0]?.name
                                        : businessUnits[0]?.id
                                    : filters.businessUnitIds
                            }
                        />
                    </ProSidebarItem>
                )}
                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}>Hesab</span>
                    <Select
                        allowClear
                        showSearch
                        size="large"
                        loading={cashboxLoading}
                        placeholder="Hesabı seçin"
                        onChange={value => onFilter('cashboxId', value)}
                        className={styles.select}
                        getPopupContainer={trigger => trigger.parentNode}
                        suffixIcon={<Icon component={DownArrow} />}
                    >
                        {accountTypeOptions.map(accountType => (
                            <OptGroup
                                key={accountType.name}
                                label={accountType.name}
                            >
                                {groupedByTypeCashboxNames[accountType.id] &&
                                    groupedByTypeCashboxNames[
                                        accountType.id
                                    ].map(({ id, name } = {}) => (
                                        <Option
                                            className={styles.dropdown}
                                            value={id}
                                            key={id}
                                        >
                                            {name}
                                        </Option>
                                    ))}
                            </OptGroup>
                        ))}
                    </Select>
                </div>

                <div className={styles.sidebarItem}>
                    <span className={styles.sectionName}>Tarix</span>
                    <ProDateRangePicker
                        getCalendarContainer={trigger =>
                            trigger.parentNode.parentNode
                        }
                        onChangeDate={handleDatePicker}
                        notRequired={false}
                    />
                </div>
            </div>
        </Sidebar>
    );
}

export default connect(
    null,
    { fetchBusinessUnitList }
)(ReportsSidebar);
