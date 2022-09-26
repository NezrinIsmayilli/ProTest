import React, { useEffect, useState, useRef } from 'react';
import { Pie } from '@ant-design/charts';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';

const roundTo = require('round-to');

const SalesChart = ({ data, setFilter, dateFrom, dateTo, businessUnitIds }) => {
  const [detail, setDetail] = useState({});
  const ref = useRef();

  const config = {
    appendPadding: 15,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{percentage}',
    },
    legend: {
      layout: 'veritical',
      position: 'left',
    },
    state: {
      active: {
        style: {
          lineWidth: 0,
          fillOpacity: 0.85,
          cursor: 'pointer',
        },
      },
    },
    meta: {
      value: {
        formatter: function formatter(v) {
          return ''.concat(roundTo.up(Number(v), 2), '%');
        },
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.on('element:click', (...args) => {
        setDetail(args[0].data?.data);
      });
    }
  }, []);
  useEffect(() => {
    let key = '';
    let value = [];
    if (detail) {
      if (detail.columnId === 'salesman_id') {
        key = 'salesManagers';
        value = [detail.id];
      } else if (detail.columnId === 'client_id') {
        key = 'contacts';
        value = [detail.id];
      } else if (detail.columnId === 'stock_from_id') {
        key = 'stocks';
        value = [detail.id];
      } else if (detail.columnId === 'detail.catalog_id') {
        key = 'catalogs';
        value = [detail.id];
      }
    }
    const filter = {
      [key]: value,
      isDeleted: 0,
      limit: 1000,
      dateFrom,
      dateTo,
      invoiceTypes: [2],
      businessUnitIds,
    };
    setFilter(filter);
  }, [detail?.id]);
  return (
    <Pie
      {...config}
      data={data}
      valueFormat={value => formatNumberToLocale(defaultNumberFormat(value))}
      // chartRef={ref}
    />
  );
};
export default SalesChart;
