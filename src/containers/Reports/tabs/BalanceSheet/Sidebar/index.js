import React from 'react';
import {
  Sidebar,
  ProDatePicker,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';
import moment from 'moment';

import { dateFormat } from 'utils';
import styles from '../../styles.module.scss';

const BalanceSheetSidebar = ({
  onFilter,
  setFilter,
  filters,
  businessUnits,
  profile,
}) => {
  return (
    <Sidebar title="Balans hesabatı">
      <div className={styles.Sidebar}>
        {businessUnits?.length === 1 &&
        profile.businessUnits.length === 0 ? null : (
          <ProSidebarItem label="Biznes blok">
            <ProSelect
              mode="multiple"
              onChange={values => onFilter('businessUnitIds', values)}
              value={
                businessUnits?.length === 1
                  ? businessUnits[0]?.id === null
                    ? businessUnits[0]?.name
                    : businessUnits[0]?.id
                  : filters.businessUnitIds
              }
              disabled={businessUnits?.length === 1}
              data={businessUnits?.map(item =>
                item.id === null ? { ...item, id: 0 } : item
              )}
              disabledBusinessUnit={businessUnits?.length === 1}
            />
          </ProSidebarItem>
        )}
        <ProSidebarItem label="Tarix">
          <ProDatePicker
            className={styles.datePicker}
            defaultValue={moment()}
            showToday
            onChange={values =>
              values
                ? onFilter('date', moment(values).format(dateFormat))
                : onFilter('date', undefined)
            }
          />
        </ProSidebarItem>
        <ProSidebarItem label="Müqayisə tarixi">
          <ProDatePicker
            className={styles.datePicker}
            showToday
            disabledDate={d => !d || d.isAfter(moment().endOf('day'))}
            onChange={values =>
              values
                ? setFilter(moment(values).format(dateFormat))
                : setFilter(undefined)
            }
          />
        </ProSidebarItem>
      </div>
    </Sidebar>
  );
};

export default BalanceSheetSidebar;
