import React from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { thisWeekStart, thisWeekEnd, onChangeDateHandle } from 'utils';

import {
  Sidebar,
  ProPanel,
  ProCollapse,
  ProDateRangePicker,
} from 'components/Lib';

// actions
import { fetchExpenseReport } from 'store/actions/expenseReport';

function ExpenseReportSidebar(props) {
  const { fetchExpenseReport } = props;

  const [filters, onFilter] = useFilterHandle(
    {
      dateFrom: thisWeekStart,
      dateTo: thisWeekEnd,
    },
    fetchExpenseReport
  );

  const onChangeDate = (startDate, endDate) =>
    onChangeDateHandle(startDate, endDate, onFilter, filters);

  return (
    <Sidebar title="Xərc Hesabatı">
      <ProCollapse defaultActiveKey="1">
        <ProPanel header="Tarix üzrə axtarış" key="1">
          <ProDateRangePicker
            getCalendarContainer={trigger => trigger.parentNode.parentNode}
            onChangeDate={onChangeDate}
          />
        </ProPanel>
      </ProCollapse>
    </Sidebar>
  );
}

export default connect(
  null,
  {
    fetchExpenseReport,
  }
)(ExpenseReportSidebar);
