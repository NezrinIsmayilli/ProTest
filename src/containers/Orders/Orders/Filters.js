/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { ProFilterButton, NewButton, ExcelButton, Can } from 'components/Lib';
import { fetchCountsGroupedByDirection } from 'store/actions/orders'; // Actions
import ExportJsonExcel from 'js-export-excel';
import { orderDirections } from 'utils';
import { accessTypes, permissions } from 'config/permissions';
import styles from '../styles.module.scss';

const Filters = props => {
  const history = useHistory();
  const {
    orders,
    filters,
    onFilter,
    countsGroupedByDirection,
    fetchCountsGroupedByDirection,
    toggleFetchAction,
    handleChange
  } = props;

  const handleDirectionChange = newDirection => {
    handleChange(1);
    if (filters.direction === newDirection) {
      toggleFetchAction();
    }
    onFilter('direction', newDirection);
  };

  const handleExport = () => {
    const data = orders || '';
    const option = {};
    const dataTable = data.map(dataItem => ({
      Id: dataItem.id,
      Contract: dataItem.serialNumber,
      'Date of order': dataItem.createdAt,
      Contrparty: dataItem.partnerName,
      Amount: (Math.round(dataItem.totalPrice * 100) / 100).toFixed(2),
      'Number of goods': dataItem.totalQuantity,
      Stage: dataItem.stage,
      'Deadline of execution': dataItem.deliveryDate,
      'Days passed': 0,
      Status: dataItem.status,
    }));

    option.fileName = 'orders';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Contract',
          'Date of order',
          'Contrparty',
          'Amount',
          'Number of goods',
          'Stage',
          'Deadline of execution',
          'Days passed',
          'Status',
        ],
        sheetHeader: [
          'Id',
          'Contract',
          'Date of order',
          'Contrparty',
          'Amount',
          'Number of goods',
          'Stage',
          'Deadline of execution',
          'Days passed',
          'Status',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  useEffect(() => {
    if (orders.length > 0) {
      fetchCountsGroupedByDirection();
    }
  }, [orders]);
  return (
    <div className={styles.tabContainer}>
      <div className={styles.buttons}>
        {Object.values(orderDirections).map(orderDirection => (
          <ProFilterButton
            onClick={() => handleDirectionChange(orderDirection.id)}
            active={filters.direction == orderDirection.id}
            key={orderDirection.id}
            count={
              countsGroupedByDirection?.filter(
                direction => direction.direction === orderDirection.id
              )[0]?.amount
            }
          >
            {orderDirection.label}
          </ProFilterButton>
        ))}
      </div>
      <div>
        <Can I={accessTypes.manage} a={permissions.order}>
          <ExcelButton onClick={handleExport} style={{ marginRight: '10px' }} />
        </Can>

        <Can I={accessTypes.manage} a={permissions.partner}>
          <NewButton
            label="Sifarişçini əlavə et"
            onClick={() => history.push('/relations/partners/new')}
          />
        </Can>
      </div>
    </div>
  );
};
const mapStateToProps = state => ({
  isLoading: state.ordersReducer.isLoading,
  orders: state.ordersReducer.orders,
  stages: state.ordersReducer.stages,
  total: state.ordersReducer.total,
  countsGroupedByDirection: state.ordersReducer.countsGroupedByDirection,
});

export default connect(
  mapStateToProps,
  {
    fetchCountsGroupedByDirection,
  }
)(Filters);
